package com.edupulse.repository;

import com.edupulse.entity.ExternalProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExternalProfileRepository extends JpaRepository<ExternalProfile, Long> {
    List<ExternalProfile> findByStudentId(Long studentId);
    Optional<ExternalProfile> findByStudentIdAndPlatform(Long studentId, ExternalProfile.Platform platform);
}
