package com.edupulse.service;

import com.edupulse.dto.AuthRequest;
import com.edupulse.dto.AuthResponse;
import com.edupulse.dto.RegisterRequest;
import com.edupulse.dto.UserDto;
import com.edupulse.entity.Role;
import com.edupulse.entity.User;
import com.edupulse.exception.BadRequestException;
import com.edupulse.exception.UnauthorizedException;
import com.edupulse.repository.UserRepository;
import com.edupulse.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public UserDto registerStudent(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        // Public registration always assigns STUDENT role. Teacher/Admin must be created by an Admin.
        User user = new User(
                request.getName().trim(),
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                Role.STUDENT
        );

        User savedUser = userRepository.save(user);
        return UserDto.fromEntity(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!user.isActive()) {
            throw new UnauthorizedException("This account has been deactivated. Please contact an administrator.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);
        return new AuthResponse(token, UserDto.fromEntity(user));
    }
}
