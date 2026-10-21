package com.edupulse.controller;

import com.edupulse.dto.ApiResponse;
import com.edupulse.dto.StudentDashboardDto;
import com.edupulse.dto.UserDto;
import com.edupulse.entity.*;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.repository.SubjectRepository;
import com.edupulse.repository.TopicMasteryRepository;
import com.edupulse.repository.TopicRepository;
import com.edupulse.repository.UserRepository;
import com.edupulse.security.UserPrincipal;
import com.edupulse.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student", description = "Student APIs: Quizzes, Bayesian Knowledge Tracing, Recommendations, AI Assistant")
public class StudentController {

    private final DashboardService dashboardService;
    private final UserService userService;
    private final QuizService quizService;
    private final AttemptService attemptService;
    private final TopicMasteryService topicMasteryService;
    private final RecommendationService recommendationService;
    private final ChatService chatService;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final AcademicImportService academicImportService;
    private final WeeklySummaryService weeklySummaryService;
    private final ExternalProfileService externalProfileService;
    private final RiskPredictionService riskPredictionService;
    private final PrivacyConsentService privacyConsentService;
    private final FeedbackSurveyService feedbackSurveyService;

    public StudentController(DashboardService dashboardService,
                             UserService userService,
                             QuizService quizService,
                             AttemptService attemptService,
                             TopicMasteryService topicMasteryService,
                             RecommendationService recommendationService,
                             ChatService chatService,
                             SubjectRepository subjectRepository,
                             TopicRepository topicRepository,
                             UserRepository userRepository,
                             AcademicImportService academicImportService,
                             WeeklySummaryService weeklySummaryService,
                             ExternalProfileService externalProfileService,
                             RiskPredictionService riskPredictionService,
                             PrivacyConsentService privacyConsentService,
                             FeedbackSurveyService feedbackSurveyService) {
        this.dashboardService = dashboardService;
        this.userService = userService;
        this.quizService = quizService;
        this.attemptService = attemptService;
        this.topicMasteryService = topicMasteryService;
        this.recommendationService = recommendationService;
        this.chatService = chatService;
        this.subjectRepository = subjectRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
        this.academicImportService = academicImportService;
        this.weeklySummaryService = weeklySummaryService;
        this.externalProfileService = externalProfileService;
        this.riskPredictionService = riskPredictionService;
        this.privacyConsentService = privacyConsentService;
        this.feedbackSurveyService = feedbackSurveyService;
    }

