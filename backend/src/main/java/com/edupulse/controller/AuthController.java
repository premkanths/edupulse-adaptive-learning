package com.edupulse.controller;

import com.edupulse.dto.ApiResponse;
import com.edupulse.dto.AuthRequest;
import com.edupulse.dto.AuthResponse;
import com.edupulse.dto.RegisterRequest;
import com.edupulse.dto.UserDto;
import com.edupulse.entity.ClassEntity;
import com.edupulse.entity.Role;
import com.edupulse.entity.User;
import com.edupulse.repository.ClassRepository;
import com.edupulse.repository.UserRepository;
import com.edupulse.security.UserPrincipal;
import com.edupulse.service.AuthService;
import com.edupulse.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/auth", "/auth"})
@Tag(name = "Authentication", description = "Authentication and registration APIs")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;

    public AuthController(AuthService authService, UserService userService,
                          UserRepository userRepository, ClassRepository classRepository) {
        this.authService = authService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.classRepository = classRepository;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new student account", description = "Public endpoint for student self-registration.")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserDto createdUser = authService.registerStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student registered successfully", createdUser));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and get JWT token", description = "Login with email and password.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user info", description = "Requires valid Bearer JWT token.")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }
        UserDto userDto = userService.getUserById(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Authenticated user retrieved", userDto));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Stateless token logout confirmation.")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logout successful", "Session cleared on client"));
    }

    @GetMapping("/demo-users")
    @Operation(summary = "Get list of available demo users for 1-click evaluation", description = "Public endpoint providing seeded students, teachers, and admin.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDemoUsers() {
        Map<String, Object> response = new HashMap<>();

        // 1. Get Teachers
        List<User> teachers = userRepository.findByRole(Role.TEACHER);
        List<Map<String, Object>> teacherList = new ArrayList<>();
        for (User t : teachers) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("name", t.getName());
            map.put("email", t.getEmail());
            map.put("password", "Password@123");
            if (t.getEmail().contains("sarah")) {
                map.put("section", "CS Year 4 - Section A");
                map.put("subjects", "Data Structures, Computer Networks");
            } else if (t.getEmail().contains("alan")) {
                map.put("section", "CS Year 4 - Section B");
                map.put("subjects", "DBMS, Software Engineering");
            } else {
                map.put("section", "CS Year 4 - Section C");
                map.put("subjects", "Operating Systems");
            }
            teacherList.add(map);
        }
        response.put("teachers", teacherList);

        // 2. Admin
        Map<String, Object> adminMap = new HashMap<>();
        adminMap.put("name", "Dr. Robert Vance (Admin)");
        adminMap.put("email", "admin@edupulse.local");
        adminMap.put("password", "Password@123");
        response.put("admin", adminMap);

        // 3. Students
        List<User> students = userRepository.findByRole(Role.STUDENT);
        List<Map<String, Object>> studentList = new ArrayList<>();

        // Group into Sections based on student number
        for (User s : students) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("name", s.getName());
            map.put("email", s.getEmail());
            map.put("password", "Password@123");

            // Extract number from studentX@edupulse.local if possible
            int num = 1;
            try {
                String clean = s.getEmail().replaceAll("[^0-9]", "");
                if (!clean.isEmpty()) num = Integer.parseInt(clean);
            } catch (Exception ignored) {}

            String section = (num <= 17) ? "Section A" : ((num <= 34) ? "Section B" : "Section C");
            map.put("section", section);

            // Categorize for demo: High, Moderate, At-Risk
            String category = (num % 3 == 0) ? "AT_RISK" : ((num % 2 == 0) ? "HIGH" : "MODERATE");
            if (num == 1 || num == 2 || num == 6 || num == 10) category = "HIGH";
            if (num == 3 || num == 7 || num == 9 || num == 13 || num == 17) category = "AT_RISK";
            map.put("category", category);

            studentList.add(map);
        }
        response.put("students", studentList);
        response.put("totalStudents", studentList.size());

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
