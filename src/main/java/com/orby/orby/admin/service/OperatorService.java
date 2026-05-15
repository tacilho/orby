package com.orby.orby.admin.service;

import com.orby.orby.admin.model.Operator;
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
                if (operator.getPassword() == null || operator.getPassword().isEmpty()) {
                    operator.setPassword(existing.getPassword());
                } else {
                    operator.setPassword(passwordEncoder.encode(operator.getPassword()));
                }
            }
        } else {
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