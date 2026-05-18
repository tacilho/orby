package com.orby.orby.admin.controller;

import com.orby.orby.admin.model.TenantConfig;
import com.orby.orby.admin.service.TenantConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenant-config")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class TenantConfigController {

    private final TenantConfigService tenantConfigService;

    public TenantConfigController(TenantConfigService tenantConfigService) {
        this.tenantConfigService = tenantConfigService;
    }

    @GetMapping
    public ResponseEntity<TenantConfig> getConfig() {
        return tenantConfigService.getConfigForCurrentTenant()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TenantConfig> saveConfig(@RequestBody TenantConfig config) {
        return ResponseEntity.ok(tenantConfigService.saveConfigForCurrentTenant(config));
    }
}
