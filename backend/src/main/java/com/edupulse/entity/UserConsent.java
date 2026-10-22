package com.edupulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_consents")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UserConsent {

    public enum ConsentStatus {
        GRANTED,
        WITHDRAWN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "consent_policy_version", nullable = false, length = 20)
    private String consentPolicyVersion = "1.0";

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_status", nullable = false, length = 20)
    private ConsentStatus consentStatus = ConsentStatus.GRANTED;

    @Column(name = "consented_at", insertable = false, updatable = false)
    private LocalDateTime consentedAt;

    public UserConsent() {}

    public UserConsent(User user, String consentPolicyVersion, ConsentStatus consentStatus) {
        this.user = user;
        this.consentPolicyVersion = consentPolicyVersion;
        this.consentStatus = consentStatus;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getConsentPolicyVersion() { return consentPolicyVersion; }
    public void setConsentPolicyVersion(String consentPolicyVersion) { this.consentPolicyVersion = consentPolicyVersion; }

    public ConsentStatus getConsentStatus() { return consentStatus; }
    public void setConsentStatus(ConsentStatus consentStatus) { this.consentStatus = consentStatus; }

    public LocalDateTime getConsentedAt() { return consentedAt; }
    public void setConsentedAt(LocalDateTime consentedAt) { this.consentedAt = consentedAt; }
}
