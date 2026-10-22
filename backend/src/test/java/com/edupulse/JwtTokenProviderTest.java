package com.edupulse;

import com.edupulse.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String secret = "EduPulseSuperSecretKeyForJwtTokenGeneration2026SecureKeyMustBeLongEnough";
    private final long expirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(secret, expirationMs);
    }

    @Test
    @DisplayName("Should generate valid JWT and extract correct email subject")
    void testGenerateAndValidateToken() {
        String email = "student1@edupulse.local";
        String token = tokenProvider.generateToken(email, 1L, "Aarav Sharma", "STUDENT");

        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(email, tokenProvider.getEmailFromToken(token));
    }

    @Test
    @DisplayName("Should reject tampered or invalid JWT token")
    void testInvalidToken() {
        String invalidToken = "eyJhbGciOiJIUzI1NiJ9.invalid.signature";
        assertFalse(tokenProvider.validateToken(invalidToken));
    }
}
