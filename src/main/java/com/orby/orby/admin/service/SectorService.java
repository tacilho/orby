package com.orby.orby.admin.service;

import com.orby.orby.admin.model.Sector;
import com.orby.orby.admin.repository.SectorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class SectorService {

    private final SectorRepository sectorRepository;

    public SectorService(SectorRepository sectorRepository) {
        this.sectorRepository = sectorRepository;
    }

    public List<Sector> findAll() {
        return sectorRepository.findAll();
    }

    public Optional<Sector> findById(Long id) {
        return sectorRepository.findById(id);
    }

    @Transactional(readOnly = false)
    public Sector save(Sector sector) {
        return sectorRepository.save(sector);
    }
}