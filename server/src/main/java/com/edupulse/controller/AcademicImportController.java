package com.edupulse.controller;

import com.edupulse.dto.ApiResponse;
import com.edupulse.dto.ImportDto.*;
import com.edupulse.entity.ImportBatch;
import com.edupulse.entity.User;
import com.edupulse.repository.UserRepository;
import com.edupulse.service.AcademicImportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/import")
public class AcademicImportController {

    private final AcademicImportService importService;
    private final UserRepository userRepository;

    public AcademicImportController(AcademicImportService importService, UserRepository userRepository) {
        this.importService = importService;
        this.userRepository = userRepository;
    }

    @GetMapping("/templates/{type}")
    public ResponseEntity<String> getTemplate(@PathVariable String type) {
        String csv = importService.getTemplateCsv(type);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + type.toLowerCase() + "_template.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<ImportPreviewResponse>> previewImport(@RequestBody ImportPreviewRequest request) {
        ImportPreviewResponse preview = importService.previewCsv(request);
        return ResponseEntity.ok(ApiResponse.success("CSV preview generated successfully", preview));
    }

    @PostMapping("/commit")
    public ResponseEntity<ApiResponse<ImportBatch>> commitImport(
            @RequestBody ImportCommitRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User uploader = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        ImportBatch batch = importService.commitImport(request, uploader.getId());
        return ResponseEntity.ok(ApiResponse.success("Import batch processed: " + batch.getSuccessfulRows() + " succeeded, " + batch.getFailedRows() + " failed", batch));
    }

    @GetMapping("/batches")
    public ResponseEntity<ApiResponse<List<ImportBatch>>> getBatches() {
        List<ImportBatch> batches = importService.getImportBatches();
        return ResponseEntity.ok(ApiResponse.success(batches));
    }
}
