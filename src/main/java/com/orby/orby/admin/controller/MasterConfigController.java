package com.orby.orby.admin.controller;

import com.orby.orby.admin.model.TenantConfig;
import com.orby.orby.admin.service.MasterConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/master")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@PreAuthorize("hasRole('MASTER')")
public class MasterConfigController {

    private final MasterConfigService masterConfigService;

    public MasterConfigController(MasterConfigService masterConfigService) {
        this.masterConfigService = masterConfigService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getSaaSMetrics() {
        return ResponseEntity.ok(masterConfigService.getSaaSMetrics());
    }

    @GetMapping("/tenants")
    public ResponseEntity<List<TenantConfig>> getAllTenants() {
        return ResponseEntity.ok(masterConfigService.getAllTenants());
    }

    @PostMapping("/tenants")
    public ResponseEntity<?> createTenant(@RequestBody Map<String, String> request) {
        String tenantId = request.get("tenantId");
        String brandName = request.get("brandName");
        String whatsAppPhoneNumberId = request.get("whatsAppPhoneNumberId");
        String whatsAppApiToken = request.get("whatsAppApiToken");
        String adminEmail = request.get("adminEmail");
        String adminName = request.get("adminName");
        String adminPassword = request.get("adminPassword");

        if (tenantId == null || tenantId.isEmpty()) {
            return ResponseEntity.badRequest().body("tenantId é obrigatório");
        }

        TenantConfig config = masterConfigService.createTenant(tenantId, brandName, whatsAppPhoneNumberId,
                whatsAppApiToken, adminEmail, adminName, adminPassword);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Empresa cadastrada com sucesso!");
        response.put("tenantId", tenantId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/tenants/{id}")
    public ResponseEntity<Void> deleteTenant(@PathVariable Long id) {
        masterConfigService.deleteTenant(id);
        return ResponseEntity.ok().build();
    }
}
