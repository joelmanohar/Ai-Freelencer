package com.freelancehub.repository;

import com.freelancehub.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByProjectIdOrderByTimestampAsc(String projectId);
    List<Message> findByProjectIdOrderByTimestampDesc(String projectId);
}
