package com.orby.orby.admin.repository;

import com.orby.orby.admin.model.TenantConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TenantConfigRepository extends JpaRepository<TenantConfig, Long> {
    Optional<TenantConfig> findByTenantId(String tenantId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM tenant_config WHERE whats_app_phone_number_id = :phoneId LIMIT 1", nativeQuery = true)
    Optional<TenantConfig> findByWhatsAppPhoneNumberIdWithoutFilter(@org.springframework.data.repository.query.Param("phoneId") String phoneId);
}
