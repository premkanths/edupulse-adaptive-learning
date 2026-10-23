package com.edupulse.repository;

import com.edupulse.entity.TopicMastery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicMasteryRepository extends JpaRepository<TopicMastery, Long> {

    @Query("SELECT tm FROM TopicMastery tm " +
           "JOIN FETCH tm.topic t " +
           "LEFT JOIN FETCH t.subject s " +
           "LEFT JOIN FETCH t.prerequisiteTopic p " +
           "WHERE tm.student.id = :studentId AND tm.topic.id = :topicId")
    Optional<TopicMastery> findByStudentIdAndTopicId(@Param("studentId") Long studentId, @Param("topicId") Long topicId);

    @Query("SELECT tm FROM TopicMastery tm " +
           "JOIN FETCH tm.topic t " +
           "LEFT JOIN FETCH t.subject s " +
           "LEFT JOIN FETCH t.prerequisiteTopic p " +
           "WHERE tm.student.id = :studentId")
    List<TopicMastery> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT tm FROM TopicMastery tm " +
           "JOIN FETCH tm.topic t " +
           "LEFT JOIN FETCH t.subject s " +
           "LEFT JOIN FETCH t.prerequisiteTopic p " +
           "WHERE tm.student.id = :studentId AND t.subject.id = :subjectId")
    List<TopicMastery> findByStudentIdAndTopicSubjectId(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId);
}
