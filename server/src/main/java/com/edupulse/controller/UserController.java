package com.edupulse.controller;

import com.edupulse.dto.ApiResponse;
import com.edupulse.dto.ChangePasswordRequest;
import com.edupulse.dto.ProfileUpdateRequest;
import com.edupulse.dto.UserDto;
import com.edupulse.security.UserPrincipal;
import com.edupulse.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("isAuthenticated()")
@Tag(name = "User Profile", description = "Self-profile retrieval, editing, and password update for all roles")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current authenticated user's profile details")
    public ResponseEntity<ApiResponse<UserDto>> getMyProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto userDto = userService.getUserById(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", userDto));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user's profile details")
    public ResponseEntity<ApiResponse<UserDto>> updateMyProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto updated = userService.updateProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change password for the current authenticated user")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        userService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", "Password updated"));
    }
}
