package com.edupulse.repository;

import com.edupulse.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByQuizIdOrderByDisplayOrderAsc(Long quizId);
    void deleteByQuizId(Long quizId);
}
