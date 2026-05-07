package com.orby.orby.ticket.model;

import com.orby.orby.shared.model.TenantAwareEntity;
import jakarta.persistence.*;

@Entity
public class TicketSubReason extends TenantAwareEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reason_id", nullable = false)
    private TicketReason reason;

    @Column(nullable = false)
    private String title;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TicketReason getReason() { return reason; }
    public void setReason(TicketReason reason) { this.reason = reason; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
