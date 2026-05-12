package com.orby.orby.ticket.repository;

import com.orby.orby.ticket.model.TicketSubReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface TicketSubReasonRepository extends JpaRepository<TicketSubReason, Long> {
    @Modifying
    @Transactional
    void deleteByReasonId(Long reasonId);
}
