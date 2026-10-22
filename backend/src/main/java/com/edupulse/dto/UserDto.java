package com.edupulse.dto;

import com.edupulse.entity.Role;
import com.edupulse.entity.User;
import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean isActive;
    private boolean emailNotifications;
    private String avatarUrl;
    private String bio;
    private String department;
    private String academicInfo;
    private String githubUrl;
    private String linkedinUrl;
    private String websiteUrl;
    private LocalDateTime createdAt;

    public UserDto() {
    }

    public UserDto(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.isActive = user.isActive();
        this.emailNotifications = user.isEmailNotifications();
        this.avatarUrl = user.getAvatarUrl();
        this.bio = user.getBio();
        this.department = user.getDepartment();
        this.academicInfo = user.getAcademicInfo();
        this.githubUrl = user.getGithubUrl();
        this.linkedinUrl = user.getLinkedinUrl();
        this.websiteUrl = user.getWebsiteUrl();
        this.createdAt = user.getCreatedAt();
    }

    public static UserDto fromEntity(User user) {
        return new UserDto(user);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public boolean isEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
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

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
