package com.orby.orby.repository;

import com.orby.orby.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Método customizado para buscar o histórico de uma conversa específica
    List<ChatMessage> findByTenantIdAndConversationIdOrderByTimestampAsc(String tenantId, String conversationId);
}