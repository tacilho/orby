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
    private final com.orby.orby.admin.repository.TenantConfigRepository tenantConfigRepository;

    @Value("${whatsapp.verify.token:}")
    private String verifyToken;

    @Value("${whatsapp.app.secret:}")
    private String appSecret;

    public WhatsAppWebhookController(ClientRepository clientRepository,
                                     SupportTicketRepository ticketRepository,
                                     com.orby.orby.admin.repository.SectorRepository sectorRepository,
                                     ChatMessageService chatMessageService,
                                     SimpMessagingTemplate messagingTemplate,
                                     WhatsAppService whatsAppService,
                                     com.orby.orby.admin.repository.TenantConfigRepository tenantConfigRepository) {
        this.clientRepository = clientRepository;
        this.ticketRepository = ticketRepository;
        this.sectorRepository = sectorRepository;
        this.chatMessageService = chatMessageService;
        this.messagingTemplate = messagingTemplate;
        this.whatsAppService = whatsAppService;
        this.tenantConfigRepository = tenantConfigRepository;
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
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String rawBody,
            @org.springframework.web.bind.annotation.RequestHeader(value = "X-Hub-Signature-256", required = false) String signature) {
        try {
            if (!isSignatureValid(rawBody, signature)) {
                System.err.println("[Webhook] Assinatura inválida. Requisição rejeitada.");
                return ResponseEntity.status(403).build();
            }
            Map<String, Object> payload;
            try {
                payload = new com.fasterxml.jackson.databind.ObjectMapper().readValue(rawBody, 
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                System.err.println("[Webhook] Erro ao parsear payload: " + e.getMessage());
                return ResponseEntity.badRequest().build();
            }

            System.out.println("Webhook received payload: " + payload);
            
            // 1. Extrair o phone_number_id do destinatário
            String recipientPhoneId = extractRecipientPhoneId(payload);
            String tenantId = "default";
            
            if (recipientPhoneId != null) {
                // 2. Buscar qual TenantConfig possui esse Phone ID configurado no banco de forma global
                var config = tenantConfigRepository.findByWhatsAppPhoneNumberIdWithoutFilter(recipientPhoneId);
                if (config.isPresent()) {
                    tenantId = config.get().getTenantId();
                    System.out.println("Mapped webhook recipient phone_number_id " + recipientPhoneId + " to tenant: " + tenantId);
                } else {
                    System.out.println("No tenant found for phone_number_id: " + recipientPhoneId + ". Falling back to default.");
                }
            } else {
                System.out.println("Recipient phone_number_id not found in payload. Using default tenant.");
            }

            // 3. Setar o TenantContext para esta thread
            TenantContext.setCurrentTenant(tenantId);
            processPayload(payload);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok().build(); // Always return 200 to Meta to avoid retries on failure
        } finally {
            TenantContext.clear();
        }
    }

    private String extractRecipientPhoneId(Map<String, Object> payload) {
        try {
            List<Map<String, Object>> entries = (List<Map<String, Object>>) payload.get("entry");
            if (entries != null && !entries.isEmpty()) {
                List<Map<String, Object>> changes = (List<Map<String, Object>>) entries.get(0).get("changes");
                if (changes != null && !changes.isEmpty()) {
                    Map<String, Object> value = (Map<String, Object>) changes.get(0).get("value");
                    if (value != null) {
                        Map<String, Object> metadata = (Map<String, Object>) value.get("metadata");
                        if (metadata != null) {
                            return (String) metadata.get("phone_number_id");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Erro ao extrair phone_number_id do payload da Meta: " + e.getMessage());
        }
        return null;
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
                    String type = (String) msg.get("type");
                    
                    if ("text".equals(type)) {
                        Map<String, Object> textObj = (Map<String, Object>) msg.get("text");
                        if (textObj != null) {
                            String text = (String) textObj.get("body");
                            handleIncomingMessage(from, text, ChatMessageType.TEXT, null, null);
                        }
                    } else if (Arrays.asList("image", "video", "audio", "voice", "document").contains(type)) {
                        Map<String, Object> mediaObj = (Map<String, Object>) msg.get(type);
                        if (mediaObj != null) {
                            String mediaId = (String) mediaObj.get("id");
                            String mimeType = (String) mediaObj.get("mime_type");
                            String caption = (String) mediaObj.get("caption");
                            
                            ChatMessageType msgType = ChatMessageType.TEXT;
                            if ("image".equals(type)) msgType = ChatMessageType.IMAGE;
                            else if ("video".equals(type)) msgType = ChatMessageType.VIDEO;
                            else if ("audio".equals(type)) msgType = ChatMessageType.AUDIO;
                            else if ("voice".equals(type)) msgType = ChatMessageType.VOICE;
                            else if ("document".equals(type)) msgType = ChatMessageType.DOCUMENT;

                            handleIncomingMessage(from, caption != null ? caption : "", msgType, mediaId, mimeType);
                        }
                    }
                }
            }
        }
    }

    public void handleIncomingMessage(String phoneNumber, String text, ChatMessageType type, String mediaId, String mimeType) {
        String activeTenant = TenantContext.getCurrentTenant();
        if (activeTenant == null) {
            activeTenant = "default";
        }

        final String tenantForEntity = activeTenant;

        // 1. Find or create client
        Client client = clientRepository.findByPhoneNumberAndTenantId(phoneNumber, tenantForEntity)
                .orElseGet(() -> {
                    System.out.println("Creating new client for: " + phoneNumber + " in tenant: " + tenantForEntity);
                    Client newClient = new Client();
                    newClient.setName("WhatsApp User " + phoneNumber);
                    newClient.setPhoneNumber(phoneNumber);
                    newClient.setDocument("WA-" + phoneNumber); // Placeholder
                    newClient.setTenantId(tenantForEntity);
                    return clientRepository.save(newClient);
                });

        // 1.5 Check if this is a rating response (1-5) for a recently closed ticket
        String trimmed = text.trim();
        if (type == ChatMessageType.TEXT && trimmed.matches("^[1-5]$")) {
            var closedTicket = ticketRepository.findFirstByClientAndStatusAndRatingIsNullAndTenantIdOrderByClosedAtDesc(
                    client, TicketStatus.CLOSED, tenantForEntity);
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

                messagingTemplate.convertAndSend("/topic/tickets", ticket);
                return;
            }
        }

        // 2. Find or create ticket
        SupportTicket ticket = ticketRepository.findFirstByClientAndStatusInAndTenantIdOrderByCreatedAtDesc(
                client, 
                Arrays.asList(TicketStatus.OPEN, TicketStatus.IN_PROGRESS), 
                tenantForEntity
        ).orElseGet(() -> {
            SupportTicket newTicket = new SupportTicket();
            newTicket.setClient(client);
            newTicket.setSource(SupportTicketSource.WHATSAPP);
            newTicket.setExternalConversationId(phoneNumber);
            newTicket.setStatus(TicketStatus.OPEN);
            newTicket.setTenantId(tenantForEntity);
            sectorRepository.findAll().stream().findFirst().ifPresent(newTicket::setSector);
            return ticketRepository.save(newTicket);
        });

        // 3. Save message
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setTicket(ticket);
        chatMessage.setContent(text);
        chatMessage.setType(type);
        chatMessage.setMimeType(mimeType);
        chatMessage.setSenderId(client.getId().toString());
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setMessageId(UUID.randomUUID().toString());
        chatMessage.setTenantId(tenantForEntity);

        if (mediaId != null) {
            String mediaUrl = whatsAppService.getMediaUrl(mediaId);
            chatMessage.setMediaUrl(mediaUrl);
        }

        ChatMessage savedMessage = chatMessageService.saveMessage(chatMessage);

        // 4. Notify operators
        messagingTemplate.convertAndSend("/topic/chat/" + ticket.getId(), savedMessage);
        messagingTemplate.convertAndSend("/topic/tickets", ticket);
    }

    private boolean isSignatureValid(String body, String signatureHeader) {
        if (appSecret == null || appSecret.isEmpty()) {
            // Se o secret não estiver configurado, pula a validação (dev mode)
            System.out.println("[Webhook] AVISO: whatsapp.app.secret não configurado. Validação de assinatura desabilitada.");
            return true;
        }
        if (signatureHeader == null || !signatureHeader.startsWith("sha256=")) {
            System.err.println("[Webhook] Assinatura ausente ou malformada.");
            return false;
        }
        try {
            String expectedSignature = signatureHeader.substring(7);
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(
                appSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256"
            );
            mac.init(secretKey);
            byte[] hash = mac.doFinal(body.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(expectedSignature);
        } catch (Exception e) {
            System.err.println("[Webhook] Erro ao validar assinatura: " + e.getMessage());
            return false;
        }
    }
}
