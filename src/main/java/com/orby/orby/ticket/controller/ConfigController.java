package com.orby.orby.ticket.controller;

import com.orby.orby.ticket.model.CannedResponse;
import com.orby.orby.ticket.model.TicketReason;
import com.orby.orby.ticket.model.TicketSubReason;
import com.orby.orby.ticket.repository.CannedResponseRepository;
import com.orby.orby.ticket.repository.TicketReasonRepository;
import com.orby.orby.ticket.repository.TicketSubReasonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    // ── Reasons ──────────────────────────────────
    @GetMapping("/reasons")
    public List<TicketReason> getReasons() {
        return reasonRepository.findAll();
    }

    @PostMapping("/reasons")
    public TicketReason createReason(@RequestBody TicketReason reason) {
        reason.setTenantId("default");
        return reasonRepository.save(reason);
    }

    @PutMapping("/reasons/{id}")
    public ResponseEntity<TicketReason> updateReason(@PathVariable Long id, @RequestBody TicketReason data) {
        return reasonRepository.findById(id)
                .map(r -> { r.setTitle(data.getTitle()); return ResponseEntity.ok(reasonRepository.save(r)); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/reasons/{id}")
    public void deleteReason(@PathVariable Long id) {
        // Delete subreasons first
        subReasonRepository.deleteByReasonId(id);
        reasonRepository.deleteById(id);
    }

    // ── SubReasons ───────────────────────────────
    @GetMapping("/subreasons")
    public List<TicketSubReason> getSubReasons() {
        return subReasonRepository.findAll();
    }

    @PostMapping("/subreasons")
    public TicketSubReason createSubReason(@RequestBody Map<String, Object> body) {
        TicketSubReason sr = new TicketSubReason();
        sr.setTitle((String) body.get("title"));
        sr.setTenantId("default");
        Long reasonId = Long.valueOf(body.get("reasonId").toString());
        TicketReason reason = reasonRepository.findById(reasonId)
                .orElseThrow(() -> new RuntimeException("Reason not found"));
        sr.setReason(reason);
        return subReasonRepository.save(sr);
    }

    @PutMapping("/subreasons/{id}")
    public ResponseEntity<TicketSubReason> updateSubReason(@PathVariable Long id, @RequestBody TicketSubReason data) {
        return subReasonRepository.findById(id)
                .map(sr -> { sr.setTitle(data.getTitle()); return ResponseEntity.ok(subReasonRepository.save(sr)); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/subreasons/{id}")
    public void deleteSubReason(@PathVariable Long id) {
        subReasonRepository.deleteById(id);
    }

    // ── Canned Responses ─────────────────────────
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
