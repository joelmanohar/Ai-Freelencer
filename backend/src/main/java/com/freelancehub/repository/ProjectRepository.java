package com.freelancehub.repository;

import com.freelancehub.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findByStatus(String status);
    List<Project> findByClientIdOrderByCreatedAtDesc(String clientId);
    List<Project> findByHiredFreelancerIdOrderByCreatedAtDesc(String hiredFreelancerId);
    List<Project> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
