package com.orby.orby.admin.controller;

import com.orby.orby.admin.model.TenantConfig;
import com.orby.orby.admin.model.Operator;
import com.orby.orby.admin.model.OperatorRole;
import com.orby.orby.admin.model.OperatorStatus;
import com.orby.orby.admin.repository.TenantConfigRepository;
import com.orby.orby.admin.repository.OperatorRepository;
import com.orby.orby.ticket.repository.SupportTicketRepository;
import com.orby.orby.ticket.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/master")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@PreAuthorize("hasRole('MASTER')")
public class MasterConfigController {

    @Autowired
    private TenantConfigRepository tenantConfigRepository;

    @Autowired
    private OperatorRepository operatorRepository;

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getSaaSMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        long totalTenants = tenantConfigRepository.count();
        long totalTickets = supportTicketRepository.countGlobalTickets();
        long totalMessages = chatMessageRepository.countGlobalMessages();
        long activeOperators = operatorRepository.countOnlineOperatorsWithoutFilter();

        metrics.put("totalTenants", totalTenants);
        metrics.put("totalTickets", totalTickets);
        metrics.put("totalMessages", totalMessages);
        metrics.put("activeOperators", activeOperators);

        // Detalhamento por empresa cadastrada
        List<TenantConfig> tenants = tenantConfigRepository.findAll();
        List<Map<String, Object>> breakdown = tenants.stream().map(t -> {
            Map<String, Object> item = new HashMap<>();
            item.put("tenantId", t.getTenantId());
            item.put("brandName", t.getBrandName());
            
            long ticketsCount = supportTicketRepository.countByTenantId(t.getTenantId());
            long messagesCount = chatMessageRepository.countByTenantId(t.getTenantId());
            
            item.put("tickets", ticketsCount);
            item.put("messages", messagesCount);
            return item;
        }).toList();

        metrics.put("breakdown", breakdown);

        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/tenants")
    public ResponseEntity<List<TenantConfig>> getAllTenants() {
        // Como o tenant ativo é "master", o filtro do Hibernate é desviado e listará TODOS
        return ResponseEntity.ok(tenantConfigRepository.findAll());
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

        // 1. Criar ou Atualizar Configurações do Tenant
        TenantConfig config = tenantConfigRepository.findByTenantId(tenantId).orElse(new TenantConfig());
        config.setTenantId(tenantId);
        config.setBrandName(brandName);
        config.setWhatsAppPhoneNumberId(whatsAppPhoneNumberId);
        config.setWhatsAppApiToken(whatsAppApiToken);
        config.setPrimaryColor("#4f46e5"); // Padrão Indigo
        config.setSidebarColor("#0f172a"); // Padrão Slate Escuro
        config.setPanelBg("#ffffff");
        config.setAppBg("#f8fafc");
        tenantConfigRepository.save(config);

        // 2. Criar o Operador Admin Inicial deste Tenant
        if (adminEmail != null && !adminEmail.isEmpty()) {
            Operator admin = operatorRepository.findByEmailWithoutFilter(adminEmail).orElse(new Operator());
            admin.setName(adminName != null ? adminName : "Admin " + brandName);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword != null ? adminPassword : "123456"));
            admin.setRole(OperatorRole.ADMIN);
            admin.setStatus(OperatorStatus.ONLINE);
            admin.setTenantId(tenantId);
            operatorRepository.save(admin);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Empresa cadastrada com sucesso!");
        response.put("tenantId", tenantId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/tenants/{id}")
    public ResponseEntity<?> deleteTenant(@PathVariable Long id) {
        tenantConfigRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
