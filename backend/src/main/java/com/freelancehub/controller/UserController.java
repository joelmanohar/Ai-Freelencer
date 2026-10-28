package com.freelancehub.controller;

import com.freelancehub.dto.MarketplaceDto.ProfileUpdateRequest;
import com.freelancehub.model.User;
import com.freelancehub.repository.UserRepository;
import com.freelancehub.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users & Profiles", description = "User profiles and directory")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user profile by ID")
    public ResponseEntity<?> getUserProfile(@PathVariable String id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        user.setPassword(null); // Never leak password hash
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody ProfileUpdateRequest req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails == null) return ResponseEntity.status(401).build();

        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        if (req.getDisplayName() != null) user.setDisplayName(req.getDisplayName());
        if (req.getTitle() != null) user.setTitle(req.getTitle());
        if (req.getBio() != null) user.setBio(req.getBio());
        if (req.getLocation() != null) user.setLocation(req.getLocation());
        if (req.getHourlyRate() != null) user.setHourlyRate(req.getHourlyRate());
        user.setHourlyRateCurrency("INR");
        if (req.getExperienceLevel() != null) user.setExperienceLevel(req.getExperienceLevel());
        if (req.getSkills() != null) user.setSkills(req.getSkills());

        User updated = userRepository.save(user);
        updated.setPassword(null);
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all registered users (Admin only)")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(users);
    }
}
