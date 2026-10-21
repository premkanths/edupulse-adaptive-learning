package com.edupulse.repository;

import com.edupulse.entity.QuizAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAssignmentRepository extends JpaRepository<QuizAssignment, Long> {
    List<QuizAssignment> findByQuizId(Long quizId);

    @Query("SELECT qa FROM QuizAssignment qa WHERE qa.targetStudent.id = :studentId OR qa.targetClass.id IN " +
           "(SELECT c.id FROM ClassEntity c JOIN c.students s WHERE s.id = :studentId)")
    List<QuizAssignment> findAssignmentsForStudent(@Param("studentId") Long studentId);
}
