package com.edupulse.service;

import com.edupulse.entity.*;
import com.edupulse.repository.RecommendationRecordRepository;
import com.edupulse.repository.TopicMasteryRepository;
import com.edupulse.repository.TopicRepository;
import com.edupulse.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private final TopicMasteryRepository topicMasteryRepository;
    private final TopicRepository topicRepository;
    private final RecommendationRecordRepository recommendationRecordRepository;
    private final UserRepository userRepository;

    public RecommendationService(TopicMasteryRepository topicMasteryRepository,
                                 TopicRepository topicRepository,
                                 RecommendationRecordRepository recommendationRecordRepository,
                                 UserRepository userRepository) {
        this.topicMasteryRepository = topicMasteryRepository;
        this.topicRepository = topicRepository;
        this.recommendationRecordRepository = recommendationRecordRepository;
        this.userRepository = userRepository;
    }

    /**
     * Generates personalized, deduplicated recommendations in clear, student-friendly language.
     * Cleans up stale recommendations so students never see redundant duplicate entries.
     */
    @Transactional
    public List<RecommendationRecord> generateRecommendationsForStudent(Long studentId) {
        User student = userRepository.findById(studentId).orElse(null);
        if (student == null) return List.of();

        // 1. Remove obsolete recommendations to prevent duplicates
        try {
            recommendationRecordRepository.deleteByStudentId(studentId);
        } catch (Exception ex) {
            log.warn("Could not clear previous recommendations for student {}: {}", studentId, ex.getMessage());
        }

        List<TopicMastery> masteries = topicMasteryRepository.findByStudentId(studentId);
        List<RecommendationRecord> recList = new ArrayList<>();
        Set<Long> processedTopicIds = new HashSet<>();

        // If the student has zero topic masteries or attempts, suggest a welcoming diagnostic quiz
        if (masteries.isEmpty()) {
            List<Topic> allTopics = topicRepository.findAll();
            Topic startingTopic = allTopics.isEmpty() ? null : allTopics.get(0);
            if (startingTopic != null) {
                RecommendationRecord diagRec = new RecommendationRecord(
                        student,
                        startingTopic,
                        RecommendationRecord.Type.PRACTICE_WEAK_TOPIC,
                        "Initial diagnostic assessment needed to identify your baseline knowledge.",
                        "Welcome to EduPulse! Take a quick 5-question practice quiz in '" + startingTopic.getName() + "' so we can personalise your learning suggestions.",
                        "Start your first 5-question diagnostic quiz.",
                        10
                );
                recList.add(recommendationRecordRepository.save(diagRec));
            }
            return recList;
        }

        // 2. Evaluate Prerequisite Blockers First
        for (TopicMastery tm : masteries) {
            Topic topic = tm.getTopic();
            if (topic == null) continue;

            if (topic.getPrerequisiteTopic() != null) {
                Topic prereq = topic.getPrerequisiteTopic();
                if (!processedTopicIds.contains(prereq.getId())) {
                    TopicMastery prereqMastery = topicMasteryRepository
                            .findByStudentIdAndTopicId(studentId, prereq.getId())
                            .orElse(null);

                    double p = prereqMastery != null && prereqMastery.getPKnown() != null ? prereqMastery.getPKnown() : 0.0;
                    if (p < AktService.WEAK_TOPIC_THRESHOLD) {
                        String evidence = String.format("Prerequisite concept understanding is at %d%%.", Math.round(p * 100));
                        String explanation = String.format(
                                "We recommend reviewing '%s' first because it provides the foundational principles needed to understand '%s'.",
                                prereq.getName(), topic.getName());
                        String action = "Review prerequisite course notes, then try 5 quick practice questions.";

                        RecommendationRecord rec = new RecommendationRecord(
                                student, prereq, RecommendationRecord.Type.REVIEW_PREREQUISITE, evidence, explanation, action, 15);
                        recList.add(recommendationRecordRepository.save(rec));
                        processedTopicIds.add(prereq.getId());
                    }
                }
            }
        }

        // 3. Evaluate Topics Needing Practice (Weak Topics)
        for (TopicMastery tm : masteries) {
            Topic topic = tm.getTopic();
            if (topic == null || processedTopicIds.contains(topic.getId())) continue;

            double p = tm.getPKnown() != null ? tm.getPKnown() : 0.50;
            double acc = tm.getAccuracy() != null ? tm.getAccuracy() : 0.0;
            int attempts = tm.getAttemptsCount() != null ? tm.getAttemptsCount() : 0;

            if (p < AktService.WEAK_TOPIC_THRESHOLD || (attempts > 0 && acc < 60.0)) {
                String evidence = String.format("Recent accuracy is %d%% across %d question attempt%s.",
                        Math.round(acc), attempts, attempts == 1 ? "" : "s");
                String explanation = String.format(
                        "We suggested '%s' because your recent quiz answers indicate that more practice will help strengthen your grasp on this concept.",
                        topic.getName());
                String action = "Review the key concepts in course materials, then attempt a short practice quiz.";

                RecommendationRecord rec = new RecommendationRecord(
                        student, topic, RecommendationRecord.Type.PRACTICE_WEAK_TOPIC, evidence, explanation, action, 15);
                recList.add(recommendationRecordRepository.save(rec));
                processedTopicIds.add(topic.getId());
            }
        }

        // 4. Evaluate Challenge Topics for Strong Understanding
        for (TopicMastery tm : masteries) {
            Topic topic = tm.getTopic();
            if (topic == null || processedTopicIds.contains(topic.getId())) continue;

            double p = tm.getPKnown() != null ? tm.getPKnown() : 0.0;
            double acc = tm.getAccuracy() != null ? tm.getAccuracy() : 0.0;

            if (p >= AktService.STRONG_TOPIC_THRESHOLD && acc >= 75.0) {
                String evidence = String.format("Demonstrated strong concept mastery (%d%%) with %d%% accuracy.",
                        Math.round(p * 100), Math.round(acc));
                String explanation = String.format(
                        "You are doing very well in '%s'. You are ready to tackle more advanced problem sets and challenging questions.",
                        topic.getName());
                String action = "Attempt an advanced problem set to test your problem-solving depth.";

                RecommendationRecord rec = new RecommendationRecord(
                        student, topic, RecommendationRecord.Type.CHALLENGE_TOPIC, evidence, explanation, action, 20);
                recList.add(recommendationRecordRepository.save(rec));
                processedTopicIds.add(topic.getId());
            }
        }

        return recList;
    }

    /**
     * Retrieves deduplicated recommendations for a student.
     */
    @Transactional
    public List<RecommendationRecord> getStudentRecommendations(Long studentId) {
        List<RecommendationRecord> records = recommendationRecordRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        if (records.isEmpty()) {
            return generateRecommendationsForStudent(studentId);
        }

        // Deduplicate by topic ID keeping the most recent one
        Map<Long, RecommendationRecord> uniqueByTopic = new LinkedHashMap<>();
        for (RecommendationRecord r : records) {
            if (r.getTopic() != null && !uniqueByTopic.containsKey(r.getTopic().getId())) {
                uniqueByTopic.put(r.getTopic().getId(), r);
            }
        }
        return new ArrayList<>(uniqueByTopic.values());
    }
}
