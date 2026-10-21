package com.edupulse.service;

import com.edupulse.entity.*;
import com.edupulse.exception.BadRequestException;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAssignmentRepository quizAssignmentRepository;
    private final SubjectRepository subjectRepository;
    private final QuestionRepository questionRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public QuizService(QuizRepository quizRepository,
                       QuizQuestionRepository quizQuestionRepository,
                       QuizAssignmentRepository quizAssignmentRepository,
                       SubjectRepository subjectRepository,
                       QuestionRepository questionRepository,
                       ClassRepository classRepository,
                       UserRepository userRepository) {
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.quizAssignmentRepository = quizAssignmentRepository;
        this.subjectRepository = subjectRepository;
        this.questionRepository = questionRepository;
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Quiz> getQuizzesByTeacher(Long teacherId) {
        return quizRepository.findByCreatedById(teacherId);
    }

    @Transactional(readOnly = true)
    public Quiz getQuizById(Long quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with ID: " + quizId));
    }

    @Transactional(readOnly = true)
    public List<QuizQuestion> getQuizQuestions(Long quizId) {
        return quizQuestionRepository.findByQuizIdOrderByDisplayOrderAsc(quizId);
    }

    @Transactional
    public Quiz createQuiz(String title, Long subjectId, User teacher, Integer timeLimitMinutes,
                           LocalDateTime dueDate, List<Long> questionIds) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + subjectId));

        Quiz quiz = new Quiz(title.trim(), subject, teacher, Quiz.Status.DRAFT, timeLimitMinutes, dueDate);
        Quiz savedQuiz = quizRepository.save(quiz);

        if (questionIds != null && !questionIds.isEmpty()) {
            int order = 1;
            for (Long qId : questionIds) {
                Question question = questionRepository.findById(qId)
                        .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + qId));
                quizQuestionRepository.save(new QuizQuestion(savedQuiz, question, order++));
            }
        }

        return savedQuiz;
    }

    @Transactional
    public Quiz publishQuiz(Long quizId) {
        Quiz quiz = getQuizById(quizId);
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByDisplayOrderAsc(quizId);
        if (questions.isEmpty()) {
            throw new BadRequestException("Cannot publish an empty quiz. Please add questions first.");
        }
        quiz.setStatus(Quiz.Status.PUBLISHED);
        return quizRepository.save(quiz);
    }

    @Transactional
    public QuizAssignment assignQuizToClass(Long quizId, Long classId) {
        Quiz quiz = getQuizById(quizId);
        ClassEntity targetClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classId));

        QuizAssignment assignment = new QuizAssignment(quiz, targetClass, null);
        return quizAssignmentRepository.save(assignment);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAssignedQuizzesForStudent(Long studentId) {
        List<QuizAssignment> assignments = quizAssignmentRepository.findAssignmentsForStudent(studentId);
        List<Map<String, Object>> result = new ArrayList<>();

        Set<Long> processedQuizIds = new HashSet<>();
        for (QuizAssignment qa : assignments) {
            Quiz quiz = qa.getQuiz();
            if (quiz.getStatus() == Quiz.Status.PUBLISHED && processedQuizIds.add(quiz.getId())) {
                List<QuizQuestion> qqList = quizQuestionRepository.findByQuizIdOrderByDisplayOrderAsc(quiz.getId());

                Map<String, Object> map = new HashMap<>();
                map.put("assignmentId", qa.getId());
                map.put("quizId", quiz.getId());
                map.put("title", quiz.getTitle());
                map.put("subjectName", quiz.getSubject().getName());
                map.put("timeLimitMinutes", quiz.getTimeLimitMinutes());
                map.put("dueDate", quiz.getDueDate());
                map.put("questionCount", qqList.size());
                map.put("assignedAt", qa.getAssignedAt());
                result.add(map);
            }
        }
        return result;
    }

    /**
     * Prepares questions for a student attempt.
     * CRITICAL SECURITY REQUIREMENT: Never exposes correctIndex or explanation to the client before submission!
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentQuizForAttempt(Long quizId) {
        Quiz quiz = getQuizById(quizId);
        List<QuizQuestion> qqList = quizQuestionRepository.findByQuizIdOrderByDisplayOrderAsc(quizId);

        List<Map<String, Object>> questions = new ArrayList<>();
        for (QuizQuestion qq : qqList) {
            Question q = qq.getQuestion();
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("id", q.getId());
            qMap.put("text", q.getText());
            qMap.put("displayOrder", qq.getDisplayOrder());
            qMap.put("difficulty", q.getDifficulty().name());
            qMap.put("topicName", q.getTopic().getName());

            try {
                List<String> options = objectMapper.readValue(q.getOptionsJson(), new TypeReference<List<String>>() {});
                qMap.put("options", options);
            } catch (Exception ex) {
                qMap.put("options", Collections.emptyList());
            }

            // Notice: correctIndex and explanation are deliberately omitted here!
            questions.add(qMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("quizId", quiz.getId());
        response.put("title", quiz.getTitle());
        response.put("subjectName", quiz.getSubject().getName());
        response.put("timeLimitMinutes", quiz.getTimeLimitMinutes());
        response.put("totalQuestions", questions.size());
        response.put("questions", questions);

        return response;
    }
}
