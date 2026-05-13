package com.orby.orby.ticket.model;

public enum TicketStatus {
    OPEN("Aberto"),
    IN_PROGRESS("Em Atendimento"),
    STAND_BY("Em Espera"),
    PENDING_TRANSFER("Transferidos"),
    CLOSED("Finalizado");

    private final String description;

    TicketStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
