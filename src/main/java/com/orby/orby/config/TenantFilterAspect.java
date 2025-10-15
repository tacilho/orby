package com.orby.orby.config;

import com.orby.orby.shared.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TenantFilterAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Before("execution(* com.orby.orby..service.*.*(..))")
    public void enableTenantFilter() {
        String tenantId = TenantContext.getCurrentTenant();

        if (tenantId != null) {

            Session session = entityManager.unwrap(Session.class);

            session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
        }
    }
}