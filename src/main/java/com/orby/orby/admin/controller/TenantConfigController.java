package com.orby.orby.admin.controller;

import com.orby.orby.admin.model.TenantConfig;
import com.orby.orby.admin.repository.TenantConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenant-config")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class TenantConfigController {

    @Autowired
    private TenantConfigRepository repository;

    @GetMapping
    public ResponseEntity<TenantConfig> getConfig() {
        return repository.findByTenantId("default")
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TenantConfig> saveConfig(@RequestBody TenantConfig config) {
        config.setTenantId("default");
        // Always update the same config for the demo
        repository.findByTenantId("default").ifPresent(existing -> config.setId(existing.getId()));
        return ResponseEntity.ok(repository.save(config));
    }
}
