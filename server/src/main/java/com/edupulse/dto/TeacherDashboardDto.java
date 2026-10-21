package com.edupulse.dto;

import java.util.List;
import java.util.Map;

public class TeacherDashboardDto {
    private String teacherName;
    private long classesCount;
    private long totalStudentsCount;
    private long createdQuizzesCount;
    private long questionsInBankCount;
    private double classAverageScore;
    private List<Map<String, Object>> managedClasses;
    private List<Map<String, Object>> recentActivities;

    public TeacherDashboardDto() {
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public long getClassesCount() {
        return classesCount;
    }

    public void setClassesCount(long classesCount) {
        this.classesCount = classesCount;
    }

    public long getTotalStudentsCount() {
        return totalStudentsCount;
    }

    public void setTotalStudentsCount(long totalStudentsCount) {
        this.totalStudentsCount = totalStudentsCount;
    }

    public long getCreatedQuizzesCount() {
        return createdQuizzesCount;
    }

    public void setCreatedQuizzesCount(long createdQuizzesCount) {
        this.createdQuizzesCount = createdQuizzesCount;
    }

    public long getQuestionsInBankCount() {
        return questionsInBankCount;
    }

    public void setQuestionsInBankCount(long questionsInBankCount) {
        this.questionsInBankCount = questionsInBankCount;
    }

    public double getClassAverageScore() {
        return classAverageScore;
    }

    public void setClassAverageScore(double classAverageScore) {
        this.classAverageScore = classAverageScore;
    }

    public List<Map<String, Object>> getManagedClasses() {
        return managedClasses;
    }

    public void setManagedClasses(List<Map<String, Object>> managedClasses) {
        this.managedClasses = managedClasses;
    }

    public List<Map<String, Object>> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<Map<String, Object>> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
