package com.edupulse.service;

import com.edupulse.entity.*;
import com.edupulse.exception.BadRequestException;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.exception.UnauthorizedException;
import com.edupulse.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final TopicMasteryRepository topicMasteryRepository;
    private final SubjectRepository subjectRepository;
    private final AttemptRepository attemptRepository;
    private final AiClientService aiClientService;

    public ChatService(ChatSessionRepository chatSessionRepository,
                       ChatMessageRepository chatMessageRepository,
                       TopicMasteryRepository topicMasteryRepository,
                       SubjectRepository subjectRepository,
                       AttemptRepository attemptRepository,
                       AiClientService aiClientService) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.topicMasteryRepository = topicMasteryRepository;
        this.subjectRepository = subjectRepository;
        this.attemptRepository = attemptRepository;
        this.aiClientService = aiClientService;
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
        if (userMessage == null || userMessage.trim().isEmpty()) {
            throw new BadRequestException("Message content cannot be empty.");
        }

        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat session not found: " + sessionId));

        if (!session.getStudent().getId().equals(student.getId())) {
            throw new UnauthorizedException("You are not authorized to interact with this chat session.");
        }

        // 1. Save Student Message
        ChatMessage userMsg = new ChatMessage(session, ChatMessage.Role.USER, userMessage.trim());
        chatMessageRepository.save(userMsg);

        // 2. Prepare Authorized Personalized Student Context
        String personalizedContext = buildStudentContext(student);

        // 3. Build Bounded Conversation History (last 8 messages)
        List<ChatMessage> previousMessages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        StringBuilder conversationHistory = new StringBuilder();
        int startIndex = Math.max(0, previousMessages.size() - 8);
        for (int i = startIndex; i < previousMessages.size(); i++) {
            ChatMessage m = previousMessages.get(i);
            conversationHistory.append(m.getRole().name()).append(": ").append(m.getContent()).append("\n");
        }

        String systemPrompt = "You are EduPulse's AI Study Assistant, a dedicated academic tutor.\n" +
                "You are helping " + student.getName() + ".\n\n" +
                "STUDENT'S LIVE LEARNING CONTEXT:\n" +
                personalizedContext + "\n\n" +
                "TUTORING INSTRUCTIONS:\n" +
                "1. Address student questions with pedagogical clarity, encouraging tone, and clear conceptual explanations.\n" +
                "2. When discussing their performance, cite their actual mastery and weak topics from the context above.\n" +
                "3. Never fabricate quiz scores or invent topics that are not in their profile.\n" +
                "4. Suggest practical study steps and practice strategies for their weak areas.\n" +
                "5. Keep responses concise, structured with Markdown headings and bullet points where helpful.";

        String fullPrompt = "Previous Conversation:\n" + conversationHistory + "\nStudent: " + userMessage;

        // 4. Execute AI Generation (Gemini -> Groq -> Ollama -> Offline Fallback)
        String aiReply = aiClientService.executePrompt(systemPrompt, fullPrompt);

        // 5. Save Assistant Message
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
        sb.append("- Student Name: ").append(student.getName()).append(" (Email: ").append(student.getEmail()).append(")\n");

        List<TopicMastery> masteries = topicMasteryRepository.findByStudentId(student.getId());
        List<String> weakTopics = masteries.stream()
                .filter(m -> m.getPKnown() < BktService.WEAK_TOPIC_THRESHOLD)
                .map(m -> m.getTopic().getName() + " (Mastery: " + String.format("%.2f", m.getPKnown()) + ")")
                .collect(Collectors.toList());

        List<String> strongTopics = masteries.stream()
                .filter(m -> m.getPKnown() >= BktService.STRONG_TOPIC_THRESHOLD)
                .map(m -> m.getTopic().getName() + " (Mastery: " + String.format("%.2f", m.getPKnown()) + ")")
                .collect(Collectors.toList());

        sb.append("- Identified Weak Topics (<0.50): ").append(weakTopics.isEmpty() ? "None detected" : String.join(", ", weakTopics)).append("\n");
        sb.append("- Strong Topics (>=0.80): ").append(strongTopics.isEmpty() ? "In progress" : String.join(", ", strongTopics)).append("\n");

        List<Attempt> recentAttempts = attemptRepository.findByStudentIdOrderByStartedAtDesc(student.getId());
        if (!recentAttempts.isEmpty()) {
            Attempt last = recentAttempts.get(0);
            sb.append("- Most Recent Quiz Attempt: '").append(last.getQuiz().getTitle())
              .append("' - Score: ").append(last.getScore()).append("% (Status: ").append(last.getStatus()).append(")\n");
        }

        return sb.toString();
    }
}
