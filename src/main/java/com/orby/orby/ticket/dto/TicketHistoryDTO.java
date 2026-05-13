package com.orby.orby.ticket.dto;

import java.util.List;

public class TicketHistoryDTO {
    private String ticketId;
    private String date;
    private String sector;
    private String operator;
    private String reason;
    private String subReason;
    private List<HistoryMessageDTO> messages;

    public TicketHistoryDTO() {}

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getSubReason() { return subReason; }
    public void setSubReason(String subReason) { this.subReason = subReason; }

    public List<HistoryMessageDTO> getMessages() { return messages; }
    public void setMessages(List<HistoryMessageDTO> messages) { this.messages = messages; }

    public static class HistoryMessageDTO {
        private String sender;
        private String text;
        private String time;
        private boolean isDivider;
        private String label;

        public HistoryMessageDTO() {}

        public String getSender() { return sender; }
        public void setSender(String sender) { this.sender = sender; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }

        public boolean isIsDivider() { return isDivider; }
        public void setIsDivider(boolean isDivider) { this.isDivider = isDivider; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
    }
}
