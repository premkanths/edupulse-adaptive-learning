package com.edupulse.controller;

import com.edupulse.dto.AdminDashboardDto;
import com.edupulse.dto.ApiResponse;
import com.edupulse.dto.UserDto;
import com.edupulse.entity.*;
import com.edupulse.security.UserPrincipal;
import com.edupulse.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Administrator APIs: Platform overview, user management, cohorts, settings, and reports")
public class AdminController {

    private final DashboardService dashboardService;
    private final UserService userService;
    private final WeeklySummaryService weeklySummaryService;
    private final ClassManagementService classManagementService;
    private final SettingService settingService;
    private final ReportExportService reportExportService;
    private final AuditService auditService;

    public AdminController(DashboardService dashboardService,
                           UserService userService,
                           WeeklySummaryService weeklySummaryService,
                           ClassManagementService classManagementService,
                           SettingService settingService,
                           ReportExportService reportExportService,
                           AuditService auditService) {
        this.dashboardService = dashboardService;
        this.userService = userService;
        this.weeklySummaryService = weeklySummaryService;
        this.classManagementService = classManagementService;
        this.settingService = settingService;
        this.reportExportService = reportExportService;
        this.auditService = auditService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform administrative overview metrics")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboard() {
        AdminDashboardDto dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    // === PHASE 11: USER LIFECYCLE & ROLE MANAGEMENT ===

    @GetMapping("/users")
    @Operation(summary = "List all platform users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PostMapping("/users")
    @Operation(summary = "Create user account as admin (Teacher, Student, or Admin)")
    public ResponseEntity<ApiResponse<UserDto>> createUser(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String name = payload.get("name");
        String email = payload.get("email");
        String password = payload.get("password");
        Role role = Role.valueOf(payload.getOrDefault("role", "STUDENT").toUpperCase());

        UserDto created = userService.createUserByAdmin(name, email, password, role);
        auditService.logEvent(null, "ADMIN_CREATE_USER", "Created user: " + email + " with role: " + role, "127.0.0.1");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully by administrator", created));
    }

    @PutMapping("/users/{userId}/toggle-active")
    @Operation(summary = "Toggle user active/inactive status")
    public ResponseEntity<ApiResponse<User>> toggleUserActive(@PathVariable Long userId) {
        User updated = classManagementService.toggleUserActive(userId);
        auditService.logEvent(updated, "ADMIN_TOGGLE_USER_ACTIVE", "Toggled active status to: " + updated.isActive(), "127.0.0.1");
        return ResponseEntity.ok(ApiResponse.success("User status updated", updated));
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Reassign user role (STUDENT, TEACHER, ADMIN)")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> payload) {
        Role newRole = Role.valueOf(payload.get("role").toUpperCase());
        User updated = classManagementService.updateUserRole(userId, newRole);
        auditService.logEvent(updated, "ADMIN_UPDATE_ROLE", "Reassigned role to: " + newRole, "127.0.0.1");
        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", updated));
    }

    @PutMapping("/users/{userId}")
    @Operation(summary = "Update user name and email")
    public ResponseEntity<ApiResponse<User>> updateUserDetails(
            @PathVariable Long userId,
            @RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        User updated = classManagementService.updateUserDetails(userId, name, email);
        return ResponseEntity.ok(ApiResponse.success("User details updated", updated));
    }

    // === PHASE 11: CLASS COHORT MANAGEMENT ===

    @GetMapping("/classes")
    @Operation(summary = "List all classes with teacher and student enrollment count")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getClasses() {
        List<Map<String, Object>> classes = classManagementService.getAllClasses();
        return ResponseEntity.ok(ApiResponse.success(classes));
    }

    @GetMapping("/classes/{classId}")
    @Operation(summary = "Get detailed class view with enrolled students list")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getClassDetails(@PathVariable Long classId) {
        Map<String, Object> details = classManagementService.getClassDetails(classId);
        return ResponseEntity.ok(ApiResponse.success(details));
    }

    @PostMapping("/classes")
    @Operation(summary = "Create a new class cohort and assign teacher")
    public ResponseEntity<ApiResponse<ClassEntity>> createClass(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        Long teacherId = ((Number) payload.get("teacherId")).longValue();
        ClassEntity newClass = classManagementService.createClass(name, teacherId);
        auditService.logEvent(null, "ADMIN_CREATE_CLASS", "Created class: " + name, "127.0.0.1");
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Class created", newClass));
    }

    @PostMapping("/classes/{classId}/students/{studentId}")
    @Operation(summary = "Enroll a student into class cohort")
    public ResponseEntity<ApiResponse<ClassEntity>> enrollStudent(
            @PathVariable Long classId,
            @PathVariable Long studentId) {
        ClassEntity c = classManagementService.enrollStudent(classId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Student enrolled in class", c));
    }

    @DeleteMapping("/classes/{classId}/students/{studentId}")
    @Operation(summary = "Remove student from class cohort")
    public ResponseEntity<ApiResponse<ClassEntity>> removeStudent(
            @PathVariable Long classId,
            @PathVariable Long studentId) {
        ClassEntity c = classManagementService.removeStudent(classId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Student removed from class", c));
    }

    @DeleteMapping("/classes/{classId}")
    @Operation(summary = "Delete class cohort")
    public ResponseEntity<ApiResponse<String>> deleteClass(@PathVariable Long classId) {
        classManagementService.deleteClass(classId);
        return ResponseEntity.ok(ApiResponse.success("Class deleted", "Class removed successfully"));
    }

    // === PHASE 12: PLATFORM CONFIGURATION SETTINGS ===

    @GetMapping("/settings")
    @Operation(summary = "Get all dynamic platform configuration settings")
    public ResponseEntity<ApiResponse<List<Setting>>> getSettings() {
        List<Setting> settings = settingService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @PutMapping("/settings/{key}")
    @Operation(summary = "Update specific platform configuration setting")
    public ResponseEntity<ApiResponse<Setting>> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> payload) {
        String value = payload.get("value");
        Setting s = settingService.updateSetting(key, value);
        auditService.logEvent(null, "ADMIN_UPDATE_SETTING", "Updated " + key + " = " + value, "127.0.0.1");
        return ResponseEntity.ok(ApiResponse.success("Setting updated", s));
    }

    @PostMapping("/settings/batch")
    @Operation(summary = "Batch update platform configuration settings")
    public ResponseEntity<ApiResponse<List<Setting>>> batchUpdateSettings(@RequestBody Map<String, String> payload) {
        List<Setting> updated = settingService.batchUpdate(payload);
        return ResponseEntity.ok(ApiResponse.success("Settings updated successfully", updated));
    }

    // === PHASE 13: INSTITUTIONAL REPORTS & CSV EXPORTS ===

    @GetMapping("/reports/overview")
    @Operation(summary = "Get aggregate institutional performance metrics overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReportsOverview() {
        Map<String, Object> report = reportExportService.getAdminOverviewReport();
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/reports/export/students")
    @Operation(summary = "Export complete student academic and quiz performance report as CSV")
    public ResponseEntity<String> exportStudentsReport() {
        String csv = reportExportService.exportStudentsCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"students_performance_report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/reports/export/at-risk")
    @Operation(summary = "Export at-risk student intervention roster as CSV")
    public ResponseEntity<String> exportAtRiskReport() {
        String csv = reportExportService.exportAtRiskCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"at_risk_interventions_report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/reports/export/topic-mastery")
    @Operation(summary = "Export Attentive Knowledge Tracing (AKT) topic mastery matrix as CSV (with BKT fallback parameters)")
    public ResponseEntity<String> exportTopicMasteryReport() {
        String csv = reportExportService.exportTopicMasteryCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"topic_mastery_matrix.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    // === PHASE 14: SECURITY AUDIT LOG TRAIL ===

    @GetMapping("/audit-logs")
    @Operation(summary = "Get security audit logs (logins, imports, data erasures, settings updates)")
    public ResponseEntity<ApiResponse<List<AuditEvent>>> getAuditLogs() {
        List<AuditEvent> logs = auditService.getRecentAuditLogs();
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    // === WEEKLY SUMMARY TRIGGER ===

    @PostMapping("/summaries/generate-all")
    @Operation(summary = "Manually trigger generation and dispatch of weekly learning summaries for all students")
    public ResponseEntity<ApiResponse<String>> generateAllWeeklySummaries() {
        int count = weeklySummaryService.generateAllWeeklySummaries().size();
        return ResponseEntity.ok(ApiResponse.success("Generated and dispatched " + count + " student weekly summaries."));
    }
}
