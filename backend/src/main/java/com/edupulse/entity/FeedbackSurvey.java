package com.edupulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback_surveys")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FeedbackSurvey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private User student;

    @Min(1) @Max(5)
    @Column(name = "q1_usefulness", nullable = false)
    private Integer q1Usefulness;

    @Min(1) @Max(5)
    @Column(name = "q2_ease_of_use", nullable = false)
    private Integer q2EaseOfUse;

    @Min(1) @Max(5)
    @Column(name = "q3_explanation_clarity", nullable = false)
    private Integer q3ExplanationClarity;

    @Min(1) @Max(5)
    @Column(name = "q4_trust", nullable = false)
    private Integer q4Trust;

    @Min(1) @Max(5)
    @Column(name = "q5_ai_usefulness", nullable = false)
    private Integer q5AiUsefulness;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "submitted_at", insertable = false, updatable = false)
    private LocalDateTime submittedAt;

    public FeedbackSurvey() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Integer getQ1Usefulness() { return q1Usefulness; }
    public void setQ1Usefulness(Integer q1Usefulness) { this.q1Usefulness = q1Usefulness; }

    public Integer getQ2EaseOfUse() { return q2EaseOfUse; }
    public void setQ2EaseOfUse(Integer q2EaseOfUse) { this.q2EaseOfUse = q2EaseOfUse; }

    public Integer getQ3ExplanationClarity() { return q3ExplanationClarity; }
    public void setQ3ExplanationClarity(Integer q3ExplanationClarity) { this.q3ExplanationClarity = q3ExplanationClarity; }

    public Integer getQ4Trust() { return q4Trust; }
    public void setQ4Trust(Integer q4Trust) { this.q4Trust = q4Trust; }

    public Integer getQ5AiUsefulness() { return q5AiUsefulness; }
    public void setQ5AiUsefulness(Integer q5AiUsefulness) { this.q5AiUsefulness = q5AiUsefulness; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
