package com.edupulse.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AktPredictionDto {

    @JsonProperty("student_id")
    private Long studentId;

    @JsonProperty("target_question_id")
    private Long targetQuestionId;

    @JsonProperty("target_topic_id")
    private Long targetTopicId;

    @JsonProperty("mastery_probability")
    private Double masteryProbability;

    @JsonProperty("confidence")
    private Double confidence;

    @JsonProperty("mastery_level")
    private String masteryLevel;

    @JsonProperty("attended_history")
    private List<Map<String, Object>> attendedHistory;

    @JsonProperty("history_length")
    private Integer historyLength;

    @JsonProperty("model")
    private String model;

    public AktPredictionDto() {
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getTargetQuestionId() {
        return targetQuestionId;
    }

    public void setTargetQuestionId(Long targetQuestionId) {
        this.targetQuestionId = targetQuestionId;
    }

    public Long getTargetTopicId() {
        return targetTopicId;
    }

    public void setTargetTopicId(Long targetTopicId) {
        this.targetTopicId = targetTopicId;
    }

    public Double getMasteryProbability() {
        return masteryProbability;
    }

    public void setMasteryProbability(Double masteryProbability) {
        this.masteryProbability = masteryProbability;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getMasteryLevel() {
        return masteryLevel;
    }

    public void setMasteryLevel(String masteryLevel) {
        this.masteryLevel = masteryLevel;
    }

    public List<Map<String, Object>> getAttendedHistory() {
        return attendedHistory;
    }

    public void setAttendedHistory(List<Map<String, Object>> attendedHistory) {
        this.attendedHistory = attendedHistory;
    }

    public Integer getHistoryLength() {
        return historyLength;
    }

    public void setHistoryLength(Integer historyLength) {
        this.historyLength = historyLength;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}
