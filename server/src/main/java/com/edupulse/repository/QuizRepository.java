package com.edupulse.repository;

import com.edupulse.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCreatedById(Long teacherId);
    List<Quiz> findBySubjectId(Long subjectId);
    List<Quiz> findByStatus(Quiz.Status status);
}
