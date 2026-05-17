package com.orby.orby.ticket.repository;

import com.orby.orby.ticket.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByTicketIdOrderByTimestampAsc(Long ticketId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM chat_message", nativeQuery = true)
    long countGlobalMessages();

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM chat_message WHERE tenant_id = :tenantId", nativeQuery = true)
    long countByTenantId(@org.springframework.data.repository.query.Param("tenantId") String tenantId);
}
