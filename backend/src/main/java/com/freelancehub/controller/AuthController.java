package com.freelancehub.controller;

import com.freelancehub.dto.AuthDto.*;
import com.freelancehub.model.User;
import com.freelancehub.repository.UserRepository;
import com.freelancehub.security.JwtUtils;
import com.freelancehub.security.UserDetailsImpl;
import com.freelancehub.service.RedisRateLimitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for login, registration, and session token verification")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final RedisRateLimitService rateLimitService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder encoder,
                          JwtUtils jwtUtils,
                          RedisRateLimitService rateLimitService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.rateLimitService = rateLimitService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user with email and password")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        // Rate limit: 20 logins per minute
        if (!rateLimitService.isAllowed("login:" + loginRequest.getEmail(), 20, 60)) {
            return ResponseEntity.status(429).body(Map.of("message", "Too many requests. Please wait a moment."));
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail().toLowerCase().trim(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        String role = user != null ? user.getRole() : userDetails.getRole();
        String displayName = user != null ? user.getDisplayName() : userDetails.getDisplayName();

        String jwt = jwtUtils.generateTokenFromEmail(userDetails.getUsername(), role, displayName, userDetails.getId());

        return ResponseEntity.ok(new AuthResponse(jwt, userDetails.getId(), userDetails.getUsername(), displayName, role));
    }

    @PostMapping("/register")
    @Operation(summary = "Register new Client or Freelancer")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        String email = registerRequest.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already in use!"));
        }

        String role = (registerRequest.getRole() != null && registerRequest.getRole().equalsIgnoreCase("CLIENT"))
                ? "CLIENT" : "FREELANCER";

        User user = new User(
                email,
                encoder.encode(registerRequest.getPassword()),
                registerRequest.getDisplayName(),
                role
        );
        User savedUser = userRepository.save(user);

        String jwt = jwtUtils.generateTokenFromEmail(savedUser.getEmail(), savedUser.getRole(), savedUser.getDisplayName(), savedUser.getId());
        return ResponseEntity.ok(new AuthResponse(jwt, savedUser.getId(), savedUser.getEmail(), savedUser.getDisplayName(), savedUser.getRole()));
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        return ResponseEntity.ok(user);
    }
}
