package com.edupulse.controller;

import com.edupulse.dto.ApiResponse;
import com.edupulse.dto.TeacherDashboardDto;
import com.edupulse.dto.UserDto;
import com.edupulse.entity.*;
import com.edupulse.exception.BadRequestException;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.repository.*;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
@PreAuthorize("hasRole('TEACHER')")
@Tag(name = "Teacher", description = "Teacher APIs: Question Bank, Quizzes, AI Quiz Generator, Class Analytics")
public class TeacherController {

    private final DashboardService dashboardService;
    private final UserService userService;
    private final QuestionService questionService;
    private final QuizService quizService;
    private final AiQuizGeneratorService aiQuizGeneratorService;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final QuestionRepository questionRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final AttemptRepository attemptRepository;
    private final QuizRepository quizRepository;
    private final RiskPredictionService riskPredictionService;
    private final AktService aktService;
    private final EmailService emailService;
    private final WeeklySummaryService weeklySummaryService;
    private final ExamPaperAnalysisService examPaperAnalysisService;

    public TeacherController(DashboardService dashboardService,
                             UserService userService,
                             QuestionService questionService,
                             QuizService quizService,
                             AiQuizGeneratorService aiQuizGeneratorService,
                             SubjectRepository subjectRepository,
                             TopicRepository topicRepository,
                             QuestionRepository questionRepository,
                             ClassRepository classRepository,
                             UserRepository userRepository,
                             AttemptRepository attemptRepository,
                             QuizRepository quizRepository,
                             RiskPredictionService riskPredictionService,
                             AktService aktService,
                             EmailService emailService,
                             WeeklySummaryService weeklySummaryService,
                             ExamPaperAnalysisService examPaperAnalysisService) {
        this.dashboardService = dashboardService;
        this.userService = userService;
        this.questionService = questionService;
        this.quizService = quizService;
        this.aiQuizGeneratorService = aiQuizGeneratorService;
        this.subjectRepository = subjectRepository;
        this.topicRepository = topicRepository;
        this.questionRepository = questionRepository;
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.attemptRepository = attemptRepository;
        this.quizRepository = quizRepository;
        this.riskPredictionService = riskPredictionService;
        this.aktService = aktService;
        this.emailService = emailService;
        this.weeklySummaryService = weeklySummaryService;
        this.examPaperAnalysisService = examPaperAnalysisService;
    }

