package com.edupulse.service;

import com.edupulse.entity.*;
import com.edupulse.exception.BadRequestException;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.exception.UnauthorizedException;
import com.edupulse.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final TopicMasteryRepository topicMasteryRepository;
    private final SubjectRepository subjectRepository;
    private final AttemptRepository attemptRepository;
    private final AiClientService aiClientService;
    private final CourseMaterialService courseMaterialService;
    private final ExamPaperAnalysisRepository examPaperAnalysisRepository;
    private final RecommendationService recommendationService;

    public ChatService(ChatSessionRepository chatSessionRepository,
                       ChatMessageRepository chatMessageRepository,
                       TopicMasteryRepository topicMasteryRepository,
                       SubjectRepository subjectRepository,
                       AttemptRepository attemptRepository,
                       AiClientService aiClientService,
                       CourseMaterialService courseMaterialService,
                       ExamPaperAnalysisRepository examPaperAnalysisRepository,
                       RecommendationService recommendationService) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.topicMasteryRepository = topicMasteryRepository;
        this.subjectRepository = subjectRepository;
        this.attemptRepository = attemptRepository;
        this.aiClientService = aiClientService;
        this.courseMaterialService = courseMaterialService;
        this.examPaperAnalysisRepository = examPaperAnalysisRepository;
        this.recommendationService = recommendationService;
    }

    @Transactional
    public ChatSession createSession(User student, String title) {
        ChatSession session = new ChatSession(student, title != null && !title.trim().isEmpty() ? title.trim() : "New Study Chat");
        return chatSessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public List<ChatSession> getStudentSessions(Long studentId) {
        return chatSessionRepository.findByStudentIdOrderByUpdatedAtDesc(studentId);
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getSessionMessages(Long sessionId, Long studentId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat session not found: " + sessionId));

        if (!session.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedException("You are not authorized to view another student's private chat messages.");
        }

        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @Transactional
    public void deleteSession(Long sessionId, Long studentId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat session not found: " + sessionId));

        if (!session.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedException("You are not authorized to delete another student's chat session.");
        }

        chatMessageRepository.deleteBySessionId(sessionId);
        chatSessionRepository.delete(session);
    }

    @Transactional
    public ChatMessage sendMessage(Long sessionId, User student, String userMessage) {
        return sendMessage(sessionId, student, userMessage, "EXPLANATORY", null);
    }

    @Transactional
    public ChatMessage sendMessage(Long sessionId, User student, String userMessage, String tutoringMode, Long subjectId) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            throw new BadRequestException("Message content cannot be empty.");
        }

        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat session not found: " + sessionId));

        if (!session.getStudent().getId().equals(student.getId())) {
            throw new UnauthorizedException("You are not authorized to interact with this chat session.");
        }

        // Rate limiting: max 60 queries in the last hour
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentCount = chatMessageRepository.countBySessionStudentIdAndCreatedAtAfter(student.getId(), oneHourAgo);
        if (recentCount >= 60) {
            throw new BadRequestException("Hourly rate limit reached (60 messages/hr). Please review your current notes and retry shortly.");
        }

        // 1. Save Student Message
        ChatMessage userMsg = new ChatMessage(session, ChatMessage.Role.USER, userMessage.trim());
        chatMessageRepository.save(userMsg);

        // 2. Prepare Authorized Personalized Student Context
        String personalizedContext = buildStudentContext(student);

        // 3. RAG Passage Retrieval from Authorized Teacher Course Materials
        List<Long> targetSubjectIds = new ArrayList<>();
        if (subjectId != null) {
            targetSubjectIds.add(subjectId);
        } else {
            List<TopicMastery> masteries = topicMasteryRepository.findByStudentId(student.getId());
            targetSubjectIds = masteries.stream()
                    .map(m -> m.getTopic().getSubject().getId())
                    .distinct()
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> retrievedChunks = Collections.emptyList();
        try {
            retrievedChunks = courseMaterialService.retrieveRelevantPassages(userMessage, targetSubjectIds, 3);
        } catch (Exception ex) {
            log.warn("RAG passage retrieval encountered non-fatal error: {}", ex.getMessage());
        }

        StringBuilder ragContext = new StringBuilder();
        StringBuilder citationsFooter = new StringBuilder();
        if (!retrievedChunks.isEmpty()) {
            ragContext.append("\nOFFICIAL COURSE MATERIALS (UPLOADED BY INSTRUCTORS):\n");
            citationsFooter.append("\n\n---\n**Referenced Course Notes:**\n");
            for (Map<String, Object> chunk : retrievedChunks) {
                String title = (String) chunk.get("materialTitle");
                String subjectName = (String) chunk.get("subjectName");
                int chunkIdx = (int) chunk.get("chunkIndex");
                String snippet = (String) chunk.get("snippet");

                ragContext.append(String.format("- [%s - %s (Section %d)]: %s\n\n", subjectName, title, chunkIdx, snippet));
                citationsFooter.append(String.format("- 📄 *%s* (%s, Section %d)\n", title, subjectName, chunkIdx));
            }
        }

        // 4. Build Bounded Conversation History (last 8 messages)
        List<ChatMessage> previousMessages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        StringBuilder conversationHistory = new StringBuilder();
        int startIndex = Math.max(0, previousMessages.size() - 8);
        for (int i = startIndex; i < previousMessages.size(); i++) {
            ChatMessage m = previousMessages.get(i);
            conversationHistory.append(m.getRole().name()).append(": ").append(m.getContent()).append("\n");
        }

        boolean isSocratic = "SOCRATIC".equalsIgnoreCase(tutoringMode);

        String systemPrompt = "You are J.A.R.V.I.S., EduPulse's dedicated adaptive AI academic tutor and study assistant.\n" +
                "You are helping " + student.getName() + ". Embody the polite, highly articulate, intelligent, and supportive demeanor of J.A.R.V.I.S. at the student's service.\n\n" +
                "STUDENT'S LIVE LEARNING CONTEXT:\n" +
                personalizedContext + "\n\n" +
                (ragContext.length() > 0 ? ragContext.toString() + "\n" : "") +
                "TUTORING MODE: " + (isSocratic ? "GUIDED PRACTICE WITH HINTS" : "DIRECT STEP-BY-STEP TEACHING & COMPLETE EXPLANATIONS") + "\n\n" +
                "INSTRUCTIONS:\n" +
                (isSocratic
                        ? "1. GUIDED PRACTICE METHOD: Give subtle conceptual hints and ask 1-2 guiding questions to help the student solve it themselves.\n" +
                          "2. Encourage reasoning through the prerequisite principles.\n"
                        : "1. DIRECT STEP-BY-STEP TEACHING: Provide direct, complete, and crystal-clear explanations. Give the full solution, breakdown formulas, provide code examples, explain underlying theory, and clarify mistakes directly so the student learns immediately without guesswork.\n") +
                "2. When relevant course materials are provided above, ground your answers in them and cite the lecture title.\n" +
                "3. Cite weak/strong topics from their learning profile when advising what to practice.\n" +
                "4. Never fabricate quiz scores or invent topics outside their syllabus.\n" +
                "5. Keep responses concise, formatted in clean Markdown with bullet points where helpful.";

        String fullPrompt = "Previous Conversation:\n" + conversationHistory + "\nStudent: " + userMessage;

        // 5. Execute AI Generation (Gemini -> Groq -> Ollama -> Offline Fallback)
        String aiReply = aiClientService.executePrompt(systemPrompt, fullPrompt);

        // Append citations footer if relevant materials were retrieved and not already in text
        if (citationsFooter.length() > 0 && !aiReply.contains("Referenced Course Notes")) {
            aiReply += citationsFooter.toString();
        }

        // 6. Save Assistant Message
        ChatMessage assistantMsg = new ChatMessage(session, ChatMessage.Role.ASSISTANT, aiReply);
        ChatMessage savedReply = chatMessageRepository.save(assistantMsg);

        // Update session timestamp & auto-title if first message
        session.setUpdatedAt(LocalDateTime.now());
        if ("New Study Chat".equals(session.getTitle())) {
            String autoTitle = userMessage.length() > 30 ? userMessage.substring(0, 27) + "..." : userMessage;
            session.setTitle(autoTitle);
        }
        chatSessionRepository.save(session);

        return savedReply;
    }

    private String buildStudentContext(User student) {
        StringBuilder sb = new StringBuilder();
        sb.append("=== COMPACT STUDENT LEARNING PROFILE ===\n");
        sb.append("- Student: ").append(student.getName()).append(" (ID: ").append(student.getId()).append(")\n");

        List<TopicMastery> masteries = topicMasteryRepository.findByStudentId(student.getId());
        List<String> weakTopics = masteries.stream()
                .filter(m -> m.getPKnown() < AktService.WEAK_TOPIC_THRESHOLD)
                .map(m -> m.getTopic().getName() + " (" + Math.round(m.getPKnown() * 100) + "% mastery)")
                .collect(Collectors.toList());

        List<String> strongTopics = masteries.stream()
                .filter(m -> m.getPKnown() >= AktService.STRONG_TOPIC_THRESHOLD)
                .map(m -> m.getTopic().getName() + " (" + Math.round(m.getPKnown() * 100) + "% mastery)")
                .collect(Collectors.toList());

        sb.append("- Demonstrated Strengths: ").append(strongTopics.isEmpty() ? "Establishing baseline" : String.join(", ", strongTopics)).append("\n");
        sb.append("- Focus Needed Areas (<60%): ").append(weakTopics.isEmpty() ? "None flagged" : String.join(", ", weakTopics)).append("\n");

        // Exam Paper Mistake attribution
        try {
            List<ExamPaperAnalysis> exams = examPaperAnalysisRepository.findByStudentIdOrderByUploadedAtDesc(student.getId());
            if (!exams.isEmpty()) {
                ExamPaperAnalysis latestExam = exams.get(0);
                sb.append("- Latest Evaluated Exam: '").append(latestExam.getExamTitle()).append("' (Score: ").append(Math.round(latestExam.getPercentage())).append("%)\n");
                if (latestExam.getWeakTopicsJson() != null && !latestExam.getWeakTopicsJson().isBlank()) {
                    sb.append("  * Diagnosed Exam Deficits: ").append(latestExam.getWeakTopicsJson()).append("\n");
                }
            }
        } catch (Exception ignored) {}

        // Active recommendations
        try {
            List<RecommendationRecord> recs = recommendationService.getStudentRecommendations(student.getId());
            if (!recs.isEmpty()) {
                sb.append("- Current Action Plan:\n");
                for (int i = 0; i < Math.min(3, recs.size()); i++) {
                    RecommendationRecord r = recs.get(i);
                    sb.append("  ").append(i + 1).append(". [").append(r.getRecommendationType()).append("] ")
                      .append(r.getTopic() != null ? r.getTopic().getName() : "Topic")
                      .append(": ").append(r.getNextStepAction()).append("\n");
                }
            }
        } catch (Exception ignored) {}

        sb.append("========================================\n");
        return sb.toString();
    }
}
