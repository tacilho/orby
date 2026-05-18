package com.orby.orby.ticket.service;

import com.orby.orby.ticket.model.StandByReason;
import com.orby.orby.ticket.repository.StandByReasonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class StandByReasonService {

    private final StandByReasonRepository repository;

    public StandByReasonService(StandByReasonRepository repository) {
        this.repository = repository;
    }

    public List<StandByReason> findAll() {
        return repository.findAll();
    }

    public Optional<StandByReason> findById(Long id) {
        return repository.findById(id);
    }

    @Transactional(readOnly = false)
    public StandByReason save(StandByReason reason) {
        return repository.save(reason);
    }

    @Transactional(readOnly = false)
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return repository.existsById(id);
    }
}
