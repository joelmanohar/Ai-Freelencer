package com.freelancehub.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "projects")
public class Project {

    @Id
    private String id;
    private String clientId;
    private String clientName;
    private String categoryId;
    private String categoryName;
    private String title;
    private String description;
    private Double budget;
    private String deadline;
    private List<String> skills = new ArrayList<>();
    private String experienceLevel; // Beginner, Intermediate, Expert
    private String status = "open"; // open, in_progress, completed, cancelled
    private String hiredFreelancerId;
    private String hiredFreelancerName;

    @CreatedDate
    private Instant createdAt = Instant.now();

    public Project() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getHiredFreelancerId() { return hiredFreelancerId; }
    public void setHiredFreelancerId(String hiredFreelancerId) { this.hiredFreelancerId = hiredFreelancerId; }

    public String getHiredFreelancerName() { return hiredFreelancerName; }
    public void setHiredFreelancerName(String hiredFreelancerName) { this.hiredFreelancerName = hiredFreelancerName; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
