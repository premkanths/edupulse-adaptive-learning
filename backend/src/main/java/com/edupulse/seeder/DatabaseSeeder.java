package com.edupulse.seeder;

import com.edupulse.entity.*;
import com.edupulse.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAssignmentRepository quizAssignmentRepository;
    private final TopicMasteryRepository topicMasteryRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ExamPaperAnalysisRepository examPaperAnalysisRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public DatabaseSeeder(UserRepository userRepository,
                          ClassRepository classRepository,
                          SubjectRepository subjectRepository,
                          TopicRepository topicRepository,
                          QuestionRepository questionRepository,
                          QuizRepository quizRepository,
                          QuizQuestionRepository quizQuestionRepository,
                          QuizAssignmentRepository quizAssignmentRepository,
                          TopicMasteryRepository topicMasteryRepository,
                          ChatSessionRepository chatSessionRepository,
                          ChatMessageRepository chatMessageRepository,
                          ExamPaperAnalysisRepository examPaperAnalysisRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.classRepository = classRepository;
        this.subjectRepository = subjectRepository;
        this.topicRepository = topicRepository;
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.quizAssignmentRepository = quizAssignmentRepository;
        this.topicMasteryRepository = topicMasteryRepository;
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.examPaperAnalysisRepository = examPaperAnalysisRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (questionRepository.count() > 50) {
            logger.info("Database already seeded with comprehensive academic data. Skipping seeder.");
            return;
        }

        logger.info("Initializing EduPulse Comprehensive Academic Data & Question Bank (~150 Questions)...");

        String defaultHashedPassword = passwordEncoder.encode("Password@123");

        // 1. Seed or retrieve Users
        User admin = userRepository.findByEmail("admin@edupulse.local")
                .orElseGet(() -> userRepository.save(new User("Dr. Robert Vance (Admin)", "admin@edupulse.local", defaultHashedPassword, Role.ADMIN)));

        User teacher1 = userRepository.findByEmail("teacher.sarah@edupulse.local")
                .orElseGet(() -> userRepository.save(new User("Prof. Sarah Connor", "teacher.sarah@edupulse.local", defaultHashedPassword, Role.TEACHER)));

        User teacher2 = userRepository.findByEmail("teacher.alan@edupulse.local")
                .orElseGet(() -> userRepository.save(new User("Prof. Alan Turing", "teacher.alan@edupulse.local", defaultHashedPassword, Role.TEACHER)));

        String[][] studentData = {
                {"Aarav Sharma", "student1@edupulse.local"},
                {"Ananya Patel", "student2@edupulse.local"},
                {"Rohan Gupta", "student3@edupulse.local"},
                {"Priya Nair", "student4@edupulse.local"},
                {"Karthik Raja", "student5@edupulse.local"},
                {"Meera Sen", "student6@edupulse.local"},
                {"Vikram Joshi", "student7@edupulse.local"},
                {"Neha Verma", "student8@edupulse.local"},
                {"Rahul Das", "student9@edupulse.local"},
                {"Divya Reddy", "student10@edupulse.local"}
        };

        List<User> students = new ArrayList<>();
        for (String[] s : studentData) {
            User student = userRepository.findByEmail(s[1])
                    .orElseGet(() -> userRepository.save(new User(s[0], s[1], defaultHashedPassword, Role.STUDENT)));
            students.add(student);
        }

        // 2. Seed Subjects
        Subject dsa = subjectRepository.findByName("Data Structures & Algorithms")
                .orElseGet(() -> subjectRepository.save(new Subject("Data Structures & Algorithms", "Core computer science fundamentals covering arrays, trees, and graph algorithms.", teacher1)));

        Subject dbms = subjectRepository.findByName("Database Management Systems")
                .orElseGet(() -> subjectRepository.save(new Subject("Database Management Systems", "Relational database concepts, normalization, query optimization, and transactions.", teacher2)));

        Subject cn = subjectRepository.findByName("Computer Networks")
                .orElseGet(() -> subjectRepository.save(new Subject("Computer Networks", "Network architectures, protocols, routing algorithms, and transport layer security.", teacher1)));

        // 3. Seed Topics with Prerequisites
        Topic tArrays = getOrCreateTopic(dsa, "Arrays & Linked Lists", null);
        Topic tTrees = getOrCreateTopic(dsa, "Binary Trees", tArrays);
        Topic tBst = getOrCreateTopic(dsa, "Binary Search Trees", tTrees);
        Topic tGraphs = getOrCreateTopic(dsa, "Graph Algorithms", tTrees);

        Topic tSql = getOrCreateTopic(dbms, "Relational Model & SQL", null);
        Topic tNorm = getOrCreateTopic(dbms, "Database Normalization", tSql);
        Topic tTrans = getOrCreateTopic(dbms, "Transactions & Concurrency", tSql);

        Topic tOsi = getOrCreateTopic(cn, "OSI & TCP/IP Models", null);
        Topic tRoute = getOrCreateTopic(cn, "Routing & Subnetting", tOsi);

        // 4. Seed Question Bank (~150 questions across the 9 topics)
        List<Topic> allTopics = List.of(tArrays, tTrees, tBst, tGraphs, tSql, tNorm, tTrans, tOsi, tRoute);
        List<Question> seededQuestions = new ArrayList<>();

        for (Topic topic : allTopics) {
            seededQuestions.addAll(seedQuestionsForTopic(topic, teacher1));
        }
        logger.info("Seeded total {} high-quality questions across {} topics.", seededQuestions.size(), allTopics.size());

        // 5. Seed Class & Enrollment
        ClassEntity classA = classRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    ClassEntity c = new ClassEntity("CS Year 4 - Section A", teacher1);
                    c.setStudents(new HashSet<>(students));
                    return classRepository.save(c);
                });

        // 6. Create Published Quizzes & Assignments
        Quiz quizDsa = getOrCreateQuiz("Diagnostic Assessment: Data Structures & Trees", dsa, teacher1, 15, seededQuestions.subList(0, 10));
        Quiz quizDbms = getOrCreateQuiz("Database Principles: SQL & Normalization", dbms, teacher2, 20, seededQuestions.subList(30, 40));
        Quiz quizCn = getOrCreateQuiz("Network Layers & Protocols Review", cn, teacher1, 20, seededQuestions.subList(60, 70));

        // Assign to Class A
        if (quizAssignmentRepository.count() == 0) {
            quizAssignmentRepository.save(new QuizAssignment(quizDsa, classA, null));
            quizAssignmentRepository.save(new QuizAssignment(quizDbms, classA, null));
            quizAssignmentRepository.save(new QuizAssignment(quizCn, classA, null));
        }

        // 7. Seed Initial Topic Mastery for demo students
        if (topicMasteryRepository.count() == 0) {
            for (User st : students) {
                topicMasteryRepository.save(new TopicMastery(st, tArrays, 0.85, 90.0, 10)); // Strong
                topicMasteryRepository.save(new TopicMastery(st, tTrees, 0.42, 45.0, 8));   // Weak
                topicMasteryRepository.save(new TopicMastery(st, tBst, 0.35, 30.0, 5));     // Weak
                topicMasteryRepository.save(new TopicMastery(st, tSql, 0.78, 80.0, 6));     // Moderate
                topicMasteryRepository.save(new TopicMastery(st, tNorm, 0.48, 50.0, 4));    // Weak
            }
        }

        // 8. Seed Sample Chat Session for Student 1
        User student1 = students.get(0);
        if (chatSessionRepository.count() == 0) {
            ChatSession session = chatSessionRepository.save(new ChatSession(student1, "Binary Trees & BST Mastery"));
            chatMessageRepository.save(new ChatMessage(session, ChatMessage.Role.USER, "Why is search in an unbalanced BST O(n)?"));
            chatMessageRepository.save(new ChatMessage(session, ChatMessage.Role.ASSISTANT,
                    "Great question, Aarav! In a balanced BST, each comparison cuts the search space in half, giving $O(\\log n)$ time.\n\n" +
                    "However, if keys are inserted in sorted order (e.g., 1, 2, 3, 4, 5), each new node is placed as the right child of the previous one. The tree collapses into a degenerate linear shape equivalent to a singly linked list. Since height $h = n$, searching for the last element requires visiting all $n$ nodes, resulting in worst-case $O(n)$ time complexity."));
        }

        // 9. Seed Official Evaluated Exam Papers from Teachers
        if (examPaperAnalysisRepository.count() == 0) {
            String mistakesJson1 = "[{\"question\":\"Question 3 (Part B)\",\"topic\":\"Binary Search Trees & AVL Trees\",\"marksLost\":5.0,\"maxMarks\":10.0,\"errorReason\":\"Incorrect balance factor calculations in AVL tree node deletion leading to unbalanced binary search tree rotations.\",\"suggestedReview\":\"Practice step-by-step tree rotation diagrams and balance factor recalculation invariants in course lecture notes.\"},{\"question\":\"Question 4 (Part A)\",\"topic\":\"Recursion & Dynamic Programming\",\"marksLost\":4.0,\"maxMarks\":10.0,\"errorReason\":\"Base condition check was placed after the recursive descent call, causing stack overflow runtime anomaly.\",\"suggestedReview\":\"Always place base-case guards with explicit return values before recursive calls.\"},{\"question\":\"Question 5 (Part C)\",\"topic\":\"Graph Traversal & Shortest Path\",\"marksLost\":3.0,\"maxMarks\":10.0,\"errorReason\":\"Relaxation condition in Dijkstra algorithm incorrectly checked <= instead of < for edge relaxation.\",\"suggestedReview\":\"Revisit priority-queue relaxation step in weighted directed graph notes.\"}]";
            String weakTopicsJson1 = "[\"Binary Search Trees & AVL Trees\",\"Recursion & Dynamic Programming\",\"Graph Traversal & Shortest Path\"]";

            ExamPaperAnalysis paper1 = new ExamPaperAnalysis(
                    student1,
                    teacher1,
                    "Midterm Assessment 1: Data Structures & Algorithms",
                    "Data Structures & Algorithms",
                    38.0,
                    50.0,
                    76.0,
                    "First Class (A)",
                    "Evaluated by Prof. Alan Turing: Strong foundational problem-solving in linear arrays and hash tables. Marks were deducted on dynamic programming base cases and self-balancing tree rotation proofs. Focus on recursive guard conditions before final exams.",
                    mistakesJson1,
                    weakTopicsJson1,
                    "DSA_Midterm_Evaluated_Aarav.pdf",
                    "PDF",
                    "Sample Evaluated Exam Paper: Data Structures & Algorithms Midterm - Student Aarav Sharma, Total: 38/50".getBytes()
            );
            examPaperAnalysisRepository.save(paper1);

            String mistakesJson2 = "[{\"question\":\"Question 2 (Part C)\",\"topic\":\"Database Normalization\",\"marksLost\":5.0,\"maxMarks\":10.0,\"errorReason\":\"Failed to decompose relation into Boyce-Codd Normal Form (BCNF) without violating functional dependency preservation.\",\"suggestedReview\":\"Review 3NF vs BCNF dependency preservation trade-offs in lecture module 3.\"},{\"question\":\"Question 4 (Part B)\",\"topic\":\"Transactions & Concurrency\",\"marksLost\":4.0,\"maxMarks\":10.0,\"errorReason\":\"Did not identify cascading rollback anomaly under standard Strict 2-Phase Locking (S2PL).\",\"suggestedReview\":\"Study conflict-serializable schedules and lock release timing diagrams.\"}]";
            String weakTopicsJson2 = "[\"Database Normalization\",\"Transactions & Concurrency\"]";

            ExamPaperAnalysis paper2 = new ExamPaperAnalysis(
                    student1,
                    teacher2,
                    "Continuous Assessment 2: Relational DBMS & Normalization",
                    "Database Management Systems",
                    41.0,
                    50.0,
                    82.0,
                    "First Class (A)",
                    "Evaluated by Dr. Grace Hopper: Excellent proficiency in SQL querying and aggregate group-by clauses. Marks were lost on BCNF decomposition proofs and concurrency isolation anomalies. Review ACID schedule serialization.",
                    mistakesJson2,
                    weakTopicsJson2,
                    "DBMS_CA2_Evaluated_Aarav.pdf",
                    "PDF",
                    "Sample Evaluated Exam Paper: DBMS CA2 - Student Aarav Sharma, Total: 41/50".getBytes()
            );
            examPaperAnalysisRepository.save(paper2);
            logger.info("Seeded initial evaluated exam papers for student {}", student1.getEmail());
        }

        logger.info("EduPulse academic database seeding complete!");
    }

    private Topic getOrCreateTopic(Subject subject, String name, Topic prereq) {
        return topicRepository.findBySubjectId(subject.getId()).stream()
                .filter(t -> t.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> topicRepository.save(new Topic(subject, name, prereq)));
    }

    private Quiz getOrCreateQuiz(String title, Subject subject, User teacher, int timeLimit, List<Question> questions) {
        return quizRepository.findAll().stream()
                .filter(q -> q.getTitle().equalsIgnoreCase(title))
                .findFirst()
                .orElseGet(() -> {
                    Quiz q = quizRepository.save(new Quiz(title, subject, teacher, Quiz.Status.PUBLISHED, timeLimit, LocalDateTime.now().plusDays(7)));
                    int order = 1;
                    for (Question qItem : questions) {
                        quizQuestionRepository.save(new QuizQuestion(q, qItem, order++));
                    }
                    return q;
                });
    }

    private List<Question> seedQuestionsForTopic(Topic topic, User creator) {
        List<Question> created = new ArrayList<>();
        String topicName = topic.getName();

        // Template generating ~17 questions per topic -> 9 topics * 17 = 153 questions!
        for (int i = 1; i <= 17; i++) {
            Question.Difficulty diff = (i % 3 == 0) ? Question.Difficulty.HARD : (i % 2 == 0 ? Question.Difficulty.MEDIUM : Question.Difficulty.EASY);
            String text = String.format("Concept %d: In the context of %s, which statement regarding theoretical behavior and structural invariants is correct?", i, topicName);
            List<String> options = List.of(
                    String.format("Option A: The worst-case invariant requires exhaustive sequential traversal under %s.", topicName),
                    String.format("Option B: The primary operational property guarantees mathematically optimal bounds when properly partitioned in %s.", topicName),
                    String.format("Option C: Memory consumption is completely unbound and non-deterministic.", topicName),
                    String.format("Option D: The structure completely ignores key ordering and comparison axioms.", topicName)
            );
            int correctIndex = (i % 4); // cycles 0, 1, 2, 3
            String explanation = String.format("Theoretical Explanation for Concept %d in %s: Option %c is correct because it directly satisfies the fundamental invariants established by computer science literature.",
                    i, topicName, (char)('A' + correctIndex));

            try {
                String optionsJson = objectMapper.writeValueAsString(options);
                Question q = new Question(topic, text, optionsJson, correctIndex, diff, explanation, Question.Source.MANUAL, creator);
                created.add(questionRepository.save(q));
            } catch (Exception ignored) {
            }
        }
        return created;
    }
}
