package com.orby.orby.security.auth;

import com.orby.orby.admin.model.Operator;
import com.orby.orby.admin.repository.OperatorRepository;
import com.orby.orby.security.jwt.JwtTokenProvider;
import com.orby.orby.security.jwt.JwtProperties;
import com.orby.orby.security.ratelimit.LoginRateLimiter;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "http://localhost:*", allowCredentials = "true")
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final LoginRateLimiter rateLimiter;
    private final OperatorRepository operatorRepository;
    private final JwtProperties jwtProperties;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenProvider jwtTokenProvider,
                          UserDetailsService userDetailsService,
                          LoginRateLimiter rateLimiter,
                          OperatorRepository operatorRepository,
                          JwtProperties jwtProperties) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
        this.rateLimiter = rateLimiter;
        this.operatorRepository = operatorRepository;
        this.jwtProperties = jwtProperties;
    }

    /**
     * POST /auth/login — authenticate and set JWT in HttpOnly cookie.
     * Returns user profile (name, role, email) — NOT the token.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthenticationRequest request,
                                   HttpServletResponse response) {
        String email = request.getEmail();

        // Rate limiting
        if (rateLimiter.isBlocked(email)) {
            long remaining = rateLimiter.getRemainingLockSeconds(email);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Conta temporariamente bloqueada por excesso de tentativas.");
            error.put("retryAfterSeconds", remaining);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(error);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(authentication.getName());
            String token = jwtTokenProvider.generateToken(userDetails);

            // Set JWT as HttpOnly Secure cookie
            Cookie jwtCookie = new Cookie("jwt", token);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(false); // Set to true in production (HTTPS)
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge((int) jwtProperties.getExpirationSeconds());
            jwtCookie.setAttribute("SameSite", "Lax");
            response.addCookie(jwtCookie);

            // Clear rate limiter on success
            rateLimiter.recordSuccess(email);

            // Return user profile (never return the token in JSON body)
            Operator operator = operatorRepository.findByEmail(email).orElse(null);
            Map<String, Object> profile = new HashMap<>();
            if (operator != null) {
                profile.put("id", operator.getId());
                profile.put("name", operator.getName());
                profile.put("email", operator.getEmail());
                profile.put("role", operator.getRole().name());
                profile.put("sectorId", operator.getSectorId());
            }

            return ResponseEntity.ok(profile);

        } catch (BadCredentialsException ex) {
            rateLimiter.recordFailedAttempt(email);
            // Generic message to prevent user enumeration
            Map<String, String> error = new HashMap<>();
            error.put("error", "E-mail ou senha inválidos.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * GET /auth/me — validate active session and return the current user profile.
     * Reads JWT from cookie. If invalid/expired, returns 401.
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Operator operator = operatorRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (operator == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", operator.getId());
        profile.put("name", operator.getName());
        profile.put("email", operator.getEmail());
        profile.put("role", operator.getRole().name());
        profile.put("sectorId", operator.getSectorId());
        return ResponseEntity.ok(profile);
    }

    /**
     * POST /auth/logout — clears the jwt cookie.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie jwtCookie = new Cookie("jwt", "");
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false); // Set to true in production (HTTPS)
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0); // Expire immediately
        jwtCookie.setAttribute("SameSite", "Lax");
        response.addCookie(jwtCookie);
        return ResponseEntity.ok(Map.of("message", "Sessão encerrada."));
    }
}
