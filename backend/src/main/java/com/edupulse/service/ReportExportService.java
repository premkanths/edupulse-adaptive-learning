package com.edupulse.service;

import com.edupulse.entity.*;
import com.edupulse.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReportExportService {

    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final QuizRepository quizRepository;
    private final AttemptRepository attemptRepository;
    private final TopicMasteryRepository topicMasteryRepository;
    private final RiskPredictionRepository riskPredictionRepository;
    private final AcademicRecordRepository academicRecordRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ObjectMapper objectMapper;

    public ReportExportService(UserRepository userRepository,
                               ClassRepository classRepository,
                               QuizRepository quizRepository,
                               AttemptRepository attemptRepository,
                               TopicMasteryRepository topicMasteryRepository,
                               RiskPredictionRepository riskPredictionRepository,
                               AcademicRecordRepository academicRecordRepository,
                               AttendanceRecordRepository attendanceRecordRepository,
                               ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.classRepository = classRepository;
        this.quizRepository = quizRepository;
        this.attemptRepository = attemptRepository;
        this.topicMasteryRepository = topicMasteryRepository;
        this.riskPredictionRepository = riskPredictionRepository;
        this.academicRecordRepository = academicRecordRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> getAdminOverviewReport() {
        Map<String, Object> map = new HashMap<>();

        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalTeachers = userRepository.countByRole(Role.TEACHER);
        long totalClasses = classRepository.count();
        long totalQuizzes = quizRepository.count();
        long totalAttempts = attemptRepository.count();
        long totalMarksRecords = academicRecordRepository.count();
        long totalAttendanceRecords = attendanceRecordRepository.count();

        List<RiskPrediction> allPredictions = riskPredictionRepository.findAll();
        long highRiskCount = allPredictions.stream().filter(p -> p.getRiskLevel() == RiskPrediction.RiskLevel.HIGH).count();
        long modRiskCount = allPredictions.stream().filter(p -> p.getRiskLevel() == RiskPrediction.RiskLevel.MODERATE).count();
        long lowRiskCount = allPredictions.stream().filter(p -> p.getRiskLevel() == RiskPrediction.RiskLevel.LOW).count();

        map.put("totalStudents", totalStudents);
        map.put("totalTeachers", totalTeachers);
        map.put("totalClasses", totalClasses);
        map.put("totalQuizzes", totalQuizzes);
        map.put("totalAttempts", totalAttempts);
        map.put("totalMarksRecords", totalMarksRecords);
        map.put("totalAttendanceRecords", totalAttendanceRecords);
        map.put("highRiskCount", highRiskCount);
        map.put("moderateRiskCount", modRiskCount);
        map.put("lowRiskCount", lowRiskCount);

        return map;
    }

    public String exportStudentsCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("student_id,name,email,is_active,quizzes_attempted,average_score,attendance_pct,risk_level,risk_score\n");

        List<User> students = userRepository.findByRole(Role.STUDENT);
        for (User s : students) {
            List<Attempt> attempts = attemptRepository.findByStudentId(s.getId());
            double avgScore = 0.0;
            if (!attempts.isEmpty()) {
                double sum = attempts.stream().mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0).sum();
                avgScore = Math.round((sum / attempts.size()) * 10.0) / 10.0;
            }

            long totalAtt = attendanceRecordRepository.countByStudentId(s.getId());
            long presentAtt = attendanceRecordRepository.countByStudentIdAndStatus(s.getId(), AttendanceRecord.Status.PRESENT);
            double attPct = totalAtt > 0 ? Math.round(((double) presentAtt / totalAtt) * 1000.0) / 10.0 : 100.0;

            Optional<RiskPrediction> riskOpt = riskPredictionRepository.findTopByStudentIdOrderByPredictedAtDesc(s.getId());
            String riskLevel = riskOpt.map(r -> r.getRiskLevel().name()).orElse("LOW");
            double riskScore = riskOpt.map(RiskPrediction::getRiskScore).orElse(15.0);

            csv.append(escapeCsv(String.valueOf(s.getId()))).append(",")
               .append(escapeCsv(s.getName())).append(",")
               .append(escapeCsv(s.getEmail())).append(",")
               .append(s.isActive()).append(",")
               .append(attempts.size()).append(",")
               .append(avgScore).append(",")
               .append(attPct).append(",")
               .append(riskLevel).append(",")
               .append(riskScore).append("\n");
        }
        return csv.toString();
    }

    public String exportAtRiskCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("student_id,name,email,risk_level,risk_score,is_fallback,reasons,intervention,predicted_at\n");

        List<User> students = userRepository.findByRole(Role.STUDENT);
        for (User s : students) {
            Optional<RiskPrediction> riskOpt = riskPredictionRepository.findTopByStudentIdOrderByPredictedAtDesc(s.getId());
            if (riskOpt.isPresent()) {
                RiskPrediction r = riskOpt.get();
                String reasonsClean = r.getReasons().replace("\"", "'").replace("\n", " ");
                String intervention = r.getRiskLevel() == RiskPrediction.RiskLevel.HIGH
                        ? "Immediate 1-on-1 academic mentoring & prerequisite remediation"
                        : r.getRiskLevel() == RiskPrediction.RiskLevel.MODERATE
                        ? "Targeted adaptive practice quizzes on weak topics"
                        : "Encourage advanced challenge problems";

                csv.append(escapeCsv(String.valueOf(s.getId()))).append(",")
                   .append(escapeCsv(s.getName())).append(",")
                   .append(escapeCsv(s.getEmail())).append(",")
                   .append(r.getRiskLevel()).append(",")
                   .append(r.getRiskScore()).append(",")
                   .append(r.getIsFallback()).append(",")
                   .append(escapeCsv(reasonsClean)).append(",")
                   .append(escapeCsv(intervention)).append(",")
                   .append(escapeCsv(String.valueOf(r.getPredictedAt()))).append("\n");
            }
        }
        return csv.toString();
    }

    public String exportTopicMasteryCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("student_id,student_name,subject_name,topic_name,p_known,accuracy,attempts_count,mastery_status\n");

        List<TopicMastery> masteries = topicMasteryRepository.findAll();
        for (TopicMastery tm : masteries) {
            String status = tm.getPKnown() >= 0.85 ? "MASTERED" : tm.getPKnown() < 0.60 ? "WEAK" : "IN_PROGRESS";
            csv.append(tm.getStudent().getId()).append(",")
               .append(escapeCsv(tm.getStudent().getName())).append(",")
               .append(escapeCsv(tm.getTopic().getSubject().getName())).append(",")
               .append(escapeCsv(tm.getTopic().getName())).append(",")
               .append(Math.round(tm.getPKnown() * 100.0) / 100.0).append(",")
               .append(tm.getAccuracy()).append(",")
               .append(tm.getAttemptsCount()).append(",")
               .append(status).append("\n");
        }
        return csv.toString();
    }

    private String escapeCsv(String val) {
        if (val == null) return "\"\"";
        return "\"" + val.replace("\"", "\"\"") + "\"";
    }
}
