package com.edupulse.repository;

import com.edupulse.entity.WeeklySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklySummaryRepository extends JpaRepository<WeeklySummary, Long> {
    List<WeeklySummary> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    Optional<WeeklySummary> findTopByStudentIdOrderByCreatedAtDesc(Long studentId);
}
