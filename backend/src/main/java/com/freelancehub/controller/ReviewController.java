package com.freelancehub.controller;

import com.freelancehub.dto.MarketplaceDto.ReviewRequest;
import com.freelancehub.model.Project;
import com.freelancehub.model.Review;
import com.freelancehub.model.User;
import com.freelancehub.repository.ProjectRepository;
import com.freelancehub.repository.ReviewRepository;
import com.freelancehub.repository.UserRepository;
import com.freelancehub.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Reviews", description = "Ratings and verified reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository,
                            ProjectRepository projectRepository,
                            UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/project/{projectId}")
    @Operation(summary = "Submit a review for a completed project")
    public ResponseEntity<?> createReview(
            @PathVariable String projectId,
            @RequestBody ReviewRequest req,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        if (!"completed".equalsIgnoreCase(project.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Reviews can only be submitted after project completion"));
        }

        boolean isClient = project.getClientId().equals(userDetails.getId());
        boolean isFreelancer = project.getHiredFreelancerId() != null && project.getHiredFreelancerId().equals(userDetails.getId());

        if (!isClient && !isFreelancer) {
            return ResponseEntity.status(403).body(Map.of("message", "Only project participants can leave a review"));
        }

        if (reviewRepository.existsByProjectIdAndReviewerId(projectId, userDetails.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "You have already reviewed this project"));
        }

        String targetUserId = isClient ? project.getHiredFreelancerId() : project.getClientId();
        User reviewer = userRepository.findById(userDetails.getId()).orElse(null);

        Review review = new Review();
        review.setProjectId(projectId);
        review.setProjectTitle(project.getTitle());
        review.setReviewerId(userDetails.getId());
        review.setReviewerName(reviewer != null ? reviewer.getDisplayName() : userDetails.getUsername());
        review.setReviewerRole(reviewer != null ? reviewer.getRole() : userDetails.getRole());
        review.setRevieweeId(targetUserId);
        review.setRating(req.getRating() != null ? req.getRating() : 5);
        review.setComment(req.getComment());

        Review saved = reviewRepository.save(review);

        // Update target user's average rating in MongoDB
        if (targetUserId != null) {
            User targetUser = userRepository.findById(targetUserId).orElse(null);
            if (targetUser != null) {
                List<Review> userReviews = reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(targetUserId);
                double avg = userReviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
                targetUser.setRating(Math.round(avg * 10.0) / 10.0);
                targetUser.setReviewCount(userReviews.size());
                userRepository.save(targetUser);
            }
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get reviews for a project")
    public ResponseEntity<List<Review>> getProjectReviews(@PathVariable String projectId) {
        return ResponseEntity.ok(reviewRepository.findByProjectId(projectId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get reviews for a user")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable String userId) {
        return ResponseEntity.ok(reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId));
    }
}
