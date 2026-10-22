package com.edupulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "academic_records")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AcademicRecord {

    public enum Source {
        MANUAL_IMPORT, PORTAL_IMPORT, DEMO_SEED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "createdBy"})
    private Subject subject;

    @Column(name = "assessment_name", nullable = false, length = 100)
    private String assessmentName;

    @Column(name = "marks_obtained", nullable = false)
    private Double marksObtained;

    @Column(name = "maximum_marks", nullable = false)
    private Double maximumMarks;

    @Column(name = "assessment_date", nullable = false)
    private LocalDate assessmentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Source source = Source.MANUAL_IMPORT;

    @Column(name = "import_batch_id")
    private Long importBatchId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public AcademicRecord() {
    }

    public AcademicRecord(User student, Subject subject, String assessmentName,
                          Double marksObtained, Double maximumMarks, LocalDate assessmentDate,
                          Source source, Long importBatchId) {
        this.student = student;
        this.subject = subject;
        this.assessmentName = assessmentName;
        this.marksObtained = marksObtained;
        this.maximumMarks = maximumMarks;
        this.assessmentDate = assessmentDate;
        this.source = source != null ? source : Source.MANUAL_IMPORT;
        this.importBatchId = importBatchId;
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

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public String getAssessmentName() {
        return assessmentName;
    }

    public void setAssessmentName(String assessmentName) {
        this.assessmentName = assessmentName;
    }

    public Double getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(Double marksObtained) {
        this.marksObtained = marksObtained;
    }

    public Double getMaximumMarks() {
        return maximumMarks;
    }

    public void setMaximumMarks(Double maximumMarks) {
        this.maximumMarks = maximumMarks;
    }

    public LocalDate getAssessmentDate() {
        return assessmentDate;
    }

    public void setAssessmentDate(LocalDate assessmentDate) {
        this.assessmentDate = assessmentDate;
    }

    public Source getSource() {
        return source;
    }

    public void setSource(Source source) {
        this.source = source;
    }

    public Long getImportBatchId() {
        return importBatchId;
    }

    public void setImportBatchId(Long importBatchId) {
        this.importBatchId = importBatchId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
