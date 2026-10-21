package com.edupulse.repository;

import com.edupulse.entity.AttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {
    List<AttemptAnswer> findByAttemptId(Long attemptId);
    List<AttemptAnswer> findByAttemptStudentIdAndQuestionTopicId(Long studentId, Long topicId);

    @Query("SELECT aa FROM AttemptAnswer aa JOIN aa.attempt a WHERE a.student.id = :studentId ORDER BY a.startedAt ASC, aa.id ASC")
    List<AttemptAnswer> findHistoryByStudentId(@Param("studentId") Long studentId);
}

