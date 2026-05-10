package com.orby.orby.ticket.controller;

import com.orby.orby.admin.model.Client;
import com.orby.orby.admin.repository.ClientRepository;
import com.orby.orby.shared.tenant.TenantContext;
import com.orby.orby.ticket.model.*;
import com.orby.orby.ticket.repository.SupportTicketRepository;
import com.orby.orby.ticket.service.ChatMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/webhooks/whatsapp")
public class WhatsAppWebhookController {

    private final ClientRepository clientRepository;
    private final SupportTicketRepository ticketRepository;
    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${whatsapp.verify.token:}")
    private String verifyToken;

    public WhatsAppWebhookController(ClientRepository clientRepository,
                                     SupportTicketRepository ticketRepository,
                                     ChatMessageService chatMessageService,
                                     SimpMessagingTemplate messagingTemplate) {
        this.clientRepository = clientRepository;
        this.ticketRepository = ticketRepository;
        this.chatMessageService = chatMessageService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping
    public ResponseEntity<String> verify(@RequestParam("hub.mode") String mode,
                                         @RequestParam("hub.verify_token") String token,
                                         @RequestParam("hub.challenge") String challenge) {
        if ("subscribe".equals(mode) && verifyToken.equals(token)) {
            return ResponseEntity.ok(challenge);
        }
        return ResponseEntity.status(403).build();
    }

    @PostMapping
    public ResponseEntity<Void> handleWebhook(@RequestBody Map<String, Object> payload) {
        try {
            TenantContext.setCurrentTenant("default"); // Hardcoded for now
            processPayload(payload);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok().build(); // Always return 200 to Meta to avoid retries on failure
        } finally {
            TenantContext.clear();
        }
    }

    private void processPayload(Map<String, Object> payload) {
        List<Map<String, Object>> entries = (List<Map<String, Object>>) payload.get("entry");
        if (entries == null) return;

        for (Map<String, Object> entry : entries) {
            List<Map<String, Object>> changes = (List<Map<String, Object>>) entry.get("changes");
            if (changes == null) continue;

            for (Map<String, Object> change : changes) {
                Map<String, Object> value = (Map<String, Object>) change.get("value");
                if (value == null) continue;

                List<Map<String, Object>> messages = (List<Map<String, Object>>) value.get("messages");
                if (messages == null) continue;

                for (Map<String, Object> msg : messages) {
                    String from = (String) msg.get("from");
                    Map<String, Object> textObj = (Map<String, Object>) msg.get("text");
                    if (textObj == null) continue;
                    
                    String text = (String) textObj.get("body");
                    if (text == null) continue;

                    handleIncomingMessage(from, text);
                }
            }
        }
    }

    private void handleIncomingMessage(String phoneNumber, String text) {
        // 1. Find or create client
        Client client = clientRepository.findByPhoneNumberAndTenantId(phoneNumber, "default")
                .orElseGet(() -> {
                    Client newClient = new Client();
                    newClient.setName("WhatsApp User " + phoneNumber);
                    newClient.setPhoneNumber(phoneNumber);
                    newClient.setDocument("WA-" + phoneNumber); // Placeholder
                    newClient.setTenantId("default");
                    return clientRepository.save(newClient);
                });

        // 2. Find or create ticket
        SupportTicket ticket = ticketRepository.findFirstByClientAndStatusInAndTenantIdOrderByCreatedAtDesc(
                client, 
                Arrays.asList(TicketStatus.OPEN, TicketStatus.IN_PROGRESS), 
                "default"
        ).orElseGet(() -> {
            SupportTicket newTicket = new SupportTicket();
            newTicket.setClient(client);
            newTicket.setSource(SupportTicketSource.WHATSAPP);
            newTicket.setExternalConversationId(phoneNumber);
            newTicket.setStatus(TicketStatus.OPEN);
            newTicket.setTenantId("default");
            return ticketRepository.save(newTicket);
        });

        // 3. Save message
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setTicket(ticket);
        chatMessage.setContent(text);
        chatMessage.setSenderId(client.getId().toString()); // Use client ID as sender
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setMessageId(UUID.randomUUID().toString());
        chatMessage.setTenantId("default");

        ChatMessage savedMessage = chatMessageService.saveMessage(chatMessage);

        // 4. Notify operators
        messagingTemplate.convertAndSend("/topic/chat/" + ticket.getId(), savedMessage);
        messagingTemplate.convertAndSend("/topic/tickets", ticket); // Notify ticket list
    }
}
