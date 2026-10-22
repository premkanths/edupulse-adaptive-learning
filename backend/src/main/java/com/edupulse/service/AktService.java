package com.edupulse.service;

import com.edupulse.dto.AktPredictionDto;
import com.edupulse.entity.AttemptAnswer;
import com.edupulse.entity.Topic;
import com.edupulse.entity.TopicMastery;
import com.edupulse.entity.User;
import com.edupulse.repository.AttemptAnswerRepository;
import com.edupulse.repository.TopicMasteryRepository;
import com.fasterxml.jackson.core.type.TypeReference;
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
import java.time.ZoneOffset;
import java.util.*;

/**
 * Attentive Knowledge Tracing (AKT) Service.
 * Communicates with the PyTorch AKT ML inference service (Ghosh et al. KDD 2020)
 * to predict student topic mastery and concept retention using self-attention and temporal decay.
 * Includes seamless fallback to Bayesian Knowledge Tracing (BKT) if ML service is unreachable.
 */
@Service
public class AktService {

    private static final Logger log = LoggerFactory.getLogger(AktService.class);

    public static final double WEAK_TOPIC_THRESHOLD = 0.50;
    public static final double STRONG_TOPIC_THRESHOLD = 0.80;

    private final AttemptAnswerRepository attemptAnswerRepository;
    private final TopicMasteryRepository topicMasteryRepository;
    private final BktService bktService;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    @Value("${ml.service.url:${edupulse.ml-service.url:http://127.0.0.1:8001}}")
    private String mlServiceUrl = "http://127.0.0.1:8001";

