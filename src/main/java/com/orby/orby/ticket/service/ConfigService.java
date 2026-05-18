package com.orby.orby.ticket.service;

import com.orby.orby.ticket.model.CannedResponse;
import com.orby.orby.ticket.model.TicketReason;
import com.orby.orby.ticket.model.TicketSubReason;
import com.orby.orby.ticket.repository.CannedResponseRepository;
import com.orby.orby.ticket.repository.TicketReasonRepository;
import com.orby.orby.ticket.repository.TicketSubReasonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ConfigService {

    private final TicketReasonRepository reasonRepository;
    private final TicketSubReasonRepository subReasonRepository;
    private final CannedResponseRepository cannedRepository;

    public ConfigService(TicketReasonRepository reasonRepository,
                         TicketSubReasonRepository subReasonRepository,
                         CannedResponseRepository cannedRepository) {
        this.reasonRepository = reasonRepository;
        this.subReasonRepository = subReasonRepository;
        this.cannedRepository = cannedRepository;
    }

    // ── Reasons ──────────────────────────────────
    public List<TicketReason> getReasons() {
        return reasonRepository.findAll();
    }

    public Optional<TicketReason> findReasonById(Long id) {
        return reasonRepository.findById(id);
    }

    @Transactional(readOnly = false)
    public TicketReason saveReason(TicketReason reason) {
        return reasonRepository.save(reason);
    }

    @Transactional(readOnly = false)
    public void deleteReason(Long id) {
        subReasonRepository.deleteByReasonId(id);
        reasonRepository.deleteById(id);
    }

    // ── SubReasons ───────────────────────────────
    public List<TicketSubReason> getSubReasons() {
        return subReasonRepository.findAll();
    }

    public Optional<TicketSubReason> findSubReasonById(Long id) {
        return subReasonRepository.findById(id);
    }

    @Transactional(readOnly = false)
    public TicketSubReason saveSubReason(TicketSubReason sr) {
        return subReasonRepository.save(sr);
    }

    @Transactional(readOnly = false)
    public void deleteSubReason(Long id) {
        subReasonRepository.deleteById(id);
    }

    // ── Canned Responses ─────────────────────────
    public List<CannedResponse> getCannedResponses() {
        return cannedRepository.findAll();
    }

    public Optional<CannedResponse> findCannedResponseById(Long id) {
        return cannedRepository.findById(id);
    }

    @Transactional(readOnly = false)
    public CannedResponse saveCannedResponse(CannedResponse canned) {
        return cannedRepository.save(canned);
    }

    @Transactional(readOnly = false)
    public void deleteCannedResponse(Long id) {
        cannedRepository.deleteById(id);
    }
}
