package com.edupulse.repository;

import com.edupulse.entity.ExamPaperAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamPaperAnalysisRepository extends JpaRepository<ExamPaperAnalysis, Long> {
    List<ExamPaperAnalysis> findByStudentIdOrderByUploadedAtDesc(Long studentId);
}
