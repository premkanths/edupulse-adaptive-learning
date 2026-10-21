package com.edupulse.service;

import com.edupulse.entity.Role;
import com.edupulse.entity.User;
import com.edupulse.entity.UserConsent;
import com.edupulse.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class PrivacyConsentService {

    private static final Logger log = LoggerFactory.getLogger(PrivacyConsentService.class);

    private final UserConsentRepository consentRepository;
    private final UserRepository userRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ExternalProfileRepository externalProfileRepository;
    private final FeedbackSurveyRepository feedbackSurveyRepository;
    private final RiskPredictionRepository riskPredictionRepository;

    public PrivacyConsentService(UserConsentRepository consentRepository,
                                 UserRepository userRepository,
                                 ChatSessionRepository chatSessionRepository,
                                 ExternalProfileRepository externalProfileRepository,
                                 FeedbackSurveyRepository feedbackSurveyRepository,
                                 RiskPredictionRepository riskPredictionRepository) {
        this.consentRepository = consentRepository;
        this.userRepository = userRepository;
        this.chatSessionRepository = chatSessionRepository;
        this.externalProfileRepository = externalProfileRepository;
        this.feedbackSurveyRepository = feedbackSurveyRepository;
        this.riskPredictionRepository = riskPredictionRepository;
    }

    public UserConsent getConsent(Long userId) {
        return consentRepository.findTopByUserIdOrderByConsentedAtDesc(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null) {
                        return consentRepository.save(new UserConsent(user, "1.0", UserConsent.ConsentStatus.GRANTED));
                    }
                    return null;
                });
    }

    @Transactional
    public UserConsent updateConsent(Long userId, UserConsent.ConsentStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        UserConsent consent = new UserConsent(user, "1.0", status);
        return consentRepository.save(consent);
    }

    @Transactional
    public void deleteMyData(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        log.warn("Executing GDPR/FERPA Right to be Forgotten for student: {}", user.getEmail());

        // 1. Delete private AI chats
        chatSessionRepository.findByStudentId(userId).forEach(chatSessionRepository::delete);

        // 2. Delete linked external profiles
        externalProfileRepository.findByStudentId(userId).forEach(externalProfileRepository::delete);

        // 3. Delete risk predictions
        riskPredictionRepository.findByStudentIdOrderByPredictedAtDesc(userId).forEach(riskPredictionRepository::delete);

        // 4. Anonymize user record
        String anonymizedEmail = "anonymized." + user.getId() + "@deleted.edupulse.local";
        user.setName("Anonymized Student #" + user.getId());
        user.setEmail(anonymizedEmail);
        user.setActive(false);
        user.setEmailNotifications(false);
        userRepository.save(user);

        log.info("Student {} successfully anonymized and private records purged", userId);
    }
}
