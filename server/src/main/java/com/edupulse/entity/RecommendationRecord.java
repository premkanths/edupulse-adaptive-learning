package com.edupulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendation_records")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RecommendationRecord {

    public enum Type {
        PRACTICE_WEAK_TOPIC,
        REVIEW_PREREQUISITE,
        CHALLENGE_TOPIC
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "subject", "prerequisiteTopic"})
    private Topic topic;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation_type", nullable = false, length = 30)
    private Type recommendationType;

    @Column(name = "supporting_evidence", nullable = false, columnDefinition = "TEXT")
    private String supportingEvidence;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Column(length = 100)
    private String outcome;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public RecommendationRecord() {
    }

    public RecommendationRecord(User student, Topic topic, Type recommendationType, String supportingEvidence, String explanation) {
        this.student = student;
        this.topic = topic;
        this.recommendationType = recommendationType;
        this.supportingEvidence = supportingEvidence;
        this.explanation = explanation;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Topic getTopic() {
        return topic;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }

    public Type getRecommendationType() {
        return recommendationType;
    }

    public void setRecommendationType(Type recommendationType) {
        this.recommendationType = recommendationType;
    }

    public String getSupportingEvidence() {
        return supportingEvidence;
    }

    public void setSupportingEvidence(String supportingEvidence) {
        this.supportingEvidence = supportingEvidence;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
