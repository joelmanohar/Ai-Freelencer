package com.freelancehub.controller;

import com.freelancehub.dto.MarketplaceDto.ProjectRequest;
import com.freelancehub.model.Category;
import com.freelancehub.model.Project;
import com.freelancehub.model.User;
import com.freelancehub.repository.CategoryRepository;
import com.freelancehub.repository.ProjectRepository;
import com.freelancehub.repository.UserRepository;
import com.freelancehub.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Project creation, browsing, and management")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ProjectController(ProjectRepository projectRepository,
                             CategoryRepository categoryRepository,
                             UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get public platform overview statistics")
    public ResponseEntity<Map<String, Object>> getPublicStats() {
        long totalUsers = userRepository.count();
        long clients = userRepository.countByRole("CLIENT");
        long freelancers = userRepository.countByRole("FREELANCER");
        long totalProjects = projectRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("clients", clients);
        stats.put("freelancers", freelancers);
        stats.put("totalProjects", totalProjects);

        return ResponseEntity.ok(stats);
    }

    @GetMapping
    @Operation(summary = "Browse all projects with optional filtering")
    public ResponseEntity<List<Project>> getProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) String status) {

        List<Project> list = projectRepository.findAllByOrderByCreatedAtDesc();

        return ResponseEntity.ok(list.stream().filter(p -> {
            if (status != null && !status.equalsIgnoreCase("ALL") && !p.getStatus().equalsIgnoreCase(status)) {
                return false;
            }
            if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("All Categories")) {
                if (p.getCategoryName() == null || !p.getCategoryName().equalsIgnoreCase(category)) {
                    return false;
                }
            }
            if (experienceLevel != null && !experienceLevel.isEmpty() && !experienceLevel.equalsIgnoreCase("All")) {
                if (p.getExperienceLevel() == null || !p.getExperienceLevel().equalsIgnoreCase(experienceLevel)) {
                    return false;
                }
            }
            if (search != null && !search.trim().isEmpty()) {
                String q = search.toLowerCase().trim();
                boolean matchTitle = p.getTitle() != null && p.getTitle().toLowerCase().contains(q);
                boolean matchDesc = p.getDescription() != null && p.getDescription().toLowerCase().contains(q);
                boolean matchSkill = p.getSkills() != null && p.getSkills().stream().anyMatch(s -> s.toLowerCase().contains(q));
                return matchTitle || matchDesc || matchSkill;
            }
            return true;
        }).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project details by ID")
    public ResponseEntity<?> getProjectById(@PathVariable String id) {
        return projectRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    @Operation(summary = "Get projects associated with the current user")
    public ResponseEntity<List<Project>> getMyProjects(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user != null && "FREELANCER".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.ok(projectRepository.findByHiredFreelancerIdOrderByCreatedAtDesc(user.getId()));
        }
        return ResponseEntity.ok(projectRepository.findByClientIdOrderByCreatedAtDesc(userDetails.getId()));
    }

    @PostMapping
    @Operation(summary = "Post a new project (Client)")
    public ResponseEntity<?> createProject(
            @RequestBody ProjectRequest req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        }

        User client = userRepository.findById(userDetails.getId()).orElse(null);
        String categoryName = "General";
        if (req.getCategoryId() != null && !req.getCategoryId().isEmpty()) {
            Category cat = categoryRepository.findById(req.getCategoryId())
                    .orElse(categoryRepository.findByName(req.getCategoryId()).orElse(null));
            if (cat != null) {
                categoryName = cat.getName();
            }
        }

        Project project = new Project();
        String currency = req.getCurrency() == null ? "INR" : req.getCurrency().trim().toUpperCase();
        if (!"INR".equals(currency)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only INR currency is supported"));
        }
        project.setClientId(userDetails.getId());
        project.setClientName(client != null ? client.getDisplayName() : userDetails.getUsername());
        project.setCategoryId(req.getCategoryId());
        project.setCategoryName(categoryName);
        project.setTitle(req.getTitle());
        project.setDescription(req.getDescription());
        project.setBudget(req.getBudget());
        project.setCurrency(currency);
        project.setDeadline(req.getDeadline());
        project.setExperienceLevel(req.getExperienceLevel() != null ? req.getExperienceLevel() : "Intermediate");
        project.setSkills(req.getSkills());
        project.setStatus("open");

        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing project")
    public ResponseEntity<?> updateProject(
            @PathVariable String id,
            @RequestBody ProjectRequest req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Project p = projectRepository.findById(id).orElse(null);
        if (p == null) return ResponseEntity.notFound().build();

        if (!p.getClientId().equals(userDetails.getId()) && !"ADMIN".equalsIgnoreCase(userDetails.getRole())) {
            return ResponseEntity.status(403).body(Map.of("message", "Not authorized"));
        }

        if (req.getTitle() != null) p.setTitle(req.getTitle());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getBudget() != null) p.setBudget(req.getBudget());
        if (req.getCurrency() != null) {
            String currency = req.getCurrency().trim().toUpperCase();
            if (!"INR".equals(currency)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only INR currency is supported"));
            }
            p.setCurrency(currency);
        }
        if (req.getDeadline() != null) p.setDeadline(req.getDeadline());
        if (req.getExperienceLevel() != null) p.setExperienceLevel(req.getExperienceLevel());
        if (req.getSkills() != null) p.setSkills(req.getSkills());

        return ResponseEntity.ok(projectRepository.save(p));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a project")
    public ResponseEntity<?> deleteProject(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Project p = projectRepository.findById(id).orElse(null);
        if (p == null) return ResponseEntity.notFound().build();

        if (!p.getClientId().equals(userDetails.getId()) && !"ADMIN".equalsIgnoreCase(userDetails.getRole())) {
            return ResponseEntity.status(403).body(Map.of("message", "Not authorized"));
        }

        projectRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
    }
}
