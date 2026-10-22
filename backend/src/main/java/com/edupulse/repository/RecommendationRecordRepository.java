package com.edupulse.repository;

import com.edupulse.entity.RecommendationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface RecommendationRecordRepository extends JpaRepository<RecommendationRecord, Long> {
    List<RecommendationRecord> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    @Modifying
    @Transactional
    void deleteByStudentId(Long studentId);
}
