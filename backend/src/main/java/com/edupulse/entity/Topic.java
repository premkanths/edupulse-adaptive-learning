package com.edupulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "topics")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "createdBy"})
    private Subject subject;

    @Column(nullable = false, length = 120)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prerequisite_topic_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "subject", "prerequisiteTopic"})
    private Topic prerequisiteTopic;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Topic() {
    }

    public Topic(Subject subject, String name, Topic prerequisiteTopic) {
        this.subject = subject;
        this.name = name;
        this.prerequisiteTopic = prerequisiteTopic;
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

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Topic getPrerequisiteTopic() {
        return prerequisiteTopic;
    }

    public void setPrerequisiteTopic(Topic prerequisiteTopic) {
        this.prerequisiteTopic = prerequisiteTopic;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
