package com.freelancehub.repository;

import com.freelancehub.model.Proposal;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ProposalRepository extends MongoRepository<Proposal, String> {
    List<Proposal> findByProjectIdOrderByCreatedAtDesc(String projectId);
    List<Proposal> findByFreelancerIdOrderByCreatedAtDesc(String freelancerId);
    Optional<Proposal> findByProjectIdAndFreelancerId(String projectId, String freelancerId);
    long countByFreelancerId(String freelancerId);
    long countByFreelancerIdAndStatus(String freelancerId, String status);
}
