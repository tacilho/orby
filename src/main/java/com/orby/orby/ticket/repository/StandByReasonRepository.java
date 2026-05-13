package com.orby.orby.ticket.repository;

import com.orby.orby.ticket.model.StandByReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StandByReasonRepository extends JpaRepository<StandByReason, Long> {
}
