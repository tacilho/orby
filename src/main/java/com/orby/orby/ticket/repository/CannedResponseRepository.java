package com.orby.orby.ticket.repository;

import com.orby.orby.ticket.model.CannedResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CannedResponseRepository extends JpaRepository<CannedResponse, Long> {
}
