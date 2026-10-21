package com.edupulse.repository;

import com.edupulse.entity.Setting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SettingRepository extends JpaRepository<Setting, Long> {
    Optional<Setting> findByConfigKey(String configKey);
    boolean existsByConfigKey(String configKey);
}
