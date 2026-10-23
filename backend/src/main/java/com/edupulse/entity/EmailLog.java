package com.edupulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_logs")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EmailLog {

    public enum Status {
        SENT, DRY_RUN, FAILED, SKIPPED_PREFERENCE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private User user;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 200)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.DRY_RUN;

    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt = LocalDateTime.now();

    public EmailLog() {
    }

    public EmailLog(User user, String type, String subject, Status status) {
        this.user = user;
        this.type = type;
        this.subject = subject;
        this.status = status != null ? status : Status.DRY_RUN;
        this.sentAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) sentAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
}
