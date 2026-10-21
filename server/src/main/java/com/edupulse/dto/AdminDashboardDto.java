package com.edupulse.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardDto {
    private long totalUsersCount;
    private long studentsCount;
    private long teachersCount;
    private long adminsCount;
    private long classesCount;
    private long subjectsCount;
    private List<UserDto> recentUsers;
    private Map<String, Object> knowledgeTracingModel;

    public AdminDashboardDto() {
    }

    public long getTotalUsersCount() {
        return totalUsersCount;
    }

    public void setTotalUsersCount(long totalUsersCount) {
        this.totalUsersCount = totalUsersCount;
    }

    public long getStudentsCount() {
        return studentsCount;
    }

    public void setStudentsCount(long studentsCount) {
        this.studentsCount = studentsCount;
    }

    public long getTeachersCount() {
        return teachersCount;
    }

    public void setTeachersCount(long teachersCount) {
        this.teachersCount = teachersCount;
    }

    public long getAdminsCount() {
        return adminsCount;
    }

    public void setAdminsCount(long adminsCount) {
        this.adminsCount = adminsCount;
    }

    public long getClassesCount() {
        return classesCount;
    }

    public void setClassesCount(long classesCount) {
        this.classesCount = classesCount;
    }

    public long getSubjectsCount() {
        return subjectsCount;
    }

    public void setSubjectsCount(long subjectsCount) {
        this.subjectsCount = subjectsCount;
    }

    public List<UserDto> getRecentUsers() {
        return recentUsers;
    }

    public void setRecentUsers(List<UserDto> recentUsers) {
        this.recentUsers = recentUsers;
    }

    public Map<String, Object> getKnowledgeTracingModel() {
        return knowledgeTracingModel;
    }

    public void setKnowledgeTracingModel(Map<String, Object> knowledgeTracingModel) {
        this.knowledgeTracingModel = knowledgeTracingModel;
    }
}
