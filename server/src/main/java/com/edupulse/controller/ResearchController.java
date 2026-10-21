package com.edupulse.controller;

import com.edupulse.dto.ApiResponse;
import com.edupulse.entity.EvaluationRun;
import com.edupulse.service.FeedbackSurveyService;
import com.edupulse.service.ResearchEvaluationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/research")
@Tag(name = "Research Evaluation", description = "Evaluation benchmarks, BKT vs Baseline comparison, Learning curves, Survey analytics")
public class ResearchController {

    private final ResearchEvaluationService evaluationService;
    private final FeedbackSurveyService feedbackSurveyService;

    public ResearchController(ResearchEvaluationService evaluationService, FeedbackSurveyService feedbackSurveyService) {
        this.evaluationService = evaluationService;
        this.feedbackSurveyService = feedbackSurveyService;
    }

    @GetMapping("/evaluation-metrics")
    @Operation(summary = "Get comparative research metrics (Adaptive vs Fixed, BKT vs Baseline, ML accuracy)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEvaluationMetrics() {
        Map<String, Object> report = evaluationService.getComprehensiveEvaluationReport();
        return ResponseEntity.ok(ApiResponse.success("Evaluation metrics computed successfully", report));
    }

    @PostMapping("/run-evaluation")
    @Operation(summary = "Execute and persist a formal experimental benchmark run")
    public ResponseEntity<ApiResponse<EvaluationRun>> runEvaluation(@RequestBody(required = false) Map<String, String> body) {
        String expId = body != null && body.containsKey("experimentId") ? body.get("experimentId") : "EXP-" + System.currentTimeMillis();
        String model = body != null && body.containsKey("modelName") ? body.get("modelName") : "EduPulse-BKT+RandomForest";
        EvaluationRun run = evaluationService.recordEvaluationRun(expId, model);
        return ResponseEntity.ok(ApiResponse.success("Benchmark evaluation recorded", run));
    }

    @GetMapping("/evaluation-history")
    @Operation(summary = "Get historical evaluation experiment records")
    public ResponseEntity<ApiResponse<List<EvaluationRun>>> getEvaluationHistory() {
        return ResponseEntity.ok(ApiResponse.success(evaluationService.getEvaluationHistory()));
    }

    @GetMapping("/survey-results")
    @Operation(summary = "Get Likert scale research feedback survey aggregations")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSurveyResults() {
        return ResponseEntity.ok(ApiResponse.success(feedbackSurveyService.getSurveyResultsSummary()));
    }
}
