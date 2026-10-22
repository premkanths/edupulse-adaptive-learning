package com.edupulse.repository;

import com.edupulse.entity.TopicMastery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicMasteryRepository extends JpaRepository<TopicMastery, Long> {
    Optional<TopicMastery> findByStudentIdAndTopicId(Long studentId, Long topicId);
    List<TopicMastery> findByStudentId(Long studentId);
    List<TopicMastery> findByStudentIdAndTopicSubjectId(Long studentId, Long subjectId);
}
