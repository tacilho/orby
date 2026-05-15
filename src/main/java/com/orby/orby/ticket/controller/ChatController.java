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
                // Prefix with senderName if available
                String prefix = chatMessage.getSenderName() != null ? "*" + chatMessage.getSenderName() + ":* " : "";
                whatsappService.sendTextMessage(ticket.getExternalConversationId(), prefix + chatMessage.getContent());
            }

            messagingTemplate.convertAndSend("/topic/chat/" + ticketId, savedMessage);
        } finally {
            TenantContext.clear();
        }
    }

    @PostMapping("/api/chat/tickets/{ticketId}/media")
    public ResponseEntity<ChatMessage> sendMedia(@PathVariable Long ticketId,
                                                @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
                                                @RequestParam("type") com.orby.orby.ticket.model.ChatMessageType type,
                                                @RequestParam(value = "caption", required = false) String caption,
                                                @RequestParam("senderId") String senderId,
                                                @RequestParam(value = "senderName", required = false) String senderName) {
        TenantContext.setCurrentTenant("default");
        try {
            SupportTicket ticket = supportTicketService.findById(ticketId)
                    .orElseThrow(() -> new RuntimeException("Ticket not found"));

            // In a real app, you'd save the file to S3 or a local disk
            // For now, we'll assume it's saved and we have a URL
            // Mocking a local URL that our MediaController could serve or a public one
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String mockPublicUrl = "https://your-public-domain.com/api/media/files/" + filename; // This would need to be real for WhatsApp to fetch it

            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setTicket(ticket);
            chatMessage.setType(type);
            chatMessage.setContent(caption != null ? caption : "");
            chatMessage.setMediaUrl(mockPublicUrl);
            chatMessage.setMimeType(file.getContentType());
            chatMessage.setFilename(file.getOriginalFilename());
            chatMessage.setSenderId(senderId);
            chatMessage.setSenderName(senderName);
            chatMessage.setTimestamp(LocalDateTime.now());
            chatMessage.setMessageId(UUID.randomUUID().toString());
            chatMessage.setTenantId("default");

            ChatMessage savedMessage = chatMessageService.saveMessage(chatMessage);

            if (ticket.getSource() == SupportTicketSource.WHATSAPP) {
                // If using public URL, Meta will fetch it.
                // In local dev, this will fail unless using ngrok or similar.
                whatsappService.sendMediaMessage(ticket.getExternalConversationId(), type, mockPublicUrl, caption);
            }

            messagingTemplate.convertAndSend("/topic/chat/" + ticketId, savedMessage);
            return ResponseEntity.ok(savedMessage);
        } finally {
            TenantContext.clear();
        }
    }

    @GetMapping("/management/tickets/{ticketId}/messages")
    public ResponseEntity<List<ChatMessage>> getTicketMessages(@PathVariable Long ticketId) {
        return ResponseEntity.ok(chatMessageService.findMessagesByTicket(ticketId));
    }
}
