package com.freelancehub.repository;

import com.freelancehub.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProjectId(String projectId);
    List<Review> findByRevieweeIdOrderByCreatedAtDesc(String revieweeId);
    List<Review> findByReviewerIdOrderByCreatedAtDesc(String reviewerId);
    boolean existsByProjectIdAndReviewerId(String projectId, String reviewerId);
}
