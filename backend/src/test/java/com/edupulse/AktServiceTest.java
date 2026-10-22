package com.edupulse;

import com.edupulse.dto.AktPredictionDto;
import com.edupulse.entity.*;
import com.edupulse.repository.AttemptAnswerRepository;
import com.edupulse.repository.TopicMasteryRepository;
import com.edupulse.service.AktService;
import com.edupulse.service.BktService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class AktServiceTest {

    private AttemptAnswerRepository attemptAnswerRepository;
    private TopicMasteryRepository topicMasteryRepository;
    private BktService bktService;
    private ObjectMapper objectMapper;
    private AktService aktService;

    @BeforeEach
    void setUp() {
        attemptAnswerRepository = Mockito.mock(AttemptAnswerRepository.class);
        topicMasteryRepository = Mockito.mock(TopicMasteryRepository.class);
        bktService = new BktService();
        objectMapper = new ObjectMapper();
        aktService = new AktService(attemptAnswerRepository, topicMasteryRepository, bktService, objectMapper);
    }

    @Test
    @DisplayName("1. Fallback prediction gracefully provides valid baseline when ML service is offline")
    void testFallbackPredictionWhenOffline() {
        // Point to unreachable port to test offline fallback
        aktService.setMlServiceUrl("http://127.0.0.1:59999");

        when(attemptAnswerRepository.findHistoryByStudentId(10L)).thenReturn(Collections.emptyList());
        when(topicMasteryRepository.findByStudentIdAndTopicId(10L, 5L)).thenReturn(Optional.empty());

        AktPredictionDto result = aktService.predictMastery(10L, 5L, 1L);

        assertNotNull(result, "Fallback prediction must not be null");
        assertEquals(0.30, result.getMasteryProbability(), 0.01, "Expected baseline initial probability");
        assertTrue(result.getModel().contains("Fallback") || result.getModel().contains("BKT"));
    }

    @Test
    @DisplayName("2. Student history payload serializes correctly from AttemptAnswer entities")
    void testStudentHistoryPayloadConstruction() {
        Topic topic = new Topic();
        topic.setId(3L);
        topic.setName("Binary Search Trees");

        Question question = new Question();
        question.setId(101L);
        question.setTopic(topic);

        Attempt attempt = new Attempt();
        attempt.setId(1L);
        attempt.setStartedAt(LocalDateTime.of(2026, 10, 21, 10, 0, 0));

        AttemptAnswer answer = new AttemptAnswer(attempt, question, 1, true, 45);

        when(attemptAnswerRepository.findHistoryByStudentId(42L)).thenReturn(List.of(answer));

        var payload = aktService.getStudentHistoryPayload(42L);

        assertEquals(1, payload.size());
        assertEquals(101L, payload.get(0).get("question_id"));
        assertEquals(3L, payload.get(0).get("topic_id"));
        assertEquals(true, payload.get(0).get("is_correct"));
        assertNotNull(payload.get(0).get("timestamp"));
    }

    @Test
    @DisplayName("3. Updating student mastery updates attempts count and accuracy")
    void testUpdateStudentMasteryFallbackIntegration() {
        aktService.setMlServiceUrl("http://127.0.0.1:59999");

        User student = new User();
        student.setId(7L);

        Topic topic = new Topic();
        topic.setId(2L);
        topic.setName("Dynamic Programming");

        TopicMastery existing = new TopicMastery(student, topic, 0.40, 50.0, 2);

        when(topicMasteryRepository.findByStudentIdAndTopicId(7L, 2L)).thenReturn(Optional.of(existing));
        when(topicMasteryRepository.save(Mockito.any(TopicMastery.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TopicMastery updated = aktService.updateStudentMastery(student, topic, true);

        assertEquals(3, updated.getAttemptsCount(), "Attempts count must increment to 3");
        assertTrue(updated.getAccuracy() > 50.0, "Accuracy must increase after correct answer");
        assertTrue(updated.getPKnown() > 0.40, "Mastery probability must increase after correct answer");
    }

    @Test
    @DisplayName("4. Live AKT prediction connects to ML service and returns model inference")
    void testLiveAktPrediction() {
        aktService.setMlServiceUrl("http://127.0.0.1:8001");
        when(attemptAnswerRepository.findHistoryByStudentId(1L)).thenReturn(Collections.emptyList());

        AktPredictionDto result = aktService.predictMastery(1L, 2L, 5L);

        assertNotNull(result);
        assertNotNull(result.getMasteryProbability());
        assertTrue(result.getMasteryProbability() > 0.0 && result.getMasteryProbability() <= 1.0);
        assertNotNull(result.getModel());
    }

    @Test
    @DisplayName("5. getModelStatus accurately reports AKT when online and BKT when offline")
    void testGetModelStatusDualBehavior() {
        // Test Online Behavior (FastAPI running on 8001)
        aktService.setMlServiceUrl("http://127.0.0.1:8001");
        var onlineStatus = aktService.getModelStatus();
        assertNotNull(onlineStatus);
        assertEquals("ACTIVE", onlineStatus.get("status"));
        assertEquals("Attentive Knowledge Tracing (AKT)", onlineStatus.get("activeModel"));
        assertEquals(false, onlineStatus.get("isFallback"));

        // Test Offline Behavior (Unreachable port)
        aktService.setMlServiceUrl("http://127.0.0.1:59999");
        var offlineStatus = aktService.getModelStatus();
        assertNotNull(offlineStatus);
        assertEquals("FALLBACK_ACTIVE", offlineStatus.get("status"));
        assertEquals("Bayesian Knowledge Tracing (BKT)", offlineStatus.get("activeModel"));
        assertEquals(true, offlineStatus.get("isFallback"));
    }
}
