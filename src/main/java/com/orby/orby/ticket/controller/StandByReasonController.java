package com.orby.orby.ticket.controller;

import com.orby.orby.ticket.model.StandByReason;
import com.orby.orby.ticket.service.StandByReasonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@RequestMapping("/management/standby-reasons")
public class StandByReasonController {

    private final StandByReasonService service;

    public StandByReasonController(StandByReasonService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<StandByReason>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    public ResponseEntity<StandByReason> create(@RequestBody StandByReason reason) {
        return ResponseEntity.ok(service.save(reason));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StandByReason> update(@PathVariable Long id, @RequestBody StandByReason updated) {
        return service.findById(id).map(existing -> {
            existing.setTitle(updated.getTitle());
            return ResponseEntity.ok(service.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.existsById(id)) {
            service.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
