package com.orby.orby.config;

import com.orby.orby.security.jwt.JwtTokenProvider;
import com.orby.orby.ticket.repository.SupportTicketRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final SupportTicketRepository ticketRepository;

    public WebSocketConfig(JwtTokenProvider jwtTokenProvider,
                           UserDetailsService userDetailsService,
                           SupportTicketRepository ticketRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
        this.ticketRepository = ticketRepository;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
                .addInterceptors(new HttpHandshakeInterceptor())
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null) {
                    StompCommand command = accessor.getCommand();

                    // ─── CONNECT ─────────────────────────────────────────────────────────────
                    if (StompCommand.CONNECT.equals(command)) {
                        String token = null;

                        // 1. Tentar ler o token do cabeçalho STOMP native
                        List<String> authHeaders = accessor.getNativeHeader("Authorization");
                        if (authHeaders != null && !authHeaders.isEmpty()) {
                            String headerVal = authHeaders.get(0);
                            if (headerVal.startsWith("Bearer ")) {
                                token = headerVal.substring(7);
                            }
                        }

                        // 2. Se não achou, tentar ler dos atributos da sessão obtidos no handshake
                        if (token == null && accessor.getSessionAttributes() != null) {
                            token = (String) accessor.getSessionAttributes().get("jwt");
                        }

                        if (token == null) {
                            throw new AccessDeniedException("Autenticação WebSocket obrigatória. Conexão rejeitada.");
                        }

                        try {
                            String username = jwtTokenProvider.extractUsername(token);
                            String tenantId = jwtTokenProvider.extractTenantId(token);

                            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                            if (jwtTokenProvider.isTokenValid(token, userDetails)) {
                                UsernamePasswordAuthenticationToken auth =
                                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                                accessor.setUser(auth);
                                
                                // Salvar atributos de segurança na sessão WebSocket
                                if (accessor.getSessionAttributes() != null) {
                                    accessor.getSessionAttributes().put("tenantId", tenantId);
                                    accessor.getSessionAttributes().put("username", username);
                                }
                            } else {
                                throw new AccessDeniedException("Token de sessão WebSocket inválido ou expirado.");
                            }
                        } catch (Exception e) {
                            throw new AccessDeniedException("Falha na autenticação WebSocket: " + e.getMessage());
                        }
                    }

                    // ─── SUBSCRIBE ──────────────────────────────────────────────────────────
                    else if (StompCommand.SUBSCRIBE.equals(command)) {
                        String destination = accessor.getDestination();
                        Map<String, Object> sessionAttrs = accessor.getSessionAttributes();
                        
                        if (sessionAttrs == null || !sessionAttrs.containsKey("tenantId")) {
                            throw new AccessDeniedException("Sessão WebSocket não autenticada.");
                        }

                        String operatorTenantId = (String) sessionAttrs.get("tenantId");

                        // Impedir cross-tenant eavesdropping nos chats privados
                        if (destination != null && destination.startsWith("/topic/chat/")) {
                            String ticketIdStr = destination.substring("/topic/chat/".length());
                            try {
                                Long ticketId = Long.parseLong(ticketIdStr);

                                // Ativar temporariamente o contexto do tenant na Thread local para a consulta SQL
                                com.orby.orby.shared.tenant.TenantContext.setCurrentTenant(operatorTenantId);

                                Optional<com.orby.orby.ticket.model.SupportTicket> ticketOpt = ticketRepository.findById(ticketId);
                                if (ticketOpt.isEmpty()) {
                                    throw new AccessDeniedException("Acesso negado: Ticket de chat não encontrado ou pertence a outro tenant.");
                                }

                                com.orby.orby.ticket.model.SupportTicket ticket = ticketOpt.get();
                                if (!operatorTenantId.equalsIgnoreCase(ticket.getTenantId())) {
                                    throw new AccessDeniedException("Acesso negado: Violação de isolamento multi-tenant.");
                                }
                            } catch (NumberFormatException nfe) {
                                throw new AccessDeniedException("Identificador de ticket inválido no destino da subscrição.");
                            } finally {
                                com.orby.orby.shared.tenant.TenantContext.clear();
                            }
                        }
                    }
                }
                return message;
            }
        });
    }

    /**
     * Interceptor HTTP que extrai cookies de sessão JWT e os repassa para a sessão do WebSocket.
     */
    private static class HttpHandshakeInterceptor implements HandshakeInterceptor {
        @Override
        public boolean beforeHandshake(org.springframework.http.server.ServerHttpRequest request,
                                       org.springframework.http.server.ServerHttpResponse response,
                                       org.springframework.web.socket.WebSocketHandler wsHandler,
                                       Map<String, Object> attributes) {
            if (request instanceof org.springframework.http.server.ServletServerHttpRequest) {
                HttpServletRequest servletRequest = ((org.springframework.http.server.ServletServerHttpRequest) request).getServletRequest();
                
                // Extrair do Cookie jwt
                Cookie[] cookies = servletRequest.getCookies();
                if (cookies != null) {
                    for (Cookie cookie : cookies) {
                        if ("jwt".equals(cookie.getName())) {
                            attributes.put("jwt", cookie.getValue());
                        }
                    }
                }

                // Extrair do Header Authorization caso enviado via handshake HTTP comum
                String authHeader = servletRequest.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    attributes.put("jwt", authHeader.substring(7));
                }
            }
            return true;
        }

        @Override
        public void afterHandshake(org.springframework.http.server.ServerHttpRequest request,
                                   org.springframework.http.server.ServerHttpResponse response,
                                   org.springframework.web.socket.WebSocketHandler wsHandler,
                                   Exception exception) {
        }
    }
}
