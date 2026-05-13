package com.orby.orby.ticket.controller;

import com.orby.orby.admin.model.Client;
import com.orby.orby.admin.repository.ClientRepository;
import com.orby.orby.shared.tenant.TenantContext;
import com.orby.orby.ticket.model.*;
import com.orby.orby.ticket.repository.SupportTicketRepository;
import com.orby.orby.ticket.service.ChatMessageService;
import com.orby.orby.ticket.service.WhatsAppService;
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
    private final com.orby.orby.admin.repository.SectorRepository sectorRepository;
    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final WhatsAppService whatsAppService;

    @Value("${whatsapp.verify.token:}")
    private String verifyToken;

    public WhatsAppWebhookController(ClientRepository clientRepository,
                                     SupportTicketRepository ticketRepository,
                                     com.orby.orby.admin.repository.SectorRepository sectorRepository,
                                     ChatMessageService chatMessageService,
                                     SimpMessagingTemplate messagingTemplate,
                                     WhatsAppService whatsAppService) {
        this.clientRepository = clientRepository;
        this.ticketRepository = ticketRepository;
        this.sectorRepository = sectorRepository;
        this.chatMessageService = chatMessageService;
        this.messagingTemplate = messagingTemplate;
        this.whatsAppService = whatsAppService;
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
            System.out.println("Webhook received payload: " + payload);
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

                    System.out.println("Processing message from: " + from + " with body: " + text);
                    handleIncomingMessage(from, text);
                }
            }
        }
    }

    private void handleIncomingMessage(String phoneNumber, String text) {
        // 1. Find or create client
        Client client = clientRepository.findByPhoneNumberAndTenantId(phoneNumber, "default")
                .orElseGet(() -> {
                    System.out.println("Creating new client for: " + phoneNumber);
                    Client newClient = new Client();
                    newClient.setName("WhatsApp User " + phoneNumber);
                    newClient.setPhoneNumber(phoneNumber);
                    newClient.setDocument("WA-" + phoneNumber); // Placeholder
                    newClient.setTenantId("default");
                    return clientRepository.save(newClient);
                });

        // 1.5 Check if this is a rating response (1-5) for a recently closed ticket
        String trimmed = text.trim();
        if (trimmed.matches("^[1-5]$")) {
            var closedTicket = ticketRepository.findFirstByClientAndStatusAndRatingIsNullAndTenantIdOrderByClosedAtDesc(
                    client, TicketStatus.CLOSED, "default");
            if (closedTicket.isPresent()) {
                SupportTicket ticket = closedTicket.get();
                ticket.setRating(Integer.parseInt(trimmed));
                ticketRepository.save(ticket);
                System.out.println("Rating " + trimmed + " saved for ticket " + ticket.getId());

                // Send thank you message
                try {
                    String[] thanks = {
                        "😔 Obrigado pelo seu feedback. Vamos melhorar!",
                        "😐 Obrigado pelo feedback. Vamos trabalhar para melhorar.",
                        "🙂 Obrigado pela avaliação!",
                        "😊 Obrigado! Ficamos felizes com sua avaliação!",
                        "🎉 Muito obrigado! Excelente saber que gostou do atendimento!"
                    };
                    int idx = Integer.parseInt(trimmed) - 1;
                    whatsAppService.sendTextMessage(phoneNumber, thanks[idx]);
                } catch (Exception e) {
                    System.err.println("Failed to send rating thank-you: " + e.getMessage());
                }

                // Notify frontend about rating update
                messagingTemplate.convertAndSend("/topic/tickets", ticket);
                return; // Don't create a new ticket for rating responses
            }
        }

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
            
            // Set default sector (Suporte N1)
            sectorRepository.findAll().stream().findFirst().ifPresent(newTicket::setSector);
            
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
