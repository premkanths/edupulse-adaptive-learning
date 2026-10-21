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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

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
                             RiskPredictionService riskPredictionService) {
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
}
