package com.edupulse.repository;

import com.edupulse.entity.AcademicRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AcademicRecordRepository extends JpaRepository<AcademicRecord, Long> {
    List<AcademicRecord> findByStudentId(Long studentId);
    List<AcademicRecord> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    List<AcademicRecord> findByImportBatchId(Long importBatchId);
}
