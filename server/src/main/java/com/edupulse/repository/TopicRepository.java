package com.edupulse.repository;

import com.edupulse.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findBySubjectId(Long subjectId);
    boolean existsBySubjectIdAndName(Long subjectId, String name);
}
