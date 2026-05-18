package com.orby.orby.ticket.controller;

import com.orby.orby.ticket.model.CannedResponse;
import com.orby.orby.ticket.model.TicketReason;
import com.orby.orby.ticket.model.TicketSubReason;
import com.orby.orby.ticket.service.ConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ConfigController {

    private final ConfigService configService;

    public ConfigController(ConfigService configService) {
        this.configService = configService;
    }

    // ── Reasons ──────────────────────────────────
    @GetMapping("/reasons")
    public List<TicketReason> getReasons() {
        return configService.getReasons();
    }

    @PostMapping("/reasons")
    public TicketReason createReason(@RequestBody TicketReason reason) {
        String tenantId = com.orby.orby.shared.tenant.TenantContext.getCurrentTenant();
        if (tenantId == null || tenantId.isEmpty()) {
            tenantId = "default";
        }
        reason.setTenantId(tenantId);
        return configService.saveReason(reason);
    }

    @PutMapping("/reasons/{id}")
    public ResponseEntity<TicketReason> updateReason(@PathVariable Long id, @RequestBody TicketReason data) {
        return configService.findReasonById(id)
                .map(r -> {
                    r.setTitle(data.getTitle());
                    return ResponseEntity.ok(configService.saveReason(r));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/reasons/{id}")
    public ResponseEntity<Void> deleteReason(@PathVariable Long id) {
        return configService.findReasonById(id)
                .map(r -> {
                    configService.deleteReason(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── SubReasons ───────────────────────────────
    @GetMapping("/subreasons")
    public List<TicketSubReason> getSubReasons() {
        return configService.getSubReasons();
    }

    @PostMapping("/subreasons")
    public ResponseEntity<TicketSubReason> createSubReason(@RequestBody Map<String, Object> body) {
        TicketSubReason sr = new TicketSubReason();
        sr.setTitle((String) body.get("title"));
        
        String tenantId = com.orby.orby.shared.tenant.TenantContext.getCurrentTenant();
        if (tenantId == null || tenantId.isEmpty()) {
            tenantId = "default";
        }
        sr.setTenantId(tenantId);

        Long reasonId = Long.valueOf(body.get("reasonId").toString());
        return configService.findReasonById(reasonId)
                .map(reason -> {
                    sr.setReason(reason);
                    return ResponseEntity.ok(configService.saveSubReason(sr));
                })
                .orElse(ResponseEntity.badRequest().build()); // Return 400 if reason belongs to another tenant or doesn't exist
    }

    @PutMapping("/subreasons/{id}")
    public ResponseEntity<TicketSubReason> updateSubReason(@PathVariable Long id, @RequestBody TicketSubReason data) {
        return configService.findSubReasonById(id)
                .map(sr -> {
                    sr.setTitle(data.getTitle());
                    return ResponseEntity.ok(configService.saveSubReason(sr));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/subreasons/{id}")
    public ResponseEntity<Void> deleteSubReason(@PathVariable Long id) {
        return configService.findSubReasonById(id)
                .map(sr -> {
                    configService.deleteSubReason(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Canned Responses ─────────────────────────
    @GetMapping("/canned-responses")
    public List<CannedResponse> getCannedResponses() {
        return configService.getCannedResponses();
    }

    @PostMapping("/canned-responses")
    public CannedResponse saveCannedResponse(@RequestBody CannedResponse canned) {
        String tenantId = com.orby.orby.shared.tenant.TenantContext.getCurrentTenant();
        if (tenantId == null || tenantId.isEmpty()) {
            tenantId = "default";
        }
        canned.setTenantId(tenantId);
        return configService.saveCannedResponse(canned);
    }

    @DeleteMapping("/canned-responses/{id}")
    public ResponseEntity<Void> deleteCannedResponse(@PathVariable Long id) {
        return configService.findCannedResponseById(id)
                .map(c -> {
                    configService.deleteCannedResponse(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
