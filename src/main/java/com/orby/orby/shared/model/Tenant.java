package com.orby.orby.shared.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Tenant {

    @Id
    private String id;
    private String name;
    private boolean active = true;

    public Tenant() {}

    public Tenant(String id, String name, boolean active) {
        this.id = id;
        this.name = name;
        this.active = active;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}