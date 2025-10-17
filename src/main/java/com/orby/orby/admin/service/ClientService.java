package com.orby.orby.admin.service;

import com.orby.orby.admin.model.Client;
import com.orby.orby.admin.repository.ClientRepository;
import com.orby.orby.shared.tenant.TenantContext; // IMPORTADO
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public List<Client> findAll() {
        return clientRepository.findAll();
    }

    public Optional<Client> findById(Long id) {

        String currentTenant = TenantContext.getCurrentTenant();

        return clientRepository.findByIdAndTenantId(id, currentTenant);
    }

    @Transactional(readOnly = false)
    public Client save(Client client) {
        return clientRepository.save(client);
    }
}