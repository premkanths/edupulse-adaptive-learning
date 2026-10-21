package com.edupulse.repository;

import com.edupulse.entity.EvaluationRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvaluationRunRepository extends JpaRepository<EvaluationRun, Long> {
    List<EvaluationRun> findAllByOrderByCreatedAtDesc();
    List<EvaluationRun> findByExperimentId(String experimentId);
}
