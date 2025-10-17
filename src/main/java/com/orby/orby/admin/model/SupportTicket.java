package com.orby.orby.admin.model;

import com.orby.orby.shared.model.Tenant;
import com.orby.orby.shared.model.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@Entity
@EqualsAndHashCode(callSuper=true)
public class SupportTicket extends TenantAwareEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Tenant tenantId;

    @Column(nullable = false)
    private Sector sectorId;

    //@Column(nullable = false)
    //private Client clientId;

    @Column(nullable = false)
    private Operator operatorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OperatorStatus status = OperatorStatus.ONLINE;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime closedAt;
}
