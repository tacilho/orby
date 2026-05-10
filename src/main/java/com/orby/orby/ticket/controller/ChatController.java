package com.orby.orby.ticket.controller;

import com.orby.orby.shared.tenant.TenantContext;
import com.orby.orby.ticket.model.ChatMessage;
import com.orby.orby.ticket.model.SupportTicket;
import com.orby.orby.ticket.model.SupportTicketSource;
import com.orby.orby.ticket.service.ChatMessageService;
import com.orby.orby.ticket.service.SupportTicketService;
import com.orby.orby.ticket.service.WhatsAppService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ChatController {

    private final ChatMessageService chatMessageService;
    private final SupportTicketService supportTicketService;
    private final SimpMessagingTemplate messagingTemplate;
    private final WhatsAppService whatsappService;

    public ChatController(ChatMessageService chatMessageService, 
                          SupportTicketService supportTicketService, 
                          SimpMessagingTemplate messagingTemplate,
                          WhatsAppService whatsappService) {
        this.chatMessageService = chatMessageService;
        this.supportTicketService = supportTicketService;
        this.messagingTemplate = messagingTemplate;
        this.whatsappService = whatsappService;
    }

    @MessageMapping("/chat.sendMessage/{ticketId}")
    public void sendMessage(@DestinationVariable Long ticketId, @Payload ChatMessage chatMessage) {
        System.out.println(">>> WEBSOCKET RECEBIDO: TicketID=" + ticketId + ", Content=" + chatMessage.getContent() + ", SenderID=" + chatMessage.getSenderId());
        // Set tenant context for WebSocket (no HTTP interceptor here)
        TenantContext.setCurrentTenant("default");
        try {
            SupportTicket ticket = supportTicketService.findById(ticketId)
                    .orElseThrow(() -> new RuntimeException("Ticket not found"));
            chatMessage.setTicket(ticket);

            if (chatMessage.getMessageId() == null || chatMessage.getMessageId().isEmpty()) {
                chatMessage.setMessageId(UUID.randomUUID().toString());
            }
            if (chatMessage.getTimestamp() == null) {
                chatMessage.setTimestamp(LocalDateTime.now());
            }

            ChatMessage savedMessage = chatMessageService.saveMessage(chatMessage);

            // Forward to WhatsApp if applicable
            System.out.println("Processing message for ticket " + ticketId + " from sender: " + chatMessage.getSenderId());
            boolean isFromClient = chatMessage.getSenderId() != null && 
                                 (chatMessage.getSenderId().equals(ticket.getClient().getId().toString()) || 
                                  "client".equals(chatMessage.getSenderId()));
            
            if (ticket.getSource() == SupportTicketSource.WHATSAPP && !isFromClient) {
                System.out.println("Forwarding message to WhatsApp: " + ticket.getExternalConversationId());
                whatsappService.sendTextMessage(ticket.getExternalConversationId(), chatMessage.getContent());
            }

            messagingTemplate.convertAndSend("/topic/chat/" + ticketId, savedMessage);
        } finally {
            TenantContext.clear();
        }
    }

    @GetMapping("/management/tickets/{ticketId}/messages")
    public ResponseEntity<List<ChatMessage>> getTicketMessages(@PathVariable Long ticketId) {
        return ResponseEntity.ok(chatMessageService.findMessagesByTicket(ticketId));
    }
}
