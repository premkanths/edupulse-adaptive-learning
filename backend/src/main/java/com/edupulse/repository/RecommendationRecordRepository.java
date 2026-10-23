package com.edupulse.repository;

import com.edupulse.entity.RecommendationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface RecommendationRecordRepository extends JpaRepository<RecommendationRecord, Long> {

    @Query("SELECT r FROM RecommendationRecord r " +
           "LEFT JOIN FETCH r.topic t " +
           "LEFT JOIN FETCH t.subject s " +
           "WHERE r.student.id = :studentId ORDER BY r.createdAt DESC")
    List<RecommendationRecord> findByStudentIdOrderByCreatedAtDesc(@Param("studentId") Long studentId);

    @Modifying
    @Transactional
    void deleteByStudentId(Long studentId);
}
