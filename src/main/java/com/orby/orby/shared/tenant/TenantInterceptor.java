package com.orby.orby.shared.tenant;

import com.orby.orby.security.jwt.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TenantInterceptor implements HandlerInterceptor {

    private static final String TENANT_HEADER = "X-Tenant-ID";
    private static final String DEFAULT_TENANT_ID = "default";

    private final JwtTokenProvider jwtTokenProvider;

    public TenantInterceptor(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String tenantId = null;

        // 1. Tentar extrair do token JWT (Cookie seguro ou Header Authorization)
        String token = resolveToken(request);
        if (token != null) {
            try {
                tenantId = jwtTokenProvider.extractTenantId(token);
            } catch (Exception e) {
                // Token inválido/expirado, deixa nulo para usar os fallbacks
            }
        }

        // 2. Se não achou no JWT, tenta o cabeçalho X-Tenant-ID (útil para rotas públicas/onboarding)
        if (tenantId == null || tenantId.isEmpty()) {
            tenantId = request.getHeader(TENANT_HEADER);
        }

        // 3. Fallback final para "default"
        if (tenantId == null || tenantId.isEmpty()) {
            tenantId = DEFAULT_TENANT_ID;
        }

        TenantContext.setCurrentTenant(tenantId);
        return true;
    }

    private String resolveToken(HttpServletRequest request) {
        // Cookie "jwt"
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

        // Header "Authorization"
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