package com.freelancehub.controller;

import com.freelancehub.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Platform analytics and administrative controls")
public class AdminController {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final CategoryRepository categoryRepository;
    private final PaymentRepository paymentRepository;

    public AdminController(UserRepository userRepository,
                           ProjectRepository projectRepository,
                           CategoryRepository categoryRepository,
                           PaymentRepository paymentRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
        this.paymentRepository = paymentRepository;
    }

    private boolean isSuccessfulPayment(String status) {
        return status == null || status.isBlank()
                || "completed".equalsIgnoreCase(status)
                || "paid".equalsIgnoreCase(status);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get overall platform metrics for Admin dashboard")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long clients = userRepository.countByRole("CLIENT");
        long freelancers = userRepository.countByRole("FREELANCER");
        long totalProjects = projectRepository.count();
        long categories = categoryRepository.count();

        double totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> p.getAmount() != null && isSuccessfulPayment(p.getStatus()))
                .mapToDouble(p -> p.getAmount() * 0.10) // 10% platform fee, all amounts are INR
                .sum();

        stats.put("totalUsers", totalUsers);
        stats.put("clients", clients);
        stats.put("freelancers", freelancers);
        stats.put("totalProjects", totalProjects);
        stats.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        stats.put("categories", categories);

        return ResponseEntity.ok(stats);
    }
}
