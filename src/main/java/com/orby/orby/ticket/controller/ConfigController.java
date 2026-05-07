package com.orby.orby.ticket.controller;

import com.orby.orby.ticket.model.CannedResponse;
import com.orby.orby.ticket.model.TicketReason;
import com.orby.orby.ticket.model.TicketSubReason;
import com.orby.orby.ticket.repository.CannedResponseRepository;
import com.orby.orby.ticket.repository.TicketReasonRepository;
import com.orby.orby.ticket.repository.TicketSubReasonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/config")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ConfigController {

    @Autowired
    private TicketReasonRepository reasonRepository;

    @Autowired
    private TicketSubReasonRepository subReasonRepository;

    @Autowired
    private CannedResponseRepository cannedRepository;

    @GetMapping("/reasons")
    public List<TicketReason> getReasons() {
        return reasonRepository.findAll();
    }

    @GetMapping("/subreasons")
    public List<TicketSubReason> getSubReasons() {
        return subReasonRepository.findAll();
    }

    @GetMapping("/canned-responses")
    public List<CannedResponse> getCannedResponses() {
        return cannedRepository.findAll();
    }

    @PostMapping("/canned-responses")
    public CannedResponse saveCannedResponse(@RequestBody CannedResponse canned) {
        return cannedRepository.save(canned);
    }

    @DeleteMapping("/canned-responses/{id}")
    public void deleteCannedResponse(@PathVariable Long id) {
        cannedRepository.deleteById(id);
    }
}
