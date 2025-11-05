package com.orby.orby.admin.repository;

import com.orby.orby.admin.model.Operator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OperatorRepository extends JpaRepository<Operator, Long> {

    Optional<Operator> findByEmail(String email);
}