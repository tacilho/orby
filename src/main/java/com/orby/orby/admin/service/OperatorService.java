package com.orby.orby.admin.service;

import com.orby.orby.admin.model.Operator;
import com.orby.orby.admin.repository.OperatorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
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

    @Transactional(readOnly = false)
    public Operator save(Operator operator) {
        if (operator.getPassword() != null && !operator.getPassword().isBlank() && !operator.getPassword().startsWith("$2")) {
            operator.setPassword(passwordEncoder.encode(operator.getPassword()));
        }
        return operatorRepository.save(operator);
    }
}