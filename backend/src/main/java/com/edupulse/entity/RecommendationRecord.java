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
        LEARN_BASICS,               // Has never learned / unassessed -> read introductory lecture notes
        PRACTICE_WORKED_EXAMPLE,    // Understands basics but makes errors -> worked examples & practice
        REVIEW_PREREQUISITE,        // Prerequisite deficit blocking learning
        REVIEW_MISCONCEPTION,       // Repeats exact conceptual error from exam/quiz
        SPACED_REVISION,            // Mastered previously but time decay indicates forgetting risk
        CHALLENGE_TOPIC,            // High mastery -> harder application / advanced problem sets
        PRACTICE_WEAK_TOPIC         // General weak topic remediation
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
    @Column(name = "recommendation_type", nullable = false, length = 50)
    private Type recommendationType;

    @Column(name = "supporting_evidence", nullable = false, columnDefinition = "TEXT")
    private String supportingEvidence;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "next_step_action", length = 255)
    private String nextStepAction;

    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes = 15;

    @Column(name = "learning_activity", length = 50)
    private String learningActivity = "PRACTICE_QUIZ"; // READ_NOTES, WORKED_EXAMPLE, REVISE_MISCONCEPTION, SPACED_QUIZ, ADVANCED_DRILL

    @Column(name = "resource_title", length = 255)
    private String resourceTitle;

    @Column(name = "resource_link", length = 255)
    private String resourceLink;

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
        this.nextStepAction = "Review concept and try a short practice quiz.";
        this.estimatedMinutes = 15;
        this.createdAt = LocalDateTime.now();
    }

    public RecommendationRecord(User student, Topic topic, Type recommendationType, String supportingEvidence, String explanation, String nextStepAction, Integer estimatedMinutes) {
        this.student = student;
        this.topic = topic;
        this.recommendationType = recommendationType;
        this.supportingEvidence = supportingEvidence;
        this.explanation = explanation;
        this.nextStepAction = nextStepAction;
        this.estimatedMinutes = estimatedMinutes != null ? estimatedMinutes : 15;
        this.createdAt = LocalDateTime.now();
    }

    public RecommendationRecord(User student, Topic topic, Type recommendationType, String supportingEvidence, String explanation, String nextStepAction, Integer estimatedMinutes, String learningActivity, String resourceTitle, String resourceLink) {
        this.student = student;
        this.topic = topic;
        this.recommendationType = recommendationType;
        this.supportingEvidence = supportingEvidence;
        this.explanation = explanation;
        this.nextStepAction = nextStepAction;
        this.estimatedMinutes = estimatedMinutes != null ? estimatedMinutes : 15;
        this.learningActivity = learningActivity != null ? learningActivity : "PRACTICE_QUIZ";
        this.resourceTitle = resourceTitle;
        this.resourceLink = resourceLink;
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

    public String getNextStepAction() {
        return nextStepAction != null && !nextStepAction.isBlank() ? nextStepAction : "Review concept notes and complete a 5-question practice quiz.";
    }

    public void setNextStepAction(String nextStepAction) {
        this.nextStepAction = nextStepAction;
    }

    public Integer getEstimatedMinutes() {
        return estimatedMinutes != null && estimatedMinutes > 0 ? estimatedMinutes : 15;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }

    public String getLearningActivity() {
        return learningActivity != null ? learningActivity : "PRACTICE_QUIZ";
    }

    public void setLearningActivity(String learningActivity) {
        this.learningActivity = learningActivity;
    }

    public String getResourceTitle() {
        return resourceTitle;
    }

    public void setResourceTitle(String resourceTitle) {
        this.resourceTitle = resourceTitle;
    }

    public String getResourceLink() {
        return resourceLink;
    }

    public void setResourceLink(String resourceLink) {
        this.resourceLink = resourceLink;
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
