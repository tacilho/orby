package com.orby.orby.ticket.model;

import com.orby.orby.shared.model.TenantAwareEntity;
import jakarta.persistence.*;

@Entity
public class TicketReason extends TenantAwareEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
