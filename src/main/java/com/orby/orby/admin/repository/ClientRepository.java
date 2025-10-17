package com.orby.orby.admin.repository;

import com.orby.orby.admin.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByIdAndTenantId(Long id, String tenantId);
}