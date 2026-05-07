package com.orby.orby.admin.controller;

import com.orby.orby.admin.model.Sector;
import com.orby.orby.admin.service.SectorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@RequestMapping("/management/sectors")
public class SectorController {

    private final SectorService sectorService;

    public SectorController(SectorService sectorService) {
        this.sectorService = sectorService;
    }

    @GetMapping
    public List<Sector> findAll() {
        return sectorService.findAll();
    }

    @PostMapping
    public ResponseEntity<Sector> create(@RequestBody Sector sector) {
        Sector savedSector = sectorService.save(sector);
        return ResponseEntity.ok(savedSector);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sector> update(@PathVariable Long id, @RequestBody Sector sector) {
        sector.setId(id);
        return ResponseEntity.ok(sectorService.save(sector));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sectorService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sector> findById(@PathVariable Long id) {
        return sectorService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}