package com.orby.orby.ticket.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.orby.orby.shared.model.TenantAwareEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class TicketNote extends TenantAwareEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    @JsonBackReference
    private SupportTicket ticket;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    private String operator;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SupportTicket getTicket() { return ticket; }
    public void setTicket(SupportTicket ticket) { this.ticket = ticket; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
