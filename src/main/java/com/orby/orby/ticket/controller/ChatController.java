package com.orby.orby.ticket.controller;

import com.orby.orby.ticket.model.ChatMessage;
import com.orby.orby.ticket.model.SupportTicket;
import com.orby.orby.ticket.service.ChatMessageService;
import com.orby.orby.ticket.service.SupportTicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatMessageService chatMessageService;
    private final SupportTicketService supportTicketService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatMessageService chatMessageService, SupportTicketService supportTicketService, SimpMessagingTemplate messagingTemplate) {
        this.chatMessageService = chatMessageService;
        this.supportTicketService = supportTicketService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.sendMessage/{ticketId}")
    public void sendMessage(@DestinationVariable Long ticketId, @Payload ChatMessage chatMessage) {
        SupportTicket ticket = supportTicketService.findById(ticketId).orElseThrow(() -> new RuntimeException("Ticket not found"));
        chatMessage.setTicket(ticket);
        
        ChatMessage savedMessage = chatMessageService.saveMessage(chatMessage);

        messagingTemplate.convertAndSend("/topic/ticket/" + ticketId, savedMessage);
    }

    @GetMapping("/management/tickets/{ticketId}/messages")
    public ResponseEntity<List<ChatMessage>> getTicketMessages(@PathVariable Long ticketId) {
        return ResponseEntity.ok(chatMessageService.findMessagesByTicket(ticketId));
    }
}
