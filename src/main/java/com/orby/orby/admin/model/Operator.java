package com.orby.orby.admin.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.orby.orby.shared.model.TenantAwareEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
public class Operator extends TenantAwareEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true)
    private Long sectorId;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    @Email
    private String email;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OperatorRole role = OperatorRole.OPERATOR;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OperatorStatus status = OperatorStatus.OFFLINE;

    @Column(name = "view_others_tickets", nullable = true)
    private Boolean viewOthersTickets = true;

    @Column(name = "respond_others_tickets", nullable = true)
    private Boolean respondOthersTickets = true;

    @Column(name = "manage_client_data", nullable = true)
    private Boolean manageClientData = true;

    @Column(name = "manage_sectors_and_reasons", nullable = true)
    private Boolean manageSectorsAndReasons = true;

    @Column(name = "view_reports", nullable = true)
    private Boolean viewReports = true;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSectorId() { return sectorId; }
    public void setSectorId(Long sectorId) { this.sectorId = sectorId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public OperatorStatus getStatus() { return status; }
    public void setStatus(OperatorStatus status) { this.status = status; }
    public OperatorRole getRole() { return role; }
    public void setRole(OperatorRole role) { this.role = role; }

    public Boolean getViewOthersTickets() { return viewOthersTickets == null ? true : viewOthersTickets; }
    public void setViewOthersTickets(Boolean viewOthersTickets) { this.viewOthersTickets = viewOthersTickets; }

    public Boolean getRespondOthersTickets() { return respondOthersTickets == null ? true : respondOthersTickets; }
    public void setRespondOthersTickets(Boolean respondOthersTickets) { this.respondOthersTickets = respondOthersTickets; }

    public Boolean getManageClientData() { return manageClientData == null ? true : manageClientData; }
    public void setManageClientData(Boolean manageClientData) { this.manageClientData = manageClientData; }

    public Boolean getManageSectorsAndReasons() { return manageSectorsAndReasons == null ? true : manageSectorsAndReasons; }
    public void setManageSectorsAndReasons(Boolean manageSectorsAndReasons) { this.manageSectorsAndReasons = manageSectorsAndReasons; }

    public Boolean getViewReports() { return viewReports == null ? true : viewReports; }
    public void setViewReports(Boolean viewReports) { this.viewReports = viewReports; }
}