    private User getTeacherUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher record not found"));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get teacher dashboard metrics")
    public ResponseEntity<ApiResponse<TeacherDashboardDto>> getDashboard(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        TeacherDashboardDto dashboard = dashboardService.getTeacherDashboard(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get teacher profile")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto profile = userService.getUserById(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    // === SUBJECTS & TOPICS ===

    @GetMapping("/subjects")
    @Operation(summary = "Get all teaching subjects")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjects() {
        return ResponseEntity.ok(ApiResponse.success(subjectRepository.findAll()));
    }

    @PostMapping("/subjects")
    @Operation(summary = "Create a new curriculum subject")
    public ResponseEntity<ApiResponse<Subject>> createSubject(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User teacher = getTeacherUser(userPrincipal);
        String name = payload.get("name");
        String desc = payload.get("description");
        if (name == null || name.trim().isEmpty()) {
            throw new BadRequestException("Subject name is required.");
        }
        Subject s = subjectRepository.save(new Subject(name.trim(), desc, teacher));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Subject created", s));
    }

    @GetMapping("/topics")
    @Operation(summary = "Get all topics, with optional subject filter")
    public ResponseEntity<ApiResponse<List<Topic>>> getTopics(@RequestParam(required = false) Long subjectId) {
        List<Topic> topics = subjectId != null
                ? topicRepository.findBySubjectId(subjectId)
                : topicRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(topics));
    }

    @PostMapping("/topics")
    @Operation(summary = "Create topic with prerequisite dependency")
    public ResponseEntity<ApiResponse<Topic>> createTopic(
            @RequestBody Map<String, Object> payload) {
        Long subjectId = ((Number) payload.get("subjectId")).longValue();
        String name = (String) payload.get("name");
        Long prereqId = payload.get("prerequisiteTopicId") != null ? ((Number) payload.get("prerequisiteTopicId")).longValue() : null;

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + subjectId));

        Topic prereq = prereqId != null ? topicRepository.findById(prereqId).orElse(null) : null;
        Topic topic = topicRepository.save(new Topic(subject, name.trim(), prereq));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Topic created", topic));
    }

    // === QUESTION BANK ===

    @GetMapping("/questions")
    @Operation(summary = "Get question bank items, with optional topic filter")
    public ResponseEntity<ApiResponse<List<Question>>> getQuestions(@RequestParam(required = false) Long topicId) {
        List<Question> questions = topicId != null
                ? questionService.getQuestionsByTopic(topicId)
                : questionService.getAllQuestions();
        return ResponseEntity.ok(ApiResponse.success(questions));
    }

    @PostMapping("/questions")
    @Operation(summary = "Add a question manually to the bank")
    public ResponseEntity<ApiResponse<Question>> createQuestion(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User teacher = getTeacherUser(userPrincipal);
        Long topicId = ((Number) payload.get("topicId")).longValue();
        String text = (String) payload.get("text");
        @SuppressWarnings("unchecked")
        List<String> options = (List<String>) payload.get("options");
        int correctIndex = ((Number) payload.get("correctIndex")).intValue();
        String diffStr = (String) payload.getOrDefault("difficulty", "MEDIUM");
        Question.Difficulty difficulty = Question.Difficulty.valueOf(diffStr.toUpperCase());
        String explanation = (String) payload.get("explanation");

        Question q = questionService.createQuestion(topicId, text, options, correctIndex, difficulty,
                explanation, Question.Source.MANUAL, teacher);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Question created", q));
    }

    // === QUIZZES & AI GENERATOR ===

    @GetMapping("/quizzes")
    @Operation(summary = "Get all quizzes created by teacher")
    public ResponseEntity<ApiResponse<List<Quiz>>> getQuizzes(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Quiz> quizzes = quizService.getQuizzesByTeacher(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    @PostMapping("/quizzes")
    @Operation(summary = "Create quiz from question bank")
    public ResponseEntity<ApiResponse<Quiz>> createQuiz(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User teacher = getTeacherUser(userPrincipal);
        String title = (String) payload.get("title");
        Long subjectId = ((Number) payload.get("subjectId")).longValue();
        Integer timeLimit = payload.get("timeLimitMinutes") != null ? ((Number) payload.get("timeLimitMinutes")).intValue() : 20;

        @SuppressWarnings("unchecked")
        List<Number> qIdsRaw = (List<Number>) payload.get("questionIds");
        List<Long> questionIds = new ArrayList<>();
        if (qIdsRaw != null) {
            for (Number n : qIdsRaw) questionIds.add(n.longValue());
        }

        Quiz quiz = quizService.createQuiz(title, subjectId, teacher, timeLimit, null, questionIds);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Quiz created as draft", quiz));
    }

    @PostMapping("/quizzes/{quizId}/publish")
    @Operation(summary = "Publish quiz draft so students can attempt it")
    public ResponseEntity<ApiResponse<Quiz>> publishQuiz(@PathVariable Long quizId) {
        Quiz quiz = quizService.publishQuiz(quizId);
        return ResponseEntity.ok(ApiResponse.success("Quiz published successfully", quiz));
    }

    @PostMapping("/quizzes/{quizId}/assign")
    @Operation(summary = "Assign published quiz to a class")
    public ResponseEntity<ApiResponse<QuizAssignment>> assignQuiz(
            @PathVariable Long quizId,
            @RequestBody Map<String, Object> payload) {
        Long classId = ((Number) payload.get("classId")).longValue();
        QuizAssignment assignment = quizService.assignQuizToClass(quizId, classId);
        return ResponseEntity.ok(ApiResponse.success("Quiz assigned to class", assignment));
    }

    @PostMapping("/quizzes/ai-generate")
    @Operation(summary = "AI Quiz Generator: Generates questions using configured AI provider (Gemini -> Groq -> Ollama)")
    public ResponseEntity<ApiResponse<Quiz>> generateAiQuiz(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User teacher = getTeacherUser(userPrincipal);
        Long subjectId = ((Number) payload.get("subjectId")).longValue();
        Long topicId = ((Number) payload.get("topicId")).longValue();
        int count = payload.get("questionCount") != null ? ((Number) payload.get("questionCount")).intValue() : 5;
        String diffStr = (String) payload.getOrDefault("difficulty", "MEDIUM");
        Question.Difficulty difficulty = Question.Difficulty.valueOf(diffStr.toUpperCase());

        Quiz quizDraft = aiQuizGeneratorService.generateQuizDraft(subjectId, topicId, count, difficulty, teacher);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("AI draft questions generated. Ready for teacher review and approval.", quizDraft));
    }

    @GetMapping("/classes")
    @Operation(summary = "Get classes managed by teacher")
    public ResponseEntity<ApiResponse<List<ClassEntity>>> getClasses(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ClassEntity> classes = classRepository.findByTeacherId(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(classes));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get aggregate class analytics & score distribution")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getClassAnalytics() {
        List<Attempt> attempts = attemptRepository.findAll();
        double avgScore = attempts.stream()
                .filter(a -> a.getStatus() == Attempt.Status.SUBMITTED)
                .mapToDouble(Attempt::getScore)
                .average()
                .orElse(72.5);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalAttemptsRecorded", attempts.size());
        analytics.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
        analytics.put("totalQuestionsInBank", questionRepository.count());
        analytics.put("totalQuizzesCreated", quizRepository.count());
        analytics.put("knowledgeTracingModel", aktService.getModelStatus());

        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/at-risk-students")
    @Operation(summary = "Get ML predicted at-risk students with risk factor breakdowns and pedagogical interventions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAtRiskStudents(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Map<String, Object>> list = riskPredictionService.getAtRiskStudentsForTeacher(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("At-risk predictions retrieved successfully", list));
    }

    @PostMapping("/at-risk-students/{studentId}/recalculate")
    @Operation(summary = "Trigger on-demand risk re-prediction for a specific student")
    public ResponseEntity<ApiResponse<RiskPrediction>> recalculateStudentRisk(
            @PathVariable Long studentId) {
        RiskPrediction prediction = riskPredictionService.evaluateStudentRisk(studentId);
        return ResponseEntity.ok(ApiResponse.success("Risk recalculated successfully", prediction));
    }

    // === EMAIL NOTIFICATIONS: QUIZ REMINDERS & RISK ALERTS ===

    @PostMapping("/notifications/send-quiz-reminder")
    @Operation(summary = "Send an email reminder to a student to complete pending practice quizzes")
    public ResponseEntity<ApiResponse<String>> sendQuizReminder(
            @RequestBody Map<String, Object> payload) {
        Long studentId = payload.get("studentId") != null ? Long.valueOf(payload.get("studentId").toString()) : null;
        if (studentId == null) {
            throw new BadRequestException("studentId is required");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        String customMsg = (String) payload.getOrDefault("message", "Your instructor recommends completing an adaptive practice quiz on EduPulse to consolidate your course topics.");
        String htmlBody = "<html><body style='font-family: sans-serif; color: #1e293b;'>" +
                "<div style='max-width: 560px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;'>" +
                "<h2 style='color: #4f46e5; margin-top: 0;'>EduPulse Practice Quiz Reminder</h2>" +
                "<p>Hello <strong>" + student.getName() + "</strong>,</p>" +
                "<p>" + customMsg + "</p>" +
                "<p>Taking 5-10 minutes for targeted practice directly updates your Attentive Knowledge Tracing (AKT) mastery score and prepares you for upcoming assessments.</p>" +
                "<div style='margin-top: 24px;'><a href='http://localhost:5173/student/quizzes' style='background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;'>Start Practice Quiz</a></div>" +
                "<p style='color: #64748b; font-size: 12px; margin-top: 24px;'>EduPulse Multi-Modal Adaptive Learning Platform</p>" +
                "</div></body></html>";

        String recipientEmail = payload.get("overrideEmail") != null ? payload.get("overrideEmail").toString().trim() : student.getEmail();
        emailService.sendDirectEmail(recipientEmail, student.getName(), "QUIZ_REMINDER", "Upcoming Practice Quiz Reminder - EduPulse", htmlBody);
        return ResponseEntity.ok(ApiResponse.success("Quiz reminder email sent to " + recipientEmail));
    }

    @PostMapping("/notifications/send-risk-alert")
    @Operation(summary = "Send an academic support alert email to an at-risk student")
    public ResponseEntity<ApiResponse<String>> sendRiskAlert(
            @RequestBody Map<String, Object> payload) {
        Long studentId = payload.get("studentId") != null ? Long.valueOf(payload.get("studentId").toString()) : null;
        if (studentId == null) {
            throw new BadRequestException("studentId is required");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        String reason = (String) payload.getOrDefault("reason", "Low engagement or recent prerequisite topic gaps");
        String htmlBody = "<html><body style='font-family: sans-serif; color: #1e293b;'>" +
                "<div style='max-width: 560px; margin: auto; padding: 24px; border: 1px solid #fed7aa; border-radius: 16px; background-color: #fffaf5;'>" +
                "<h2 style='color: #ea580c; margin-top: 0;'>Academic Support &amp; Learning Notice</h2>" +
                "<p>Dear <strong>" + student.getName() + "</strong>,</p>" +
                "<p>Your course faculty noticed that you may benefit from dedicated attention in foundational concepts (Flag: <em>" + reason + "</em>).</p>" +
                "<p>To stay on track for your examinations:</p>" +
                "<ul>" +
                "<li>Review teacher lecture notes in <strong>Course Materials</strong></li>" +
                "<li>Attempt the prerequisite quizzes recommended on your student dashboard</li>" +
                "<li>Consult with your instructor during scheduled office hours</li>" +
                "</ul>" +
                "<div style='margin-top: 24px;'><a href='http://localhost:5173/student/recommendations' style='background-color: #ea580c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;'>View Recommended Learning Path</a></div>" +
                "<p style='color: #64748b; font-size: 12px; margin-top: 24px;'>EduPulse Faculty Intervention Service</p>" +
                "</div></body></html>";

        String recipientEmail = payload.get("overrideEmail") != null ? payload.get("overrideEmail").toString().trim() : student.getEmail();
        emailService.sendDirectEmail(recipientEmail, student.getName(), "RISK_ALERT", "Important: Academic Support & Learning Notice - EduPulse", htmlBody);
        return ResponseEntity.ok(ApiResponse.success("Risk alert email successfully sent to " + recipientEmail));
    }

    @PostMapping("/notifications/send-test-email")
    @Operation(summary = "Send a test email to verify Gmail SMTP delivery")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendTestEmail(
            @RequestBody Map<String, Object> payload) {
        String recipient = payload.get("recipientEmail") != null ? payload.get("recipientEmail").toString().trim() : "";
        if (recipient.isBlank()) {
            throw new BadRequestException("recipientEmail is required (e.g. your Gmail address)");
        }

        boolean hasSender = emailService.isMailSenderConfigured();
        String htmlBody = "<html><body style='font-family: sans-serif; color: #1e293b; padding: 20px;'>" +
                "<div style='max-width: 500px; margin: auto; border: 1px solid #c7d2fe; border-radius: 12px; padding: 24px; background: #f8faff;'>" +
                "<h2 style='color: #4f46e5; margin-top: 0;'>EduPulse Live SMTP Test</h2>" +
                "<p>Success! Your EduPulse application is successfully connected to Gmail SMTP and can send live emails.</p>" +
                "<p><strong>Dispatched to:</strong> " + recipient + "</p>" +
                "<p style='color: #64748b; font-size: 12px; margin-top: 20px;'>EduPulse Adaptive Learning Platform</p>" +
                "</div></body></html>";

        EmailLog log = emailService.sendDirectEmail(recipient, "EduPulse User", "LIVE_TEST", "EduPulse Live Email Test - Connection Verified", htmlBody);

        Map<String, Object> resp = new HashMap<>();
        resp.put("recipient", recipient);
        resp.put("status", log.getStatus().name());
        resp.put("smtpConfigured", hasSender);
        if (!hasSender) {
            resp.put("hint", "Live delivery simulated in DRY_RUN mode because SPRING_MAIL_USERNAME and SPRING_MAIL_PASSWORD are not yet configured.");
        } else if (log.getStatus() == EmailLog.Status.SENT) {
            resp.put("message", "Live email successfully sent to " + recipient + "! Check your Gmail inbox or spam folder.");
        } else {
            resp.put("message", "SMTP connection attempted but delivery failed. Please verify your Gmail address and 16-character App Password.");
        }
        return ResponseEntity.ok(ApiResponse.success(resp));
    }

    @PostMapping("/notifications/send-weekly-summary")
    @Operation(summary = "Trigger a weekly learning summary email for a specific student")
    public ResponseEntity<ApiResponse<String>> sendWeeklySummaryForStudent(
            @RequestBody Map<String, Object> payload) {
        Long studentId = payload.get("studentId") != null ? Long.valueOf(payload.get("studentId").toString()) : null;
        if (studentId == null) {
            throw new BadRequestException("studentId is required");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        java.time.LocalDate weekStart = java.time.LocalDate.now().with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        weeklySummaryService.generateSummaryForStudent(student, weekStart);

        return ResponseEntity.ok(ApiResponse.success("Weekly summary email dispatched to " + student.getName()));
    }

    // === EVALUATED EXAM PAPERS & AI GRADER ===

    @GetMapping("/students")
    @Operation(summary = "Get list of all students for exam assignment and grading")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStudents() {
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.STUDENT && u.isActive())
                .sorted(Comparator.comparing(User::getName))
                .collect(Collectors.toList());

        List<Map<String, Object>> result = students.stream().map(s -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", s.getId());
            map.put("name", s.getName());
            map.put("email", s.getEmail());
            map.put("department", s.getDepartment());
            map.put("academicInfo", s.getAcademicInfo());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping(value = "/exam-papers/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and evaluate student exam paper with AI question diagnosis")
    public ResponseEntity<ApiResponse<ExamPaperAnalysis>> uploadStudentExamPaper(
            @RequestParam("studentId") Long studentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "examTitle", required = false) String examTitle,
            @RequestParam(value = "subjectName", required = false) String subjectName,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User teacher = getTeacherUser(userPrincipal);
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        ExamPaperAnalysis analysis = examPaperAnalysisService.uploadAndAnalyzeForStudent(student, teacher, file, examTitle, subjectName);
        return ResponseEntity.ok(ApiResponse.success("Exam paper uploaded and evaluated successfully with AI diagnosis", analysis));
    }

    @GetMapping("/exam-papers")
    @Operation(summary = "Get all exam papers uploaded and evaluated by the current teacher")
    public ResponseEntity<ApiResponse<List<ExamPaperAnalysis>>> getTeacherExamPapers(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ExamPaperAnalysis> papers = examPaperAnalysisService.getTeacherAnalyses(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(papers));
    }

    @GetMapping("/exam-papers/{id}/download")
    @Operation(summary = "Download original exam paper file")
    public ResponseEntity<byte[]> downloadExamPaperFile(@PathVariable Long id) {
        ExamPaperAnalysis paper = examPaperAnalysisService.getAnalysisById(id);
        byte[] data = paper.getFileData();
        if (data == null || data.length == 0) {
            throw new BadRequestException("Binary file data not available for this exam paper.");
        }

        String fileName = paper.getFileName() != null ? paper.getFileName() : "exam_paper.pdf";
        MediaType mediaType = MediaType.APPLICATION_PDF;
        if (fileName.toLowerCase().endsWith(".docx")) mediaType = MediaType.APPLICATION_OCTET_STREAM;
        else if (fileName.toLowerCase().endsWith(".png")) mediaType = MediaType.IMAGE_PNG;
        else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) mediaType = MediaType.IMAGE_JPEG;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(mediaType)
                .body(data);
    }

    @DeleteMapping("/exam-papers/{id}")
    @Operation(summary = "Delete an uploaded student exam paper")
    public ResponseEntity<ApiResponse<Void>> deleteExamPaper(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        examPaperAnalysisService.deleteAnalysis(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Exam paper deleted successfully", null));
    }
}
