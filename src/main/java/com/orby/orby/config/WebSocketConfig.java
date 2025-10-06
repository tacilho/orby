package com.orby.orby.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilita o broker simples (em memória) do Spring para rotear mensagens
        // Tudo que começar com /topic ou /queue pode ser assinado (SUBSCRIBE) pelos clientes.
        config.enableSimpleBroker("/topic", "/queue");

        // Prefixo para mensagens enviadas por clientes ao servidor (SEND)
        // Ex: O cliente envia para /app/chat.send, que é mapeado no ChatController
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Define o endpoint HTTP para a conexão WebSocket (o "Handshake")
        // O cliente se conecta em ws://localhost:8080/ws
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Permite conexões de qualquer domínio (Para MVP)
                .withSockJS(); // Adiciona fallback para navegadores/redes antigas
    }
}