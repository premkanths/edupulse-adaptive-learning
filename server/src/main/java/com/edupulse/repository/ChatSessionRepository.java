package com.edupulse.repository;

import com.edupulse.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByStudentId(Long studentId);
    List<ChatSession> findByStudentIdOrderByUpdatedAtDesc(Long studentId);
}
