package com.edupulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Question {

    public enum Difficulty {
        EASY, MEDIUM, HARD
    }

    public enum Source {
        MANUAL, AI_GENERATED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "subject", "prerequisiteTopic"})
    private Topic topic;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    // Stored as JSON string of 4 options: ["Option A", "Option B", "Option C", "Option D"]
    @Column(name = "options_json", nullable = false, columnDefinition = "JSON")
    private String optionsJson;

    @Column(name = "correct_index", nullable = false)
    private int correctIndex;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty = Difficulty.MEDIUM;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String explanation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Source source = Source.MANUAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnore
    private User createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Question() {
    }

    public Question(Topic topic, String text, String optionsJson, int correctIndex,
                    Difficulty difficulty, String explanation, Source source, User createdBy) {
        this.topic = topic;
        this.text = text;
        this.optionsJson = optionsJson;
        this.correctIndex = correctIndex;
        this.difficulty = difficulty != null ? difficulty : Difficulty.MEDIUM;
        this.explanation = explanation;
        this.source = source != null ? source : Source.MANUAL;
        this.createdBy = createdBy;
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

    public Topic getTopic() {
        return topic;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getOptionsJson() {
        return optionsJson;
    }

    public void setOptionsJson(String optionsJson) {
        this.optionsJson = optionsJson;
    }

    public int getCorrectIndex() {
        return correctIndex;
    }

    public void setCorrectIndex(int correctIndex) {
        this.correctIndex = correctIndex;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public Source getSource() {
        return source;
    }

    public void setSource(Source source) {
        this.source = source;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
