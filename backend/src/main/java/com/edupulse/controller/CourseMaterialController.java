package com.edupulse.controller;

import com.edupulse.dto.ApiResponse;
import com.edupulse.entity.CourseMaterial;
import com.edupulse.entity.User;
import com.edupulse.repository.UserRepository;
import com.edupulse.security.UserPrincipal;
import com.edupulse.service.CourseMaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Course Material RAG", description = "Teacher study notes upload, document chunking, and semantic RAG retrieval")
public class CourseMaterialController {

    private final CourseMaterialService courseMaterialService;
    private final UserRepository userRepository;

    public CourseMaterialController(CourseMaterialService courseMaterialService, UserRepository userRepository) {
        this.courseMaterialService = courseMaterialService;
        this.userRepository = userRepository;
    }

    @PostMapping(value = "/teacher/materials/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Upload course notes (PDF, DOCX, TXT, MD) and generate semantic chunks for RAG")
    public ResponseEntity<ApiResponse<CourseMaterial>> uploadMaterial(
            @RequestParam("subjectId") Long subjectId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "rawText", required = false) String rawText,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        User teacher = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("Teacher user not found"));

        CourseMaterial saved = courseMaterialService.uploadMaterial(teacher, subjectId, title, description, file, rawText);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Material '%s' processed into %d study chunks for AI RAG tutor.", saved.getTitle(), saved.getChunkCount()),
                saved
        ));
    }

    @PostMapping(value = "/teacher/materials/upload-text", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Upload raw lecture notes text via JSON")
    public ResponseEntity<ApiResponse<CourseMaterial>> uploadMaterialText(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        User teacher = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("Teacher user not found"));

        Long subjectId = ((Number) payload.get("subjectId")).longValue();
        String title = (String) payload.get("title");
        String description = (String) payload.get("description");
        String rawText = (String) payload.get("rawText");

        CourseMaterial saved = courseMaterialService.uploadMaterial(teacher, subjectId, title, description, null, rawText);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Material '%s' processed into %d study chunks for AI RAG tutor.", saved.getTitle(), saved.getChunkCount()),
                saved
        ));
    }

    @GetMapping("/teacher/materials")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Get list of materials uploaded by current teacher")
    public ResponseEntity<ApiResponse<List<CourseMaterial>>> getMyMaterials(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<CourseMaterial> materials = courseMaterialService.getTeacherMaterials(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(materials));
    }

    @DeleteMapping("/teacher/materials/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Delete course material and its semantic chunks")
    public ResponseEntity<ApiResponse<String>> deleteMaterial(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        User requester = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        courseMaterialService.deleteMaterial(id, requester);
        return ResponseEntity.ok(ApiResponse.success("Course material and chunks deleted successfully"));
    }

    @GetMapping("/student/materials")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "List all available course materials for student reference")
    public ResponseEntity<ApiResponse<List<CourseMaterial>>> getAvailableMaterials() {
        List<CourseMaterial> materials = courseMaterialService.getAllMaterials();
        return ResponseEntity.ok(ApiResponse.success(materials));
    }

    @PostMapping("/student/materials/retrieve")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Retrieve top matching chunks for a question")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> retrievePassages(
            @RequestBody Map<String, Object> request) {
        String query = (String) request.get("query");
        @SuppressWarnings("unchecked")
        List<Number> subIds = (List<Number>) request.get("subjectIds");
        List<Long> subjectIds = subIds != null ? subIds.stream().map(Number::longValue).toList() : null;
        int topK = request.containsKey("topK") ? ((Number) request.get("topK")).intValue() : 3;

        List<Map<String, Object>> chunks = courseMaterialService.retrieveRelevantPassages(query, subjectIds, topK);
        return ResponseEntity.ok(ApiResponse.success(chunks));
    }

    @GetMapping({"/materials/{id}/file", "/student/materials/{id}/file", "/teacher/materials/{id}/file"})
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Stream or view course material document (PDF, DOCX, TXT)")
    public ResponseEntity<byte[]> getMaterialFile(@PathVariable Long id) {
        CourseMaterial material = courseMaterialService.getMaterialById(id);
        byte[] data = material.getFileData();
        if (data == null || data.length == 0) {
            String text = material.getTextContent() != null ? material.getTextContent() : "No document content available.";
            data = text.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        }

        String fileName = material.getFileName() != null ? material.getFileName() : "material.pdf";
        String contentType = "application/pdf";
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".txt") || "TXT".equalsIgnoreCase(material.getFileType())) {
            contentType = "text/plain";
        } else if (lower.endsWith(".docx")) {
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (lower.endsWith(".md")) {
            contentType = "text/markdown";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(data);
    }
}
