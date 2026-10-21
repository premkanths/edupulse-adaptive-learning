package com.edupulse.service;

import com.edupulse.entity.*;
import com.edupulse.repository.RecommendationRecordRepository;
import com.edupulse.repository.TopicMasteryRepository;
import com.edupulse.repository.TopicRepository;
import com.edupulse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class RecommendationService {

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

    @Transactional
    public List<RecommendationRecord> generateRecommendationsForStudent(Long studentId) {
        User student = userRepository.findById(studentId).orElse(null);
        if (student == null) return List.of();

        List<TopicMastery> masteries = topicMasteryRepository.findByStudentId(studentId);
        List<RecommendationRecord> newRecs = new ArrayList<>();

        for (TopicMastery tm : masteries) {
            Topic topic = tm.getTopic();
            double p = tm.getPKnown();
            double acc = tm.getAccuracy();

            // Rule 1: Prerequisite Check
            if (topic.getPrerequisiteTopic() != null) {
                Topic prereq = topic.getPrerequisiteTopic();
                TopicMastery prereqMastery = topicMasteryRepository
                        .findByStudentIdAndTopicId(studentId, prereq.getId())
                        .orElse(null);

                if (prereqMastery != null && prereqMastery.getPKnown() < BktService.WEAK_TOPIC_THRESHOLD) {
                    String evidence = String.format("Prerequisite topic '%s' mastery is %.2f (below 0.50 threshold).",
                            prereq.getName(), prereqMastery.getPKnown());
                    String explanation = String.format("Reviewing foundational prerequisite '%s' is recommended before attempting '%s'.",
                            prereq.getName(), topic.getName());

                    RecommendationRecord rec = new RecommendationRecord(student, prereq,
                            RecommendationRecord.Type.REVIEW_PREREQUISITE, evidence, explanation);
                    newRecs.add(recommendationRecordRepository.save(rec));
                    continue; // Focus on prerequisite first
                }
            }

            // Rule 2: Weak Topic Remediation
            if (p < BktService.WEAK_TOPIC_THRESHOLD) {
                String evidence = String.format("Estimated topic mastery pKnown is %.2f (threshold < 0.50). Historical accuracy: %.1f%% across %d attempts.",
                        p, acc, tm.getAttemptsCount());
                String explanation = String.format("'%s' is recommended for practice because current BKT estimated mastery is %.2f. Targeted exercises will help reinforce foundational concepts.",
                        topic.getName(), p);

                RecommendationRecord rec = new RecommendationRecord(student, topic,
                        RecommendationRecord.Type.PRACTICE_WEAK_TOPIC, evidence, explanation);
                newRecs.add(recommendationRecordRepository.save(rec));
            }

            // Rule 3: High Mastery Challenge
            else if (p >= BktService.STRONG_TOPIC_THRESHOLD && acc >= 80.0) {
                String evidence = String.format("Estimated topic mastery pKnown is %.2f with %.1f%% accuracy.", p, acc);
                String explanation = String.format("You have demonstrated solid mastery in '%s'. Advanced/Hard questions are recommended to challenge your problem-solving depth.", topic.getName());

                RecommendationRecord rec = new RecommendationRecord(student, topic,
                        RecommendationRecord.Type.CHALLENGE_TOPIC, evidence, explanation);
                newRecs.add(recommendationRecordRepository.save(rec));
            }
        }

        return newRecs;
    }

    @Transactional(readOnly = true)
    public List<RecommendationRecord> getStudentRecommendations(Long studentId) {
        List<RecommendationRecord> records = recommendationRecordRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        if (records.isEmpty()) {
            // Generate initial recommendations if none exist
            return generateRecommendationsForStudent(studentId);
        }
        return records;
    }
}
