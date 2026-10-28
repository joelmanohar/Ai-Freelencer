package com.freelancehub.dto;

import java.util.List;

public class MarketplaceDto {

    public static class ProjectRequest {
        private String title;
        private String description;
        private Double budget;
        private String currency;
        private String deadline;
        private String categoryId;
        private String experienceLevel;
        private List<String> skills;

        public ProjectRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Double getBudget() { return budget; }
        public void setBudget(Double budget) { this.budget = budget; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getDeadline() { return deadline; }
        public void setDeadline(String deadline) { this.deadline = deadline; }
        public String getCategoryId() { return categoryId; }
        public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
        public String getExperienceLevel() { return experienceLevel; }
        public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
        public List<String> getSkills() { return skills; }
        public void setSkills(List<String> skills) { this.skills = skills; }
    }

    public static class ProposalRequest {
        private String coverLetter;
        private Double bidAmount;
        private Integer estimatedDays;

        public ProposalRequest() {}

        public String getCoverLetter() { return coverLetter; }
        public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }
        public Double getBidAmount() { return bidAmount; }
        public void setBidAmount(Double bidAmount) { this.bidAmount = bidAmount; }
        public Integer getEstimatedDays() { return estimatedDays; }
        public void setEstimatedDays(Integer estimatedDays) { this.estimatedDays = estimatedDays; }
    }

    public static class ReviewRequest {
        private Integer rating;
        private String comment;

        public ReviewRequest() {}

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    public static class ProfileUpdateRequest {
        private String displayName;
        private String title;
        private String bio;
        private String location;
        private Double hourlyRate;
        private String experienceLevel;
        private List<String> skills;

        public ProfileUpdateRequest() {}

        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public Double getHourlyRate() { return hourlyRate; }
        public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }
        public String getExperienceLevel() { return experienceLevel; }
        public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
        public List<String> getSkills() { return skills; }
        public void setSkills(List<String> skills) { this.skills = skills; }
    }

    public static class ChatMessageRequest {
        private String content;

        public ChatMessageRequest() {}
        public ChatMessageRequest(String content) { this.content = content; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class RazorpayOrderResponse {
        private String orderId;
        private Double amount;
        private String currency;
        private String keyId;

        public RazorpayOrderResponse(String orderId, Double amount, String currency, String keyId) {
            this.orderId = orderId;
            this.amount = amount;
            this.currency = currency;
            this.keyId = keyId;
        }

        public String getOrderId() { return orderId; }
        public Double getAmount() { return amount; }
        public String getCurrency() { return currency; }
        public String getKeyId() { return keyId; }
    }
}
