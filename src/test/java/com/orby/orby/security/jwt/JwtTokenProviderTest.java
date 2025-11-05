package com.orby.orby.security.jwt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        JwtProperties jwtProperties = new JwtProperties();
        jwtProperties.setSecret("0123456789ABCDEF0123456789ABCDEF");
        jwtProperties.setExpirationSeconds(60);
        jwtTokenProvider = new JwtTokenProvider(jwtProperties);
        userDetails = User.withUsername("user@example.com")
                .password("password")
                .authorities(Collections.emptyList())
                .build();
    }

    @Test
    void generateTokenShouldIncludeUsername() {
        String token = jwtTokenProvider.generateToken(userDetails);

        assertNotNull(token);
        assertEquals(userDetails.getUsername(), jwtTokenProvider.extractUsername(token));
    }

    @Test
    void isTokenValidShouldReturnTrueForFreshToken() {
        String token = jwtTokenProvider.generateToken(userDetails);

        assertTrue(jwtTokenProvider.isTokenValid(token, userDetails));
    }

    @Test
    void isTokenValidShouldReturnFalseWhenTokenExpired() throws InterruptedException {
        JwtProperties shortLivedProperties = new JwtProperties();
        shortLivedProperties.setSecret("0123456789ABCDEF0123456789ABCDEF");
        shortLivedProperties.setExpirationSeconds(1);
        JwtTokenProvider shortLivedProvider = new JwtTokenProvider(shortLivedProperties);

        String token = shortLivedProvider.generateToken(userDetails);

        Thread.sleep(1200);

        assertFalse(shortLivedProvider.isTokenValid(token, userDetails));
    }

    @Test
    void isTokenValidShouldReturnFalseWhenUsernameDoesNotMatch() {
        String token = jwtTokenProvider.generateToken(userDetails);

        UserDetails differentUser = User.withUsername("other@example.com")
                .password("password")
                .authorities(Collections.emptyList())
                .build();

        assertFalse(jwtTokenProvider.isTokenValid(token, differentUser));
    }
}
