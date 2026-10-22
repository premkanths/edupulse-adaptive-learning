package com.edupulse.repository;

import com.edupulse.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findTop100ByOrderByCreatedAtDesc();
    Page<AuditEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<AuditEvent> findByActionOrderByCreatedAtDesc(String action);
    List<AuditEvent> findByUserIdOrderByCreatedAtDesc(Long userId);
}
