package com.edupulse.repository;

import com.edupulse.entity.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    List<ClassEntity> findByTeacherId(Long teacherId);
    boolean existsByName(String name);
}
