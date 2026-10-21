package com.edupulse.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation_runs")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EvaluationRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "experiment_id", nullable = false, length = 100)
    private String experimentId;

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;

    @Column(name = "metrics_json", columnDefinition = "JSON", nullable = false)
    private String metricsJson;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public EvaluationRun() {}

    public EvaluationRun(String experimentId, String modelName, String metricsJson) {
        this.experimentId = experimentId;
        this.modelName = modelName;
        this.metricsJson = metricsJson;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getExperimentId() { return experimentId; }
    public void setExperimentId(String experimentId) { this.experimentId = experimentId; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getMetricsJson() { return metricsJson; }
    public void setMetricsJson(String metricsJson) { this.metricsJson = metricsJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
