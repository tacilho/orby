package com.orby.orby.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String messageId;
    private String tenantId;
    private String conversationId;
    private String senderId;

    @Lob
    private String content;

    private Instant timestamp;

    @PrePersist
    void prePersist() {
        if (messageId == null) messageId = UUID.randomUUID().toString();
        if (timestamp == null) timestamp = Instant.now();
    }

    // --- GETTERS E SETTERS (Essenciais para o Controller funcionar) ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}