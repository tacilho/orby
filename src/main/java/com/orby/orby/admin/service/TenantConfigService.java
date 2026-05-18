package com.orby.orby.admin.service;

import com.orby.orby.admin.model.TenantConfig;
import com.orby.orby.admin.repository.TenantConfigRepository;
import com.orby.orby.shared.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class TenantConfigService {

    private final TenantConfigRepository repository;

    public TenantConfigService(TenantConfigRepository repository) {
        this.repository = repository;
    }

    public Optional<TenantConfig> getConfigForCurrentTenant() {
        String currentTenant = TenantContext.getCurrentTenant();
        if (currentTenant == null || currentTenant.isEmpty()) {
            currentTenant = "default";
        }
        return repository.findByTenantId(currentTenant);
    }

    @Transactional(readOnly = false)
    public TenantConfig saveConfigForCurrentTenant(TenantConfig config) {
        String currentTenant = TenantContext.getCurrentTenant();
        if (currentTenant == null || currentTenant.isEmpty()) {
            currentTenant = "default";
        }
        config.setTenantId(currentTenant);
        
        // Update the existing configuration for this tenant instead of creating duplicates
        repository.findByTenantId(currentTenant).ifPresent(existing -> config.setId(existing.getId()));
        return repository.save(config);
    }

    public Optional<TenantConfig> findByWhatsAppPhoneNumberIdWithoutFilter(String phoneId) {
        return repository.findByWhatsAppPhoneNumberIdWithoutFilter(phoneId);
    }
}
