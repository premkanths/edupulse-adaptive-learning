package com.edupulse.controller;

import com.edupulse.dto.ApiResponse;
import com.edupulse.dto.AuthRequest;
import com.edupulse.dto.AuthResponse;
import com.edupulse.dto.RegisterRequest;
import com.edupulse.dto.UserDto;
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

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication and registration APIs")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
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
}
