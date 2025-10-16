package com.orby.orby.admin.service;

import com.orby.orby.admin.model.Operator;
import com.orby.orby.admin.repository.OperatorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class OperatorService {

    private final OperatorRepository operatorRepository;

    public OperatorService(OperatorRepository operatorRepository) {
        this.operatorRepository = operatorRepository;
    }

    public List<Operator> findAll() {
        return operatorRepository.findAll();
    }

    public Optional<Operator> findById(Long id) {
        return operatorRepository.findById(id);
    }

    @Transactional(readOnly = false)
    public Operator save(Operator operator) {
        return operatorRepository.save(operator);
    }
}