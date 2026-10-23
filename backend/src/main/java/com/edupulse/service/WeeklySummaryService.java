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

    @Scheduled(cron = "${edupulse.inactivity.cron:0 0 7 * * *}")
    public void scheduledInactivityCheck() {
        log.info("Starting daily scheduled inactivity check for students inactive >7 days...");
        checkAndAlertInactiveStudents();
    }

    @Transactional
    public int checkAndAlertInactiveStudents() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<User> students = userRepository.findByRoleAndIsActiveTrue(Role.STUDENT);
        int alertsSent = 0;

        for (User student : students) {
            List<Attempt> recentAttempts = attemptRepository.findByStudentIdAndSubmittedAtAfter(student.getId(), sevenDaysAgo);
            if (recentAttempts.isEmpty()) {
                try {
                    String html = "<html><body>" +
                            "<h3>We Miss You at EduPulse!</h3>" +
                            "<p>Hello " + student.getName() + ",</p>" +
                            "<p>We noticed you haven't taken any practice quizzes in the past 7 days. Consistency is key to knowledge retention!</p>" +
                            "<p>Dedicate just 5-10 minutes today to review your weak topics and keep your mastery scores high.</p>" +
                            "<p><a href=\"http://localhost:5173\">Jump back into EduPulse</a></p>" +
                            "</body></html>";
                    emailService.sendEmail(student, "INACTIVITY_ALERT", "Keep your learning momentum going with EduPulse!", html);
                    alertsSent++;
                } catch (Exception ex) {
                    log.warn("Failed to dispatch inactivity alert to {}: {}", student.getEmail(), ex.getMessage());
                }
            }
        }
        return alertsSent;
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
        return generateSummaryForStudent(student, weekStart, null);
    }

    @Transactional
    public WeeklySummary generateSummaryForStudent(User student, LocalDate weekStart, String overrideEmail) {
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
        String clientBase = "http://localhost:5173";
        boolean hasWeakTopic = weakTopic != null && weakTopic.getPKnown() < 0.65;
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }");
        html.append(".card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }");
        html.append(".header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; color: #ffffff; text-align: center; }");
        html.append(".header h1 { margin: 0; font-size: 24px; font-weight: 800; }");
        html.append(".header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }");
        html.append(".content { padding: 28px 24px; }");
        html.append(".grid { display: flex; gap: 12px; margin: 20px 0; }");
        html.append(".metric { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; }");
        html.append(".metric-val { font-size: 22px; font-weight: 800; color: #4f46e5; }");
        html.append(".metric-lbl { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-top: 4px; }");
        html.append(".alert-box { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 14px; color: #9f1239; font-size: 13px; margin: 20px 0; }");
        html.append(".focus-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 18px; margin: 20px 0; }");
        html.append(".btn { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; text-align: center; margin: 10px 0; }");
        html.append(".footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }");
        html.append("</style></head><body>");
        html.append("<div class='card'>");
        html.append("<div class='header'>");
        html.append("<h1>EduPulse Weekly Learning Digest</h1>");
        html.append("<p>Week of ").append(weekStart).append(" &bull; Continuous Student Telemetry</p>");
        html.append("</div>");
        html.append("<div class='content'>");
        html.append("<p style='font-size: 15px;'>Hello <strong>").append(student.getName()).append("</strong>,</p>");
        html.append("<p style='font-size: 14px; color: #475569;'>Here is your personalized summary of quiz practice, topic mastery standing, and immediate study priorities for the upcoming week:</p>");

        html.append("<div class='grid'>");
        html.append("<div class='metric'><div class='metric-val'>").append(attempts.size()).append("</div><div class='metric-lbl'>Quizzes Taken</div></div>");
        html.append("<div class='metric'><div class='metric-val'>").append(avgScore).append("%</div><div class='metric-lbl'>Average Score</div></div>");
        if (topTopic != null) {
            html.append("<div class='metric'><div class='metric-val'>").append(Math.round(topTopic.getPKnown() * 100)).append("%</div><div class='metric-lbl'>Best Mastery</div></div>");
        }
        html.append("</div>");

        if (hasWeakTopic) {
            html.append("<div class='alert-box'>");
            html.append("<strong>&#9888;&#65039; Academic Priority Alert:</strong> Your estimated mastery in <strong>")
                .append(weakTopic.getTopic().getName()).append("</strong> is currently at ")
                .append(Math.round(weakTopic.getPKnown() * 100)).append("%. Taking a quick practice test this week will boost your retention!");
            html.append("</div>");
        }

        if (weakTopic != null) {
            html.append("<div class='focus-box'>");
            html.append("<h4 style='margin: 0 0 8px 0; color: #5b21b6; font-size: 15px;'>🎯 Recommended Focus Area:</h4>");
            html.append("<p style='margin: 0; font-size: 13px; color: #4c1d95;'><strong>")
                .append(weakTopic.getTopic().getName()).append("</strong> (Current Mastery: ")
                .append(Math.round(weakTopic.getPKnown() * 100)).append("%)</p>");
            html.append("<p style='margin: 8px 0 0 0; font-size: 12px; color: #6d28d9;'><em>Study Tip: Review teacher lecture slides in Course Materials and ask Jarvis AI Study Assistant to walk you through sample questions.</em></p>");
            html.append("</div>");
        }

        html.append("<div style='text-align: center; margin: 28px 0;'>");
        html.append("<a href='").append(clientBase).append("/student/quizzes' class='btn'>Launch Your Weekly 5-Minute Practice Quiz &rarr;</a>");
        html.append("</div>");

        html.append("<p style='font-size: 13px; color: #64748b;'>Consistency is the foundation of academic excellence. Dedicate just 5 to 10 minutes today to keep your knowledge tracing model up to date.</p>");
        html.append("</div>");
        html.append("<div class='footer'>");
        html.append("&copy; ").append(java.time.Year.now().getValue()).append(" EduPulse Adaptive Learning Platform &bull; Automated Weekly Digest");
        html.append("</div></div></body></html>");

        if (overrideEmail != null && !overrideEmail.isBlank()) {
            emailService.sendDirectEmail(overrideEmail, student.getName(), "WEEKLY_SUMMARY", "Your EduPulse Weekly Learning Summary & Quiz Reminder - " + weekStart, html.toString());
        } else {
            emailService.sendEmail(student, "WEEKLY_SUMMARY", "Your EduPulse Weekly Learning Summary & Quiz Reminder - " + weekStart, html.toString());
        }

        return summary;
    }

    @Transactional
    public int dispatchWeeklySummariesToAll() {
        List<WeeklySummary> list = generateAllWeeklySummaries();
        return list.size();
    }

    @Transactional
    public boolean dispatchWeeklySummaryToStudent(Long studentId) {
        User student = userRepository.findById(studentId).orElse(null);
        if (student == null) return false;
        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        generateSummaryForStudent(student, weekStart);
        return true;
    }

    public List<WeeklySummary> getStudentSummaries(Long studentId) {
        return weeklySummaryRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }
}
