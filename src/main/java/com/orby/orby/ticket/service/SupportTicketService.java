package com.orby.orby.ticket.service;

import com.orby.orby.admin.model.Operator;
import com.orby.orby.admin.model.Sector;
import com.orby.orby.admin.repository.OperatorRepository;
import com.orby.orby.admin.repository.SectorRepository;
import com.orby.orby.ticket.model.*;
import com.orby.orby.ticket.repository.EquipmentRepository;
import com.orby.orby.ticket.repository.SupportTicketRepository;
import com.orby.orby.ticket.repository.TicketNoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final OperatorRepository operatorRepository;
    private final SectorRepository sectorRepository;
    private final TicketNoteRepository noteRepository;
    private final EquipmentRepository equipmentRepository;
    private final WhatsAppService whatsAppService;

    public SupportTicketService(SupportTicketRepository supportTicketRepository, 
                                OperatorRepository operatorRepository, 
                                SectorRepository sectorRepository,
                                TicketNoteRepository noteRepository,
                                EquipmentRepository equipmentRepository,
                                WhatsAppService whatsAppService) {
        this.supportTicketRepository = supportTicketRepository;
        this.operatorRepository = operatorRepository;
        this.sectorRepository = sectorRepository;
        this.noteRepository = noteRepository;
        this.equipmentRepository = equipmentRepository;
        this.whatsAppService = whatsAppService;
    }

    public List<SupportTicket> findAll() {
        return supportTicketRepository.findAll();
    }

    public Optional<SupportTicket> findById(Long id) {
        return supportTicketRepository.findById(id);
    }

    @Transactional
    public SupportTicket save(SupportTicket supportTicket) {
        return supportTicketRepository.save(supportTicket);
    }

    @Transactional
    public SupportTicket assumeTicket(Long ticketId, Long operatorId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        Operator operator = operatorRepository.findById(operatorId)
                .orElseThrow(() -> new RuntimeException("Operator not found"));
        
        ticket.setOperator(operator);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setAcceptedAt(LocalDateTime.now());
        return supportTicketRepository.save(ticket);
    }

    @Transactional
    public SupportTicket closeTicket(Long ticketId, String reason, String subReason, String comment, Integer rating) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Ticket não encontrado"));
        
        ticket.setStatus(TicketStatus.CLOSED);
        ticket.setClosedAt(LocalDateTime.now());
        ticket.setReason(reason);
        ticket.setSubReason(subReason);
        ticket.setClosingComment(comment);
        ticket.setRating(rating);
        SupportTicket saved = supportTicketRepository.save(ticket);

        // Send rating request via WhatsApp if applicable
        if (saved.getSource() == SupportTicketSource.WHATSAPP && saved.getExternalConversationId() != null) {
            try {
                String ratingMessage = "⭐ *Avaliação do Atendimento* ⭐\n\n"
                    + "Seu chamado foi encerrado.\n"
                    + "Por favor, avalie nosso atendimento respondendo com uma nota de 1 a 5:\n\n"
                    + "1 ⭐ - Péssimo\n"
                    + "2 ⭐⭐ - Ruim\n"
                    + "3 ⭐⭐⭐ - Regular\n"
                    + "4 ⭐⭐⭐⭐ - Bom\n"
                    + "5 ⭐⭐⭐⭐⭐ - Excelente\n\n"
                    + "Obrigado! 😊";
                whatsAppService.sendTextMessage(saved.getExternalConversationId(), ratingMessage);
            } catch (Exception e) {
                System.err.println("Failed to send rating request via WhatsApp: " + e.getMessage());
            }
        }

        return saved;
    }

    @Transactional
    public SupportTicket transferTicket(Long ticketId, Long newOperatorId, Long newSectorId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (newOperatorId != null) {
            Operator operator = operatorRepository.findById(newOperatorId)
                    .orElseThrow(() -> new RuntimeException("Operator not found"));
            ticket.setOperator(operator);
        }

        if (newSectorId != null) {
            Sector sector = sectorRepository.findById(newSectorId)
                    .orElseThrow(() -> new RuntimeException("Sector not found"));
            ticket.setSector(sector);
        }

        return supportTicketRepository.save(ticket);
    }

    @Transactional
    public TicketNote addNote(Long ticketId, String text, String operatorName) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        TicketNote note = new TicketNote();
        note.setTicket(ticket);
        note.setText(text);
        note.setOperator(operatorName);
        note.setCreatedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }

    @Transactional
    public Equipment addEquipment(Long ticketId, String name, String type, String description) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        Equipment equipment = new Equipment();
        equipment.setTicket(ticket);
        equipment.setName(name);
        equipment.setType(type);
        equipment.setDescription(description);
        return equipmentRepository.save(equipment);
    }
}
