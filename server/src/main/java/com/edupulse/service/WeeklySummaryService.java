package com.edupulse.service;

import com.edupulse.entity.*;
import com.edupulse.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
public class WeeklySummaryService {

    private static final Logger log = LoggerFactory.getLogger(WeeklySummaryService.class);

    private final UserRepository userRepository;
    private final AttemptRepository attemptRepository;
    private final TopicMasteryRepository topicMasteryRepository;
    private final RecommendationRecordRepository recommendationRecordRepository;
    private final WeeklySummaryRepository weeklySummaryRepository;
    private final EmailService emailService;

    public WeeklySummaryService(UserRepository userRepository,
                                AttemptRepository attemptRepository,
                                TopicMasteryRepository topicMasteryRepository,
                                RecommendationRecordRepository recommendationRecordRepository,
                                WeeklySummaryRepository weeklySummaryRepository,
                                EmailService emailService) {
        this.userRepository = userRepository;
        this.attemptRepository = attemptRepository;
        this.topicMasteryRepository = topicMasteryRepository;
        this.recommendationRecordRepository = recommendationRecordRepository;
        this.weeklySummaryRepository = weeklySummaryRepository;
        this.emailService = emailService;
    }

    @Scheduled(cron = "${edupulse.summary.cron:0 0 6 * * MON}")
    public void scheduledWeeklySummary() {
        log.info("Starting scheduled Monday weekly summary generation for all active students...");
        generateAllWeeklySummaries();
    }

    @Transactional
    public List<WeeklySummary> generateAllWeeklySummaries() {
        List<User> students = userRepository.findByRoleAndIsActiveTrue(Role.STUDENT);
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<WeeklySummary> created = new ArrayList<>();

        for (User student : students) {
            try {
                WeeklySummary summary = generateSummaryForStudent(student, weekStart);
                created.add(summary);
            } catch (Exception ex) {
                log.error("Failed to generate weekly summary for student {}: {}", student.getEmail(), ex.getMessage());
            }
        }
        return created;
    }

    @Transactional
    public WeeklySummary generateSummaryForStudent(User student, LocalDate weekStart) {
        LocalDateTime startOfWeek = weekStart.atStartOfDay();
        List<Attempt> attempts = attemptRepository.findByStudentIdAndSubmittedAtAfter(student.getId(), startOfWeek);
        if (attempts.isEmpty()) {
            attempts = attemptRepository.findByStudentId(student.getId()); // fallback to recent attempts
        }

        List<TopicMastery> masteries = topicMasteryRepository.findByStudentId(student.getId());

        double avgScore = 0.0;
        if (!attempts.isEmpty()) {
            double total = attempts.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0).sum();
            avgScore = Math.round((total / attempts.size()) * 10.0) / 10.0;
        }

        TopicMastery topTopic = null;
        TopicMastery weakTopic = null;
        if (!masteries.isEmpty()) {
            masteries.sort((a, b) -> Double.compare(b.getPKnown(), a.getPKnown()));
            topTopic = masteries.get(0);
            weakTopic = masteries.get(masteries.size() - 1);
        }

        StringBuilder content = new StringBuilder();
        content.append("## EduPulse Weekly Learning Summary\n\n");
        content.append("**Week of:** ").append(weekStart).append("\n\n");
        content.append("### Summary of Activity:\n");
        content.append("- **Quizzes Completed:** ").append(attempts.size()).append("\n");
        content.append("- **Average Score:** ").append(avgScore).append("%\n\n");

        if (topTopic != null) {
            content.append("### Strongest Topic:\n");
            content.append("- **").append(topTopic.getTopic().getName()).append("** (")
                    .append(Math.round(topTopic.getPKnown() * 100)).append("% estimated mastery)\n\n");
        }

        if (weakTopic != null) {
            content.append("### Recommended Focus Area for Next Week:\n");
            content.append("- **").append(weakTopic.getTopic().getName()).append("** (")
                    .append(Math.round(weakTopic.getPKnown() * 100)).append("% estimated mastery)\n");
            content.append("  *Tip: Dedicate 15-20 minutes to review prerequisite concepts and solve adaptive practice questions.*\n\n");
        }

        content.append("Keep up the great work in mastering your subjects with EduPulse!\n");

        WeeklySummary summary = new WeeklySummary();
        summary.setStudent(student);
        summary.setWeekStart(weekStart);
        summary.setContent(content.toString());
        summary.setEmailedAt(LocalDateTime.now());
        summary = weeklySummaryRepository.save(summary);

        // Send email via service (respecting dry-run mode)
        String htmlBody = "<html><body>" +
                "<h2>EduPulse Weekly Learning Summary</h2>" +
                "<p><strong>Week of: </strong>" + weekStart + "</p>" +
                "<ul>" +
                "<li><strong>Quizzes Completed: </strong>" + attempts.size() + "</li>" +
                "<li><strong>Average Score: </strong>" + avgScore + "%</li>" +
                (topTopic != null ? "<li><strong>Strongest Topic: </strong>" + topTopic.getTopic().getName() + " (" + Math.round(topTopic.getPKnown() * 100) + "% mastery)</li>" : "") +
                (weakTopic != null ? "<li><strong>Recommended Focus: </strong>" + weakTopic.getTopic().getName() + " (" + Math.round(weakTopic.getPKnown() * 100) + "% mastery)</li>" : "") +
                "</ul>" +
                "<p>Log in to <a href=\"http://localhost:5173\">EduPulse</a> to review your personalized recommendations!</p>" +
                "</body></html>";

        emailService.sendEmail(student, "WEEKLY_SUMMARY", "Your EduPulse Weekly Learning Summary - " + weekStart, htmlBody);

        return summary;
    }

    public List<WeeklySummary> getStudentSummaries(Long studentId) {
        return weeklySummaryRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }
}
