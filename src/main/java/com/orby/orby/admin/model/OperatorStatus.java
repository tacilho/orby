package com.orby.orby.admin.model;

public enum OperatorStatus {

    ONLINE("Online"),
    AWAY("Ausente"),
    OFFLINE("Offline");

    private final String description;

    OperatorStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}