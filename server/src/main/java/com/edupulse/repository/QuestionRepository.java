package com.edupulse.repository;

import com.edupulse.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByTopicId(Long topicId);
    List<Question> findByTopicSubjectId(Long subjectId);
    long countByTopicSubjectId(Long subjectId);
}
