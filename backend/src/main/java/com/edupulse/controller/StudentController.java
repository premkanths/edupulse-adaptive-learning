package com.edupulse.controller;

import com.edupulse.dto.ApiResponse;
import com.edupulse.dto.AktPredictionDto;
import com.edupulse.dto.StudentDashboardDto;
import com.edupulse.dto.UserDto;
import com.edupulse.entity.*;
import com.edupulse.exception.BadRequestException;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.repository.SubjectRepository;
import com.edupulse.repository.TopicMasteryRepository;
import com.edupulse.repository.TopicRepository;
import com.edupulse.repository.UserRepository;
import com.edupulse.security.UserPrincipal;
import com.edupulse.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Student", description = "Student APIs: Quizzes, Attentive Knowledge Tracing (AKT), Recommendations, AI Assistant")
public class StudentController {

    private final DashboardService dashboardService;
    private final UserService userService;
    private final QuizService quizService;
    private final AttemptService attemptService;
    private final TopicMasteryService topicMasteryService;
    private final AktService aktService;
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
    private final ExamPaperAnalysisService examPaperAnalysisService;

    public StudentController(DashboardService dashboardService,
                             UserService userService,
                             QuizService quizService,
                             AttemptService attemptService,
                             TopicMasteryService topicMasteryService,
                             AktService aktService,
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
                             FeedbackSurveyService feedbackSurveyService,
                             ExamPaperAnalysisService examPaperAnalysisService) {
        this.dashboardService = dashboardService;
        this.userService = userService;
        this.quizService = quizService;
        this.attemptService = attemptService;
        this.topicMasteryService = topicMasteryService;
        this.aktService = aktService;
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
        this.examPaperAnalysisService = examPaperAnalysisService;
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
    @Operation(summary = "Get enrolled subjects and topics with AKT mastery estimates")
    @Transactional(readOnly = true)
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

    @PostMapping("/recommendations/refresh")
    @Operation(summary = "Generate fresh recommendations using latest Attentive Knowledge Tracing (AKT) mastery")
    public ResponseEntity<ApiResponse<List<RecommendationRecord>>> refreshRecommendations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<RecommendationRecord> recs = recommendationService.generateRecommendationsForStudent(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Recommendations refreshed using AKT", recs));
    }

    @GetMapping("/performance")
    @Operation(summary = "Get learning performance history and AKT topic mastery analytics")
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

    @GetMapping("/akt-insights")
    @Operation(summary = "Get deep Attentive Knowledge Tracing (AKT) mastery and attention weights")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAktInsights(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long studentId = userPrincipal.getId();
        List<TopicMastery> masteries = topicMasteryService.getStudentMastery(studentId);
        List<Map<String, Object>> insights = new ArrayList<>();

        for (TopicMastery tm : masteries) {
            AktPredictionDto pred = aktService.predictMastery(studentId, tm.getTopic().getId(), null);
            Map<String, Object> map = new HashMap<>();
            map.put("topicId", tm.getTopic().getId());
            map.put("topicName", tm.getTopic().getName());
            map.put("subjectName", tm.getTopic().getSubject() != null ? tm.getTopic().getSubject().getName() : "");
            map.put("masteryProbability", pred.getMasteryProbability());
            map.put("confidence", pred.getConfidence());
            map.put("masteryLevel", pred.getMasteryLevel());
            map.put("attendedHistory", pred.getAttendedHistory());
            map.put("historyLength", pred.getHistoryLength());
            map.put("model", pred.getModel());
            insights.add(map);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("insights", insights);
        result.put("modelArchitecture", "Attentive Knowledge Tracing (AKT)");
        result.put("reference", "Ghosh et al., KDD 2020");
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
    @Operation(summary = "Send question to AI study assistant with personalized learning context, RAG grounding, and Socratic mode")
    public ResponseEntity<ApiResponse<ChatMessage>> sendChatMessage(
            @PathVariable Long sessionId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User student = getStudentUser(userPrincipal);
        String message = payload.get("message");
        String tutoringMode = payload.getOrDefault("tutoringMode", "EXPLANATORY");
        Long subjectId = null;
        if (payload.containsKey("subjectId") && payload.get("subjectId") != null && !payload.get("subjectId").trim().isEmpty()) {
            try {
                subjectId = Long.parseLong(payload.get("subjectId").trim());
            } catch (NumberFormatException ignored) {}
        }

        ChatMessage reply = chatService.sendMessage(sessionId, student, message, tutoringMode, subjectId);
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

    // === ACADEMIC & ATTENDANCE RECORDS ===

    @GetMapping("/academic-records")
    @Operation(summary = "Get student marks and attendance records")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAcademicOverview(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Map<String, Object> overview = academicImportService.getStudentAcademicOverview(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(overview));
    }

    @PostMapping(value = "/exam-papers/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Notice: Exam papers are officially evaluated and uploaded by course teachers")
    public ResponseEntity<ApiResponse<Void>> analyzeExamPaper() {
        throw new BadRequestException("Students cannot upload exam papers directly. Official evaluated answer sheets are uploaded by your course faculty and analyzed with EduPulse AI.");
    }

    @GetMapping("/exam-papers")
    @Operation(summary = "Get all evaluated exam papers uploaded by faculty for current student")
    public ResponseEntity<ApiResponse<List<ExamPaperAnalysis>>> getExamPapers(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ExamPaperAnalysis> list = examPaperAnalysisService.getStudentAnalyses(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/exam-papers/{id}/download")
    @Operation(summary = "Download evaluated exam paper PDF/document uploaded by faculty")
    public ResponseEntity<byte[]> downloadExamPaper(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ExamPaperAnalysis paper = examPaperAnalysisService.getAnalysisById(id);
        if (!paper.getStudent().getId().equals(userPrincipal.getId())) {
            throw new BadRequestException("You do not have permission to access another student's exam paper.");
        }

        byte[] data = paper.getFileData();
        if (data == null || data.length == 0) {
            throw new BadRequestException("Binary file content not available for this exam paper.");
        }

        String fileName = paper.getFileName() != null ? paper.getFileName() : "evaluated_exam_paper.pdf";
        MediaType mediaType = MediaType.APPLICATION_PDF;
        if (fileName.toLowerCase().endsWith(".docx")) mediaType = MediaType.APPLICATION_OCTET_STREAM;
        else if (fileName.toLowerCase().endsWith(".png")) mediaType = MediaType.IMAGE_PNG;
        else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) mediaType = MediaType.IMAGE_JPEG;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(mediaType)
                .body(data);
    }

    @GetMapping("/exam-papers/{id}/practice-mcqs")
    @Operation(summary = "Get tailored MCQ practice questions targeting weak topics diagnosed in this exam paper")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPracticeQuestions(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ExamPaperAnalysis paper = examPaperAnalysisService.getAnalysisById(id);
        if (!paper.getStudent().getId().equals(userPrincipal.getId())) {
            throw new BadRequestException("Access denied to this student record.");
        }

        List<Map<String, Object>> questions = examPaperAnalysisService.getPracticeQuestionsForPaper(id);
        return ResponseEntity.ok(ApiResponse.success("Practice questions retrieved", questions));
    }

    // === WEEKLY SUMMARIES ===

    @GetMapping("/weekly-summaries")
    @Operation(summary = "Get historical weekly learning summaries")
    public ResponseEntity<ApiResponse<List<WeeklySummary>>> getWeeklySummaries(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<WeeklySummary> summaries = weeklySummaryService.getStudentSummaries(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(summaries));
    }

    // === EXTERNAL PROFILES ===

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

    // === RISK PREDICTION ===

    @GetMapping("/my-risk-status")
    @Operation(summary = "Student self-monitoring risk prediction and academic health check")
    public ResponseEntity<ApiResponse<RiskPrediction>> getMyRiskStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        RiskPrediction prediction = riskPredictionService.getLatestPrediction(userPrincipal.getId())
                .orElseGet(() -> riskPredictionService.evaluateStudentRisk(userPrincipal.getId()));
        return ResponseEntity.ok(ApiResponse.success(prediction));
    }

    // === PRIVACY & CONSENT ===

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

    @GetMapping("/export-my-data")
    @Operation(summary = "Export complete student academic, attempt, mastery, and profile data (GDPR/FERPA Data Portability)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> exportMyData(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long studentId = userPrincipal.getId();
        Map<String, Object> exportPackage = new LinkedHashMap<>();
        exportPackage.put("exportedAt", java.time.LocalDateTime.now().toString());
        exportPackage.put("compliance", "GDPR Article 20 / FERPA Data Portability Archive");
        exportPackage.put("profile", userService.getUserById(studentId));
        exportPackage.put("consent", privacyConsentService.getConsent(studentId));
        exportPackage.put("academicOverview", academicImportService.getStudentAcademicOverview(studentId));
        exportPackage.put("topicMasteries", topicMasteryService.getStudentMastery(studentId));
        exportPackage.put("quizAttempts", attemptService.getStudentAttempts(studentId));
        exportPackage.put("externalProfiles", externalProfileService.getStudentProfiles(studentId));
        exportPackage.put("weeklySummaries", weeklySummaryService.getStudentSummaries(studentId));

        return ResponseEntity.ok(ApiResponse.success("Student data export package generated successfully", exportPackage));
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

    // === COMPREHENSIVE STUDENT AI SUMMARY DOSSIER ===

    @GetMapping("/ai-summary")
    @Operation(summary = "Comprehensive AI Student Portfolio and Learning Summary")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAiStudentSummary(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return handleGetAiSummary(userPrincipal);
    }

    @PostMapping("/ai-summary/generate")
    @Operation(summary = "Generate fresh real-time AI summary on demand")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateAiSummary(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return handleGetAiSummary(userPrincipal);
    }

    @Transactional(readOnly = true)
    protected ResponseEntity<ApiResponse<Map<String, Object>>> handleGetAiSummary(UserPrincipal userPrincipal) {
        Long studentId = userPrincipal.getId();
        User student = getStudentUser(userPrincipal);

        // 1. Topic Masteries & AKT Sequence Modeling
        List<TopicMastery> allMasteries = topicMasteryService.getStudentMastery(studentId);
        List<Map<String, Object>> masteredList = new ArrayList<>();
        List<Map<String, Object>> gapList = new ArrayList<>();
        double totalMastery = 0;
        int masteryCount = 0;

        for (TopicMastery tm : allMasteries) {
            Topic topic = tm.getTopic();
            double p = tm.getPKnown() != null ? tm.getPKnown() : 0.30;
            totalMastery += p;
            masteryCount++;

            Map<String, Object> item = new HashMap<>();
            item.put("topicId", topic.getId());
            item.put("topicName", topic.getName());
            item.put("subjectId", topic.getSubject() != null ? topic.getSubject().getId() : null);
            item.put("subjectName", topic.getSubject() != null ? topic.getSubject().getName() : "General");
            item.put("pKnown", Math.round(p * 1000.0) / 1000.0);
            item.put("masteryPercent", Math.round(p * 100.0));
            item.put("accuracy", Math.round((tm.getAccuracy() != null ? tm.getAccuracy() : 0.0) * 10.0) / 10.0);
            item.put("attemptsCount", tm.getAttemptsCount() != null ? tm.getAttemptsCount() : 0);

            if (p >= 0.65) {
                masteredList.add(item);
            } else {
                item.put("hasPrerequisite", topic.getPrerequisiteTopic() != null);
                item.put("prerequisiteName", topic.getPrerequisiteTopic() != null ? topic.getPrerequisiteTopic().getName() : null);
                gapList.add(item);
            }
        }
        double avgMastery = masteryCount > 0 ? (totalMastery / masteryCount) : 0.65;

        // 2. Quiz Attempts Performance
        List<Attempt> attempts = attemptService.getStudentAttempts(studentId);
        int totalQuizzes = 0;
        double sumScore = 0;
        for (Attempt a : attempts) {
            if (a.getStatus() == Attempt.Status.SUBMITTED) {
                totalQuizzes++;
                sumScore += (a.getScore() != null ? a.getScore() : 0);
            }
        }
        double avgQuizScore = totalQuizzes > 0 ? Math.round((sumScore / totalQuizzes) * 10.0) / 10.0 : 75.0;

        // 3. Academic & Attendance
        Map<String, Object> academic = academicImportService.getStudentAcademicOverview(studentId);
        double attendancePct = academic.containsKey("attendancePercentage") ? ((Number) academic.get("attendancePercentage")).doubleValue() : 90.0;
        double marksPct = academic.containsKey("averageMarksPercentage") ? ((Number) academic.get("averageMarksPercentage")).doubleValue() : 80.0;

        // 4. External Profiles
        List<ExternalProfile> profiles = externalProfileService.getStudentProfiles(studentId);
        List<Map<String, Object>> externalProfilesList = new ArrayList<>();
        for (ExternalProfile prof : profiles) {
            Map<String, Object> pMap = new HashMap<>();
            pMap.put("platform", prof.getPlatform().name());
            pMap.put("username", prof.getUsername());
            pMap.put("snapshotJson", prof.getSnapshotJson());
            pMap.put("lastSyncedAt", prof.getLastSyncedAt());
            externalProfilesList.add(pMap);
        }

        // 5. Recommendations
        List<RecommendationRecord> recRecords = recommendationService.generateRecommendationsForStudent(studentId);
        List<Map<String, Object>> recommendationsList = new ArrayList<>();
        for (RecommendationRecord rec : recRecords) {
            Map<String, Object> r = new HashMap<>();
            r.put("id", rec.getId());
            r.put("topicName", rec.getTopic() != null ? rec.getTopic().getName() : "Foundational Topic");
            r.put("type", rec.getRecommendationType().name());
            r.put("evidence", rec.getSupportingEvidence());
            r.put("explanation", rec.getExplanation());
            recommendationsList.add(r);
        }

        // 6. Risk Level
        RiskPrediction risk = riskPredictionService.getLatestPrediction(studentId)
                .orElseGet(() -> riskPredictionService.evaluateStudentRisk(studentId));

        // 7. Assemble Structured Summary
        Map<String, Object> data = new LinkedHashMap<>();

        Map<String, Object> studentInfo = new LinkedHashMap<>();
        studentInfo.put("id", student.getId());
        studentInfo.put("name", student.getName());
        studentInfo.put("email", student.getEmail());
        studentInfo.put("department", student.getDepartment() != null ? student.getDepartment() : "Computer Science & Engineering");
        studentInfo.put("academicInfo", student.getAcademicInfo() != null ? student.getAcademicInfo() : "B.Tech CSE - Final Year");
        studentInfo.put("bio", student.getBio());
        studentInfo.put("githubUrl", student.getGithubUrl());
        studentInfo.put("linkedinUrl", student.getLinkedinUrl());
        studentInfo.put("websiteUrl", student.getWebsiteUrl());
        data.put("studentInfo", studentInfo);

        Map<String, Object> whatHeLearned = new LinkedHashMap<>();
        whatHeLearned.put("masteredTopics", masteredList);
        whatHeLearned.put("masteredCount", masteredList.size());
        whatHeLearned.put("totalQuizzesCompleted", totalQuizzes);
        whatHeLearned.put("averageQuizScore", avgQuizScore);
        whatHeLearned.put("averageMasteryPercent", Math.round(avgMastery * 100));
        whatHeLearned.put("pedagogicalMilestones", List.of(
                "Completed core linear & hierarchical algorithmic structures",
                "Demonstrated consistent problem-solving accuracy on baseline assessments",
                "Active continuous knowledge tracing tracking sequence transitions"
        ));
        data.put("whatHeLearned", whatHeLearned);

        Map<String, Object> whatHeShouldLearn = new LinkedHashMap<>();
        whatHeShouldLearn.put("activeGaps", gapList);
        whatHeShouldLearn.put("gapCount", gapList.size());
        whatHeShouldLearn.put("recommendations", recommendationsList);
        whatHeShouldLearn.put("priorityRemediation", gapList.isEmpty() ? "No critical gaps identified" : gapList.get(0).get("topicName"));
        data.put("whatHeShouldLearn", whatHeShouldLearn);

        Map<String, Object> academicHealth = new LinkedHashMap<>();
        academicHealth.put("attendancePercentage", attendancePct);
        academicHealth.put("averageMarksPercentage", marksPct);
        academicHealth.put("marksRecords", academic.get("marksRecords"));
        academicHealth.put("attendanceRecords", academic.get("attendanceRecords"));
        academicHealth.put("riskLevel", risk != null && risk.getRiskLevel() != null ? risk.getRiskLevel().name() : "LOW");
        academicHealth.put("riskScore", risk != null ? risk.getRiskScore() : 0.15);
        academicHealth.put("riskReasons", risk != null ? risk.getReasons() : "Student maintains regular attendance and stable quiz attempts.");
        data.put("academics", academicHealth);

        Map<String, Object> externalGrowth = new LinkedHashMap<>();
        externalGrowth.put("profiles", externalProfilesList);
        externalGrowth.put("hasGitHub", student.getGithubUrl() != null && !student.getGithubUrl().isBlank());
        externalGrowth.put("hasLinkedIn", student.getLinkedinUrl() != null && !student.getLinkedinUrl().isBlank());
        externalGrowth.put("hasWebsite", student.getWebsiteUrl() != null && !student.getWebsiteUrl().isBlank());
        data.put("external", externalGrowth);

        Map<String, Object> aiSynthesis = new LinkedHashMap<>();
        aiSynthesis.put("headline", "Where You Stand & What to Do Next");
        String topGap = gapList.isEmpty() ? null : (String) gapList.get(0).get("topicName");
        String simpleMessage = String.format(
                "You're doing great in %s with an exam average of %.1f%% and %.1f%% attendance. You currently have %d topic%s that need a quick practice review%s.",
                studentInfo.get("department"),
                marksPct,
                attendancePct,
                gapList.size(),
                gapList.size() == 1 ? "" : "s",
                topGap != null ? " (starting with " + topGap + ")" : ""
        );
        aiSynthesis.put("executiveSummary", simpleMessage);
        aiSynthesis.put("nextAction", topGap != null
                ? "Take a quick 5-question practice quiz on " + topGap + " to turn this gap into a strength."
                : "You're all caught up! Try an advanced quiz or review teacher notes.");
        aiSynthesis.put("readingAdvice", "Check lecture notes in Course Materials to prepare for upcoming classes.");
        aiSynthesis.put("engine", "EduPulse Student Learning Assistant");
        aiSynthesis.put("generatedAt", java.time.LocalDateTime.now().toString());
        data.put("aiSynthesis", aiSynthesis);

        return ResponseEntity.ok(ApiResponse.success("AI Student Summary generated successfully", data));
    }
}
