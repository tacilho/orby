package com.orby.orby.admin.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.orby.orby.shared.model.TenantAwareEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity

@EqualsAndHashCode(callSuper=true)
public class Operator extends TenantAwareEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sectorId;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    @Email
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OperatorStatus status = OperatorStatus.OFFLINE;

}