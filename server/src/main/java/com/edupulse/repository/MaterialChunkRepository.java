package com.edupulse.repository;

import com.edupulse.entity.MaterialChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialChunkRepository extends JpaRepository<MaterialChunk, Long> {
    List<MaterialChunk> findByMaterialIdOrderByChunkIndexAsc(Long materialId);
    void deleteByMaterialId(Long materialId);

    @Query("SELECT c FROM MaterialChunk c WHERE c.material.subject.id = :subjectId")
    List<MaterialChunk> findBySubjectId(@Param("subjectId") Long subjectId);

    @Query("SELECT c FROM MaterialChunk c WHERE c.material.subject.id IN :subjectIds")
    List<MaterialChunk> findBySubjectIds(@Param("subjectIds") List<Long> subjectIds);
}
