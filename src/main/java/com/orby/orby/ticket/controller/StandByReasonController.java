package com.orby.orby.ticket.controller;

import com.orby.orby.ticket.model.StandByReason;
import com.orby.orby.ticket.repository.StandByReasonRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@RequestMapping("/management/standby-reasons")
public class StandByReasonController {

    private final StandByReasonRepository repository;

    public StandByReasonController(StandByReasonRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<StandByReason>> findAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<StandByReason> create(@RequestBody StandByReason reason) {
        return ResponseEntity.ok(repository.save(reason));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StandByReason> update(@PathVariable Long id, @RequestBody StandByReason updated) {
        return repository.findById(id).map(existing -> {
            existing.setTitle(updated.getTitle());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
