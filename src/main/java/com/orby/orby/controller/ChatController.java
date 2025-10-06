package com.orby.orby.controller;

import com.orby.orby.model.ChatMessage;
import com.orby.orby.repository.ChatMessageRepository; // 💡 Importação Correta
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository repository; // 💡 Declaração do Repositório

    // 💡 Construtor Corrigido: Spring injeta as duas dependências
    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageRepository repository) {
        this.messagingTemplate = messagingTemplate;
        this.repository = repository; // Atribuição correta
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage msg) {
        // 1. Persistir a mensagem no banco de dados
        ChatMessage saved = repository.save(msg);

        // 2. Definir o destino usando os getters
        // Se a Entidade ChatMessage for a próxima (abaixo), esses métodos funcionarão!
        String dest = "/topic/" + saved.getTenantId() + "/" + saved.getConversationId();

        // 3. Enviar a mensagem para todos os clientes inscritos no tópico
        messagingTemplate.convertAndSend(dest, saved);
    }
}