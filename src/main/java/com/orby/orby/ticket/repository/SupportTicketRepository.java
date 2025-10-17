    package com.orby.orby.ticket.repository;

    import com.orby.orby.ticket.model.SupportTicket;
    import org.springframework.data.jpa.repository.JpaRepository;
    import org.springframework.stereotype.Repository;

    @Repository
    public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    }
