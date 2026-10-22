package com.edupulse.repository;

import com.edupulse.entity.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, Long> {
    List<Attempt> findByStudentId(Long studentId);
    List<Attempt> findByStudentIdOrderByStartedAtDesc(Long studentId);
    List<Attempt> findByStudentIdAndSubmittedAtAfter(Long studentId, LocalDateTime after);
    List<Attempt> findByQuizIdOrderBySubmittedAtDesc(Long quizId);
    Optional<Attempt> findFirstByQuizIdAndStudentIdAndStatus(Long quizId, Long studentId, Attempt.Status status);
    List<Attempt> findByStudentIdAndStatus(Long studentId, Attempt.Status status);
}
