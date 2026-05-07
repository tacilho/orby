package com.orby.orby.ticket.dto;

public class TicketCloseRequest {
    private String reason;
    private String subReason;
    private String comment;
    private Integer rating;

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getSubReason() { return subReason; }
    public void setSubReason(String subReason) { this.subReason = subReason; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
}
