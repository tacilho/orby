package com.orby.orby.admin.controller;

import com.orby.orby.admin.model.Client;
import com.orby.orby.admin.service.ClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/management/clients")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable Long id, @RequestBody Client clientData) {
        return clientService.findById(id)
                .map(client -> {
                    client.setName(clientData.getName());
                    client.setDocument(clientData.getDocument());
                    client.setPhoneNumber(clientData.getPhoneNumber());
                    client.setEmail(clientData.getEmail());
                    return ResponseEntity.ok(clientService.save(client));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
