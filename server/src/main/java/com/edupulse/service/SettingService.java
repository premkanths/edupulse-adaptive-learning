package com.edupulse.service;

import com.edupulse.entity.Setting;
import com.edupulse.repository.SettingRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class SettingService {

    private static final Logger log = LoggerFactory.getLogger(SettingService.class);

    private final SettingRepository settingRepository;

    public SettingService(SettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @PostConstruct
    public void initDefaultSettings() {
        Map<String, String> defaults = new LinkedHashMap<>();
        defaults.put("bkt.mastery.threshold", "0.85");
        defaults.put("bkt.remediation.threshold", "0.60");
        defaults.put("ai.provider.order", "GEMINI,GROQ,OLLAMA,OFFLINE");
        defaults.put("risk.low_score.threshold", "50.0");
        defaults.put("risk.attendance.threshold", "75.0");
        defaults.put("risk.inactive_days.threshold", "7");
        defaults.put("email.summary.cron", "0 0 6 * * MON");
        defaults.put("privacy.retention_days", "365");

        for (Map.Entry<String, String> entry : defaults.entrySet()) {
            if (!settingRepository.existsByConfigKey(entry.getKey())) {
                settingRepository.save(new Setting(entry.getKey(), entry.getValue()));
                log.info("Initialized default system setting: {} = {}", entry.getKey(), entry.getValue());
            }
        }
    }

    public List<Setting> getAllSettings() {
        return settingRepository.findAll();
    }

    public String getSettingValue(String key, String defaultValue) {
        return settingRepository.findByConfigKey(key)
                .map(Setting::getConfigValue)
                .orElse(defaultValue);
    }

    @Transactional
    public Setting updateSetting(String key, String value) {
        Setting setting = settingRepository.findByConfigKey(key)
                .orElse(new Setting(key, value));

        setting.setConfigValue(value);
        return settingRepository.save(setting);
    }

    @Transactional
    public List<Setting> batchUpdate(Map<String, String> updates) {
        List<Setting> results = new ArrayList<>();
        for (Map.Entry<String, String> e : updates.entrySet()) {
            results.add(updateSetting(e.getKey(), e.getValue()));
        }
        return results;
    }
}
