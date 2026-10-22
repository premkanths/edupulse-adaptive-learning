package com.edupulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_paper_analyses")
public class ExamPaperAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "exam_title", nullable = false)
    private String examTitle;

    @Column(name = "subject_name")
    private String subjectName;

    @Column(name = "total_score")
    private Double totalScore;

    @Column(name = "max_score")
    private Double maxScore;

    @Column(name = "percentage")
    private Double percentage;

    @Column(name = "grade", length = 50)
    private String grade;

    @Lob
    @Column(name = "feedback_summary", columnDefinition = "TEXT")
    private String feedbackSummary;

    @Lob
    @Column(name = "mistakes_json", columnDefinition = "LONGTEXT")
    private String mistakesJson; // JSON array of questions, marks lost, error diagnosis

    @Lob
    @Column(name = "weak_topics_json", columnDefinition = "TEXT")
    private String weakTopicsJson; // JSON array of topic strings

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    public ExamPaperAnalysis() {}

    public ExamPaperAnalysis(User student, String examTitle, String subjectName,
                             Double totalScore, Double maxScore, Double percentage,
                             String grade, String feedbackSummary, String mistakesJson,
                             String weakTopicsJson, String fileName) {
        this.student = student;
        this.examTitle = examTitle;
        this.subjectName = subjectName;
        this.totalScore = totalScore;
        this.maxScore = maxScore;
        this.percentage = percentage;
        this.grade = grade;
        this.feedbackSummary = feedbackSummary;
        this.mistakesJson = mistakesJson;
        this.weakTopicsJson = weakTopicsJson;
        this.fileName = fileName;
        this.uploadedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public String getExamTitle() { return examTitle; }
    public void setExamTitle(String examTitle) { this.examTitle = examTitle; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public Double getTotalScore() { return totalScore; }
    public void setTotalScore(Double totalScore) { this.totalScore = totalScore; }

    public Double getMaxScore() { return maxScore; }
    public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getFeedbackSummary() { return feedbackSummary; }
    public void setFeedbackSummary(String feedbackSummary) { this.feedbackSummary = feedbackSummary; }

    public String getMistakesJson() { return mistakesJson; }
    public void setMistakesJson(String mistakesJson) { this.mistakesJson = mistakesJson; }

    public String getWeakTopicsJson() { return weakTopicsJson; }
    public void setWeakTopicsJson(String weakTopicsJson) { this.weakTopicsJson = weakTopicsJson; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
