package com.edupulse.service;

import com.edupulse.entity.Topic;
import com.edupulse.entity.TopicMastery;
import com.edupulse.entity.User;
import com.edupulse.repository.TopicMasteryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TopicMasteryService {

    private final TopicMasteryRepository topicMasteryRepository;
    private final BktService bktService;

    public TopicMasteryService(TopicMasteryRepository topicMasteryRepository, BktService bktService) {
        this.topicMasteryRepository = topicMasteryRepository;
        this.bktService = bktService;
    }

    @Transactional
    public TopicMastery processTopicAnswer(User student, Topic topic, boolean isCorrect) {
        TopicMastery mastery = topicMasteryRepository.findByStudentIdAndTopicId(student.getId(), topic.getId())
                .orElseGet(() -> new TopicMastery(student, topic, BktService.DEFAULT_P_INIT, 0.0, 0));

        // 1. Calculate Bayesian Knowledge Tracing update
        double updatedPKnown = bktService.updateMastery(mastery.getPKnown(), isCorrect);
        mastery.setPKnown(updatedPKnown);

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

    @Transactional(readOnly = true)
    public List<TopicMastery> getStudentMastery(Long studentId) {
        return topicMasteryRepository.findByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public List<TopicMastery> getWeakTopics(Long studentId) {
        return topicMasteryRepository.findByStudentId(studentId).stream()
                .filter(tm -> tm.getPKnown() < BktService.WEAK_TOPIC_THRESHOLD)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TopicMastery> getStrongTopics(Long studentId) {
        return topicMasteryRepository.findByStudentId(studentId).stream()
                .filter(tm -> tm.getPKnown() >= BktService.STRONG_TOPIC_THRESHOLD)
                .collect(Collectors.toList());
    }
}
