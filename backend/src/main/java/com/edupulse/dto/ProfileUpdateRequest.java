package com.edupulse.dto;

import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 255, message = "Avatar URL must not exceed 255 characters")
    private String avatarUrl;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;

    @Size(max = 100, message = "Department must not exceed 100 characters")
    private String department;

    @Size(max = 100, message = "Academic info must not exceed 100 characters")
    private String academicInfo;

    @Size(max = 255, message = "GitHub URL must not exceed 255 characters")
    private String githubUrl;

    @Size(max = 255, message = "LinkedIn URL must not exceed 255 characters")
    private String linkedinUrl;

    @Size(max = 255, message = "Website URL must not exceed 255 characters")
    private String websiteUrl;

    private Boolean emailNotifications;

    public ProfileUpdateRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getAcademicInfo() { return academicInfo; }
    public void setAcademicInfo(String academicInfo) { this.academicInfo = academicInfo; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getWebsiteUrl() { return websiteUrl; }
    public void setWebsiteUrl(String websiteUrl) { this.websiteUrl = websiteUrl; }

    public Boolean getEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(Boolean emailNotifications) { this.emailNotifications = emailNotifications; }
}