    private User getStudentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found"));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get student dashboard analytics and summary")
    public ResponseEntity<ApiResponse<StudentDashboardDto>> getDashboard(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        StudentDashboardDto dashboard = dashboardService.getStudentDashboard(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get student profile details")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto profile = userService.getUserById(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/subjects")
    @Operation(summary = "Get enrolled subjects and topics with BKT mastery estimates")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSubjects(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Subject> subjects = subjectRepository.findAll();
        List<TopicMastery> masteries = topicMasteryService.getStudentMastery(userPrincipal.getId());
        Map<Long, TopicMastery> masteryMap = new HashMap<>();
        for (TopicMastery tm : masteries) {
            masteryMap.put(tm.getTopic().getId(), tm);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Subject s : subjects) {
            Map<String, Object> sMap = new HashMap<>();
            sMap.put("id", s.getId());
            sMap.put("name", s.getName());
            sMap.put("description", s.getDescription());

            List<Topic> topics = topicRepository.findBySubjectId(s.getId());
            List<Map<String, Object>> topicList = new ArrayList<>();
            for (Topic t : topics) {
                Map<String, Object> tMap = new HashMap<>();
                tMap.put("id", t.getId());
                tMap.put("name", t.getName());
                tMap.put("prerequisiteId", t.getPrerequisiteTopic() != null ? t.getPrerequisiteTopic().getId() : null);
                tMap.put("prerequisiteName", t.getPrerequisiteTopic() != null ? t.getPrerequisiteTopic().getName() : null);

                TopicMastery tm = masteryMap.get(t.getId());
                tMap.put("pKnown", tm != null ? tm.getPKnown() : 0.30);
                tMap.put("accuracy", tm != null ? tm.getAccuracy() : 0.0);
                tMap.put("attemptsCount", tm != null ? tm.getAttemptsCount() : 0);
                topicList.add(tMap);
            }
            sMap.put("topics", topicList);
            result.add(sMap);
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/quizzes")
    @Operation(summary = "Get assigned quizzes for student")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAssignedQuizzes(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Map<String, Object>> quizzes = quizService.getAssignedQuizzesForStudent(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    @PostMapping("/quizzes/{quizId}/start")
    @Operation(summary = "Start or resume quiz attempt")
    public ResponseEntity<ApiResponse<Map<String, Object>>> startQuizAttempt(
            @PathVariable Long quizId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User student = getStudentUser(userPrincipal);
        Attempt attempt = attemptService.startAttempt(quizId, student);
        Map<String, Object> quizData = quizService.getStudentQuizForAttempt(quizId);
        quizData.put("attemptId", attempt.getId());
        quizData.put("attemptStatus", attempt.getStatus().name());
        return ResponseEntity.ok(ApiResponse.success("Quiz attempt initialized", quizData));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    @Operation(summary = "Submit quiz attempt answers for server-side evaluation & BKT updates")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitQuiz(
            @PathVariable Long attemptId,
            @RequestBody Map<String, Object> submissionPayload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User student = getStudentUser(userPrincipal);

        @SuppressWarnings("unchecked")
        Map<String, Integer> answers = (Map<String, Integer>) submissionPayload.get("answers");
        @SuppressWarnings("unchecked")
        Map<String, Integer> times = (Map<String, Integer>) submissionPayload.get("times");

        Map<String, Object> evaluation = attemptService.submitAttempt(attemptId, student, answers, times);
        return ResponseEntity.ok(ApiResponse.success("Quiz scored successfully", evaluation));
    }

    @GetMapping("/attempts/{attemptId}/review")
    @Operation(summary = "Get complete attempt review, scoring breakdown, and question explanations")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttemptReview(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User student = getStudentUser(userPrincipal);
        Map<String, Object> review = attemptService.getAttemptReview(attemptId, student);
        return ResponseEntity.ok(ApiResponse.success(review));
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Get explainable personalized study recommendations with 'Why this?' evidence")
    public ResponseEntity<ApiResponse<List<RecommendationRecord>>> getRecommendations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<RecommendationRecord> recs = recommendationService.getStudentRecommendations(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(recs));
    }

    @GetMapping("/performance")
    @Operation(summary = "Get learning performance history and BKT topic mastery analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPerformanceAnalytics(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long studentId = userPrincipal.getId();
        List<TopicMastery> masteries = topicMasteryService.getStudentMastery(studentId);

        List<Map<String, Object>> topicScores = new ArrayList<>();
        for (TopicMastery tm : masteries) {
            Map<String, Object> m = new HashMap<>();
            m.put("topic", tm.getTopic().getName());
            m.put("subject", tm.getTopic().getSubject().getName());
            m.put("mastery", Math.round(tm.getPKnown() * 100));
            m.put("accuracy", tm.getAccuracy());
            m.put("attempts", tm.getAttemptsCount());
            topicScores.add(m);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("topicMastery", topicScores);
        result.put("weakTopicsCount", topicMasteryService.getWeakTopics(studentId).size());
        result.put("strongTopicsCount", topicMasteryService.getStrongTopics(studentId).size());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // === AI STUDY ASSISTANT CHAT APIS ===

    @GetMapping("/chat/sessions")
    @Operation(summary = "Get student's saved AI study chat sessions")
    public ResponseEntity<ApiResponse<List<ChatSession>>> getChatSessions(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ChatSession> sessions = chatService.getStudentSessions(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @PostMapping("/chat/sessions")
    @Operation(summary = "Create a new AI study chat session")
    public ResponseEntity<ApiResponse<ChatSession>> createChatSession(
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User student = getStudentUser(userPrincipal);
        String title = payload != null ? payload.get("title") : "New Study Chat";
        ChatSession session = chatService.createSession(student, title);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Session created", session));
    }

    @GetMapping("/chat/sessions/{sessionId}/messages")
    @Operation(summary = "Get message history for an authorized chat session")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getChatMessages(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ChatMessage> messages = chatService.getSessionMessages(sessionId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PostMapping("/chat/sessions/{sessionId}/messages")
    @Operation(summary = "Send question to AI study assistant with personalized learning context")
    public ResponseEntity<ApiResponse<ChatMessage>> sendChatMessage(
            @PathVariable Long sessionId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User student = getStudentUser(userPrincipal);
        String message = payload.get("message");
        ChatMessage reply = chatService.sendMessage(sessionId, student, message);
        return ResponseEntity.ok(ApiResponse.success("Assistant reply received", reply));
    }

    @DeleteMapping("/chat/sessions/{sessionId}")
    @Operation(summary = "Delete chat session and associated messages")
    public ResponseEntity<ApiResponse<String>> deleteChatSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        chatService.deleteSession(sessionId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Chat session deleted", "Session removed"));
    }

    // === PHASE 6: ACADEMIC & ATTENDANCE RECORDS ===

    @GetMapping("/academic-records")
    @Operation(summary = "Get student marks and attendance records")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAcademicOverview(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Map<String, Object> overview = academicImportService.getStudentAcademicOverview(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(overview));
    }

    // === PHASE 7: WEEKLY SUMMARIES ===

    @GetMapping("/weekly-summaries")
    @Operation(summary = "Get historical weekly learning summaries")
    public ResponseEntity<ApiResponse<List<WeeklySummary>>> getWeeklySummaries(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<WeeklySummary> summaries = weeklySummaryService.getStudentSummaries(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(summaries));
    }

    // === PHASE 8: EXTERNAL PROFILES ===

    @GetMapping("/external-profiles")
    @Operation(summary = "Get student's connected external coding profiles")
    public ResponseEntity<ApiResponse<List<ExternalProfile>>> getExternalProfiles(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ExternalProfile> profiles = externalProfileService.getStudentProfiles(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(profiles));
    }

    @PostMapping("/external-profiles/link")
    @Operation(summary = "Link or update external profile handle")
    public ResponseEntity<ApiResponse<ExternalProfile>> linkExternalProfile(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User student = getStudentUser(userPrincipal);
        String platformStr = payload.get("platform");
        String username = payload.get("username");
        ExternalProfile.Platform platform = ExternalProfile.Platform.valueOf(platformStr.toUpperCase());
        ExternalProfile profile = externalProfileService.linkProfile(student, platform, username);
        return ResponseEntity.ok(ApiResponse.success("External profile linked and synced", profile));
    }

    @PostMapping("/external-profiles/sync/{platform}")
    @Operation(summary = "Sync external profile stats (forces live refresh)")
    public ResponseEntity<ApiResponse<ExternalProfile>> syncExternalProfile(
            @PathVariable String platform,
            @RequestParam(defaultValue = "true") boolean force,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User student = getStudentUser(userPrincipal);
        ExternalProfile.Platform p = ExternalProfile.Platform.valueOf(platform.toUpperCase());
        ExternalProfile profile = externalProfileService.getStudentProfiles(userPrincipal.getId()).stream()
                .filter(prof -> prof.getPlatform() == p)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Profile not linked for platform: " + platform));

        ExternalProfile synced = externalProfileService.syncProfile(profile, force);
        return ResponseEntity.ok(ApiResponse.success("Profile refreshed", synced));
    }

    @PostMapping("/external-profiles/manual")
    @Operation(summary = "Save manual statistics when public API is unavailable")
    public ResponseEntity<ApiResponse<ExternalProfile>> saveManualExternalProfile(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User student = getStudentUser(userPrincipal);
        String platformStr = (String) payload.get("platform");
        String username = (String) payload.getOrDefault("username", student.getName());
        ExternalProfile.Platform platform = ExternalProfile.Platform.valueOf(platformStr.toUpperCase());
        
        Map<String, Object> manualStats = new HashMap<>(payload);
        manualStats.remove("platform");

        ExternalProfile saved = externalProfileService.saveManualProfile(student, platform, username, manualStats);
        return ResponseEntity.ok(ApiResponse.success("Manual profile metrics saved", saved));
    }

    @DeleteMapping("/external-profiles/{platform}")
    @Operation(summary = "Unlink external coding profile")
    public ResponseEntity<ApiResponse<String>> unlinkProfile(
            @PathVariable String platform,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ExternalProfile.Platform p = ExternalProfile.Platform.valueOf(platform.toUpperCase());
        externalProfileService.deleteProfile(userPrincipal.getId(), p);
        return ResponseEntity.ok(ApiResponse.success("Profile unlinked", platform));
    }

    // === PHASE 9: RISK PREDICTION ===

    @GetMapping("/my-risk-status")
    @Operation(summary = "Student self-monitoring risk prediction and academic health check")
    public ResponseEntity<ApiResponse<RiskPrediction>> getMyRiskStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        RiskPrediction prediction = riskPredictionService.getLatestPrediction(userPrincipal.getId())
                .orElseGet(() -> riskPredictionService.evaluateStudentRisk(userPrincipal.getId()));
        return ResponseEntity.ok(ApiResponse.success(prediction));
    }

    // === PHASE 10: PRIVACY, CONSENT & RESEARCH SURVEY ===

    @GetMapping("/consent")
    @Operation(summary = "Get student privacy and research consent status")
    public ResponseEntity<ApiResponse<UserConsent>> getConsent(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserConsent consent = privacyConsentService.getConsent(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(consent));
    }

    @PostMapping("/consent")
    @Operation(summary = "Update student privacy and research consent status")
    public ResponseEntity<ApiResponse<UserConsent>> updateConsent(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String statusStr = payload.getOrDefault("status", "GRANTED");
        UserConsent.ConsentStatus status = UserConsent.ConsentStatus.valueOf(statusStr.toUpperCase());
        UserConsent consent = privacyConsentService.updateConsent(userPrincipal.getId(), status);
        return ResponseEntity.ok(ApiResponse.success("Consent preferences updated", consent));
    }

    @PostMapping("/delete-my-data")
    @Operation(summary = "Execute GDPR/FERPA Right to be Forgotten (Account Anonymization)")
    public ResponseEntity<ApiResponse<String>> deleteMyData(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        privacyConsentService.deleteMyData(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Your personal data and chat sessions have been permanently purged and anonymized."));
    }

    @GetMapping("/survey")
    @Operation(summary = "Check if student has submitted research feedback survey")
    public ResponseEntity<ApiResponse<FeedbackSurvey>> getMySurvey(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Optional<FeedbackSurvey> survey = feedbackSurveyService.getStudentSurvey(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(survey.orElse(null)));
    }

    @PostMapping("/survey")
    @Operation(summary = "Submit 5-point Likert scale research evaluation feedback survey")
    public ResponseEntity<ApiResponse<FeedbackSurvey>> submitSurvey(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        int q1 = ((Number) payload.getOrDefault("q1Usefulness", 5)).intValue();
        int q2 = ((Number) payload.getOrDefault("q2EaseOfUse", 5)).intValue();
        int q3 = ((Number) payload.getOrDefault("q3ExplanationClarity", 5)).intValue();
        int q4 = ((Number) payload.getOrDefault("q4Trust", 5)).intValue();
        int q5 = ((Number) payload.getOrDefault("q5AiUsefulness", 5)).intValue();
        String comments = (String) payload.get("comments");

        FeedbackSurvey survey = feedbackSurveyService.submitSurvey(userPrincipal.getId(), q1, q2, q3, q4, q5, comments);
        return ResponseEntity.ok(ApiResponse.success("Thank you! Your survey feedback has been recorded for research evaluation.", survey));
    }
}
