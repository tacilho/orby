package com.orby.orby.admin.service;

import com.orby.orby.admin.model.Operator;
import com.orby.orby.admin.model.OperatorStatus;
import com.orby.orby.admin.repository.OperatorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@Service
public class OperatorService {

    private final OperatorRepository operatorRepository;
    private final PasswordEncoder passwordEncoder;

    public OperatorService(OperatorRepository operatorRepository, PasswordEncoder passwordEncoder) {
        this.operatorRepository = operatorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Operator> findAll() {
        return operatorRepository.findAll();
    }

    public Optional<Operator> findById(Long id) {
        return operatorRepository.findById(id);
    }

    @Transactional
    public Operator save(Operator operator) {
        if (operator.getTenantId() == null) operator.setTenantId("default");
        
        if (operator.getId() != null) {
            Operator existing = operatorRepository.findById(operator.getId()).orElse(null);
            if (existing != null) {
                // Merge fields from incoming operator to existing operator to avoid database constraint violations
                if (operator.getName() != null) {
                    existing.setName(operator.getName());
                }
                if (operator.getEmail() != null) {
                    existing.setEmail(operator.getEmail());
                }
                if (operator.getSectorId() != null) {
                    existing.setSectorId(operator.getSectorId());
                }
                if (operator.getRole() != null) {
                    existing.setRole(operator.getRole());
                }
                if (operator.getStatus() != null) {
                    existing.setStatus(operator.getStatus());
                }
                if (operator.getViewOthersTickets() != null) {
                    existing.setViewOthersTickets(operator.getViewOthersTickets());
                }
                if (operator.getRespondOthersTickets() != null) {
                    existing.setRespondOthersTickets(operator.getRespondOthersTickets());
                }
                if (operator.getManageClientData() != null) {
                    existing.setManageClientData(operator.getManageClientData());
                }
                if (operator.getManageSectorsAndReasons() != null) {
                    existing.setManageSectorsAndReasons(operator.getManageSectorsAndReasons());
                }
                if (operator.getViewReports() != null) {
                    existing.setViewReports(operator.getViewReports());
                }
                
                // Password handling
                if (operator.getPassword() != null && !operator.getPassword().isEmpty()) {
                    existing.setPassword(passwordEncoder.encode(operator.getPassword()));
                }
                
                return operatorRepository.save(existing);
            }
        } else {
            // It's a new operator. Fill in defaults for any null fields so they don't trigger nullable constraint
            if (operator.getViewOthersTickets() == null) operator.setViewOthersTickets(true);
            if (operator.getRespondOthersTickets() == null) operator.setRespondOthersTickets(true);
            if (operator.getManageClientData() == null) operator.setManageClientData(true);
            if (operator.getManageSectorsAndReasons() == null) operator.setManageSectorsAndReasons(true);
            if (operator.getViewReports() == null) operator.setViewReports(true);
            if (operator.getStatus() == null) operator.setStatus(OperatorStatus.OFFLINE);
            
            if (operator.getPassword() != null && !operator.getPassword().isEmpty()) {
                operator.setPassword(passwordEncoder.encode(operator.getPassword()));
            }
        }
        
        return operatorRepository.save(operator);
    }

    @Transactional
    public void delete(Long id) {
        operatorRepository.deleteById(id);
    }
}