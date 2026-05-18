package com.orby.orby.admin.controller;

import com.orby.orby.admin.model.Client;
import com.orby.orby.admin.repository.ClientRepository;
import com.orby.orby.shared.tenant.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/management/clients")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ClientController {

    private final ClientRepository clientRepository;

    public ClientController(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable Long id, @RequestBody Client clientData) {
        String tenantId = com.orby.orby.shared.tenant.TenantContext.getCurrentTenant();
        if (tenantId == null || tenantId.isEmpty()) {
            tenantId = "default";
        }
        return clientRepository.findByIdAndTenantId(id, tenantId)
                .map(client -> {
                    client.setName(clientData.getName());
                    client.setDocument(clientData.getDocument());
                    client.setPhoneNumber(clientData.getPhoneNumber());
                    client.setEmail(clientData.getEmail());
                    return ResponseEntity.ok(clientRepository.save(client));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
