package com.edupulse.service;

import com.edupulse.entity.AuditEvent;
import com.edupulse.entity.User;
import com.edupulse.repository.AuditEventRepository;
import com.edupulse.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditEventRepository auditEventRepository;
    private final UserRepository userRepository;

    public AuditService(AuditEventRepository auditEventRepository, UserRepository userRepository) {
        this.auditEventRepository = auditEventRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AuditEvent logEvent(User user, String action, String details, String ipAddress) {
        log.info("[AUDIT] User: {} | Action: {} | IP: {} | Details: {}",
                user != null ? user.getEmail() : "ANONYMOUS", action, ipAddress, details);

        AuditEvent event = new AuditEvent(user, action, details, ipAddress);
        return auditEventRepository.save(event);
    }

    public void logAuthEvent(String email, boolean success, String ipAddress) {
        User user = userRepository.findByEmail(email).orElse(null);
        String action = success ? "AUTH_LOGIN_SUCCESS" : "AUTH_LOGIN_FAILED";
        String details = success ? "User successfully authenticated" : "Failed login attempt with email: " + email;
        logEvent(user, action, details, ipAddress);
    }

    public void logAdminAction(User admin, String action, String details) {
        logEvent(admin, action, details, "127.0.0.1");
    }

    public List<AuditEvent> getRecentAuditLogs() {
        return auditEventRepository.findTop100ByOrderByCreatedAtDesc();
    }
}
