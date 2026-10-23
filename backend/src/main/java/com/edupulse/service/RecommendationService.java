package com.edupulse.service;

import com.edupulse.entity.*;
import com.edupulse.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private final TopicMasteryRepository topicMasteryRepository;
    private final TopicRepository topicRepository;
    private final RecommendationRecordRepository recommendationRecordRepository;
    private final UserRepository userRepository;
    private final ExamPaperAnalysisRepository examPaperAnalysisRepository;
    private final CourseMaterialRepository courseMaterialRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final ObjectMapper objectMapper;

    public RecommendationService(TopicMasteryRepository topicMasteryRepository,
                                 TopicRepository topicRepository,
                                 RecommendationRecordRepository recommendationRecordRepository,
                                 UserRepository userRepository,
                                 ExamPaperAnalysisRepository examPaperAnalysisRepository,
                                 CourseMaterialRepository courseMaterialRepository,
                                 AttemptAnswerRepository attemptAnswerRepository,
                                 ObjectMapper objectMapper) {
        this.topicMasteryRepository = topicMasteryRepository;
        this.topicRepository = topicRepository;
        this.recommendationRecordRepository = recommendationRecordRepository;
        this.userRepository = userRepository;
        this.examPaperAnalysisRepository = examPaperAnalysisRepository;
        this.courseMaterialRepository = courseMaterialRepository;
        this.attemptAnswerRepository = attemptAnswerRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Generates a structured, pedagogical learning roadmap tailored to the student's exact situation:
     * - Unassessed / never learned -> LEARN_BASICS (Read lecture notes)
     * - Exam mistake / misconception -> REVIEW_MISCONCEPTION (Resolve misconception & worked solutions)
     * - Prerequisite deficit -> REVIEW_PREREQUISITE (Foundational review)
     * - Basics understood but mistakes -> PRACTICE_WORKED_EXAMPLE (Worked examples + practice)
     * - Mastered but time decay -> SPACED_REVISION (5-min refresher)
     * - High mastery -> CHALLENGE_TOPIC (Advanced problem sets)
     */
    @Transactional
    public List<RecommendationRecord> generateRecommendationsForStudent(Long studentId) {
        User student = userRepository.findById(studentId).orElse(null);
        if (student == null) return List.of();

        // 1. Remove obsolete recommendations for a fresh, deduplicated learning plan
        try {
            recommendationRecordRepository.deleteByStudentId(studentId);
        } catch (Exception ex) {
            log.warn("Could not clear previous recommendations for student {}: {}", studentId, ex.getMessage());
        }

        List<Topic> allTopics = topicRepository.findAll();
        List<TopicMastery> masteries = topicMasteryRepository.findByStudentId(studentId);
        Map<Long, TopicMastery> masteryMap = new HashMap<>();
        for (TopicMastery tm : masteries) {
            if (tm.getTopic() != null) {
                masteryMap.put(tm.getTopic().getId(), tm);
            }
        }

        // Cache available course materials by subject ID so we only recommend real, existing resources
        Map<Long, List<CourseMaterial>> materialsBySubject = new HashMap<>();
        try {
            List<CourseMaterial> allMaterials = courseMaterialRepository.findAll();
            for (CourseMaterial cm : allMaterials) {
                if (cm.getSubject() != null) {
                    materialsBySubject.computeIfAbsent(cm.getSubject().getId(), k -> new ArrayList<>()).add(cm);
                }
            }
        } catch (Exception ex) {
            log.warn("Could not preload course materials: {}", ex.getMessage());
        }

        // Collect recent exam weaknesses
        Set<String> examWeakTopicNames = new HashSet<>();
        try {
            List<ExamPaperAnalysis> exams = examPaperAnalysisRepository.findByStudentIdOrderByUploadedAtDesc(studentId);
            for (ExamPaperAnalysis exam : exams) {
                if (exam.getWeakTopicsJson() != null && !exam.getWeakTopicsJson().isBlank()) {
                    List<String> wList = objectMapper.readValue(exam.getWeakTopicsJson(), new TypeReference<List<String>>() {});
                    if (wList != null) {
                        for (String w : wList) {
                            if (w != null) examWeakTopicNames.add(w.trim().toLowerCase());
                        }
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Could not load exam paper weaknesses: {}", ex.getMessage());
        }

        List<RecommendationRecord> recList = new ArrayList<>();
        Set<Long> processedTopicIds = new HashSet<>();
        LocalDateTime now = LocalDateTime.now();

        // SCENARIO 0: Zero historical activity -> Welcome diagnostic assessment
        if (masteries.isEmpty()) {
            Topic startingTopic = allTopics.isEmpty() ? null : allTopics.get(0);
            if (startingTopic != null) {
                String resourceTitle = findResourceTitle(startingTopic, materialsBySubject);
                String resourceLink = startingTopic.getSubject() != null
                        ? "/student/materials?subjectId=" + startingTopic.getSubject().getId()
                        : "/student/materials";

                RecommendationRecord diagRec = new RecommendationRecord(
                        student,
                        startingTopic,
                        RecommendationRecord.Type.LEARN_BASICS,
                        "Initial diagnostic assessment needed to identify baseline knowledge.",
                        "Welcome to EduPulse! Take a quick 5-question baseline assessment in '" + startingTopic.getName() + "' so our Attentive Knowledge Tracing engine can personalize your learning path.",
                        "Start your 5-question baseline assessment.",
                        10,
                        "DIAGNOSTIC_QUIZ",
                        resourceTitle,
                        resourceLink
                );
                recList.add(recommendationRecordRepository.save(diagRec));
            }
            return recList;
        }

        // SCENARIO 1: Exam Misconceptions & Question Mistakes (REVIEW_MISCONCEPTION)
        for (Topic topic : allTopics) {
            if (processedTopicIds.contains(topic.getId())) continue;
            String normName = topic.getName().trim().toLowerCase();
            boolean isExamWeak = examWeakTopicNames.stream().anyMatch(w -> w.contains(normName) || normName.contains(w));

            if (isExamWeak) {
                String resourceTitle = findResourceTitle(topic, materialsBySubject);
                String jarvisUrl = "/student/assistant?topic=" + URLEncoder.encode(topic.getName(), StandardCharsets.UTF_8)
                        + "&prompt=" + URLEncoder.encode("Explain the key concepts and common exam mistakes in " + topic.getName(), StandardCharsets.UTF_8);

                RecommendationRecord rec = new RecommendationRecord(
                        student,
                        topic,
                        RecommendationRecord.Type.REVIEW_MISCONCEPTION,
                        "Diagnosed mark deductions and conceptual errors on recent evaluated exam papers.",
                        String.format("In your recent examination, you lost marks on questions related to '%s'. Review the AI misconception breakdown and study the step-by-step solution to ensure you do not repeat this mistake.", topic.getName()),
                        "Review AI misconception breakdown in Jarvis and re-solve the question.",
                        15,
                        "REVISE_MISCONCEPTION",
                        resourceTitle,
                        jarvisUrl
                );
                recList.add(recommendationRecordRepository.save(rec));
                processedTopicIds.add(topic.getId());
                if (recList.size() >= 5) break;
            }
        }

        // SCENARIO 2: Prerequisite Blockers (REVIEW_PREREQUISITE)
        for (TopicMastery tm : masteries) {
            Topic topic = tm.getTopic();
            if (topic == null || topic.getPrerequisiteTopic() == null) continue;

            Topic prereq = topic.getPrerequisiteTopic();
            if (processedTopicIds.contains(prereq.getId())) continue;

            TopicMastery prereqMastery = masteryMap.get(prereq.getId());
            double prereqP = prereqMastery != null && prereqMastery.getPKnown() != null ? prereqMastery.getPKnown() : 0.0;

            if (prereqP < AktService.WEAK_TOPIC_THRESHOLD) {
                String resourceTitle = findResourceTitle(prereq, materialsBySubject);
                String resourceLink = prereq.getSubject() != null
                        ? "/student/materials?subjectId=" + prereq.getSubject().getId()
                        : "/student/materials";

                String evidence = String.format("Prerequisite concept mastery is currently at %d%%.", Math.round(prereqP * 100));
                String explanation = String.format(
                        "We recommend reviewing '%s' first because it provides the foundational principles needed to understand '%s'.",
                        prereq.getName(), topic.getName());
                String action = "Read prerequisite lecture notes, then complete 5 quick verification questions.";

                RecommendationRecord rec = new RecommendationRecord(
                        student,
                        prereq,
                        RecommendationRecord.Type.REVIEW_PREREQUISITE,
                        evidence,
                        explanation,
                        action,
                        15,
                        "READ_NOTES",
                        resourceTitle,
                        resourceLink
                );
                recList.add(recommendationRecordRepository.save(rec));
                processedTopicIds.add(prereq.getId());
                if (recList.size() >= 5) break;
            }
        }

        // SCENARIO 3: Understands Basics but Makes Mistakes (PRACTICE_WORKED_EXAMPLE)
        for (TopicMastery tm : masteries) {
            Topic topic = tm.getTopic();
            if (topic == null || processedTopicIds.contains(topic.getId())) continue;

            double p = tm.getPKnown() != null ? tm.getPKnown() : 0.50;
            double acc = tm.getAccuracy() != null ? tm.getAccuracy() : 0.0;
            int attempts = tm.getAttemptsCount() != null ? tm.getAttemptsCount() : 0;

            if (attempts > 0 && acc >= 35.0 && acc < 65.0) {
                String resourceTitle = findResourceTitle(topic, materialsBySubject);
                String jarvisUrl = "/student/assistant?topic=" + URLEncoder.encode(topic.getName(), StandardCharsets.UTF_8);

                String evidence = String.format("Understanding of basics is established, but accuracy is %d%% across %d attempts.",
                        Math.round(acc), attempts);
                String explanation = String.format(
                        "You understand the fundamentals of '%s', but occasional errors show that studying a guided worked example will help sharpen your problem-solving.",
                        topic.getName());
                String action = "Walk through a step-by-step worked example in Jarvis, then try 5 practice problems.";

                RecommendationRecord rec = new RecommendationRecord(
                        student,
                        topic,
                        RecommendationRecord.Type.PRACTICE_WORKED_EXAMPLE,
                        evidence,
                        explanation,
                        action,
                        15,
                        "WORKED_EXAMPLE",
                        resourceTitle,
                        jarvisUrl
                );
                recList.add(recommendationRecordRepository.save(rec));
                processedTopicIds.add(topic.getId());
                if (recList.size() >= 5) break;
            }
        }

        // SCENARIO 4: General Focus on Weak Topics (PRACTICE_WEAK_TOPIC)
        for (TopicMastery tm : masteries) {
            Topic topic = tm.getTopic();
            if (topic == null || processedTopicIds.contains(topic.getId())) continue;

            double p = tm.getPKnown() != null ? tm.getPKnown() : 0.50;
            double acc = tm.getAccuracy() != null ? tm.getAccuracy() : 0.0;
            int attempts = tm.getAttemptsCount() != null ? tm.getAttemptsCount() : 0;

            if (p < AktService.WEAK_TOPIC_THRESHOLD || (attempts > 0 && acc < 40.0)) {
                String resourceTitle = findResourceTitle(topic, materialsBySubject);
                String resourceLink = topic.getSubject() != null
                        ? "/student/materials?subjectId=" + topic.getSubject().getId()
                        : "/student/materials";

                String evidence = String.format("Current concept mastery is at %d%%.", Math.round(p * 100));
                String explanation = String.format(
                        "Recent assessments indicate '%s' requires focused revision to build strong procedural confidence.",
                        topic.getName());
                String action = "Review key principles in course lecture slides, then complete a practice quiz.";

                RecommendationRecord rec = new RecommendationRecord(
                        student,
                        topic,
                        RecommendationRecord.Type.PRACTICE_WEAK_TOPIC,
                        evidence,
                        explanation,
                        action,
                        15,
                        "PRACTICE_QUIZ",
                        resourceTitle,
                        resourceLink
                );
                recList.add(recommendationRecordRepository.save(rec));
                processedTopicIds.add(topic.getId());
                if (recList.size() >= 5) break;
            }
        }

        // SCENARIO 5: Memory Decay on Previously Mastered Topics (SPACED_REVISION)
        for (TopicMastery tm : masteries) {
            Topic topic = tm.getTopic();
            if (topic == null || processedTopicIds.contains(topic.getId())) continue;

            double p = tm.getPKnown() != null ? tm.getPKnown() : 0.0;
            LocalDateTime lastUpdated = tm.getUpdatedAt() != null ? tm.getUpdatedAt() : now;
            long daysSince = Duration.between(lastUpdated, now).toDays();

            if (p >= AktService.STRONG_TOPIC_THRESHOLD && daysSince >= 7) {
                String evidence = String.format("Last practiced %d days ago. Ebbinghaus memory curve indicates potential retention decay.", daysSince);
                String explanation = String.format(
                        "You mastered '%s' previously, but haven't revisited it in over a week. A quick 5-minute refresher ensures your knowledge stays sharp.",
                        topic.getName());
                String action = "Complete a quick 5-minute refresher check to reinforce long-term memory retention.";

                RecommendationRecord rec = new RecommendationRecord(
                        student,
                        topic,
                        RecommendationRecord.Type.SPACED_REVISION,
                        evidence,
                        explanation,
                        action,
                        10,
                        "SPACED_QUIZ",
                        "5-Minute Spaced Retrieval Quiz",
                        "/student/quizzes"
                );
                recList.add(recommendationRecordRepository.save(rec));
                processedTopicIds.add(topic.getId());
                if (recList.size() >= 5) break;
            }
        }

        // SCENARIO 6: Unassessed Syllabus Topics (LEARN_BASICS)
        for (Topic topic : allTopics) {
            if (processedTopicIds.contains(topic.getId())) continue;

            if (!masteryMap.containsKey(topic.getId())) {
                String resourceTitle = findResourceTitle(topic, materialsBySubject);
                String resourceLink = topic.getSubject() != null
                        ? "/student/materials?subjectId=" + topic.getSubject().getId()
                        : "/student/materials";

                String explanation = String.format(
                        "You have not yet started '%s'. We recommend reading the introductory lecture notes before attempting your first quiz.",
                        topic.getName());
                String action = "Read introductory course notes in Course Materials.";

                RecommendationRecord rec = new RecommendationRecord(
                        student,
                        topic,
                        RecommendationRecord.Type.LEARN_BASICS,
                        "Syllabus topic has not yet been assessed.",
                        explanation,
                        action,
                        15,
                        "READ_NOTES",
                        resourceTitle,
                        resourceLink
                );
                recList.add(recommendationRecordRepository.save(rec));
                processedTopicIds.add(topic.getId());
                if (recList.size() >= 5) break;
            }
        }

        // SCENARIO 7: High Mastery Challenges (CHALLENGE_TOPIC)
        for (TopicMastery tm : masteries) {
            Topic topic = tm.getTopic();
            if (topic == null || processedTopicIds.contains(topic.getId())) continue;

            double p = tm.getPKnown() != null ? tm.getPKnown() : 0.0;
            double acc = tm.getAccuracy() != null ? tm.getAccuracy() : 0.0;

            if (p >= AktService.STRONG_TOPIC_THRESHOLD && acc >= 75.0) {
                String evidence = String.format("Demonstrated strong concept mastery (%d%%) with %d%% accuracy.",
                        Math.round(p * 100), Math.round(acc));
                String explanation = String.format(
                        "You have thoroughly mastered '%s'. You are ready to tackle advanced problem sets and challenging algorithmic depth questions.",
                        topic.getName());
                String action = "Attempt an advanced problem set to test your problem-solving depth.";

                RecommendationRecord rec = new RecommendationRecord(
                        student,
                        topic,
                        RecommendationRecord.Type.CHALLENGE_TOPIC,
                        evidence,
                        explanation,
                        action,
                        20,
                        "ADVANCED_DRILL",
                        "Advanced Problem Set",
                        "/student/quizzes"
                );
                recList.add(recommendationRecordRepository.save(rec));
                processedTopicIds.add(topic.getId());
                if (recList.size() >= 5) break;
            }
        }

        return recList;
    }

    /**
     * Looks up real course material titles uploaded by faculty for the topic's subject.
     * Prevents recommending non-existent resources.
     */
    private String findResourceTitle(Topic topic, Map<Long, List<CourseMaterial>> materialsBySubject) {
        if (topic.getSubject() != null && materialsBySubject.containsKey(topic.getSubject().getId())) {
            List<CourseMaterial> materials = materialsBySubject.get(topic.getSubject().getId());
            for (CourseMaterial cm : materials) {
                if (cm.getTitle().toLowerCase().contains(topic.getName().toLowerCase())
                        || topic.getName().toLowerCase().contains(cm.getTitle().toLowerCase())) {
                    return "Lecture Notes: " + cm.getTitle();
                }
            }
            if (!materials.isEmpty()) {
                return "Lecture Notes: " + materials.get(0).getTitle();
            }
        }
        return "Faculty Syllabus: " + (topic.getSubject() != null ? topic.getSubject().getName() : "Course Notes");
    }

    /**
     * Retrieves cached recommendations from database without triggering redundant LLM calls.
     */
    @Transactional(readOnly = true)
    public List<RecommendationRecord> getStudentRecommendations(Long studentId) {
        List<RecommendationRecord> records = recommendationRecordRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        if (records.isEmpty()) {
            return generateRecommendationsForStudent(studentId);
        }

        // Deduplicate by topic ID keeping the most recent one
        Map<Long, RecommendationRecord> uniqueByTopic = new LinkedHashMap<>();
        for (RecommendationRecord r : records) {
            if (r.getTopic() != null && !uniqueByTopic.containsKey(r.getTopic().getId())) {
                uniqueByTopic.put(r.getTopic().getId(), r);
            }
        }
        return new ArrayList<>(uniqueByTopic.values());
    }
}
