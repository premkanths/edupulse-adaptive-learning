package com.edupulse.dto;

import java.util.List;
import java.util.Map;

public class StudentDashboardDto {
    private String studentName;
    private String studentEmail;
    private long enrolledSubjectsCount;
    private long assignedQuizzesCount;
    private long completedAttemptsCount;
    private double overallMasteryAverage;
    private long strongTopicsCount;
    private long weakTopicsCount;
    private List<Map<String, Object>> recentQuizzes;
    private List<Map<String, Object>> recommendations;

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

    public double getOverallMasteryAverage() {
        return overallMasteryAverage;
    }

    public void setOverallMasteryAverage(double overallMasteryAverage) {
        this.overallMasteryAverage = overallMasteryAverage;
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
}
