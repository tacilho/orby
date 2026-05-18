package com.orby.orby.config;

import com.orby.orby.shared.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TenantFilterAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Around("execution(* com.orby.orby.admin.service..*(..)) || execution(* com.orby.orby.ticket.service..*(..))")
    public Object applyTenantFilter(ProceedingJoinPoint joinPoint) throws Throwable {
        Session session = entityManager.unwrap(Session.class);
        String currentTenant = TenantContext.getCurrentTenant();

        if (currentTenant != null && !currentTenant.equalsIgnoreCase("master")) {
            session.enableFilter("tenantFilter").setParameter("tenantId", currentTenant);
        }

        return joinPoint.proceed();
    }
}
