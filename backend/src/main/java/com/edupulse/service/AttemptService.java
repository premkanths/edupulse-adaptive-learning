package com.edupulse.service;

import com.edupulse.entity.*;
import com.edupulse.exception.BadRequestException;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.exception.UnauthorizedException;
import com.edupulse.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuestionRepository questionRepository;
    private final TopicMasteryService topicMasteryService;
    private final RecommendationService recommendationService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AttemptService(AttemptRepository attemptRepository,
                          AttemptAnswerRepository attemptAnswerRepository,
                          QuizRepository quizRepository,
                          QuizQuestionRepository quizQuestionRepository,
                          QuestionRepository questionRepository,
                          TopicMasteryService topicMasteryService,
                          RecommendationService recommendationService,
                          EmailService emailService) {
        this.attemptRepository = attemptRepository;
        this.attemptAnswerRepository = attemptAnswerRepository;
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.questionRepository = questionRepository;
        this.topicMasteryService = topicMasteryService;
        this.recommendationService = recommendationService;
        this.emailService = emailService;
    }

    @Transactional
    public Attempt startAttempt(Long quizId, User student) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with ID: " + quizId));

        if (quiz.getStatus() != Quiz.Status.PUBLISHED) {
            throw new BadRequestException("This quiz is currently in draft mode and not available for attempts.");
        }

        // Check if an in-progress attempt already exists
        Optional<Attempt> existing = attemptRepository.findFirstByQuizIdAndStudentIdAndStatus(
                quizId, student.getId(), Attempt.Status.IN_PROGRESS);
        if (existing.isPresent()) {
            return existing.get();
        }

        Attempt attempt = new Attempt(quiz, student);
        return attemptRepository.save(attempt);
    }

    @Transactional
    public Map<String, Object> submitAttempt(Long attemptId, User student,
                                             Map<String, Integer> answersMap,
                                             Map<String, Integer> timesMap) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with ID: " + attemptId));

        if (!attempt.getStudent().getId().equals(student.getId())) {
            throw new UnauthorizedException("You are not authorized to submit this attempt.");
        }

        // Prevent duplicate submissions
        if (attempt.getStatus() == Attempt.Status.SUBMITTED) {
            throw new BadRequestException("This attempt has already been submitted and scored.");
        }

        List<QuizQuestion> qqList = quizQuestionRepository.findByQuizIdOrderByDisplayOrderAsc(attempt.getQuiz().getId());
        if (qqList.isEmpty()) {
            throw new BadRequestException("Quiz contains no questions to evaluate.");
        }

        int totalQuestions = qqList.size();
        int correctCount = 0;
        List<Map<String, Object>> evaluatedQuestions = new ArrayList<>();
        Map<String, int[]> topicBreakdown = new HashMap<>(); // topicName -> [correct, total]

        for (QuizQuestion qq : qqList) {
            Question question = qq.getQuestion();
            String qIdStr = String.valueOf(question.getId());

            Integer chosenIndex = answersMap != null ? answersMap.get(qIdStr) : null;
            Integer timeTaken = timesMap != null ? timesMap.getOrDefault(qIdStr, 0) : 0;

            boolean isCorrect = chosenIndex != null && chosenIndex == question.getCorrectIndex();
            if (isCorrect) {
                correctCount++;
            }

            // Save individual answer
            AttemptAnswer answer = new AttemptAnswer(attempt, question, chosenIndex, isCorrect, timeTaken);
            attemptAnswerRepository.save(answer);

            // Update Bayesian Knowledge Tracing topic mastery
            topicMasteryService.processTopicAnswer(student, question.getTopic(), isCorrect);

            // Accumulate topic breakdown
            String topicName = question.getTopic().getName();
            int[] stats = topicBreakdown.computeIfAbsent(topicName, k -> new int[2]);
            stats[1]++; // total
            if (isCorrect) stats[0]++; // correct

            Map<String, Object> qResult = new HashMap<>();
            qResult.put("questionId", question.getId());
            qResult.put("text", question.getText());
            qResult.put("chosenIndex", chosenIndex);
            qResult.put("correctIndex", question.getCorrectIndex());
            qResult.put("isCorrect", isCorrect);
            qResult.put("explanation", question.getExplanation());
            qResult.put("topicName", topicName);
            qResult.put("timeTakenSeconds", timeTaken);
            try {
                qResult.put("options", objectMapper.readValue(question.getOptionsJson(), new TypeReference<List<String>>() {}));
            } catch (Exception ex) {
                qResult.put("options", Collections.emptyList());
            }
            evaluatedQuestions.add(qResult);
        }

        double scorePercentage = Math.round(((double) correctCount / totalQuestions) * 10000.0) / 100.0;
        attempt.setScore(scorePercentage);
        attempt.setStatus(Attempt.Status.SUBMITTED);
        attempt.setSubmittedAt(LocalDateTime.now());
        attemptRepository.save(attempt);

        // Refresh recommendations immediately
        recommendationService.generateRecommendationsForStudent(student.getId());

        // Low-score advisory alert (< 50%)
        if (scorePercentage < 50.0) {
            try {
                String html = "<html><body>" +
                        "<h3>EduPulse Academic Support Advisory</h3>" +
                        "<p>Hello " + student.getName() + ",</p>" +
                        "<p>You completed <strong>" + attempt.getQuiz().getTitle() + "</strong> with a score of <strong>" + scorePercentage + "%</strong>.</p>" +
                        "<p>Don't be discouraged! EduPulse has generated personalized adaptive recommendations and prerequisites to help you strengthen these concepts.</p>" +
                        "<p>Review your tailored study path at <a href=\"http://localhost:5173\">EduPulse</a>.</p>" +
                        "</body></html>";
                emailService.sendEmail(student, "LOW_SCORE_ALERT", "Academic Advisory: Support for " + attempt.getQuiz().getTitle(), html);
            } catch (Exception ex) {
                // Non-blocking
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("attemptId", attempt.getId());
        response.put("quizTitle", attempt.getQuiz().getTitle());
        response.put("score", scorePercentage);
        response.put("correctCount", correctCount);
        response.put("totalQuestions", totalQuestions);
        response.put("submittedAt", attempt.getSubmittedAt());
        response.put("questions", evaluatedQuestions);
        response.put("topicBreakdown", topicBreakdown);

        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAttemptReview(Long attemptId, User user) {
        Attempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with ID: " + attemptId));

        if (!attempt.getStudent().getId().equals(user.getId()) && user.getRole() == Role.STUDENT) {
            throw new UnauthorizedException("You are not authorized to view another student's quiz attempt.");
        }

        List<AttemptAnswer> answers = attemptAnswerRepository.findByAttemptId(attemptId);
        List<Map<String, Object>> answerList = new ArrayList<>();

        for (AttemptAnswer aa : answers) {
            Question q = aa.getQuestion();
            Map<String, Object> m = new HashMap<>();
            m.put("questionId", q.getId());
            m.put("text", q.getText());
            m.put("chosenIndex", aa.getChosenIndex());
            m.put("correctIndex", q.getCorrectIndex());
            m.put("isCorrect", aa.isCorrect());
            m.put("explanation", q.getExplanation());
            m.put("topicName", q.getTopic().getName());
            m.put("timeTakenSeconds", aa.getTimeTakenSeconds());
            try {
                m.put("options", objectMapper.readValue(q.getOptionsJson(), new TypeReference<List<String>>() {}));
            } catch (Exception ex) {
                m.put("options", Collections.emptyList());
            }
            answerList.add(m);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("attemptId", attempt.getId());
        result.put("quizTitle", attempt.getQuiz().getTitle());
        result.put("studentName", attempt.getStudent().getName());
        result.put("score", attempt.getScore());
        result.put("status", attempt.getStatus().name());
        result.put("startedAt", attempt.getStartedAt());
        result.put("submittedAt", attempt.getSubmittedAt());
        result.put("answers", answerList);

        return result;
    }

    @Transactional(readOnly = true)
    public List<Attempt> getStudentAttempts(Long studentId) {
        return attemptRepository.findByStudentIdOrderByStartedAtDesc(studentId);
    }
}
