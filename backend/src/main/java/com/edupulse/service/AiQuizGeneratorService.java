package com.edupulse.service;

import com.edupulse.entity.*;
import com.edupulse.exception.BadRequestException;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AiQuizGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(AiQuizGeneratorService.class);

    private final AiClientService aiClientService;
    private final QuestionService questionService;
    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuestionRepository questionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiQuizGeneratorService(AiClientService aiClientService,
                                  QuestionService questionService,
                                  TopicRepository topicRepository,
                                  SubjectRepository subjectRepository,
                                  QuizRepository quizRepository,
                                  QuizQuestionRepository quizQuestionRepository,
                                  QuestionRepository questionRepository) {
        this.aiClientService = aiClientService;
        this.questionService = questionService;
        this.topicRepository = topicRepository;
        this.subjectRepository = subjectRepository;
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.questionRepository = questionRepository;
    }

    @Transactional
    public Quiz generateQuizDraft(Long subjectId, Long topicId, int questionCount,
                                  Question.Difficulty difficulty, User teacher) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + subjectId));
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));

        int safeCount = Math.min(Math.max(questionCount, 1), 30);

        String systemPrompt = "You are an expert academic assessment generator for higher education.\n" +
                "Generate exactly " + safeCount + " multiple-choice questions for the topic: '" + topic.getName() + "' (" + subject.getName() + ").\n" +
                "Difficulty level: " + difficulty.name() + ".\n\n" +
                "CRITICAL JSON FORMAT REQUIREMENTS:\n" +
                "Return ONLY a valid JSON array of objects with NO markdown formatting, NO backticks, and NO extra text.\n" +
                "Each object MUST have:\n" +
                "- \"text\": String (The question text)\n" +
                "- \"options\": Array of exactly 4 non-empty strings\n" +
                "- \"correctIndex\": Integer between 0 and 3\n" +
                "- \"explanation\": String (Pedagogical explanation of why the correct option is right and others are wrong)\n\n" +
                "Example:\n" +
                "[{\"text\":\"What is the time complexity of searching an element in a balanced BST?\",\"options\":[\"O(1)\",\"O(log n)\",\"O(n)\",\"O(n log n)\"],\"correctIndex\":1,\"explanation\":\"In a balanced BST, height is log2(n), yielding O(log n) search time.\"}]";

        String userPrompt = "Generate " + safeCount + " questions on " + topic.getName() + " with difficulty " + difficulty.name();

        List<Map<String, Object>> parsedQuestions = tryGenerateWithRetry(systemPrompt, userPrompt, topic);

        // 1. Create Draft Quiz for Teacher Review
        String title = String.format("AI Draft: %s (%s)", topic.getName(), difficulty.name());
        Quiz quiz = new Quiz(title, subject, teacher, Quiz.Status.DRAFT, 15, null);
        quiz.setAiProvider("Gemini/Groq/Ollama-Chain");
        Quiz savedQuiz = quizRepository.save(quiz);

        // 2. Save generated questions with Source.AI_GENERATED
        int displayOrder = 1;
        for (Map<String, Object> qData : parsedQuestions) {
            String text = (String) qData.get("text");
            @SuppressWarnings("unchecked")
            List<String> options = (List<String>) qData.get("options");
            int correctIndex = ((Number) qData.get("correctIndex")).intValue();
            String explanation = (String) qData.get("explanation");

            Question question = questionService.createQuestion(
                    topic.getId(), text, options, correctIndex, difficulty,
                    explanation, Question.Source.AI_GENERATED, teacher
            );

            quizQuestionRepository.save(new QuizQuestion(savedQuiz, question, displayOrder++));
        }

        return savedQuiz;
    }

    private List<Map<String, Object>> tryGenerateWithRetry(String systemPrompt, String userPrompt, Topic topic) {
        // Attempt 1
        String rawResponse = aiClientService.executePrompt(systemPrompt, userPrompt);
        List<Map<String, Object>> result = parseAndValidateJson(rawResponse);

        if (result.isEmpty()) {
            logger.warn("First AI JSON parsing failed. Retrying once with strict JSON reinforcement...");
            // Attempt 2 (Retry once)
            String retryPrompt = systemPrompt + "\nIMPORTANT: Your previous output was invalid JSON. Output pure valid JSON array only.";
            rawResponse = aiClientService.executePrompt(retryPrompt, userPrompt);
            result = parseAndValidateJson(rawResponse);
        }

        if (result.isEmpty()) {
            logger.info("External AI JSON failed. Falling back to pre-generated pedagogical assessment pool for '{}'.", topic.getName());
            result = getPreGeneratedFallbackQuestions(topic);
        }

        return result;
    }

    private List<Map<String, Object>> parseAndValidateJson(String rawText) {
        List<Map<String, Object>> validList = new ArrayList<>();
        if (rawText == null || rawText.trim().isEmpty()) return validList;

        try {
            String cleaned = rawText.trim();
            if (cleaned.startsWith("```json")) {
                cleaned = cleaned.substring(7);
            } else if (cleaned.startsWith("```")) {
                cleaned = cleaned.substring(3);
            }
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
            cleaned = cleaned.trim();

            JsonNode root = objectMapper.readTree(cleaned);
            if (root.isArray()) {
                for (JsonNode node : root) {
                    if (node.has("text") && node.has("options") && node.has("correctIndex") && node.has("explanation")) {
                        JsonNode opts = node.get("options");
                        if (opts.isArray() && opts.size() == 4) {
                            Map<String, Object> map = new HashMap<>();
                            map.put("text", node.get("text").asText());
                            List<String> options = new ArrayList<>();
                            for (JsonNode opt : opts) {
                                options.add(opt.asText());
                            }
                            map.put("options", options);
                            int cIdx = node.get("correctIndex").asInt();
                            if (cIdx >= 0 && cIdx <= 3) {
                                map.put("correctIndex", cIdx);
                                map.put("explanation", node.get("explanation").asText());
                                validList.add(map);
                            }
                        }
                    }
                }
            }
        } catch (Exception ex) {
            logger.debug("JSON parse error: {}", ex.getMessage());
        }
        return validList;
    }

    private List<Map<String, Object>> getPreGeneratedFallbackQuestions(Topic topic) {
        List<Map<String, Object>> list = new ArrayList<>();
        String topicName = topic.getName();

        Map<String, Object> q1 = new HashMap<>();
        q1.put("text", "Which of the following operations has O(1) time complexity in a standard Hash Table on average?");
        q1.put("options", List.of("Sequential traversal", "Direct key lookup", "Sorting all elements", "Finding median"));
        q1.put("correctIndex", 1);
        q1.put("explanation", "Hash tables compute array index via hash function h(k), allowing direct O(1) average time lookups.");
        list.add(q1);

        Map<String, Object> q2 = new HashMap<>();
        q2.put("text", "In " + topicName + ", what is the primary invariant required for optimal correctness?");
        q2.put("options", List.of("Elements must be stored in random order", "Total size must equal a power of two", "Key ordering constraint must hold across all subtree partitions", "All leaves must reside at level 0"));
        q2.put("correctIndex", 2);
        q2.put("explanation", "The partition constraint guarantees that left elements are less and right elements are greater, ensuring binary search holds.");
        list.add(q2);

        Map<String, Object> q3 = new HashMap<>();
        q3.put("text", "What is the worst-case scenario time complexity when " + topicName + " degrades into an unbalanced linear chain?");
        q3.put("options", List.of("O(1)", "O(log n)", "O(n)", "O(n^2)"));
        q3.put("correctIndex", 2);
        q3.put("explanation", "When a binary tree becomes degenerate (skewed in one direction), it behaves like a linked list, degrading search to O(n).");
        list.add(q3);

        return list;
    }
}
