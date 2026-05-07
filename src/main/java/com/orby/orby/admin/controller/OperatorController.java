package com.orby.orby.admin.controller;

import com.orby.orby.admin.model.Operator;
import com.orby.orby.admin.service.OperatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@RequestMapping("/management/operators")
public class OperatorController {

    private final OperatorService operatorService;

    public OperatorController(OperatorService operatorService) {
        this.operatorService = operatorService;
    }

    @GetMapping
    public List<Operator> findAll() {
        return operatorService.findAll();
    }

    @PostMapping
    public ResponseEntity<Operator> create(@RequestBody Operator operator) {
        Operator savedOperator = operatorService.save(operator);
        return ResponseEntity.ok(savedOperator);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Operator> update(@PathVariable Long id, @RequestBody Operator operator) {
        operator.setId(id);
        return ResponseEntity.ok(operatorService.save(operator));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        operatorService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Operator> findById(@PathVariable Long id) {
        return operatorService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}