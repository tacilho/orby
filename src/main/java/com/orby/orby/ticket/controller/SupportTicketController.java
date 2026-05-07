package com.orby.orby.ticket.controller;

import com.orby.orby.ticket.dto.TicketCloseRequest;
import com.orby.orby.ticket.dto.TicketEquipmentRequest;
import com.orby.orby.ticket.dto.TicketNoteRequest;
import com.orby.orby.ticket.model.Equipment;
import com.orby.orby.ticket.model.SupportTicket;
import com.orby.orby.ticket.model.TicketNote;
import com.orby.orby.ticket.service.SupportTicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@RequestMapping("/management/tickets")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    public SupportTicketController(SupportTicketService supportTicketService) {
        this.supportTicketService = supportTicketService;
    }

    @GetMapping
    public ResponseEntity<List<SupportTicket>> findAllTickets() {
        return ResponseEntity.ok(supportTicketService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicket> findById(@PathVariable Long id) {
        return supportTicketService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/assume")
    public ResponseEntity<SupportTicket> assumeTicket(@PathVariable Long id, @RequestParam Long operatorId) {
        return ResponseEntity.ok(supportTicketService.assumeTicket(id, operatorId));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<SupportTicket> closeTicket(
            @PathVariable Long id,
            @RequestBody TicketCloseRequest request) {
        return ResponseEntity.ok(supportTicketService.closeTicket(
                id, 
                request.getReason(), 
                request.getSubReason(), 
                request.getComment(), 
                request.getRating()));
    }

    @PutMapping("/{id}/transfer")
    public ResponseEntity<SupportTicket> transferTicket(
            @PathVariable Long id,
            @RequestParam(required = false) Long newOperatorId,
            @RequestParam(required = false) Long newSectorId) {
        return ResponseEntity.ok(supportTicketService.transferTicket(id, newOperatorId, newSectorId));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<TicketNote> addNote(
            @PathVariable Long id,
            @RequestBody TicketNoteRequest request) {
        return ResponseEntity.ok(supportTicketService.addNote(id, request.getText(), request.getOperator()));
    }

    @PostMapping("/{id}/equipments")
    public ResponseEntity<Equipment> addEquipment(
            @PathVariable Long id,
            @RequestBody TicketEquipmentRequest request) {
        return ResponseEntity.ok(supportTicketService.addEquipment(
                id, 
                request.getName(), 
                request.getType(), 
                request.getDescription()));
    }
}
