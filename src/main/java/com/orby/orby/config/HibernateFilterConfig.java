package com.orby.orby.config;

import com.orby.orby.shared.tenant.TenantContext;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.event.service.spi.EventListenerRegistry;
import org.hibernate.event.spi.EventType;
import org.hibernate.event.spi.PostLoadEvent;
import org.hibernate.event.spi.PostLoadEventListener;
import org.hibernate.event.spi.PreLoadEvent;
import org.hibernate.event.spi.PreLoadEventListener;
import org.hibernate.internal.SessionFactoryImpl;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class HibernateFilterConfig implements HibernatePropertiesCustomizer {

    private final EntityManagerFactory entityManagerFactory;

    public HibernateFilterConfig(EntityManagerFactory entityManagerFactory) {
        this.entityManagerFactory = entityManagerFactory;
        registerTenantFilter();
    }

    private void registerTenantFilter() {
        SessionFactory sessionFactory = entityManagerFactory.unwrap(SessionFactory.class);

        if (sessionFactory instanceof SessionFactoryImpl sessionFactoryImpl) {

            final EventListenerRegistry registry = sessionFactoryImpl.getServiceRegistry()
                    .getService(EventListenerRegistry.class);

            final TenantFilterEnabler listener = new TenantFilterEnabler();

            registry.getEventListenerGroup(EventType.POST_LOAD).appendListener(listener);
            registry.getEventListenerGroup(EventType.PRE_LOAD).appendListener(listener);
        }
    }

    private static class TenantFilterEnabler implements PreLoadEventListener, PostLoadEventListener {

        private void enableTenantFilter(org.hibernate.Session session) {
            String tenantId = TenantContext.getCurrentTenant();
            if (tenantId != null) {

                session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
            }
        }

        @Override
        public void onPreLoad(PreLoadEvent event) {
            enableTenantFilter(event.getSession());
        }

        @Override
        public void onPostLoad(PostLoadEvent event) {
            enableTenantFilter(event.getSession());
        }
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
    }
}