package com.orby.orby.ticket.repository;

import com.orby.orby.admin.model.Client;
import com.orby.orby.ticket.model.SupportTicket;
import com.orby.orby.ticket.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"client", "sector", "operator"})
    java.util.List<SupportTicket> findAll();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"client", "sector", "operator"})
    java.util.Optional<SupportTicket> findById(Long id);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"client", "sector", "operator"})
    Optional<SupportTicket> findFirstByClientAndStatusInAndTenantIdOrderByCreatedAtDesc(
            Client client, 
            java.util.Collection<TicketStatus> statuses, 
            String tenantId
    );

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"client", "sector", "operator"})
    java.util.List<SupportTicket> findAllByClientIdOrderByCreatedAtDesc(Long clientId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"client", "sector", "operator"})
    Optional<SupportTicket> findFirstByClientAndStatusAndRatingIsNullAndTenantIdOrderByClosedAtDesc(
            Client client,
            TicketStatus status,
            String tenantId
    );

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM support_ticket", nativeQuery = true)
    long countGlobalTickets();

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM support_ticket WHERE tenant_id = :tenantId", nativeQuery = true)
    long countByTenantId(@org.springframework.data.repository.query.Param("tenantId") String tenantId);
}
