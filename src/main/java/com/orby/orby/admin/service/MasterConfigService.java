package com.orby.orby.admin.service;

import com.orby.orby.admin.model.Operator;
import com.orby.orby.admin.model.OperatorRole;
import com.orby.orby.admin.model.OperatorStatus;
import com.orby.orby.admin.model.TenantConfig;
import com.orby.orby.admin.repository.OperatorRepository;
import com.orby.orby.admin.repository.TenantConfigRepository;
import com.orby.orby.ticket.repository.ChatMessageRepository;
import com.orby.orby.ticket.repository.SupportTicketRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class MasterConfigService {

    private final TenantConfigRepository tenantConfigRepository;
    private final OperatorRepository operatorRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final PasswordEncoder passwordEncoder;

    public MasterConfigService(TenantConfigRepository tenantConfigRepository,
                               OperatorRepository operatorRepository,
                               SupportTicketRepository supportTicketRepository,
                               ChatMessageRepository chatMessageRepository,
                               PasswordEncoder passwordEncoder) {
        this.tenantConfigRepository = tenantConfigRepository;
        this.operatorRepository = operatorRepository;
        this.supportTicketRepository = supportTicketRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Map<String, Object> getSaaSMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        long totalTenants = tenantConfigRepository.count();
        long totalTickets = supportTicketRepository.countGlobalTickets();
        long totalMessages = chatMessageRepository.countGlobalMessages();
        long activeOperators = operatorRepository.countOnlineOperatorsWithoutFilter();

        metrics.put("totalTenants", totalTenants);
        metrics.put("totalTickets", totalTickets);
        metrics.put("totalMessages", totalMessages);
        metrics.put("activeOperators", activeOperators);

        // Breakdown by tenant
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
        return metrics;
    }

    public List<TenantConfig> getAllTenants() {
        return tenantConfigRepository.findAll();
    }

    @Transactional(readOnly = false)
    public TenantConfig createTenant(String tenantId, String brandName, String whatsAppPhoneNumberId,
                                      String whatsAppApiToken, String adminEmail, String adminName,
                                      String adminPassword) {
        // 1. Create or Update Tenant Config
        TenantConfig config = tenantConfigRepository.findByTenantId(tenantId).orElse(new TenantConfig());
        config.setTenantId(tenantId);
        config.setBrandName(brandName);
        config.setWhatsAppPhoneNumberId(whatsAppPhoneNumberId);
        config.setWhatsAppApiToken(whatsAppApiToken);
        config.setPrimaryColor("#4f46e5");
        config.setSidebarColor("#0f172a");
        config.setPanelBg("#ffffff");
        config.setAppBg("#f8fafc");
        TenantConfig savedConfig = tenantConfigRepository.save(config);

        // 2. Create the operator admin
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

        return savedConfig;
    }

    @Transactional(readOnly = false)
    public void deleteTenant(Long id) {
        tenantConfigRepository.deleteById(id);
    }
}
