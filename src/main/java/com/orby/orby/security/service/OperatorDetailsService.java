package com.orby.orby.security.service;

import com.orby.orby.admin.model.Operator;
import com.orby.orby.admin.repository.OperatorRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class OperatorDetailsService implements UserDetailsService {

    private final OperatorRepository operatorRepository;

    public OperatorDetailsService(OperatorRepository operatorRepository) {
        this.operatorRepository = operatorRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Operator operator = operatorRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Operator not found"));
        return User.builder()
                .username(operator.getEmail())
                .password(operator.getPassword())
                .roles("OPERATOR")
                .build();
    }
}
