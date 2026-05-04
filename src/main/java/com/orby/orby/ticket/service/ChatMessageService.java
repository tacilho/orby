package com.orby.orby.ticket.service;

import com.orby.orby.ticket.model.ChatMessage;
import com.orby.orby.ticket.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    public List<ChatMessage> findMessagesByTicket(Long ticketId) {
        return chatMessageRepository.findByTicketIdOrderByTimestampAsc(ticketId);
    }

    @Transactional
    public ChatMessage saveMessage(ChatMessage message) {
        return chatMessageRepository.save(message);
    }
}
