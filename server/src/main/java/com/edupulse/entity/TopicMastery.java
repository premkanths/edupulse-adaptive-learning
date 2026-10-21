package com.edupulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "topic_mastery", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "topic_id"})
})
public class TopicMastery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(name = "p_known", nullable = false)
    private Double pKnown = 0.3000;

    @Column(name = "accuracy")
    private Double accuracy = 0.00;

    @Column(name = "attempts_count")
    private Integer attemptsCount = 0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public TopicMastery() {
    }

    public TopicMastery(User student, Topic topic, Double pKnown, Double accuracy, Integer attemptsCount) {
        this.student = student;
        this.topic = topic;
        this.pKnown = pKnown != null ? pKnown : 0.3000;
        this.accuracy = accuracy != null ? accuracy : 0.00;
        this.attemptsCount = attemptsCount != null ? attemptsCount : 0;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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

    public Double getPKnown() {
        return pKnown;
    }

    public void setPKnown(Double pKnown) {
        this.pKnown = pKnown;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public Integer getAttemptsCount() {
        return attemptsCount;
    }

    public void setAttemptsCount(Integer attemptsCount) {
        this.attemptsCount = attemptsCount;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
