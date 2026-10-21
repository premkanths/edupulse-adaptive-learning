package com.edupulse.dto;

import java.util.List;
import java.util.Map;

public class StudentDashboardDto {
    private String studentName;
    private String studentEmail;
    private String department;
    private String academicInfo;
    private String welcomeGreeting;
    private String welcomeSummary;
    private boolean hasQuizHistory;

    // Progress metrics
    private long enrolledSubjectsCount;
    private long assignedQuizzesCount;
    private long completedAttemptsCount;
    private double averageQuizScore;
    private double overallMasteryAverage;
    private long topicsStudiedCount;
    private long strongTopicsCount;
    private long weakTopicsCount;

    // Strengths and Gaps
    private List<Map<String, Object>> strongTopics;
    private List<Map<String, Object>> topicsToPractice;

    // Recent activity & next steps
    private List<Map<String, Object>> recentQuizzes;
    private List<Map<String, Object>> recommendations;
    private Map<String, Object> nextAction;
    private Map<String, Object> howLearningIsAnalysed;

    public StudentDashboardDto() {
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getAcademicInfo() {
        return academicInfo;
    }

    public void setAcademicInfo(String academicInfo) {
        this.academicInfo = academicInfo;
    }

    public String getWelcomeGreeting() {
        return welcomeGreeting;
    }

    public void setWelcomeGreeting(String welcomeGreeting) {
        this.welcomeGreeting = welcomeGreeting;
    }

    public String getWelcomeSummary() {
        return welcomeSummary;
    }

    public void setWelcomeSummary(String welcomeSummary) {
        this.welcomeSummary = welcomeSummary;
    }

    public boolean isHasQuizHistory() {
        return hasQuizHistory;
    }

    public void setHasQuizHistory(boolean hasQuizHistory) {
        this.hasQuizHistory = hasQuizHistory;
    }

    public long getEnrolledSubjectsCount() {
        return enrolledSubjectsCount;
    }

    public void setEnrolledSubjectsCount(long enrolledSubjectsCount) {
        this.enrolledSubjectsCount = enrolledSubjectsCount;
    }

    public long getAssignedQuizzesCount() {
        return assignedQuizzesCount;
    }

    public void setAssignedQuizzesCount(long assignedQuizzesCount) {
        this.assignedQuizzesCount = assignedQuizzesCount;
    }

    public long getCompletedAttemptsCount() {
        return completedAttemptsCount;
    }

    public void setCompletedAttemptsCount(long completedAttemptsCount) {
        this.completedAttemptsCount = completedAttemptsCount;
    }

    public double getAverageQuizScore() {
        return averageQuizScore;
    }

    public void setAverageQuizScore(double averageQuizScore) {
        this.averageQuizScore = averageQuizScore;
    }

    public double getOverallMasteryAverage() {
        return overallMasteryAverage;
    }

    public void setOverallMasteryAverage(double overallMasteryAverage) {
        this.overallMasteryAverage = overallMasteryAverage;
    }

    public long getTopicsStudiedCount() {
        return topicsStudiedCount;
    }

    public void setTopicsStudiedCount(long topicsStudiedCount) {
        this.topicsStudiedCount = topicsStudiedCount;
    }

    public long getStrongTopicsCount() {
        return strongTopicsCount;
    }

    public void setStrongTopicsCount(long strongTopicsCount) {
        this.strongTopicsCount = strongTopicsCount;
    }

    public long getWeakTopicsCount() {
        return weakTopicsCount;
    }

    public void setWeakTopicsCount(long weakTopicsCount) {
        this.weakTopicsCount = weakTopicsCount;
    }

    public List<Map<String, Object>> getStrongTopics() {
        return strongTopics;
    }

    public void setStrongTopics(List<Map<String, Object>> strongTopics) {
        this.strongTopics = strongTopics;
    }

    public List<Map<String, Object>> getTopicsToPractice() {
        return topicsToPractice;
    }

    public void setTopicsToPractice(List<Map<String, Object>> topicsToPractice) {
        this.topicsToPractice = topicsToPractice;
    }

    public List<Map<String, Object>> getRecentQuizzes() {
        return recentQuizzes;
    }

    public void setRecentQuizzes(List<Map<String, Object>> recentQuizzes) {
        this.recentQuizzes = recentQuizzes;
    }

    public List<Map<String, Object>> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<Map<String, Object>> recommendations) {
        this.recommendations = recommendations;
    }

    public Map<String, Object> getNextAction() {
        return nextAction;
    }

    public void setNextAction(Map<String, Object> nextAction) {
        this.nextAction = nextAction;
    }

    public Map<String, Object> getHowLearningIsAnalysed() {
        return howLearningIsAnalysed;
    }

    public void setHowLearningIsAnalysed(Map<String, Object> howLearningIsAnalysed) {
        this.howLearningIsAnalysed = howLearningIsAnalysed;
    }
}
