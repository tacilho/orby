package com.orby.orby.admin.repository;

import com.orby.orby.admin.model.Operator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OperatorRepository extends JpaRepository<Operator, Long> {

    Optional<Operator> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM operator WHERE email = :email LIMIT 1", nativeQuery = true)
    Optional<Operator> findByEmailWithoutFilter(@org.springframework.data.repository.query.Param("email") String email);

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM operator WHERE status = 'ONLINE'", nativeQuery = true)
    long countOnlineOperatorsWithoutFilter();
}