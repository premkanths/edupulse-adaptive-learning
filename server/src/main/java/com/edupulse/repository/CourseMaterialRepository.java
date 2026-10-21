package com.edupulse.repository;

import com.edupulse.entity.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Long> {
    List<CourseMaterial> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    List<CourseMaterial> findBySubjectIdOrderByCreatedAtDesc(Long subjectId);
    List<CourseMaterial> findBySubjectIdInOrderByCreatedAtDesc(List<Long> subjectIds);
}
