package com.edupulse.repository;

import com.edupulse.entity.RiskPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RiskPredictionRepository extends JpaRepository<RiskPrediction, Long> {
    List<RiskPrediction> findByStudentIdOrderByPredictedAtDesc(Long studentId);
    Optional<RiskPrediction> findTopByStudentIdOrderByPredictedAtDesc(Long studentId);
    List<RiskPrediction> findByRiskLevel(RiskPrediction.RiskLevel riskLevel);
}