    public AktService(AttemptAnswerRepository attemptAnswerRepository,
                      TopicMasteryRepository topicMasteryRepository,
                      BktService bktService,
                      ObjectMapper objectMapper) {
        this.attemptAnswerRepository = attemptAnswerRepository;
        this.topicMasteryRepository = topicMasteryRepository;
        this.bktService = bktService;
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(2500));
        requestFactory.setReadTimeout(Duration.ofMillis(2500));
        this.restClient = RestClient.builder().requestFactory(requestFactory).build();
    }

    public void setMlServiceUrl(String mlServiceUrl) {
        this.mlServiceUrl = mlServiceUrl;
    }

    /**
     * Builds interaction history payload for a student from chronological AttemptAnswers.
     */
    public List<Map<String, Object>> getStudentHistoryPayload(Long studentId) {
        List<AttemptAnswer> answers = attemptAnswerRepository.findHistoryByStudentId(studentId);
        List<Map<String, Object>> payload = new ArrayList<>();

        for (AttemptAnswer ans : answers) {
            Map<String, Object> item = new HashMap<>();
            item.put("question_id", ans.getQuestion().getId());
            item.put("topic_id", ans.getQuestion().getTopic() != null ? ans.getQuestion().getTopic().getId() : 1L);
            item.put("is_correct", ans.isCorrect());
            if (ans.getAttempt() != null && ans.getAttempt().getStartedAt() != null) {
                item.put("timestamp", ans.getAttempt().getStartedAt().toEpochSecond(ZoneOffset.UTC));
            }
            payload.add(item);
        }
        return payload;
    }

    /**
     * Predicts next-step mastery for a specific topic / question using Attentive Knowledge Tracing.
     */
    public AktPredictionDto predictMastery(Long studentId, Long topicId, Long questionId) {
        try {
            List<Map<String, Object>> history = getStudentHistoryPayload(studentId);

            Map<String, Object> req = new HashMap<>();
            req.put("student_id", studentId);
            req.put("target_topic_id", topicId);
            req.put("target_question_id", questionId != null ? questionId : topicId);
            req.put("history", history);

            String response = restClient.post()
                    .uri(mlServiceUrl + "/akt/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(req)
                    .retrieve()
                    .body(String.class);

            return objectMapper.readValue(response, AktPredictionDto.class);
        } catch (Exception ex) {
            log.warn("AKT service unreachable for student {} topic {}. Falling back to BKT baseline: {}",
                    studentId, topicId, ex.getMessage());
            return createFallbackPrediction(studentId, topicId, questionId);
        }
    }

    /**
     * Batch-predicts mastery for a collection of topics.
     */
    public Map<Long, AktPredictionDto> batchPredictMasteries(Long studentId, List<Topic> topics) {
        Map<Long, AktPredictionDto> resultMap = new HashMap<>();
        if (topics == null || topics.isEmpty()) {
            return resultMap;
        }

        try {
            List<Map<String, Object>> history = getStudentHistoryPayload(studentId);
            List<Map<String, Object>> targetTopics = new ArrayList<>();
            for (Topic t : topics) {
                Map<String, Object> item = new HashMap<>();
                item.put("topic_id", t.getId());
                item.put("question_id", t.getId());
                targetTopics.add(item);
            }

            Map<String, Object> req = new HashMap<>();
            req.put("student_id", studentId);
            req.put("history", history);
            req.put("target_topics", targetTopics);

            String response = restClient.post()
                    .uri(mlServiceUrl + "/akt/batch-predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(req)
                    .retrieve()
                    .body(String.class);

            Map<String, Object> respMap = objectMapper.readValue(response, new TypeReference<Map<String, Object>>() {});
            List<Map<String, Object>> preds = (List<Map<String, Object>>) respMap.get("predictions");
            if (preds != null) {
                for (Map<String, Object> p : preds) {
                    AktPredictionDto dto = objectMapper.convertValue(p, AktPredictionDto.class);
                    if (dto.getTargetTopicId() != null) {
                        resultMap.put(dto.getTargetTopicId(), dto);
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("AKT batch prediction unreachable for student {}. Using BKT/DB fallback: {}", studentId, ex.getMessage());
            for (Topic t : topics) {
                resultMap.put(t.getId(), createFallbackPrediction(studentId, t.getId(), t.getId()));
            }
        }
        return resultMap;
    }

    /**
     * Processes student answer, updating topic mastery using the AKT neural model.
     */
    @Transactional
    public TopicMastery updateStudentMastery(User student, Topic topic, boolean isCorrect) {
        TopicMastery mastery = topicMasteryRepository.findByStudentIdAndTopicId(student.getId(), topic.getId())
                .orElseGet(() -> new TopicMastery(student, topic, BktService.DEFAULT_P_INIT, 0.0, 0));

        // 1. Calculate attentive knowledge tracing prediction
        double updatedMastery;
        try {
            AktPredictionDto pred = predictMastery(student.getId(), topic.getId(), null);
            if (pred != null && pred.getMasteryProbability() != null && !"BKT-Fallback Baseline".equals(pred.getModel())) {
                updatedMastery = Math.round(pred.getMasteryProbability() * 10000.0) / 10000.0;
            } else {
                updatedMastery = bktService.updateMastery(mastery.getPKnown(), isCorrect);
            }
        } catch (Exception ex) {
            log.warn("AKT update failed, using BKT fallback: {}", ex.getMessage());
            updatedMastery = bktService.updateMastery(mastery.getPKnown(), isCorrect);
        }

        mastery.setPKnown(updatedMastery);

        // 2. Update rolling accuracy and attempts
        int previousAttempts = mastery.getAttemptsCount();
        int newAttempts = previousAttempts + 1;
        double previousTotalCorrect = (mastery.getAccuracy() / 100.0) * previousAttempts;
        double newTotalCorrect = previousTotalCorrect + (isCorrect ? 1.0 : 0.0);
        double newAccuracy = Math.round((newTotalCorrect / newAttempts) * 10000.0) / 100.0;

        mastery.setAttemptsCount(newAttempts);
        mastery.setAccuracy(newAccuracy);

        return topicMasteryRepository.save(mastery);
    }

    /**
     * Inspects actual backend health and returns live status of the cognitive knowledge tracing engine.
     * Accurately distinguishes between active deep PyTorch AKT and local Bayesian Knowledge Tracing (BKT) fallback.
     */
    public Map<String, Object> getModelStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        try {
            String response = restClient.get()
                    .uri(mlServiceUrl + "/akt/health")
                    .retrieve()
                    .body(String.class);

            Map<String, Object> health = objectMapper.readValue(response, new TypeReference<Map<String, Object>>() {});
            boolean isLoaded = Boolean.TRUE.equals(health.get("is_loaded"));

            if (isLoaded) {
                status.put("activeModel", "Attentive Knowledge Tracing (AKT)");
                status.put("modelCode", "AKT");
                status.put("status", "ACTIVE");
                status.put("displayName", "Attentive Knowledge Tracing (AKT)");
                status.put("architecture", "Context-Aware Attention with Monotonic Temporal Distance Decay (Ghosh et al., KDD 2020)");
                status.put("description", "Analyzes the chronological sequence of quiz attempts to predict topic mastery using attention weights and temporal decay.");
                status.put("isFallback", false);
                status.put("fallbackModel", "Bayesian Knowledge Tracing (BKT)");
                status.put("questionsIndexed", health.get("n_questions"));
                status.put("skillsIndexed", health.get("n_skills"));
            } else {
                status.put("activeModel", "Bayesian Knowledge Tracing (BKT)");
                status.put("modelCode", "BKT");
                status.put("status", "FALLBACK_ACTIVE");
                status.put("displayName", "Bayesian Knowledge Tracing (BKT Baseline)");
                status.put("architecture", "Corbett & Anderson Standard Two-State Hidden Markov Model");
                status.put("description", "AKT neural engine is initializing; platform is operating on the deterministic BKT mathematical fallback baseline.");
                status.put("isFallback", true);
                status.put("fallbackModel", "Bayesian Knowledge Tracing (BKT)");
            }
        } catch (Exception ex) {
            log.warn("AKT health check failed ({}), reporting BKT fallback baseline: {}", mlServiceUrl, ex.getMessage());
            status.put("activeModel", "Bayesian Knowledge Tracing (BKT)");
            status.put("modelCode", "BKT");
            status.put("status", "FALLBACK_ACTIVE");
            status.put("displayName", "Bayesian Knowledge Tracing (BKT Baseline)");
            status.put("architecture", "Corbett & Anderson Standard Two-State Hidden Markov Model");
            status.put("description", "AKT neural microservice is temporarily offline; platform is actively running on the local BKT algorithmic baseline.");
            status.put("isFallback", true);
            status.put("fallbackModel", "Bayesian Knowledge Tracing (BKT)");
            status.put("error", ex.getMessage());
        }
        return status;
    }

    /**
     * Fetches AKT benchmark metrics and BKT comparison directly from ML service.
     */
    public Map<String, Object> getAktEvaluationMetrics() {
        try {
            String response = restClient.get()
                    .uri(mlServiceUrl + "/akt/metrics")
                    .retrieve()
                    .body(String.class);

            return objectMapper.readValue(response, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ex) {
            log.warn("Could not fetch AKT metrics from ML service: {}", ex.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("model", "Attentive Knowledge Tracing (AKT)");
            fallback.put("status", "UNAVAILABLE");
            fallback.put("error", ex.getMessage());
            return fallback;
        }
    }

    private AktPredictionDto createFallbackPrediction(Long studentId, Long topicId, Long questionId) {
        TopicMastery existing = topicMasteryRepository.findByStudentIdAndTopicId(studentId, topicId).orElse(null);
        double p = (existing != null) ? existing.getPKnown() : BktService.DEFAULT_P_INIT;

        AktPredictionDto dto = new AktPredictionDto();
        dto.setStudentId(studentId);
        dto.setTargetTopicId(topicId);
        dto.setTargetQuestionId(questionId);
        dto.setMasteryProbability(p);
        dto.setConfidence(0.50);
        dto.setMasteryLevel(p >= STRONG_TOPIC_THRESHOLD ? "MASTERED" : (p >= WEAK_TOPIC_THRESHOLD ? "PROGRESSING" : "NEEDS_REINFORCEMENT"));
        dto.setModel("BKT-Fallback Baseline");
        dto.setHistoryLength(existing != null ? existing.getAttemptsCount() : 0);
        dto.setAttendedHistory(Collections.emptyList());
        return dto;
    }
}
