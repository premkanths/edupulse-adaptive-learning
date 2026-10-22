package com.edupulse.repository;

import com.edupulse.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByStudentId(Long studentId);
    List<AttendanceRecord> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    long countByStudentIdAndStatus(Long studentId, AttendanceRecord.Status status);
    long countByStudentId(Long studentId);
}
