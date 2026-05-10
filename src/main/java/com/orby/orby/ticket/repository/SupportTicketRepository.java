package com.orby.orby.ticket.repository;

import com.orby.orby.admin.model.Client;
import com.orby.orby.ticket.model.SupportTicket;
import com.orby.orby.ticket.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    Optional<SupportTicket> findFirstByClientAndStatusInAndTenantIdOrderByCreatedAtDesc(
            Client client, 
            java.util.Collection<TicketStatus> statuses, 
            String tenantId
    );
}
