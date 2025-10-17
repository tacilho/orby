package com.orby.orby.ticket.service;

import com.orby.orby.ticket.model.SupportTicket;
import com.orby.orby.ticket.repository.SupportTicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;

    public SupportTicketService(SupportTicketRepository supportTicketRepository) {
        this.supportTicketRepository = supportTicketRepository;
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
}
