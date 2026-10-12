package com.freelancehub.repository;

import com.freelancehub.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByClientIdOrderByCreatedAtDesc(String clientId);
    List<Payment> findByFreelancerIdOrderByCreatedAtDesc(String freelancerId);
    List<Payment> findByProjectId(String projectId);
    List<Payment> findAllByOrderByCreatedAtDesc();
}
