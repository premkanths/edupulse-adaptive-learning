package com.edupulse.service;

import com.edupulse.dto.AdminDashboardDto;
import com.edupulse.dto.StudentDashboardDto;
import com.edupulse.dto.TeacherDashboardDto;
import com.edupulse.dto.UserDto;
import com.edupulse.entity.*;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final QuizRepository quizRepository;
    private final AttemptRepository attemptRepository;
    private final TopicMasteryRepository topicMasteryRepository;
    private final RecommendationService recommendationService;
    private final AiClientService aiClientService;

    public DashboardService(UserRepository userRepository,
                            ClassRepository classRepository,
                            SubjectRepository subjectRepository,
                            QuizRepository quizRepository,
                            AttemptRepository attemptRepository,
                            TopicMasteryRepository topicMasteryRepository,
                            RecommendationService recommendationService,
                            AiClientService aiClientService) {
        this.userRepository = userRepository;
        this.classRepository = classRepository;
        this.subjectRepository = subjectRepository;
        this.quizRepository = quizRepository;
        this.attemptRepository = attemptRepository;
        this.topicMasteryRepository = topicMasteryRepository;
        this.recommendationService = recommendationService;
        this.aiClientService = aiClientService;
    }

    @Transactional
    public StudentDashboardDto getStudentDashboard(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        StudentDashboardDto dto = new StudentDashboardDto();
        dto.setStudentName(student.getName());
        dto.setStudentEmail(student.getEmail());
        dto.setDepartment(student.getDepartment() != null ? student.getDepartment() : "Computer Science & Engineering");
        dto.setAcademicInfo(student.getAcademicInfo() != null ? student.getAcademicInfo() : "Student");

        // 1. Subjects & Quizzes
        long subjectsCount = subjectRepository.count();
        dto.setEnrolledSubjectsCount(subjectsCount);

        List<Quiz> publishedQuizzes = quizRepository.findByStatus(Quiz.Status.PUBLISHED);
        dto.setAssignedQuizzesCount(publishedQuizzes.size());

        // 2. Real Attempts & Scores
        List<Attempt> attempts = attemptRepository.findByStudentIdOrderByStartedAtDesc(studentId);
        List<Attempt> completedAttempts = attempts.stream()
                .filter(a -> a.getStatus() == Attempt.Status.SUBMITTED)
                .collect(Collectors.toList());

        long completedCount = completedAttempts.size();
        dto.setCompletedAttemptsCount(completedCount);
        dto.setHasQuizHistory(completedCount > 0);

        double totalScore = 0.0;
        for (Attempt a : completedAttempts) {
            totalScore += (a.getScore() != null ? a.getScore() : 0.0);
        }
        double avgScore = completedCount > 0 ? Math.round((totalScore / completedCount) * 10.0) / 10.0 : 0.0;
        dto.setAverageQuizScore(avgScore);

        // 3. Real Topic Masteries
        List<TopicMastery> masteries = topicMasteryRepository.findByStudentId(studentId);
        dto.setTopicsStudiedCount(masteries.size());

        double totalMastery = 0.0;
        List<Map<String, Object>> strongTopicsList = new ArrayList<>();
        List<Map<String, Object>> topicsToPracticeList = new ArrayList<>();

        for (TopicMastery tm : masteries) {
            Topic topic = tm.getTopic();
            double p = tm.getPKnown() != null ? tm.getPKnown() : 0.0;
            double acc = tm.getAccuracy() != null ? tm.getAccuracy() : 0.0;
            int attCount = tm.getAttemptsCount() != null ? tm.getAttemptsCount() : 0;
            totalMastery += p;

            Map<String, Object> tMap = new HashMap<>();
            tMap.put("topicId", topic.getId());
            tMap.put("topicName", topic.getName());
            tMap.put("subjectName", topic.getSubject() != null ? topic.getSubject().getName() : "General");
            tMap.put("masteryPercent", Math.round(p * 100));
            tMap.put("accuracy", Math.round(acc));
            tMap.put("attemptsCount", attCount);

            if (p >= 0.70 || (attCount > 0 && acc >= 75.0)) {
                strongTopicsList.add(tMap);
            } else if (p < 0.50 || (attCount > 0 && acc < 60.0)) {
                if (topic.getPrerequisiteTopic() != null) {
                    tMap.put("prerequisiteName", topic.getPrerequisiteTopic().getName());
                }
                tMap.put("advice", "Review key concepts and complete targeted practice.");
                topicsToPracticeList.add(tMap);
            }
        }

        double overallMastery = masteries.isEmpty() ? 0.0 : (totalMastery / masteries.size());
        dto.setOverallMasteryAverage(Math.round(overallMastery * 1000.0) / 1000.0);
        dto.setStrongTopicsCount(strongTopicsList.size());
        dto.setWeakTopicsCount(topicsToPracticeList.size());
        dto.setStrongTopics(strongTopicsList);
        dto.setTopicsToPractice(topicsToPracticeList);

        // 4. Personalized Welcome Greeting & Summary
        dto.setWelcomeGreeting("Welcome back, " + student.getName().split(" ")[0] + "!");
        if (completedCount == 0) {
            dto.setWelcomeSummary("You're enrolled in " + subjectsCount + " subjects. Ready to begin? Take your first quiz to uncover your strengths and build your personalized learning path.");
        } else {
            dto.setWelcomeSummary(String.format(
                    "You're making steady progress across %d subject%s with %d completed quiz%s and an average score of %.1f%%. Keep it up!",
                    subjectsCount, subjectsCount == 1 ? "" : "s",
                    completedCount, completedCount == 1 ? "" : "zes",
                    avgScore
            ));
        }

        // 5. Real Recent Quizzes (Top 4)
        List<Map<String, Object>> recentList = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM d, yyyy");
        for (int i = 0; i < Math.min(4, completedAttempts.size()); i++) {
            Attempt a = completedAttempts.get(i);
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("id", a.getId());
            qMap.put("title", a.getQuiz() != null ? a.getQuiz().getTitle() : "Practice Quiz");
            qMap.put("score", a.getScore() != null ? a.getScore() : 0.0);
            qMap.put("status", a.getStatus().name());
            qMap.put("date", a.getSubmittedAt() != null ? a.getSubmittedAt().format(dtf) : "Recently");
            qMap.put("feedback", a.getScore() != null && a.getScore() >= 80.0
                    ? "Great mastery shown on foundational questions!"
                    : "Review missed questions to boost your mastery.");
            recentList.add(qMap);
        }
        dto.setRecentQuizzes(recentList);

        // 6. Real Recommendations & Next Action
        List<RecommendationRecord> recRecords = recommendationService.getStudentRecommendations(studentId);
        List<Map<String, Object>> recs = new ArrayList<>();
        for (RecommendationRecord r : recRecords) {
            Map<String, Object> rMap = new HashMap<>();
            rMap.put("id", r.getId());
            rMap.put("topic", r.getTopic() != null ? r.getTopic().getName() : "Foundational Topic");
            rMap.put("type", r.getRecommendationType().name());
            rMap.put("reason", r.getExplanation());
            rMap.put("evidence", r.getSupportingEvidence());
            rMap.put("action", r.getNextStepAction());
            rMap.put("estimatedMinutes", r.getEstimatedMinutes());
            recs.add(rMap);
        }
        dto.setRecommendations(recs);

        // Set Prominent Next Action
        Map<String, Object> nextAct = new HashMap<>();
        if (!recRecords.isEmpty()) {
            RecommendationRecord topRec = recRecords.get(0);
            nextAct.put("topic", topRec.getTopic() != null ? topRec.getTopic().getName() : "Recommended Practice");
            nextAct.put("action", topRec.getNextStepAction());
            nextAct.put("reason", topRec.getExplanation());
            nextAct.put("estimatedMinutes", topRec.getEstimatedMinutes());
            nextAct.put("url", "/student/quizzes");
        } else if (!publishedQuizzes.isEmpty()) {
            Quiz nextQuiz = publishedQuizzes.get(0);
            nextAct.put("topic", nextQuiz.getTitle());
            nextAct.put("action", "Take this short quiz to test your concept understanding.");
            nextAct.put("reason", "Regular quizzes help keep concepts fresh and update your learning recommendations.");
            nextAct.put("estimatedMinutes", 15);
            nextAct.put("url", "/student/quizzes");
        } else {
            nextAct.put("topic", "Course Notes & Learning Materials");
            nextAct.put("action", "Browse instructor-uploaded notes and slides.");
            nextAct.put("reason", "Study materials provide deep conceptual clarity.");
            nextAct.put("estimatedMinutes", 20);
            nextAct.put("url", "/student/materials");
        }
        dto.setNextAction(nextAct);

        // 7. Explainable Learning Insights Metadata (For Expandable Section)
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("model", "Attentive Knowledge Tracing (AKT)");
        analysis.put("description", "EduPulse models your concept understanding by observing your question-response history and applying temporal decay.");
        analysis.put("aktStatus", "ACTIVE");
        analysis.put("aiTutorProvider", aiClientService.getActiveProviderName());
        dto.setHowLearningIsAnalysed(analysis);

        return dto;
    }

    @Transactional(readOnly = true)
    public TeacherDashboardDto getTeacherDashboard(Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with ID: " + teacherId));

        List<ClassEntity> classes = classRepository.findByTeacherId(teacherId);

        TeacherDashboardDto dto = new TeacherDashboardDto();
        dto.setTeacherName(teacher.getName());
        dto.setClassesCount(classes.size());

        long studentCount = classes.stream()
                .mapToLong(c -> c.getStudents().size())
                .sum();
        if (studentCount == 0) {
            studentCount = userRepository.countByRole(Role.STUDENT);
        }
        dto.setTotalStudentsCount(studentCount);
        dto.setCreatedQuizzesCount(5);
        dto.setQuestionsInBankCount(45);
        dto.setClassAverageScore(72.4);

        List<Map<String, Object>> classList = new ArrayList<>();
        for (ClassEntity c : classes) {
            Map<String, Object> cMap = new HashMap<>();
            cMap.put("id", c.getId());
            cMap.put("name", c.getName());
            cMap.put("studentCount", c.getStudents().size());
            classList.add(cMap);
        }
        dto.setManagedClasses(classList);

        List<Map<String, Object>> activities = new ArrayList<>();
        Map<String, Object> act1 = new HashMap<>();
        act1.put("title", "Quiz Assignment Completed");
        act1.put("description", "8 of 10 students completed 'Data Structures: Binary Trees'");
        act1.put("timestamp", "2 hours ago");
        activities.add(act1);
        dto.setRecentActivities(activities);

        return dto;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getAdminDashboard() {
        AdminDashboardDto dto = new AdminDashboardDto();
        dto.setTotalUsersCount(userRepository.count());
        dto.setStudentsCount(userRepository.countByRole(Role.STUDENT));
        dto.setTeachersCount(userRepository.countByRole(Role.TEACHER));
        dto.setAdminsCount(userRepository.countByRole(Role.ADMIN));
        dto.setClassesCount(classRepository.count());
        dto.setSubjectsCount(subjectRepository.count());

        List<UserDto> recentUsers = userRepository.findAll().stream()
                .sorted((u1, u2) -> u2.getCreatedAt().compareTo(u1.getCreatedAt()))
                .limit(10)
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
        dto.setRecentUsers(recentUsers);

        return dto;
    }
}
