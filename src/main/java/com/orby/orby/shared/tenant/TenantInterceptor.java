package com.orby.orby.shared.tenant;

import com.orby.orby.security.jwt.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TenantInterceptor implements HandlerInterceptor {

    private static final String TENANT_HEADER = "X-Tenant-ID";
    private static final String M2M_HEADER = "X-M2M-Token";
    private static final String DEFAULT_TENANT_ID = "default";

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.security.m2m-token:ORBY_SUPER_SECRET_M2M_TOKEN_12345}")
    private String configuredM2mToken;

    public TenantInterceptor(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String tenantId = null;

        // 1. Tentar resolver o token JWT da requisição
        String token = resolveToken(request);

        if (token != null) {
            try {
                // Validar a assinatura e extrair o tenantId
                tenantId = jwtTokenProvider.extractTenantId(token);
                
                // Se houver um token JWT presente, o cabeçalho X-Tenant-ID não pode ser usado para spoofing.
                String clientHeaderTenant = request.getHeader(TENANT_HEADER);
                if (clientHeaderTenant != null && !clientHeaderTenant.isEmpty() && !clientHeaderTenant.equalsIgnoreCase(tenantId)) {
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Acesso negado: Tentativa de Tenant Spoofing detectada!");
                    return false;
                }
            } catch (Exception e) {
                // Token adulterado ou com assinatura inválida
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token de sessão inválido ou expirado.");
                return false;
            }
        }

        // 2. Se não houver JWT, verificar se há uma requisição M2M autenticada
        if (tenantId == null) {
            String requestM2mToken = request.getHeader(M2M_HEADER);
            if (requestM2mToken != null && !requestM2mToken.isEmpty()) {
                if (configuredM2mToken.equals(requestM2mToken)) {
                    // M2M autenticado, aceita o tenant indicado
                    tenantId = request.getHeader(TENANT_HEADER);
                } else {
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Acesso M2M negado: Token M2M inválido.");
                    return false;
                }
            }
        }

        // 3. Bloquear o cabeçalho X-Tenant-ID se fornecido por um usuário comum sem autenticação JWT ou M2M
        if (tenantId == null) {
            String clientHeaderTenant = request.getHeader(TENANT_HEADER);
            if (clientHeaderTenant != null && !clientHeaderTenant.isEmpty()) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Acesso não autorizado: Cabeçalho de Tenant proibido para usuários comuns.");
                return false;
            }
        }

        // 4. Fallback final para "default" para rotas públicas legítimas
        if (tenantId == null || tenantId.isEmpty()) {
            tenantId = DEFAULT_TENANT_ID;
        }

        TenantContext.setCurrentTenant(tenantId);
        return true;
    }

    private String resolveToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    String value = cookie.getValue();
                    if (value != null && !value.isEmpty()) {
                        return value;
                    }
                }
            }
        }

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }

        return null;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        TenantContext.clear();
    }
}