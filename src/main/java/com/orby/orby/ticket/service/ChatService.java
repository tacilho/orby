package com.orby.orby.ticket.service;

import com.orby.orby.admin.model.Client;
import com.orby.orby.admin.repository.ClientRepository;
import com.orby.orby.admin.repository.SectorRepository;
import com.orby.orby.shared.tenant.TenantContext;
import com.orby.orby.ticket.model.*;
import com.orby.orby.ticket.repository.SupportTicketRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.UUID;

@Service
public class ChatService {

    private final ClientRepository clientRepository;
    private final SupportTicketRepository ticketRepository;
    private final SectorRepository sectorRepository;
    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final WhatsAppService whatsAppService;

    public ChatService(ClientRepository clientRepository,
                       SupportTicketRepository ticketRepository,
                       SectorRepository sectorRepository,
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

    @Transactional
    public void handleIncomingMessage(String phoneNumber, String text, ChatMessageType type, String mediaId, String mimeType) {
        String activeTenant = TenantContext.getCurrentTenant();
        if (activeTenant == null) {
            activeTenant = "default";
        }

        final String tenantForEntity = activeTenant;
        final String cleanIncoming = normalizePhoneNumber(phoneNumber);

        // 1. Find or create client using normalized match for maximum robustness
        Client client = clientRepository.findAll().stream()
                .filter(c -> tenantForEntity.equals(c.getTenantId()) && c.getPhoneNumber() != null &&
                        cleanIncoming.equals(normalizePhoneNumber(c.getPhoneNumber())))
                .findFirst()
                .orElseGet(() -> {
                    return clientRepository.findByPhoneNumberAndTenantId(phoneNumber, tenantForEntity)
                            .orElseGet(() -> {
                                System.out.println("Creating new client for: " + phoneNumber + " (clean: " + cleanIncoming + ") in tenant: " + tenantForEntity);
                                Client newClient = new Client();
                                newClient.setName("WhatsApp User " + cleanIncoming);
                                newClient.setPhoneNumber(cleanIncoming); // Store standardized format
                                newClient.setDocument("WA-" + cleanIncoming); // Placeholder
                                newClient.setTenantId(tenantForEntity);
                                return clientRepository.save(newClient);
                            });
                });

        // 2. Check if this is a rating response (1-5) for a recently closed ticket
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

        // 3. Find or create ticket including all active attention statuses
        SupportTicket ticket = ticketRepository.findFirstByClientAndStatusInAndTenantIdOrderByCreatedAtDesc(
                client, 
                Arrays.asList(TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.STAND_BY, TicketStatus.PENDING_TRANSFER), 
                tenantForEntity
        ).orElseGet(() -> {
            SupportTicket newTicket = new SupportTicket();
            newTicket.setClient(client);
            newTicket.setSource(SupportTicketSource.WHATSAPP);
            newTicket.setExternalConversationId(phoneNumber); // Keep exact JID/LID for bridge sending
            newTicket.setStatus(TicketStatus.OPEN);
            newTicket.setTenantId(tenantForEntity);
            sectorRepository.findAll().stream().findFirst().ifPresent(newTicket::setSector);
            return ticketRepository.save(newTicket);
        });

        // Automatically transition ticket back to IN_PROGRESS if client replies to a standby or transfer-pending ticket
        if (ticket.getStatus() == TicketStatus.STAND_BY || ticket.getStatus() == TicketStatus.PENDING_TRANSFER) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            ticket.setStandByReason(null);
            ticketRepository.save(ticket);
        }

        // 4. Save message
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

        // 5. Notify operators
        messagingTemplate.convertAndSend("/topic/chat/" + ticket.getId(), savedMessage);
        messagingTemplate.convertAndSend("/topic/tickets", ticket);
    }

    private String normalizePhoneNumber(String number) {
        if (number == null) return null;
        String clean = number.replaceAll("@.*$", "").replaceAll("\\D", "");
        // Normalize Brazilian 9th digit for cell phones (55 + 2-digit DDD + 9 digits starting with 9)
        if (clean.startsWith("55") && (clean.length() == 13 || clean.length() == 12)) {
            String ddd = clean.substring(2, 4);
            String subscriber = clean.substring(4);
            if (subscriber.length() == 9 && subscriber.startsWith("9")) {
                subscriber = subscriber.substring(1);
            }
            return "55" + ddd + subscriber;
        }
        return clean;
    }
}
