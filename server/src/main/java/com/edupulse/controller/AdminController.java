package com.edupulse.controller;

import com.edupulse.dto.AdminDashboardDto;
import com.edupulse.dto.ApiResponse;
import com.edupulse.dto.UserDto;
import com.edupulse.entity.Role;
import com.edupulse.security.UserPrincipal;
import com.edupulse.service.DashboardService;
import com.edupulse.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Administrator APIs: Platform overview, user management, and settings")
public class AdminController {

    private final DashboardService dashboardService;
    private final UserService userService;
    private final com.edupulse.service.WeeklySummaryService weeklySummaryService;

    public AdminController(DashboardService dashboardService, UserService userService, com.edupulse.service.WeeklySummaryService weeklySummaryService) {
        this.dashboardService = dashboardService;
        this.userService = userService;
        this.weeklySummaryService = weeklySummaryService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform administrative overview metrics")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboard() {
        AdminDashboardDto dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/users")
    @Operation(summary = "List all platform users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PostMapping("/users")
    @Operation(summary = "Create user account as admin (Teacher, Student, or Admin)")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String password = payload.get("password");
        Role role = Role.valueOf(payload.getOrDefault("role", "STUDENT").toUpperCase());

        UserDto created = userService.createUserByAdmin(name, email, password, role);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully by administrator", created));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get admin profile")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto profile = userService.getUserById(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PostMapping("/summaries/generate-all")
    @Operation(summary = "Manually trigger generation and dispatch of weekly learning summaries for all students")
    public ResponseEntity<ApiResponse<String>> generateAllWeeklySummaries() {
        int count = weeklySummaryService.generateAllWeeklySummaries().size();
        return ResponseEntity.ok(ApiResponse.success("Generated and dispatched " + count + " student weekly summaries."));
    }
}
