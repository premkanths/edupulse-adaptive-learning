package com.edupulse.service;

import com.edupulse.entity.*;
import com.edupulse.exception.BadRequestException;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.exception.UnauthorizedException;
import com.edupulse.repository.CourseMaterialRepository;
import com.edupulse.repository.MaterialChunkRepository;
import com.edupulse.repository.SubjectRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class CourseMaterialService {

    private static final Logger log = LoggerFactory.getLogger(CourseMaterialService.class);

    private final CourseMaterialRepository courseMaterialRepository;
    private final MaterialChunkRepository materialChunkRepository;
    private final SubjectRepository subjectRepository;
    private final RestClient restClient;

    @Value("${ml.service.url:http://127.0.0.1:8001}")
    private String mlServiceUrl;

    public CourseMaterialService(CourseMaterialRepository courseMaterialRepository,
                                 MaterialChunkRepository materialChunkRepository,
                                 SubjectRepository subjectRepository) {
        this.courseMaterialRepository = courseMaterialRepository;
        this.materialChunkRepository = materialChunkRepository;
        this.subjectRepository = subjectRepository;
        this.restClient = RestClient.builder().build();
    }

    @Transactional
    public CourseMaterial uploadMaterial(User teacher, Long subjectId, String title, String description,
                                         MultipartFile file, String rawText) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + subjectId));

        String extractedText = "";
        String fileName = "notes.txt";
        String fileType = "TXT";

        if (file != null && !file.isEmpty()) {
            fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
            String lowerName = fileName.toLowerCase();

            try (InputStream is = file.getInputStream()) {
                if (lowerName.endsWith(".pdf")) {
                    fileType = "PDF";
                    try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                        PDFTextStripper stripper = new PDFTextStripper();
                        extractedText = stripper.getText(document);
                    }
                } else if (lowerName.endsWith(".docx")) {
                    fileType = "DOCX";
                    try (XWPFDocument doc = new XWPFDocument(is)) {
                        StringBuilder sb = new StringBuilder();
                        for (XWPFParagraph p : doc.getParagraphs()) {
                            sb.append(p.getText()).append("\n");
                        }
                        extractedText = sb.toString();
                    }
                } else if (lowerName.endsWith(".txt") || lowerName.endsWith(".md") || lowerName.endsWith(".csv")) {
                    fileType = lowerName.endsWith(".md") ? "MD" : "TXT";
                    extractedText = new String(file.getBytes(), StandardCharsets.UTF_8);
                } else {
                    throw new BadRequestException("Unsupported file format. Please upload PDF, DOCX, TXT, or MD documents.");
                }
            } catch (BadRequestException bre) {
                throw bre;
            } catch (Exception ex) {
                log.error("Failed to extract text from {}: {}", fileName, ex.getMessage());
                throw new BadRequestException("Failed to read document text: " + ex.getMessage());
            }
        } else if (rawText != null && !rawText.trim().isEmpty()) {
            extractedText = rawText.trim();
            fileName = "raw_input.txt";
            fileType = "TXT";
        } else {
            throw new BadRequestException("Please provide a valid document file or text content.");
        }

        if (extractedText == null || extractedText.trim().length() < 10) {
            throw new BadRequestException("Document content is empty or contains insufficient readable text.");
        }

        // Sanitize untrusted content (remove script tags or null bytes)
        extractedText = sanitizeText(extractedText);

        CourseMaterial material = new CourseMaterial(
                title != null && !title.trim().isEmpty() ? title.trim() : fileName,
                description,
                subject,
                teacher,
                fileName,
                fileType,
                extractedText
        );

        CourseMaterial saved = courseMaterialRepository.save(material);

        // Chunking: 250 words per chunk with 50 words overlap
        List<String> textChunks = chunkText(extractedText, 250, 50);
        int index = 1;
        for (String chunkStr : textChunks) {
            int words = countWords(chunkStr);
            MaterialChunk chunk = new MaterialChunk(saved, index++, chunkStr, words);
            materialChunkRepository.save(chunk);
        }

        saved.setChunkCount(textChunks.size());
        return courseMaterialRepository.save(saved);
    }

    @Transactional(readOnly = true)
    public List<CourseMaterial> getTeacherMaterials(Long teacherId) {
        return courseMaterialRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);
    }

    @Transactional(readOnly = true)
    public List<CourseMaterial> getSubjectMaterials(Long subjectId) {
        return courseMaterialRepository.findBySubjectIdOrderByCreatedAtDesc(subjectId);
    }

    @Transactional(readOnly = true)
    public List<CourseMaterial> getAllMaterials() {
        return courseMaterialRepository.findAll();
    }

    @Transactional
    public void deleteMaterial(Long materialId, User requester) {
        CourseMaterial material = courseMaterialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Course material not found: " + materialId));

        if (!requester.getRole().name().equals("ADMIN") && !material.getTeacher().getId().equals(requester.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this course material.");
        }

        materialChunkRepository.deleteByMaterialId(materialId);
        courseMaterialRepository.delete(material);
        log.info("Deleted course material {} ({})", materialId, material.getTitle());
    }

    /**
     * RAG Retrieval: Finds top matching chunks relevant to a student question
     * strictly isolated to the given subjectIds.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> retrieveRelevantPassages(String query, List<Long> subjectIds, int topK) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        List<MaterialChunk> candidateChunks;
        if (subjectIds != null && !subjectIds.isEmpty()) {
            candidateChunks = materialChunkRepository.findBySubjectIds(subjectIds);
        } else {
            candidateChunks = materialChunkRepository.findAll();
        }

        if (candidateChunks.isEmpty()) {
            return Collections.emptyList();
        }

        // Tokenize query
        List<String> queryTokens = tokenize(query);
        if (queryTokens.isEmpty()) {
            return Collections.emptyList();
        }

        // BM25/TF-IDF scoring
        List<ScoredChunk> scored = new ArrayList<>();
        for (MaterialChunk chunk : candidateChunks) {
            double score = scoreChunk(queryTokens, chunk.getContent());
            if (score > 0.05) {
                scored.add(new ScoredChunk(chunk, score));
            }
        }

        scored.sort((a, b) -> Double.compare(b.score, a.score));

        int limit = Math.min(topK > 0 ? topK : 3, scored.size());
        List<Map<String, Object>> results = new ArrayList<>();

        for (int i = 0; i < limit; i++) {
            ScoredChunk sc = scored.get(i);
            MaterialChunk c = sc.chunk;
            CourseMaterial m = c.getMaterial();

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("materialId", m.getId());
            map.put("materialTitle", m.getTitle());
            map.put("subjectName", m.getSubject().getName());
            map.put("chunkIndex", c.getChunkIndex());
            map.put("snippet", truncateSnippet(c.getContent(), 350));
            map.put("fullText", c.getContent());
            map.put("similarityScore", Math.round(sc.score * 100.0) / 100.0);
            results.add(map);
        }

        return results;
    }

    private static class ScoredChunk {
        MaterialChunk chunk;
        double score;
        ScoredChunk(MaterialChunk chunk, double score) {
            this.chunk = chunk;
            this.score = score;
        }
    }

    private double scoreChunk(List<String> queryTokens, String chunkText) {
        if (chunkText == null) return 0.0;
        String lowerChunk = chunkText.toLowerCase();
        double matches = 0.0;

        for (String token : queryTokens) {
            if (lowerChunk.contains(token)) {
                // Exact substring or whole word bonus
                matches += 1.0;
                if (Pattern.compile("\\b" + Pattern.quote(token) + "\\b").matcher(lowerChunk).find()) {
                    matches += 0.5;
                }
            }
        }

        if (matches == 0.0) return 0.0;
        double tokenRatio = matches / (double) queryTokens.size();
        double lengthPenalty = Math.log(1.0 + chunkText.length() / 200.0);
        return tokenRatio / (lengthPenalty > 0 ? lengthPenalty : 1.0);
    }

    private List<String> tokenize(String text) {
        Set<String> stopwords = Set.of("the", "is", "at", "which", "on", "and", "a", "an", "in", "to", "for", "of", "with", "as", "by", "what", "how", "why", "when", "can", "you", "tell", "me", "about");
        return Arrays.stream(text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").split("\\s+"))
                .map(String::trim)
                .filter(t -> t.length() > 2 && !stopwords.contains(t))
                .distinct()
                .collect(Collectors.toList());
    }

    private List<String> chunkText(String text, int targetWords, int overlapWords) {
        String[] words = text.split("\\s+");
        List<String> chunks = new ArrayList<>();
        if (words.length <= targetWords) {
            chunks.add(text.trim());
            return chunks;
        }

        int start = 0;
        while (start < words.length) {
            int end = Math.min(start + targetWords, words.length);
            StringBuilder sb = new StringBuilder();
            for (int i = start; i < end; i++) {
                sb.append(words[i]).append(" ");
            }
            chunks.add(sb.toString().trim());
            if (end == words.length) break;
            start += (targetWords - overlapWords);
        }
        return chunks;
    }

    private int countWords(String s) {
        if (s == null || s.trim().isEmpty()) return 0;
        return s.trim().split("\\s+").length;
    }

    private String sanitizeText(String text) {
        return text.replace("\u0000", "").replaceAll("<script.*?</script>", "");
    }

    private String truncateSnippet(String text, int maxChars) {
        if (text == null) return "";
        if (text.length() <= maxChars) return text;
        return text.substring(0, maxChars).trim() + "...";
    }
}
