package com.orby.orby.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;   // 💡 Importações do Lombok
import lombok.Setter;   // 💡 Importações do Lombok
import lombok.NoArgsConstructor; // 💡 Importação para Construtor

@Entity
@Getter // 💡 Gera TODOS os métodos get...()
@Setter // 💡 Gera TODOS os métodos set...()
@NoArgsConstructor // 💡 Gera um construtor vazio, exigido pelo JPA
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
}