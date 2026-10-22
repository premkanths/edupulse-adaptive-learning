package com.edupulse.repository;

import com.edupulse.entity.FeedbackSurvey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface FeedbackSurveyRepository extends JpaRepository<FeedbackSurvey, Long> {
    Optional<FeedbackSurvey> findTopByStudentIdOrderBySubmittedAtDesc(Long studentId);
    List<FeedbackSurvey> findAllByOrderBySubmittedAtDesc();

    @Query("SELECT AVG(s.q1Usefulness) as avgQ1, AVG(s.q2EaseOfUse) as avgQ2, " +
           "AVG(s.q3ExplanationClarity) as avgQ3, AVG(s.q4Trust) as avgQ4, " +
           "AVG(s.q5AiUsefulness) as avgQ5, COUNT(s) as totalResponses " +
           "FROM FeedbackSurvey s")
    Map<String, Object> calculateSurveyAverages();
}
