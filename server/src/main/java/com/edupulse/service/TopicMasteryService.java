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
    private final AktService aktService;

    public TopicMasteryService(TopicMasteryRepository topicMasteryRepository,
                               BktService bktService,
                               AktService aktService) {
        this.topicMasteryRepository = topicMasteryRepository;
        this.bktService = bktService;
        this.aktService = aktService;
    }

    @Transactional
    public TopicMastery processTopicAnswer(User student, Topic topic, boolean isCorrect) {
        // Upgrade to Attentive Knowledge Tracing (AKT) model with automatic BKT fallback
        return aktService.updateStudentMastery(student, topic, isCorrect);
    }

    @Transactional(readOnly = true)
    public List<TopicMastery> getStudentMastery(Long studentId) {
        return topicMasteryRepository.findByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public List<TopicMastery> getWeakTopics(Long studentId) {
        return topicMasteryRepository.findByStudentId(studentId).stream()
                .filter(tm -> tm.getPKnown() < AktService.WEAK_TOPIC_THRESHOLD)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TopicMastery> getStrongTopics(Long studentId) {
        return topicMasteryRepository.findByStudentId(studentId).stream()
                .filter(tm -> tm.getPKnown() >= AktService.STRONG_TOPIC_THRESHOLD)
                .collect(Collectors.toList());
    }
}
