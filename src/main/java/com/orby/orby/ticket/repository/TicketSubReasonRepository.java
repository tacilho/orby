package com.orby.orby.ticket.repository;

import com.orby.orby.ticket.model.TicketSubReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketSubReasonRepository extends JpaRepository<TicketSubReason, Long> {
}
