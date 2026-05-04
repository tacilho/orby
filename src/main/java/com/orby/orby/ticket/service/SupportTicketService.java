package com.orby.orby.ticket.service;

import com.orby.orby.admin.model.Operator;
import com.orby.orby.admin.model.Sector;
import com.orby.orby.admin.repository.OperatorRepository;
import com.orby.orby.admin.repository.SectorRepository;
import com.orby.orby.ticket.model.SupportTicket;
import com.orby.orby.ticket.repository.SupportTicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final OperatorRepository operatorRepository;
    private final SectorRepository sectorRepository;

    public SupportTicketService(SupportTicketRepository supportTicketRepository, OperatorRepository operatorRepository, SectorRepository sectorRepository) {
        this.supportTicketRepository = supportTicketRepository;
        this.operatorRepository = operatorRepository;
        this.sectorRepository = sectorRepository;
    }

    public List<SupportTicket> findAll() {
        return supportTicketRepository.findAll();
    }

    public Optional<SupportTicket> findById(Long id) {
        return supportTicketRepository.findById(id);
    }

    @Transactional(readOnly = false)
    public SupportTicket save(SupportTicket supportTicket) {
        return supportTicketRepository.save(supportTicket);
    }

    @Transactional(readOnly = false)
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
}
