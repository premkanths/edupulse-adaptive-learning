package com.edupulse.service;

import com.edupulse.entity.*;
import com.edupulse.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class RiskPredictionService {

    private static final Logger log = LoggerFactory.getLogger(RiskPredictionService.class);

    private final RiskPredictionRepository riskPredictionRepository;
    private final UserRepository userRepository;
    private final AttemptRepository attemptRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final TopicMasteryRepository topicMasteryRepository;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    @Value("${edupulse.ml-service.url:http://localhost:8001}")
    private String mlServiceUrl;

    public RiskPredictionService(RiskPredictionRepository riskPredictionRepository,
                                 UserRepository userRepository,
                                 AttemptRepository attemptRepository,
                                 AttendanceRecordRepository attendanceRecordRepository,
                                 TopicMasteryRepository topicMasteryRepository,
                                 ObjectMapper objectMapper) {
        this.riskPredictionRepository = riskPredictionRepository;
        this.userRepository = userRepository;
        this.attemptRepository = attemptRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.topicMasteryRepository = topicMasteryRepository;
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(2500));
        requestFactory.setReadTimeout(Duration.ofMillis(2500));
        this.restClient = RestClient.builder().requestFactory(requestFactory).build();
    }

    public Optional<RiskPrediction> getLatestPrediction(Long studentId) {
        return riskPredictionRepository.findTopByStudentIdOrderByPredictedAtDesc(studentId);
    }

    @Transactional
    public RiskPrediction evaluateStudentRisk(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        // 1. Calculate student features
        List<Attempt> attempts = attemptRepository.findByStudentId(studentId);
        double quizAverage = 70.0;
        LocalDateTime lastActive = student.getCreatedAt() != null ? student.getCreatedAt() : LocalDateTime.now().minusDays(3);

        if (!attempts.isEmpty()) {
            double sum = 0;
            for (Attempt a : attempts) {
                sum += (a.getScore() != null ? a.getScore() : 0.0);
                if (a.getSubmittedAt() != null && a.getSubmittedAt().isAfter(lastActive)) {
                    lastActive = a.getSubmittedAt();
                }
            }
            quizAverage = sum / attempts.size();
        }

        List<AttendanceRecord> attendanceRecords = attendanceRecordRepository.findByStudentId(studentId);
        double attendancePct = 85.0;
        if (!attendanceRecords.isEmpty()) {
            long presentCount = attendanceRecords.stream()
                    .filter(a -> a.getStatus() == AttendanceRecord.Status.PRESENT)
                    .count();
            attendancePct = ((double) presentCount / attendanceRecords.size()) * 100.0;
        }

        List<TopicMastery> masteries = topicMasteryRepository.findByStudentId(studentId);
        double bktMastery = 0.50;
        if (!masteries.isEmpty()) {
            double totalBkt = masteries.stream().mapToDouble(TopicMastery::getPKnown).sum();
            bktMastery = totalBkt / masteries.size();
        }

        long daysInactive = ChronoUnit.DAYS.between(lastActive.toLocalDate(), LocalDate.now());
        if (daysInactive < 0) daysInactive = 0;

        int assignmentsMissed = 0;
        for (AttendanceRecord att : attendanceRecords) {
            if (att.getStatus() == AttendanceRecord.Status.ABSENT) {
                assignmentsMissed++;
            }
        }
        for (Attempt a : attempts) {
            if (a.getScore() != null && a.getScore() < 40.0) {
                assignmentsMissed++;
            }
        }

        // 2. Attempt ML Service prediction
        Double riskScore = null;
        RiskPrediction.RiskLevel riskLevel = null;
        List<String> reasons = new ArrayList<>();
        boolean isFallback = false;

        try {
            Map<String, Object> req = new HashMap<>();
            req.put("quiz_average", Math.round(quizAverage * 10.0) / 10.0);
            req.put("attendance_pct", Math.round(attendancePct * 10.0) / 10.0);
            req.put("bkt_avg_mastery", Math.round(bktMastery * 100.0) / 100.0);
            req.put("akt_avg_mastery", Math.round(bktMastery * 100.0) / 100.0);
            req.put("days_inactive", daysInactive);
            req.put("assignments_missed", assignmentsMissed);

            Map<?, ?> mlResp = restClient.post()
                    .uri(mlServiceUrl + "/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(req)
                    .retrieve()
                    .body(Map.class);

            if (mlResp != null && mlResp.containsKey("risk_score")) {
                riskScore = ((Number) mlResp.get("risk_score")).doubleValue();
                riskLevel = RiskPrediction.RiskLevel.valueOf((String) mlResp.get("risk_level"));
                Object reasonsObj = mlResp.get("reasons");
                if (reasonsObj instanceof List) {
                    for (Object r : (List<?>) reasonsObj) {
                        reasons.add(String.valueOf(r));
                    }
                }
                log.info("ML Service predicted risk for student {}: {} (score: {})", student.getEmail(), riskLevel, riskScore);
            }
        } catch (Exception e) {
            log.warn("ML Service unavailable ({}), falling back to deterministic heuristic rule engine: {}",
                    mlServiceUrl, e.getMessage());
            isFallback = true;
        }

        // 3. Fallback Heuristic Rule Engine
        if (riskScore == null || isFallback) {
            isFallback = true;
            double calculatedScore = (100.0 - quizAverage) * 0.4 +
                                     (100.0 - attendancePct) * 0.3 +
                                     (1.0 - bktMastery) * 100.0 * 0.3;
            if (daysInactive >= 7) calculatedScore += 15.0;
            calculatedScore = Math.min(100.0, Math.max(0.0, calculatedScore));
            riskScore = Math.round(calculatedScore * 10.0) / 10.0;

            if (quizAverage < 50.0 || attendancePct < 70.0 || daysInactive >= 10 || riskScore >= 60.0) {
                riskLevel = RiskPrediction.RiskLevel.HIGH;
            } else if (quizAverage < 65.0 || attendancePct < 80.0 || daysInactive >= 5 || riskScore >= 35.0) {
                riskLevel = RiskPrediction.RiskLevel.MODERATE;
            } else {
                riskLevel = RiskPrediction.RiskLevel.LOW;
            }

            if (quizAverage < 50.0) reasons.add("Quiz score average is critically low (" + Math.round(quizAverage) + "%)");
            else if (quizAverage < 65.0) reasons.add("Quiz score average is below 65%");
            if (attendancePct < 75.0) reasons.add("Attendance is below required 75% (" + Math.round(attendancePct) + "%)");
            if (bktMastery < 0.45) reasons.add("BKT estimated mastery is low across key syllabus topics (" + Math.round(bktMastery * 100) + "%)");
            if (daysInactive >= 7) reasons.add("Student has been inactive for " + daysInactive + " days");
            if (assignmentsMissed >= 2) reasons.add("Has " + assignmentsMissed + " missed or failing assessment marks");
            if (reasons.isEmpty()) reasons.add("Student is performing well with high engagement and mastery");
        }

        String reasonsJson;
        try {
            reasonsJson = objectMapper.writeValueAsString(reasons);
        } catch (Exception e) {
            reasonsJson = "[\"" + String.join("\", \"", reasons) + "\"]";
        }

        RiskPrediction prediction = new RiskPrediction(student, riskScore, riskLevel, reasonsJson, isFallback);
        return riskPredictionRepository.save(prediction);
    }

    public List<Map<String, Object>> getAtRiskStudentsForTeacher(Long teacherId) {
        // Find students across teacher's classes
        List<User> students = userRepository.findByRoleAndIsActiveTrue(Role.STUDENT);
        List<Map<String, Object>> list = new ArrayList<>();

        for (User s : students) {
            RiskPrediction pred = getLatestPrediction(s.getId()).orElseGet(() -> evaluateStudentRisk(s.getId()));

            Map<String, Object> map = new HashMap<>();
            map.put("studentId", s.getId());
            map.put("studentName", s.getName());
            map.put("studentEmail", s.getEmail());
            map.put("riskScore", pred.getRiskScore());
            map.put("riskLevel", pred.getRiskLevel());
            map.put("isFallback", pred.getIsFallback());
            map.put("predictedAt", pred.getPredictedAt());
            
            try {
                map.put("reasons", objectMapper.readValue(pred.getReasons(), List.class));
            } catch (Exception e) {
                map.put("reasons", List.of(pred.getReasons()));
            }

            // Pedagogical interventions
            if (pred.getRiskLevel() == RiskPrediction.RiskLevel.HIGH) {
                map.put("recommendedIntervention", "Immediate 1-on-1 academic mentoring and foundational prerequisite review assignment.");
            } else if (pred.getRiskLevel() == RiskPrediction.RiskLevel.MODERATE) {
                map.put("recommendedIntervention", "Assign targeted adaptive practice quiz on weak topics and send reminder alert.");
            } else {
                map.put("recommendedIntervention", "Encourage student to tackle advanced challenge topics.");
            }

            list.add(map);
        }

        list.sort((a, b) -> Double.compare((Double) b.get("riskScore"), (Double) a.get("riskScore")));
        return list;
    }
}
