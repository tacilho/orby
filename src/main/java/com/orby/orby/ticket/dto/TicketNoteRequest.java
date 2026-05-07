package com.orby.orby.ticket.dto;

public class TicketNoteRequest {
    private String text;
    private String operator;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
}
