package com.edupulse.service;

import com.edupulse.entity.EmailLog;
import com.edupulse.entity.User;
import com.edupulse.repository.EmailLogRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final EmailLogRepository emailLogRepository;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${mail.dry-run:true}")
    private boolean dryRun;

    public EmailService(EmailLogRepository emailLogRepository, ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.emailLogRepository = emailLogRepository;
        this.mailSenderProvider = mailSenderProvider;
    }

    public EmailLog sendEmail(User user, String type, String subject, String content) {
        EmailLog emailLog = new EmailLog();
        emailLog.setUser(user);
        emailLog.setType(type);
        emailLog.setSubject(subject);
        emailLog.setSentAt(LocalDateTime.now());

        if (dryRun) {
            log.info("[EMAIL DRY-RUN] To: {} | Type: {} | Subject: {}", user.getEmail(), type, subject);
            emailLog.setStatus(EmailLog.Status.DRY_RUN);
            return emailLogRepository.save(emailLog);
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("JavaMailSender not available, defaulting to DRY_RUN for: {}", user.getEmail());
            emailLog.setStatus(EmailLog.Status.DRY_RUN);
            return emailLogRepository.save(emailLog);
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);

            emailLog.setStatus(EmailLog.Status.SENT);
            log.info("Email successfully sent to: {}", user.getEmail());
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", user.getEmail(), ex.getMessage());
            emailLog.setStatus(EmailLog.Status.FAILED);
        }

        return emailLogRepository.save(emailLog);
    }
}
