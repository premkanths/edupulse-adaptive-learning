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

import java.time.LocalDate;
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
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AcademicRecordRepository academicRecordRepository;
    private final AttemptRepository attemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final CourseMaterialRepository courseMaterialRepository;
    private final MaterialChunkRepository materialChunkRepository;
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
                          AttendanceRecordRepository attendanceRecordRepository,
                          AcademicRecordRepository academicRecordRepository,
                          AttemptRepository attemptRepository,
                          AttemptAnswerRepository attemptAnswerRepository,
                          CourseMaterialRepository courseMaterialRepository,
                          MaterialChunkRepository materialChunkRepository,
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
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.academicRecordRepository = academicRecordRepository;
        this.attemptRepository = attemptRepository;
        this.attemptAnswerRepository = attemptAnswerRepository;
        this.courseMaterialRepository = courseMaterialRepository;
        this.materialChunkRepository = materialChunkRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        boolean hasCuratedQuestions = questionRepository.findAll().stream()
                .anyMatch(q -> q.getText().contains("ACID") || q.getText().contains("Two-Phase Locking") || q.getText().contains("Single Responsibility Principle"));
        boolean hasCourseMaterials = courseMaterialRepository.count() >= 15;
        boolean hasExamPapers = examPaperAnalysisRepository.count() >= 50;
        boolean hasSectionDTeacher = userRepository.findByEmail("teacher.maya@edupulse.local").isPresent();
        boolean hasSectionDStudents = userRepository.findByEmail("student51@edupulse.local").isPresent();

        if (userRepository.countByRole(Role.STUDENT) >= 60 && questionRepository.count() >= 100
                && hasCuratedQuestions && hasCourseMaterials && hasExamPapers && hasSectionDTeacher && hasSectionDStudents) {
            logger.info("Database already fully seeded with 60 students (including Section D Live Demo) and complete academic curriculum. Skipping seeder.");
            return;
        }

        logger.info("Seeding EduPulse with 60 students, 4 teachers, 1 admin, 5 subjects, and live demo section...");

        String defaultHashedPassword = passwordEncoder.encode("Password@123");

        // 1. Seed Admin
        User admin = userRepository.findByEmail("admin@edupulse.local")
                .orElseGet(() -> userRepository.save(new User("Dr. Robert Vance (Admin)", "admin@edupulse.local", defaultHashedPassword, Role.ADMIN)));

        // 2. Seed 4 Teachers (3 standard + 1 Live Demo Teacher)
        User teacher1 = userRepository.findByEmail("teacher.sarah@edupulse.local")
                .orElseGet(() -> userRepository.save(new User("Prof. Sarah Connor", "teacher.sarah@edupulse.local", defaultHashedPassword, Role.TEACHER)));

        User teacher2 = userRepository.findByEmail("teacher.alan@edupulse.local")
                .orElseGet(() -> userRepository.save(new User("Prof. Alan Turing", "teacher.alan@edupulse.local", defaultHashedPassword, Role.TEACHER)));

        User teacher3 = userRepository.findByEmail("teacher.ada@edupulse.local")
                .orElseGet(() -> userRepository.save(new User("Prof. Ada Lovelace", "teacher.ada@edupulse.local", defaultHashedPassword, Role.TEACHER)));

        User teacherDemo = userRepository.findByEmail("teacher.maya@edupulse.local")
                .orElseGet(() -> userRepository.save(new User("Prof. Maya Lin (Demo Faculty)", "teacher.maya@edupulse.local", defaultHashedPassword, Role.TEACHER)));

        // 3. Define the 60 Students (50 curriculum + 10 clean Section D demo students)
        String[][] studentRoster = {
                // Section A (Students 1 to 17) -> Lead: Prof. Sarah Connor
                {"Aarav Sharma", "student1@edupulse.local", "HIGH", "CS Year 4 - Section A"},
                {"Ananya Patel", "student2@edupulse.local", "HIGH", "CS Year 4 - Section A"},
                {"Rohan Gupta", "student3@edupulse.local", "AT_RISK", "CS Year 4 - Section A"},
                {"Priya Nair", "student4@edupulse.local", "MODERATE", "CS Year 4 - Section A"},
                {"Karthik Raja", "student5@edupulse.local", "MODERATE", "CS Year 4 - Section A"},
                {"Meera Sen", "student6@edupulse.local", "HIGH", "CS Year 4 - Section A"},
                {"Vikram Joshi", "student7@edupulse.local", "AT_RISK", "CS Year 4 - Section A"},
                {"Neha Verma", "student8@edupulse.local", "MODERATE", "CS Year 4 - Section A"},
                {"Rahul Das", "student9@edupulse.local", "AT_RISK", "CS Year 4 - Section A"},
                {"Divya Reddy", "student10@edupulse.local", "HIGH", "CS Year 4 - Section A"},
                {"Aditya Roy", "student11@edupulse.local", "MODERATE", "CS Year 4 - Section A"},
                {"Sneha Kulkarni", "student12@edupulse.local", "HIGH", "CS Year 4 - Section A"},
                {"Tarun Kumar", "student13@edupulse.local", "AT_RISK", "CS Year 4 - Section A"},
                {"Pooja Hegde", "student14@edupulse.local", "MODERATE", "CS Year 4 - Section A"},
                {"Varun Tej", "student15@edupulse.local", "HIGH", "CS Year 4 - Section A"},
                {"Kavya Madhavan", "student16@edupulse.local", "MODERATE", "CS Year 4 - Section A"},
                {"Nikhil Siddharth", "student17@edupulse.local", "AT_RISK", "CS Year 4 - Section A"},

                // Section B (Students 18 to 34) -> Lead: Prof. Alan Turing
                {"Siddharth Menon", "student18@edupulse.local", "HIGH", "CS Year 4 - Section B"},
                {"Riya Chakraborty", "student19@edupulse.local", "HIGH", "CS Year 4 - Section B"},
                {"Amitav Ghosh", "student20@edupulse.local", "AT_RISK", "CS Year 4 - Section B"},
                {"Deepa Malik", "student21@edupulse.local", "MODERATE", "CS Year 4 - Section B"},
                {"Farhan Akhtar", "student22@edupulse.local", "MODERATE", "CS Year 4 - Section B"},
                {"Ishita Dutta", "student23@edupulse.local", "HIGH", "CS Year 4 - Section B"},
                {"Harish Kalyan", "student24@edupulse.local", "AT_RISK", "CS Year 4 - Section B"},
                {"Jyoti Prakash", "student25@edupulse.local", "MODERATE", "CS Year 4 - Section B"},
                {"Kunal Kapoor", "student26@edupulse.local", "AT_RISK", "CS Year 4 - Section B"},
                {"Lavanya Tripathi", "student27@edupulse.local", "HIGH", "CS Year 4 - Section B"},
                {"Manish Paul", "student28@edupulse.local", "MODERATE", "CS Year 4 - Section B"},
                {"Nidhi Agarwal", "student29@edupulse.local", "HIGH", "CS Year 4 - Section B"},
                {"Omkar Prasad", "student30@edupulse.local", "AT_RISK", "CS Year 4 - Section B"},
                {"Pallavi Sharda", "student31@edupulse.local", "MODERATE", "CS Year 4 - Section B"},
                {"Qadir Khan", "student32@edupulse.local", "MODERATE", "CS Year 4 - Section B"},
                {"Rashmika Mandanna", "student33@edupulse.local", "HIGH", "CS Year 4 - Section B"},
                {"Sachin Tendulkar", "student34@edupulse.local", "HIGH", "CS Year 4 - Section B"},

                // Section C (Students 35 to 50) -> Lead: Prof. Ada Lovelace
                {"Tanvi Shah", "student35@edupulse.local", "HIGH", "CS Year 4 - Section C"},
                {"Uday Kiran", "student36@edupulse.local", "AT_RISK", "CS Year 4 - Section C"},
                {"Vaishnavi Gowda", "student37@edupulse.local", "MODERATE", "CS Year 4 - Section C"},
                {"Waseem Ahmed", "student38@edupulse.local", "AT_RISK", "CS Year 4 - Section C"},
                {"Yashwant Rao", "student39@edupulse.local", "HIGH", "CS Year 4 - Section C"},
                {"Zoya Akhtar", "student40@edupulse.local", "MODERATE", "CS Year 4 - Section C"},
                {"Abhimanyu Singh", "student41@edupulse.local", "MODERATE", "CS Year 4 - Section C"},
                {"Bhavana Menon", "student42@edupulse.local", "HIGH", "CS Year 4 - Section C"},
                {"Chirag Paswan", "student43@edupulse.local", "AT_RISK", "CS Year 4 - Section C"},
                {"Drishti Dhami", "student44@edupulse.local", "MODERATE", "CS Year 4 - Section C"},
                {"Eshan Hilal", "student45@edupulse.local", "MODERATE", "CS Year 4 - Section C"},
                {"Fatima Sana", "student46@edupulse.local", "HIGH", "CS Year 4 - Section C"},
                {"Gaurav Khanna", "student47@edupulse.local", "AT_RISK", "CS Year 4 - Section C"},
                {"Hansika Motwani", "student48@edupulse.local", "MODERATE", "CS Year 4 - Section C"},
                {"Ishaan Khatter", "student49@edupulse.local", "MODERATE", "CS Year 4 - Section C"},
                {"Janhvi Kapoor", "student50@edupulse.local", "HIGH", "CS Year 4 - Section C"},

                // Section D (Students 51 to 60) -> Lead: Prof. Maya Lin (CLEAN SLATE FOR LIVE PRESENTATION)
                {"Aakash Varma", "student51@edupulse.local", "DEMO", "CS Year 4 - Section D (Live Demo)"},
                {"Ananya Deshmukh", "student52@edupulse.local", "DEMO", "CS Year 4 - Section D (Live Demo)"},
                {"Bikram Roy", "student53@edupulse.local", "DEMO", "CS Year 4 - Section D (Live Demo)"},
                {"Chaitanya Joshi", "student54@edupulse.local", "DEMO", "CS Year 4 - Section D (Live Demo)"},
                {"Deepika Padukone", "student55@edupulse.local", "DEMO", "CS Year 4 - Section D (Live Demo)"},
                {"Eklavya Sharma", "student56@edupulse.local", "DEMO", "CS Year 4 - Section D (Live Demo)"},
                {"Gitanjali Rao", "student57@edupulse.local", "DEMO", "CS Year 4 - Section D (Live Demo)"},
                {"Himanshu Tiwari", "student58@edupulse.local", "DEMO", "CS Year 4 - Section D (Live Demo)"},
                {"Indira Sengupta", "student59@edupulse.local", "DEMO", "CS Year 4 - Section D (Live Demo)"},
                {"Jayesh Patel", "student60@edupulse.local", "DEMO", "CS Year 4 - Section D (Live Demo)"}
        };

        List<User> sectionAStudents = new ArrayList<>();
        List<User> sectionBStudents = new ArrayList<>();
        List<User> sectionCStudents = new ArrayList<>();
        List<User> sectionDStudents = new ArrayList<>();
        List<User> allStudents = new ArrayList<>();

        for (int i = 0; i < studentRoster.length; i++) {
            String name = studentRoster[i][0];
            String email = studentRoster[i][1];
            String section = studentRoster[i][3];

            User student = userRepository.findByEmail(email)
                    .orElseGet(() -> userRepository.save(new User(name, email, defaultHashedPassword, Role.STUDENT)));

            allStudents.add(student);
            if (section.contains("Section A")) {
                sectionAStudents.add(student);
            } else if (section.contains("Section B")) {
                sectionBStudents.add(student);
            } else if (section.contains("Section C")) {
                sectionCStudents.add(student);
            } else {
                sectionDStudents.add(student);
            }
        }
        logger.info("Registered and ensured 60 student records across Sections A, B, C, and D.");

        // 4. Seed the 5 Subjects
        Subject dsa = subjectRepository.findByName("Data Structures & Algorithms")
                .orElseGet(() -> subjectRepository.save(new Subject("Data Structures & Algorithms", "Core fundamentals covering arrays, trees, search algorithms, and graphs.", teacher1)));

        Subject dbms = subjectRepository.findByName("Database Management Systems")
                .orElseGet(() -> subjectRepository.save(new Subject("Database Management Systems", "Relational database concepts, normalization, query optimization, and transactions.", teacher2)));

        Subject cn = subjectRepository.findByName("Computer Networks")
                .orElseGet(() -> subjectRepository.save(new Subject("Computer Networks", "Network architectures, protocols, routing algorithms, and transport layer security.", teacher1)));

        Subject os = subjectRepository.findByName("Operating Systems")
                .orElseGet(() -> subjectRepository.save(new Subject("Operating Systems", "Process management, CPU scheduling, virtual memory paging, and file systems.", teacher3)));

        Subject se = subjectRepository.findByName("Software Engineering & System Design")
                .orElseGet(() -> subjectRepository.save(new Subject("Software Engineering & System Design", "Architectural patterns, microservices, testing paradigms, and system design.", teacher2)));

        List<Subject> allSubjects = List.of(dsa, dbms, cn, os, se);

        // 5. Seed Core Topics with Prerequisites across all 5 subjects
        Topic tArrays = getOrCreateTopic(dsa, "Arrays & Linked Lists", null);
        Topic tTrees = getOrCreateTopic(dsa, "Binary Trees", tArrays);
        Topic tBst = getOrCreateTopic(dsa, "Binary Search Trees", tTrees);
        Topic tGraphs = getOrCreateTopic(dsa, "Graph Algorithms", tTrees);

        Topic tSql = getOrCreateTopic(dbms, "Relational Model & SQL", null);
        Topic tNorm = getOrCreateTopic(dbms, "Database Normalization", tSql);
        Topic tTrans = getOrCreateTopic(dbms, "Transactions & Concurrency", tSql);

        Topic tOsi = getOrCreateTopic(cn, "OSI & TCP/IP Models", null);
        Topic tRoute = getOrCreateTopic(cn, "Routing & Subnetting", tOsi);

        Topic tCpu = getOrCreateTopic(os, "Process Scheduling & CPU", null);
        Topic tMem = getOrCreateTopic(os, "Memory Management & Paging", tCpu);

        Topic tArch = getOrCreateTopic(se, "Agile & System Architecture", null);
        Topic tPatterns = getOrCreateTopic(se, "Design Patterns & Microservices", tArch);

        List<Topic> allTopics = List.of(tArrays, tTrees, tBst, tGraphs, tSql, tNorm, tTrans, tOsi, tRoute, tCpu, tMem, tArch, tPatterns);

        // 6. Seed Question Bank (~180 questions across topics)
        if (questionRepository.count() < 100) {
            for (Topic topic : allTopics) {
                seedQuestionsForTopic(topic, teacher1);
            }
            logger.info("Seeded technical question bank across all 5 subjects.");
        }

        // Curate and seed the 50 authentic university subject questions (10 per subject)
        List<Question> dsaCurated = seedDsaCuratedQuestions(tArrays, tTrees, tBst, tGraphs, teacher1);
        List<Question> dbmsCurated = seedDbmsCuratedQuestions(tSql, tNorm, tTrans, teacher2);
        List<Question> cnCurated = seedCnCuratedQuestions(tOsi, tRoute, teacher1);
        List<Question> osCurated = seedOsCuratedQuestions(tCpu, tMem, teacher3);
        List<Question> seCurated = seedSeCuratedQuestions(tArch, tPatterns, teacher2);
        logger.info("Curated 50 authentic university questions across DSA, DBMS, CN, OS, and SE.");

        // 7. Seed Classes and enrollments
        ClassEntity classA = classRepository.findAll().stream()
                .filter(c -> c.getName().contains("Section A"))
                .findFirst()
                .orElseGet(() -> classRepository.save(new ClassEntity("CS Year 4 - Section A", teacher1)));
        classA.setStudents(new HashSet<>(sectionAStudents));
        classRepository.save(classA);

        ClassEntity classB = classRepository.findAll().stream()
                .filter(c -> c.getName().contains("Section B"))
                .findFirst()
                .orElseGet(() -> classRepository.save(new ClassEntity("CS Year 4 - Section B", teacher2)));
        classB.setStudents(new HashSet<>(sectionBStudents));
        classRepository.save(classB);

        ClassEntity classC = classRepository.findAll().stream()
                .filter(c -> c.getName().contains("Section C"))
                .findFirst()
                .orElseGet(() -> classRepository.save(new ClassEntity("CS Year 4 - Section C", teacher3)));
        classC.setStudents(new HashSet<>(sectionCStudents));
        classRepository.save(classC);

        ClassEntity classD = classRepository.findAll().stream()
                .filter(c -> c.getName().contains("Section D"))
                .findFirst()
                .orElseGet(() -> classRepository.save(new ClassEntity("CS Year 4 - Section D (Live Demo)", teacherDemo)));
        classD.setStudents(new HashSet<>(sectionDStudents));
        classRepository.save(classD);

        // 8. Create 5 Published Quizzes (one per subject) mapped directly to authentic subject questions
        Quiz q1 = getOrCreateQuiz("Diagnostic Assessment: Data Structures & Trees", dsa, teacher1, 15, dsaCurated);
        Quiz q2 = getOrCreateQuiz("Database Principles: SQL & Normalization", dbms, teacher2, 20, dbmsCurated);
        Quiz q3 = getOrCreateQuiz("Network Layers & Protocols Review", cn, teacher1, 20, cnCurated);
        Quiz q4 = getOrCreateQuiz("Operating Systems: CPU Scheduling & Memory", os, teacher3, 20, osCurated);
        Quiz q5 = getOrCreateQuiz("System Architecture & Design Patterns", se, teacher2, 25, seCurated);

        List<Quiz> quizzes = List.of(q1, q2, q3, q4, q5);
        for (Quiz q : quizzes) {
            assignQuizIfNotAssigned(q, classA);
            assignQuizIfNotAssigned(q, classB);
            assignQuizIfNotAssigned(q, classC);
            // Notice: classD is deliberately NOT assigned any quizzes so it remains a clean slate for the live demo!
        }

        // 9. Seed Comprehensive Academic, Attendance, Mastery, and Attempt Records for Sections A, B, and C
        LocalDate today = LocalDate.now();
        Random rand = new Random(42);

        for (int i = 0; i < studentRoster.length; i++) {
            User student = allStudents.get(i);
            String category = studentRoster[i][2]; // HIGH, MODERATE, AT_RISK, DEMO
            String section = studentRoster[i][3];

            if (category.equals("DEMO") || section.contains("Section D")) {
                // Section D students remain 100% clean for live on-the-spot demo in presentation
                continue;
            }

            // A. Seed Topic Masteries
            if (topicMasteryRepository.findByStudentId(student.getId()).isEmpty()) {
                double baseMastery = category.equals("HIGH") ? 0.88 : (category.equals("MODERATE") ? 0.70 : 0.42);
                double baseAccuracy = category.equals("HIGH") ? 92.0 : (category.equals("MODERATE") ? 75.0 : 48.0);
                int attemptsBase = category.equals("HIGH") ? 12 : (category.equals("MODERATE") ? 8 : 4);

                topicMasteryRepository.save(new TopicMastery(student, tArrays, Math.min(0.98, baseMastery + 0.05), baseAccuracy + 3.0, attemptsBase));
                topicMasteryRepository.save(new TopicMastery(student, tTrees, Math.max(0.25, baseMastery - 0.12), Math.max(30.0, baseAccuracy - 15.0), attemptsBase));
                topicMasteryRepository.save(new TopicMastery(student, tBst, Math.max(0.20, baseMastery - 0.18), Math.max(25.0, baseAccuracy - 20.0), attemptsBase));
                topicMasteryRepository.save(new TopicMastery(student, tSql, Math.min(0.95, baseMastery + 0.02), baseAccuracy, attemptsBase));
                topicMasteryRepository.save(new TopicMastery(student, tNorm, Math.max(0.28, baseMastery - 0.10), Math.max(35.0, baseAccuracy - 12.0), attemptsBase));
                topicMasteryRepository.save(new TopicMastery(student, tCpu, Math.min(0.92, baseMastery), baseAccuracy, attemptsBase));
                topicMasteryRepository.save(new TopicMastery(student, tMem, Math.max(0.30, baseMastery - 0.08), Math.max(38.0, baseAccuracy - 10.0), attemptsBase));
                topicMasteryRepository.save(new TopicMastery(student, tOsi, Math.min(0.90, baseMastery + 0.01), baseAccuracy, attemptsBase));
            }

            // B. Seed Attendance Records (12 classes per student across subjects)
            if (attendanceRecordRepository.findByStudentId(student.getId()).isEmpty()) {
                double presentRate = category.equals("HIGH") ? 0.95 : (category.equals("MODERATE") ? 0.82 : 0.58);
                for (int day = 1; day <= 12; day++) {
                    LocalDate date = today.minusDays(day * 2L);
                    Subject sub = allSubjects.get(day % allSubjects.size());
                    boolean isPresent = rand.nextDouble() < presentRate;
                    AttendanceRecord.Status status = isPresent ? AttendanceRecord.Status.PRESENT : AttendanceRecord.Status.ABSENT;
                    attendanceRecordRepository.save(new AttendanceRecord(student, sub, date, status, AttendanceRecord.Source.DEMO_SEED, null));
                }
            }

            // C. Seed Academic Marks (CA1, CA2, Midterm)
            if (academicRecordRepository.findByStudentId(student.getId()).isEmpty()) {
                double factor = category.equals("HIGH") ? 0.90 : (category.equals("MODERATE") ? 0.72 : 0.48);
                academicRecordRepository.save(new AcademicRecord(student, dsa, "Continuous Assessment 1 (CA1)",
                        Math.round(50.0 * (factor + (rand.nextDouble() * 0.06 - 0.03)) * 10.0) / 10.0, 50.0,
                        today.minusDays(30), AcademicRecord.Source.DEMO_SEED, null));

                academicRecordRepository.save(new AcademicRecord(student, dbms, "Continuous Assessment 2 (CA2)",
                        Math.round(50.0 * (factor + (rand.nextDouble() * 0.06 - 0.03)) * 10.0) / 10.0, 50.0,
                        today.minusDays(18), AcademicRecord.Source.DEMO_SEED, null));

                academicRecordRepository.save(new AcademicRecord(student, os, "Midterm Examination",
                        Math.round(100.0 * (factor + (rand.nextDouble() * 0.08 - 0.04)) * 10.0) / 10.0, 100.0,
                        today.minusDays(8), AcademicRecord.Source.DEMO_SEED, null));
            }

            // D. Seed Submitted Quiz Attempts
            if (attemptRepository.findByStudentId(student.getId()).isEmpty()) {
                double scorePercent = category.equals("HIGH") ? (88.0 + rand.nextInt(10)) : (category.equals("MODERATE") ? (68.0 + rand.nextInt(12)) : (42.0 + rand.nextInt(15)));
                Attempt att1 = new Attempt(q1, student);
                att1.setScore(scorePercent);
                att1.setStatus(Attempt.Status.SUBMITTED);
                att1.setSubmittedAt(LocalDateTime.now().minusDays(rand.nextInt(5) + 1));
                attemptRepository.save(att1);

                Attempt att2 = new Attempt(q2, student);
                att2.setScore(Math.min(100.0, scorePercent + (rand.nextInt(8) - 4)));
                att2.setStatus(Attempt.Status.SUBMITTED);
                att2.setSubmittedAt(LocalDateTime.now().minusHours(rand.nextInt(24) + 1));
                attemptRepository.save(att2);
            }
        }

        // 8.5. Seed Official Course Notes & Module PDFs for all 5 Subjects
        seedCourseMaterials(allSubjects, teacher1, teacher2, teacher3);

        // 10. Seed Comprehensive Evaluated Exam Paper Scripts for all 50 students across Sections A, B, and C
        seedComprehensiveExamPapers(allStudents, studentRoster, teacher1, teacher2, teacher3);

        // 10.5. Seed Question-Level Attempt Answers for past quiz attempts
        seedAttemptAnswers(allStudents, q1, dsaCurated, q2, dbmsCurated);

        // 11. Seed Sample Jarvis AI Chat Session for Student 1
        User student1 = allStudents.get(0);
        if (chatSessionRepository.findByStudentIdOrderByUpdatedAtDesc(student1.getId()).isEmpty()) {
            ChatSession session = chatSessionRepository.save(new ChatSession(student1, "Binary Trees & BST Mastery"));
            chatMessageRepository.save(new ChatMessage(session, ChatMessage.Role.USER, "Why is search in an unbalanced BST O(n)?"));
            chatMessageRepository.save(new ChatMessage(session, ChatMessage.Role.ASSISTANT,
                    "In a balanced BST, each comparison cuts the search space in half, giving $O(\\log n)$ time.\n\n" +
                    "However, if keys are inserted in sorted order (e.g., 1, 2, 3, 4, 5), each new node is placed as the right child of the previous one. The tree collapses into a degenerate linear shape equivalent to a singly linked list. Since height $h = n$, searching for the last element requires visiting all $n$ nodes, resulting in worst-case $O(n)$ time complexity."));
        }

        logger.info("EduPulse academic database seeding successfully completed with 50 students across 3 sections!");
    }

    private void seedCourseMaterials(List<Subject> subjects, User teacher1, User teacher2, User teacher3) {
        if (courseMaterialRepository.count() >= 15) {
            logger.info("Course materials and module PDFs already seeded ({} total). Skipping.", courseMaterialRepository.count());
            return;
        }

        Subject dsa = subjects.get(0);
        Subject dbms = subjects.get(1);
        Subject cn = subjects.get(2);
        Subject os = subjects.get(3);
        Subject se = subjects.get(4);

        // 1. DSA Modules (Prof. Sarah Connor)
        createModuleMaterial(dsa, teacher1, "Module 1 - Linear Data Structures: Arrays, Linked Lists & Queues",
                "DSA_Module1_Linear_Structures.pdf",
                "Foundational lecture notes on array contiguous memory layouts, amortized constant time dynamic resizing, and doubly linked lists.",
                List.of(
                        "Unit 1.1: Memory Representation of Linear Arrays and Cache Locality",
                        "Arrays are stored in contiguous memory blocks. Element address is computed in O(1) via Address(A[i]) = Base + i * sizeof(Type). Cache line prefetching maximizes sequential read throughput.",
                        "Unit 1.2: Dynamic Array Resizing & Amortized Complexity",
                        "Dynamic arrays (std::vector, ArrayList) utilize a geometric growth factor (typically 2x). Although array resizing requires O(N) allocation and copying, the amortized cost per append remains strictly O(1).",
                        "Unit 1.3: Singly vs Doubly Linked Lists & Sentinel Nodes",
                        "Linked lists provide O(1) insertions at known node pointers without shifting elements. Sentinel (dummy) head and tail nodes eliminate null pointer boundary checks in pointer reassignment."
                ));

        createModuleMaterial(dsa, teacher1, "Module 2 - Non-Linear Structures: Binary Search Trees & AVL Balancing",
                "DSA_Module2_Trees_and_BST.pdf",
                "Comprehensive notes on binary search tree ordering invariants, traversal algorithms, and AVL height balancing mechanics.",
                List.of(
                        "Unit 2.1: Binary Search Tree Invariants and Traversals",
                        "For every BST node u, all keys in left(u) < key(u) and right(u) > key(u). In-order depth-first traversal visits left-root-right, yielding keys in strictly ascending sorted order.",
                        "Unit 2.2: Degenerate Tree Behavior and Search Degradation",
                        "When keys are inserted in sequential or sorted order, the BST degenerates into a linear linked list with depth N, causing search complexity to collapse from O(log N) to worst-case O(N).",
                        "Unit 2.3: AVL Self-Balancing and Rotation Mathematics",
                        "AVL trees enforce balance factor BF(u) = height(left) - height(right) in {-1, 0, +1}. Imbalances are corrected in O(1) via Left-Left, Right-Right, Left-Right, and Right-Left tree rotations."
                ));

        createModuleMaterial(dsa, teacher1, "Module 3 - Advanced Graph Algorithms: BFS, DFS & Shortest Paths",
                "DSA_Module3_Graph_Algorithms.pdf",
                "Algorithmic study of graph representations, traversal queue dynamics, cycle detection, and Dijkstra shortest path routing.",
                List.of(
                        "Unit 3.1: Graph Data Structures: Adjacency Matrix vs List",
                        "Adjacency matrices take O(V^2) memory and are ideal for dense graphs. Adjacency lists take O(V + E) space, providing optimal traversal efficiency for sparse graphs.",
                        "Unit 3.2: Breadth-First Search (BFS) & Shortest Unweighted Paths",
                        "BFS expands nodes level by level using a FIFO queue. The first time a target vertex is dequeued, the path traversed contains the absolute minimum edge count.",
                        "Unit 3.3: Dijkstra's Algorithm and the Non-Negative Invariant",
                        "Dijkstra uses a greedy min-heap priority queue with O((V + E) log V) time. It requires all edge weights to be non-negative because once a node is finalized, its shortest distance cannot decrease."
                ));

        // 2. DBMS Modules (Prof. Alan Turing)
        createModuleMaterial(dbms, teacher2, "Module 1 - Relational Data Model, Relational Algebra & SQL",
                "DBMS_Module1_Relational_Model_SQL.pdf",
                "Theoretical foundations of the relational model, relational algebra operators, and SQL query execution lifecycles.",
                List.of(
                        "Unit 1.1: Relational Algebra Operators and Equivalence",
                        "Fundamental operators include Selection (sigma), Projection (pi), Cartesian Product (x), Union, Difference, and Natural Join (bowtie). Query optimizers transform algebra trees into efficient plans.",
                        "Unit 1.2: SQL Logical Processing: WHERE vs HAVING",
                        "WHERE predicates are evaluated row-by-row before GROUP BY aggregation. The HAVING clause evaluates aggregate conditions (e.g., COUNT(*) > 5) on grouped partitions after aggregation.",
                        "Unit 1.3: Disk Indexing Architecture: B+ Trees",
                        "B+ Trees store all physical record pointers exclusively in leaf nodes linked horizontally for sequential range scans. High branching fan-out keeps tree depth at 3-4 levels, minimizing physical disk I/O."
                ));

        createModuleMaterial(dbms, teacher2, "Module 2 - Functional Dependencies & Schema Normalization",
                "DBMS_Module2_Normalization.pdf",
                "Formal normalization theory covering Armstrong's axioms, 1NF, 2NF, 3NF, and Boyce-Codd Normal Form (BCNF).",
                List.of(
                        "Unit 2.1: Functional Dependencies & Attribute Closures",
                        "A dependency X -> Y means X uniquely determines Y. Armstrong axioms (Reflexivity, Augmentation, Transitivity) enable computing attribute closure X+ to discover candidate keys.",
                        "Unit 2.2: Third Normal Form (3NF) and Transitive Dependencies",
                        "3NF eliminates transitive functional dependencies where a non-prime attribute depends on another non-prime attribute (X -> Y -> Z). Every non-prime attribute must depend directly on candidate keys.",
                        "Unit 2.3: Boyce-Codd Normal Form (BCNF) Decomposition",
                        "BCNF mandates that for EVERY non-trivial dependency X -> Y, determinant X must be a superkey. BCNF strictly eliminates update, insertion, and deletion anomalies."
                ));

        createModuleMaterial(dbms, teacher2, "Module 3 - Transaction Processing & Concurrency Control",
                "DBMS_Module3_Transactions_Concurrency.pdf",
                "ACID guarantees, schedule serializability testing, Two-Phase Locking (2PL), and database deadlock detection.",
                List.of(
                        "Unit 3.1: ACID Guarantees & Transaction States",
                        "Atomicity guarantees all-or-nothing execution. Consistency preserves integrity constraints. Isolation hides concurrent uncommitted intermediate states. Durability ensures committed writes survive crash via WAL.",
                        "Unit 3.2: Strict Two-Phase Locking (Strict 2PL)",
                        "Strict 2PL divides locking into a Growing Phase (acquiring locks) and holds ALL exclusive write locks until final COMMIT or ROLLBACK. This prevents cascading aborts and guarantees serializability.",
                        "Unit 3.3: Concurrency Anomalies & Deadlock Detection",
                        "Isolation levels prevent Dirty Reads (Read Committed), Non-Repeatable Reads (Repeatable Read), and Phantoms (Serializable). Deadlocks are detected by finding directed cycles in Wait-For Graphs."
                ));

        // 3. Computer Networks Modules (Prof. Sarah Connor)
        createModuleMaterial(cn, teacher1, "Module 1 - Network Architectures, OSI Model & Data Link Framing",
                "CN_Module1_Network_Architectures.pdf",
                "Study of layered network abstractions, protocol encapsulation, framing, CRC error detection, and ARP.",
                List.of(
                        "Unit 1.1: Layered Architectures: OSI vs TCP/IP",
                        "The OSI 7-layer model separates concerns into Physical, Data Link, Network, Transport, Session, Presentation, and Application. Data packets encapsulate Layer 4 headers within Layer 3 and Layer 2 frames.",
                        "Unit 1.2: Framing & Error Detection (CRC-32)",
                        "Data link frames utilize byte/bit stuffing for delineation. Cyclic Redundancy Check (CRC) treats frames as binary polynomials, dividing by a generator polynomial to detect bit errors.",
                        "Unit 1.3: Address Resolution Protocol (ARP) & Collision Protocols",
                        "ARP dynamically resolves known Layer 3 IPv4 addresses to 48-bit Layer 2 MAC addresses on local LANs. Wired Ethernet uses CSMA/CD, while Wi-Fi utilizes CSMA/CA due to transceiver blindness."
                ));

        createModuleMaterial(cn, teacher1, "Module 2 - IPv4/IPv6 Addressing, Subnetting & Routing Protocols",
                "CN_Module2_Subnetting_Routing.pdf",
                "Classless Inter-Domain Routing (CIDR), Variable Length Subnet Masking (VLSM), RIP, and OSPF.",
                List.of(
                        "Unit 2.1: CIDR Subnetting & Address Allocations",
                        "In CIDR /26, 32 - 26 = 6 host bits yield 2^6 = 64 total addresses, with 62 usable host addresses after deducting network address (all 0s) and broadcast address (all 1s).",
                        "Unit 2.2: Distance Vector Routing & Count-to-Infinity",
                        "Distance vector protocols (RIP) broadcast routing tables periodically. Loops and Count-to-Infinity are mitigated using Split Horizon and Poison Reverse with metric infinity = 16.",
                        "Unit 2.3: Link-State Routing (OSPF) & Dijkstra SPF",
                        "OSPF routers flood Link-State Advertisements (LSAs) so every node constructs an identical network topology graph, executing Dijkstra's algorithm to compute loop-free shortest forwarding paths."
                ));

        createModuleMaterial(cn, teacher1, "Module 3 - Transport Layer: TCP/UDP, Congestion Control & TLS 1.3",
                "CN_Module3_Transport_Layer_Security.pdf",
                "TCP 3-way handshake mechanics, flow control, sliding window algorithms, congestion control, and TLS 1.3.",
                List.of(
                        "Unit 3.1: TCP 3-Way Handshake & Connection Teardown",
                        "Connection establishment exchanges SYN -> SYN-ACK -> ACK. Flow control uses sliding windows with receiver advertised window (rwnd) to prevent fast senders from overwhelming slow receivers.",
                        "Unit 3.2: TCP Congestion Control: Slow Start & Congestion Avoidance",
                        "Slow Start doubles the congestion window (cwnd) exponentially every RTT. When cwnd >= ssthresh, Congestion Avoidance mode takes over, increasing cwnd linearly by 1 MSS per RTT.",
                        "Unit 3.3: Transport Layer Security (TLS 1.3) & Forward Secrecy",
                        "TLS 1.3 employs Ephemeral Diffie-Hellman (ECDHE) key exchange to guarantee Perfect Forward Secrecy (PFS): future compromise of the server private key cannot decrypt past recorded sessions."
                ));

        // 4. Operating Systems Modules (Prof. Ada Lovelace)
        createModuleMaterial(os, teacher3, "Module 1 - Process Management, Context Switching & CPU Scheduling",
                "OS_Module1_Process_CPU_Scheduling.pdf",
                "Process lifecycle, PCB structures, user vs kernel threads, and optimal CPU scheduling algorithms.",
                List.of(
                        "Unit 1.1: Process Control Blocks & State Transitions",
                        "Processes transition between NEW, READY, RUNNING, BLOCKED, and TERMINATED. Issuing synchronous I/O or waiting for resources triggers a transition from RUNNING to BLOCKED.",
                        "Unit 1.2: Context Switching Overhead & Thread Models",
                        "Context switches save register state, stack pointer, and flush/reload page tables. In pure User-Level Threads (ULT), a single thread invoking a blocking system call blocks the entire process.",
                        "Unit 1.3: CPU Scheduling Algorithms & SJF Optimality",
                        "Shortest Job First (SJF) is mathematically optimal for minimizing average waiting time by prioritizing processes with minimal CPU burst durations. Preemptive SJF is Shortest Remaining Time First (SRTF)."
                ));

        createModuleMaterial(os, teacher3, "Module 2 - Process Synchronization, Semaphores & Deadlocks",
                "OS_Module2_Synchronization_Deadlocks.pdf",
                "Critical sections, atomic primitives, counting semaphores, mutexes, 4 Coffman conditions, and Banker's algorithm.",
                List.of(
                        "Unit 2.1: The Critical Section Problem & Atomic Hardware",
                        "Critical sections require Mutual Exclusion, Progress, and Bounded Waiting. Hardware instructions Test-And-Set and Compare-And-Swap (CAS) enable lock-free atomic state transitions.",
                        "Unit 2.2: Mutex vs Counting Semaphore Primitives",
                        "A Mutex is a locking mechanism with thread ownership (only the lock owner can release it). A Counting Semaphore is an integer signaling mechanism that can be incremented/decremented by any thread.",
                        "Unit 2.3: Coffman Conditions & Dijkstra's Banker's Algorithm",
                        "Deadlocks require 4 simultaneous conditions: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait. The Banker's Algorithm avoids deadlock by ensuring safe states prior to allocation."
                ));

        createModuleMaterial(os, teacher3, "Module 3 - Virtual Memory, Demand Paging & Disk Scheduling",
                "OS_Module3_Virtual_Memory_Paging.pdf",
                "Memory management units (MMU), TLBs, page fault handling, Belady's anomaly, and SCAN disk scheduling.",
                List.of(
                        "Unit 3.1: Hardware Paging & Translation Lookaside Buffers (TLB)",
                        "The MMU translates Virtual Page Numbers (VPN) to Physical Frame Numbers (PFN). The TLB hardware cache stores recent translations to prevent costly multiple RAM memory accesses.",
                        "Unit 3.2: Page Faults & Belady's Anomaly in FIFO",
                        "Accessing a page with present bit = 0 raises a Page Fault interrupt, prompting the kernel to load it from disk into RAM. FIFO replacement exhibits Belady's Anomaly where more frames cause more faults.",
                        "Unit 3.3: Disk Head Scheduling: SCAN (Elevator Algorithm)",
                        "The SCAN elevator algorithm moves the disk read/write head continuously in one direction servicing pending track cylinder requests until hitting the boundary, then reverses direction."
                ));

        // 5. Software Engineering Modules (Prof. Alan Turing)
        createModuleMaterial(se, teacher2, "Module 1 - Software Lifecycle Models, Agile Scrum & CI/CD",
                "SE_Module1_Agile_Requirements.pdf",
                "Iterative software delivery models, Agile Scrum ceremonies, test-driven development, and deployment strategies.",
                List.of(
                        "Unit 1.1: Waterfall vs Agile Software Development",
                        "Waterfall is predictive with rigid sequential phases. Agile Scrum is empirical and adaptive, delivering working software increments in time-boxed 2-4 week sprints with continuous customer feedback.",
                        "Unit 1.2: Test-Driven Development (TDD) & Quality Assurance",
                        "TDD follows the Red-Green-Refactor discipline: write a failing test first, write minimal production code to pass, then refactor cleanly. Automated CI pipelines enforce test suites on every pull request.",
                        "Unit 1.3: Continuous Deployment: Blue-Green vs Canary Releases",
                        "Blue-Green maintains two identical environments, switching routing instantly. Canary releases progressively expose the new release to a small percentage (e.g. 5%) of real traffic to monitor metrics before full rollout."
                ));

        createModuleMaterial(se, teacher2, "Module 2 - Object-Oriented SOLID Principles & Design Patterns",
                "SE_Module2_SOLID_Design_Patterns.pdf",
                "Design principles for extensible architectures, SOLID rules, Gang of Four patterns, and dependency injection.",
                List.of(
                        "Unit 2.1: The SOLID Architecture Principles",
                        "Single Responsibility: one reason to change. Open-Closed: open for extension, closed for modification. Liskov Substitution: subtypes must be substitutable. Dependency Inversion: depend on abstractions.",
                        "Unit 2.2: Creational & Behavioral Patterns: Factory & Observer",
                        "Factory Method delegates object creation to subclasses. Observer defines a one-to-many publish-subscribe relationship where observers are automatically notified upon state transitions.",
                        "Unit 2.3: The Singleton Pattern & Architectural Drawbacks",
                        "Classic Singletons introduce global mutable state, tight coupling, and hinder test isolation and mock injection, which is why inversion-of-control (IoC) singleton beans are preferred."
                ));

        createModuleMaterial(se, teacher2, "Module 3 - Distributed System Design, Microservices & Caching",
                "SE_Module3_Distributed_System_Design.pdf",
                "High-scale distributed architectures, CAP theorem trade-offs, caching paradigms, and message queues.",
                List.of(
                        "Unit 3.1: Monoliths vs Microservices & Brewer's CAP Theorem",
                        "Under network partitions (P), distributed systems must choose between Consistency (CP, rejecting writes to preserve correctness) or Availability (AP, returning responses that may be slightly stale).",
                        "Unit 3.2: Caching Patterns: Cache-Aside vs Write-Through",
                        "Cache-Aside (Lazy Loading) queries cache first, reads DB on miss, and populates cache. Write-Through writes simultaneously to cache and DB in a synchronous operation.",
                        "Unit 3.3: Asynchronous Message Queues & Horizontal Sharding",
                        "Message brokers (Kafka / RabbitMQ) decouple services and absorb traffic spikes. Horizontal sharding partitions table rows across multiple database instances based on a shard key."
                ));

        logger.info("Successfully seeded 15 official course materials and module PDFs across all 5 academic subjects!");
    }

    private void createModuleMaterial(Subject subject, User teacher, String title, String fileName, String description, List<String> units) {
        StringBuilder fullText = new StringBuilder();
        fullText.append("# ").append(title).append("\n\n");
        fullText.append("Instructor: ").append(teacher.getName()).append(" | Subject: ").append(subject.getName()).append("\n\n");
        fullText.append("Overview: ").append(description).append("\n\n---\n\n");

        for (String u : units) {
            fullText.append(u).append("\n\n");
        }

        byte[] pdfBytes = DemoPdfGenerator.generatePdf(title, "Instructor: " + teacher.getName() + " - " + subject.getName(), units);

        CourseMaterial material = new CourseMaterial(title, description, subject, teacher, fileName, "PDF", fullText.toString());
        material.setFileData(pdfBytes);
        material.setChunkCount(units.size());
        CourseMaterial saved = courseMaterialRepository.save(material);

        int index = 1;
        for (String u : units) {
            int words = u.split("\\s+").length;
            materialChunkRepository.save(new MaterialChunk(saved, index++, u, words));
        }
    }

    private void seedComprehensiveExamPapers(List<User> students, String[][] studentRoster, User teacher1, User teacher2, User teacher3) {
        if (examPaperAnalysisRepository.count() >= 50) {
            logger.info("Exam paper records already seeded ({} total). Skipping.", examPaperAnalysisRepository.count());
            return;
        }

        logger.info("Seeding comprehensive evaluated exam paper scripts for all 50 students across Sections A, B, and C...");
        Random rand = new Random(101);

        for (int i = 0; i < studentRoster.length; i++) {
            User student = students.get(i);
            String category = studentRoster[i][2]; // HIGH, MODERATE, AT_RISK
            String section = studentRoster[i][3];

            if (category.equals("DEMO") || section.contains("Section D")) {
                continue;
            }

            User teacher = section.contains("Section A") ? teacher1 : (section.contains("Section B") ? teacher2 : teacher3);
            String subject = section.contains("Section A") ? "Data Structures & Algorithms" : (section.contains("Section B") ? "Database Management Systems" : "Operating Systems");

            double basePct = category.equals("HIGH") ? (88.0 + rand.nextInt(10)) : (category.equals("MODERATE") ? (68.0 + rand.nextInt(12)) : (40.0 + rand.nextInt(14)));
            double score = Math.round((50.0 * (basePct / 100.0)) * 10.0) / 10.0;
            String grade = score >= 45 ? "Distinction (O)" : (score >= 38 ? "First Class (A)" : (score >= 30 ? "Needs Revision (C)" : "Remedial Alert (D)"));

            List<String> mistakesSummary = new ArrayList<>();
            String mistakesJson;
            String weakTopicsJson;

            if (category.equals("HIGH")) {
                mistakesSummary.add("Question 4 (Part B): Minor edge case omitted in boundary condition check (-2.0 marks)");
                mistakesJson = "[{\"question\":\"Question 4 (Part B)\",\"topic\":\"Boundary Condition Verification\",\"marksLost\":2.0,\"maxMarks\":10.0,\"errorReason\":\"Omitted empty buffer guard before pointer traversal.\",\"suggestedReview\":\"Review boundary sentinel patterns in module notes.\"}]";
                weakTopicsJson = "[\"Boundary Condition Verification\"]";
            } else if (category.equals("MODERATE")) {
                mistakesSummary.add("Question 2 (Part A): Incorrect height balance factor calculation in AVL tree deletion (-4.0 marks)");
                mistakesSummary.add("Question 5 (Part B): Sub-optimal query filter placement causing table scan (-3.0 marks)");
                mistakesJson = "[{\"question\":\"Question 2 (Part A)\",\"topic\":\"Binary Search Trees & AVL Balancing\",\"marksLost\":4.0,\"maxMarks\":10.0,\"errorReason\":\"Incorrect balance factor calculations in AVL tree node deletion leading to unbalanced binary search tree rotations.\",\"suggestedReview\":\"Practice step-by-step tree rotation diagrams and balance factor recalculation invariants in course lecture notes.\"},{\"question\":\"Question 5 (Part B)\",\"topic\":\"Query Optimization & Indexing\",\"marksLost\":3.0,\"maxMarks\":10.0,\"errorReason\":\"Filter placed after cross join instead of pushing predicate before join.\",\"suggestedReview\":\"Review push-down predicate optimization techniques in DBMS notes.\"}]";
                weakTopicsJson = "[\"Binary Search Trees & AVL Balancing\",\"Query Optimization & Indexing\"]";
            } else {
                mistakesSummary.add("Question 1 (Part C): Loop termination error in recursive tree traversal causing stack overflow (-6.0 marks)");
                mistakesSummary.add("Question 3 (Part A): Omitted Hold-and-Wait and Circular Wait deadlock conditions (-5.0 marks)");
                mistakesSummary.add("Question 5: Failed to eliminate partial functional dependencies in 2NF decomposition (-6.0 marks)");
                mistakesJson = "[{\"question\":\"Question 1 (Part C)\",\"topic\":\"Recursion & Dynamic Programming\",\"marksLost\":6.0,\"maxMarks\":10.0,\"errorReason\":\"Base condition check was placed after the recursive descent call, causing stack overflow runtime anomaly.\",\"suggestedReview\":\"Always place base-case guards with explicit return values before recursive calls.\"},{\"question\":\"Question 3 (Part A)\",\"topic\":\"Process Synchronization & Deadlocks\",\"marksLost\":5.0,\"maxMarks\":10.0,\"errorReason\":\"Omitted circular wait and no preemption conditions in Coffman deadlock analysis.\",\"suggestedReview\":\"Memorize and verify all 4 Coffman deadlock conditions in OS notes.\"},{\"question\":\"Question 5\",\"topic\":\"Database Normalization\",\"marksLost\":6.0,\"maxMarks\":10.0,\"errorReason\":\"Failed to decompose composite key partial dependencies before moving to 3NF.\",\"suggestedReview\":\"Follow step-by-step 2NF decomposition rules before attempting 3NF.\"}]";
                weakTopicsJson = "[\"Recursion & Dynamic Programming\",\"Process Synchronization & Deadlocks\",\"Database Normalization\"]";
            }

            String feedback = category.equals("HIGH")
                    ? "Outstanding performance demonstrating rigorous analytical capability and strong conceptual clarity. Excellent work on core derivations."
                    : (category.equals("MODERATE")
                    ? "Solid fundamental grasp shown throughout the assessment. Lost marks on secondary edge cases and rotation mechanics. Practice targeted MCQs."
                    : "Significant conceptual gaps diagnosed in theoretical foundations. Immediate remedial revision required before upcoming end-semester examinations.");

            byte[] pdfBytes = DemoPdfGenerator.generateExamPaperPdf(
                    student.getName(), student.getEmail(), section,
                    "Continuous Assessment 1 (CA1): Core Foundations", subject,
                    score, 50.0, grade, feedback, teacher.getName(), mistakesSummary
            );

            ExamPaperAnalysis paper = new ExamPaperAnalysis(
                    student, teacher, "Continuous Assessment 1 (CA1): Core Foundations", subject,
                    score, 50.0, (score / 50.0) * 100.0, grade, feedback, mistakesJson, weakTopicsJson,
                    "Evaluated_" + student.getName().replaceAll("\\s+", "_") + "_CA1.pdf",
                    "PDF", pdfBytes
            );
            examPaperAnalysisRepository.save(paper);
        }

        logger.info("Successfully seeded evaluated exam paper scripts with verified PDF byte content for all 50 students across Sections A, B, and C!");
    }

    private void seedAttemptAnswers(List<User> students, Quiz q1, List<Question> q1Questions, Quiz q2, List<Question> q2Questions) {
        if (attemptAnswerRepository.count() >= 100) {
            return;
        }

        logger.info("Seeding question-level AttemptAnswer records for past student quiz attempts...");
        Random rand = new Random(77);

        for (User student : students) {
            List<Attempt> attempts = attemptRepository.findByStudentId(student.getId());
            for (Attempt att : attempts) {
                if (!attemptAnswerRepository.findByAttemptId(att.getId()).isEmpty()) {
                    continue;
                }

                List<Question> questions = (att.getQuiz() != null && att.getQuiz().getId().equals(q1.getId())) ? q1Questions : q2Questions;
                double score = att.getScore() != null ? att.getScore() : 70.0;
                int correctCount = (int) Math.round((score / 100.0) * questions.size());

                for (int qIdx = 0; qIdx < questions.size(); qIdx++) {
                    Question q = questions.get(qIdx);
                    boolean isCorrect = (qIdx < correctCount);
                    int chosenIdx = isCorrect ? q.getCorrectIndex() : ((q.getCorrectIndex() + 1) % 4);
                    int timeSeconds = 12 + rand.nextInt(20);

                    attemptAnswerRepository.save(new AttemptAnswer(att, q, chosenIdx, isCorrect, timeSeconds));
                }
            }
        }
        logger.info("Successfully populated question-level AttemptAnswer records across all submitted attempts.");
    }

    private Topic getOrCreateTopic(Subject subject, String name, Topic prereq) {
        return topicRepository.findBySubjectId(subject.getId()).stream()
                .filter(t -> t.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> topicRepository.save(new Topic(subject, name, prereq)));
    }

    private Quiz getOrCreateQuiz(String title, Subject subject, User teacher, int timeLimit, List<Question> questions) {
        Quiz quiz = quizRepository.findAll().stream()
                .filter(q -> q.getTitle().equalsIgnoreCase(title))
                .findFirst()
                .orElseGet(() -> quizRepository.save(new Quiz(title, subject, teacher, Quiz.Status.PUBLISHED, timeLimit, LocalDateTime.now().plusDays(14))));

        List<QuizQuestion> currentLinks = quizQuestionRepository.findByQuizIdOrderByDisplayOrderAsc(quiz.getId());
        boolean needsUpdate = currentLinks.isEmpty()
                || currentLinks.size() != questions.size()
                || currentLinks.stream().anyMatch(qq -> qq.getQuestion().getText().startsWith("Concept "))
                || currentLinks.stream().anyMatch(qq -> !qq.getQuestion().getTopic().getSubject().getId().equals(subject.getId()));

        if (needsUpdate && !questions.isEmpty()) {
            quizQuestionRepository.deleteByQuizId(quiz.getId());
            quizQuestionRepository.flush();
            int order = 1;
            for (Question qItem : questions) {
                if (qItem != null) {
                    quizQuestionRepository.save(new QuizQuestion(quiz, qItem, order++));
                }
            }
            logger.info("Synchronized quiz '{}' with {} authentic curated questions.", title, questions.size());
        }

        return quiz;
    }

    private Question getOrCreateQuestion(Topic topic, String text, List<String> options, int correctIndex,
                                         Question.Difficulty difficulty, String explanation, User creator) {
        return questionRepository.findAll().stream()
                .filter(q -> q.getText().equals(text))
                .findFirst()
                .orElseGet(() -> {
                    try {
                        String optionsJson = objectMapper.writeValueAsString(options);
                        return questionRepository.save(new Question(topic, text, optionsJson, correctIndex, difficulty, explanation, Question.Source.MANUAL, creator));
                    } catch (Exception ex) {
                        logger.error("Failed to serialize question options", ex);
                        return null;
                    }
                });
    }

    private List<Question> seedDsaCuratedQuestions(Topic tArrays, Topic tTrees, Topic tBst, Topic tGraphs, User teacher) {
        List<Question> list = new ArrayList<>();
        list.add(getOrCreateQuestion(tArrays,
                "What is the worst-case time complexity of inserting an element at index 0 of an array containing N elements?",
                List.of("O(1)", "O(log N)", "O(N)", "O(N^2)"),
                2, Question.Difficulty.EASY,
                "Inserting at the beginning (index 0) requires shifting all existing N elements one position to the right, requiring O(N) operations in the worst case.",
                teacher));

        list.add(getOrCreateQuestion(tBst,
                "Under what condition does search in an unbalanced Binary Search Tree (BST) degrade to worst-case O(N) time complexity?",
                List.of("When keys are inserted in random uniform order",
                        "When keys are inserted in strictly sorted ascending or descending order",
                        "When all keys are even numbers",
                        "When the tree height is balanced using rotations"),
                1, Question.Difficulty.MEDIUM,
                "Inserting keys in already sorted order causes every new node to become a right child (or left child) of the previous node, transforming the BST into a linear linked list of height N.",
                teacher));

        list.add(getOrCreateQuestion(tTrees,
                "Which depth-first tree traversal on a valid Binary Search Tree (BST) visits nodes in strictly ascending sorted order?",
                List.of("Pre-order traversal (Root, Left, Right)",
                        "Post-order traversal (Left, Right, Root)",
                        "In-order traversal (Left, Root, Right)",
                        "Level-order traversal"),
                2, Question.Difficulty.EASY,
                "In-order traversal processes the left subtree (all smaller keys), then the root, then the right subtree (all larger keys), naturally producing sorted ascending order.",
                teacher));

        list.add(getOrCreateQuestion(tGraphs,
                "Which graph traversal algorithm guarantees finding the shortest path (minimum edge count) between two vertices in an unweighted graph?",
                List.of("Breadth-First Search (BFS)",
                        "Depth-First Search (DFS)",
                        "Topological Sort",
                        "Bellman-Ford Algorithm"),
                0, Question.Difficulty.EASY,
                "BFS explores all neighboring nodes level by level at distance k before moving to distance k+1, guaranteeing that the first time a vertex is reached, the path has minimum edge count.",
                teacher));

        list.add(getOrCreateQuestion(tArrays,
                "Which two core structural properties must a problem satisfy to be solvable using Dynamic Programming?",
                List.of("Greedy choice property and polynomial search space",
                        "Optimal substructure and overlapping subproblems",
                        "Divide-and-conquer partitions and disjoint subproblems",
                        "Deterministic finite transitions and acyclic call trees"),
                1, Question.Difficulty.MEDIUM,
                "Dynamic Programming is applicable when optimal solutions contain optimal solutions to subproblems (optimal substructure) and recursive algorithms solve the same subproblems repeatedly (overlapping subproblems).",
                teacher));

        list.add(getOrCreateQuestion(tArrays,
                "What is the worst-case time complexity of Lomuto or Hoare QuickSort if the pivot chosen is always the minimum or maximum element?",
                List.of("O(N log N)", "O(N)", "O(N^2)", "O(log N)"),
                2, Question.Difficulty.MEDIUM,
                "When the selected pivot is always an extreme element, the partition splits into subproblems of size 0 and N-1. The recursion tree depth becomes N, requiring N*(N-1)/2 comparisons which is O(N^2).",
                teacher));

        list.add(getOrCreateQuestion(tTrees,
                "In an AVL tree, what is the valid balance factor range for every node after any insertion or deletion?",
                List.of("0 only",
                        "-1, 0, or +1",
                        "Any integer between -2 and +2",
                        "Strictly non-negative integers"),
                1, Question.Difficulty.MEDIUM,
                "By definition, an AVL tree is a height-balanced BST where the heights of the two child subtrees of any node differ by at most one, permitting balance factors of -1, 0, or +1.",
                teacher));

        list.add(getOrCreateQuestion(tTrees,
                "What is the time complexity of extracting the minimum element from a binary Min-Heap containing N elements?",
                List.of("O(1)", "O(log N)", "O(N)", "O(N log N)"),
                1, Question.Difficulty.MEDIUM,
                "Removing the root takes O(1), but swapping the last element into the root and sifting down (heapify) to restore the min-heap invariant requires traversing down the tree height, which takes O(log N) time.",
                teacher));

        list.add(getOrCreateQuestion(tArrays,
                "In a hash table using open addressing with linear probing, what primary issue degrades lookup performance as the load factor grows?",
                List.of("Secondary clustering",
                        "Primary clustering",
                        "Chaining overflow",
                        "Deadlock on bucket lock"),
                1, Question.Difficulty.HARD,
                "Linear probing suffers from primary clustering, where filled slots form contiguous blocks. Any new key hashing into the block must traverse the entire cluster, continually worsening search times.",
                teacher));

        list.add(getOrCreateQuestion(tGraphs,
                "Why can Dijkstra's algorithm produce incorrect shortest paths on graphs with negative edge weights?",
                List.of("It gets stuck in infinite recursion loops",
                        "Its greedy assumption presumes adding positive edges only increases path distance, so finalized nodes are never updated",
                        "Priority queues cannot accept negative values",
                        "It requires the graph to be bipartite"),
                1, Question.Difficulty.HARD,
                "Dijkstra's greedy paradigm permanently marks a vertex as visited assuming its distance cannot decrease. A negative weight edge discovered later could provide a shorter overall path to an already finalized vertex.",
                teacher));

        return list;
    }

    private List<Question> seedDbmsCuratedQuestions(Topic tSql, Topic tNorm, Topic tTrans, User teacher) {
        List<Question> list = new ArrayList<>();
        list.add(getOrCreateQuestion(tTrans,
                "Which ACID property guarantees that the intermediate effects of concurrently running transactions are hidden from each other?",
                List.of("Atomicity", "Consistency", "Isolation", "Durability"),
                2, Question.Difficulty.EASY,
                "Isolation ensures that transactions execute without interference from concurrent transactions, preventing dirty reads and non-repeatable reads until changes are officially committed.",
                teacher));

        list.add(getOrCreateQuestion(tSql,
                "What is the key difference between the WHERE and HAVING clauses in standard SQL queries?",
                List.of("WHERE filters individual rows before aggregation; HAVING filters groups after GROUP BY aggregation",
                        "WHERE is used only with JOINs, while HAVING is used with nested queries",
                        "HAVING can only evaluate string equality, while WHERE handles numerical comparisons",
                        "WHERE applies to materialized views; HAVING applies to temporary tables"),
                0, Question.Difficulty.EASY,
                "WHERE filters rows before they enter any aggregate functions. HAVING filters the synthesized groups produced by GROUP BY based on aggregate conditions (e.g. COUNT(*) > 5).",
                teacher));

        list.add(getOrCreateQuestion(tNorm,
                "A relational schema is in Third Normal Form (3NF) if it is in 2NF and has no:",
                List.of("Partial functional dependencies",
                        "Transitive functional dependencies where a non-prime attribute depends on another non-prime attribute",
                        "Multi-valued dependencies",
                        "Foreign key constraints"),
                1, Question.Difficulty.MEDIUM,
                "3NF eliminates transitive dependencies (X -> Y -> Z where X is a candidate key and Y, Z are non-prime attributes), requiring every non-prime attribute to depend directly and only on candidate keys.",
                teacher));

        list.add(getOrCreateQuestion(tSql,
                "Why do relational database engines predominantly utilize B+ Trees instead of Binary Search Trees for disk-based table indexing?",
                List.of("B+ Trees store all actual record pointers in linked leaf nodes and feature high fan-out, minimizing disk block I/O operations",
                        "Binary search trees have lower theoretical lookup complexity O(1)",
                        "B+ Trees do not require rebalancing during write operations",
                        "Binary trees automatically support multi-column composite indexing"),
                0, Question.Difficulty.MEDIUM,
                "B+ trees have a high branching factor (fan-out) that keeps tree height very low (typically 3-4 levels), dramatically reducing physical disk read operations. Linked leaf nodes also make sequential range queries very fast.",
                teacher));

        list.add(getOrCreateQuestion(tTrans,
                "Under Strict Two-Phase Locking (Strict 2PL), when are exclusive (write) locks released?",
                List.of("Immediately after each update query executes",
                        "During the shrinking phase before the transaction commits",
                        "Only at transaction termination upon COMMIT or ROLLBACK",
                        "When another transaction requests a shared read lock"),
                2, Question.Difficulty.HARD,
                "Strict 2PL holds all exclusive write locks until the transaction completes (COMMIT or ABORT). This prevents cascading rollbacks and guarantees strict conflict serializability.",
                teacher));

        list.add(getOrCreateQuestion(tSql,
                "What occurs when a row in a parent table is deleted if its foreign key is defined with 'ON DELETE CASCADE'?",
                List.of("The deletion fails with a foreign key violation error",
                        "All matching child rows referencing that parent key are automatically deleted",
                        "The child rows remain intact with their foreign key set to NULL",
                        "The parent row is flagged as archived rather than deleted"),
                1, Question.Difficulty.EASY,
                "ON DELETE CASCADE automatically propagates parent row deletions to all corresponding child rows referencing that foreign key, maintaining referential integrity.",
                teacher));

        list.add(getOrCreateQuestion(tTrans,
                "Which concurrency anomaly is prevented under the REPEATABLE READ isolation level that can still occur under READ COMMITTED?",
                List.of("Dirty Read",
                        "Non-Repeatable Read (Fuzzy Read)",
                        "Phantom Read",
                        "Write Skew"),
                1, Question.Difficulty.MEDIUM,
                "Under READ COMMITTED, reading the same row twice within a single transaction can return different values if a concurrent transaction commits an update. REPEATABLE READ prevents this by guaranteeing that rows read once remain unchanged throughout the transaction.",
                teacher));

        list.add(getOrCreateQuestion(tTrans,
                "In database concurrency control, how is a system deadlock detected using a Wait-For Graph (WFG)?",
                List.of("Finding a node with degree zero",
                        "Detecting a directed cycle in the graph of waiting transactions",
                        "Checking if the graph is bipartite",
                        "Measuring the path length from source to sink"),
                1, Question.Difficulty.MEDIUM,
                "In a Wait-For Graph, directed edges represent transactions waiting for locks held by others. A directed cycle (T1 -> T2 -> T1) represents an intractable mutual circular wait, indicating a deadlock.",
                teacher));

        list.add(getOrCreateQuestion(tSql,
                "Which statement accurately defines a standard (non-materialized) SQL View?",
                List.of("A physical copy of table data stored on SSD for faster reads",
                        "A virtual table defined by a saved SQL query that executes dynamically upon access",
                        "An in-memory hash table shared across active database connections",
                        "A pre-computed binary cache updated by background replication threads"),
                1, Question.Difficulty.EASY,
                "A standard SQL view does not store pre-computed data on disk; it is a stored query definition that the database engine evaluates dynamically whenever queried.",
                teacher));

        list.add(getOrCreateQuestion(tNorm,
                "What condition must hold for every non-trivial functional dependency X -> Y in Boyce-Codd Normal Form (BCNF)?",
                List.of("Y must be a prime attribute",
                        "X must be a superkey",
                        "X and Y must belong to the same composite key",
                        "The relation must have no nullable columns"),
                1, Question.Difficulty.HARD,
                "BCNF is stricter than 3NF: for EVERY functional dependency X -> Y, determinant X MUST be a superkey. Unlike 3NF, BCNF does not allow exceptions even if Y is a prime attribute.",
                teacher));

        return list;
    }

    private List<Question> seedCnCuratedQuestions(Topic tOsi, Topic tRoute, User teacher) {
        List<Question> list = new ArrayList<>();
        list.add(getOrCreateQuestion(tOsi,
                "Which layer of the OSI 7-layer model handles end-to-end process-to-process communication, port multiplexing, and reliability?",
                List.of("Network Layer (Layer 3)",
                        "Transport Layer (Layer 4)",
                        "Data Link Layer (Layer 2)",
                        "Session Layer (Layer 5)"),
                1, Question.Difficulty.EASY,
                "The Transport Layer (Layer 4) provides process-to-process communication using port numbers (e.g., TCP, UDP), along with flow control, segmentation, and error recovery.",
                teacher));

        list.add(getOrCreateQuestion(tOsi,
                "What is the exact sequence of flag packets sent during the standard TCP Three-Way Handshake?",
                List.of("ACK -> SYN -> SYN-ACK",
                        "SYN -> SYN-ACK -> ACK",
                        "SYN -> ACK -> FIN",
                        "RST -> SYN -> ACK"),
                1, Question.Difficulty.EASY,
                "Client initiates connection with SYN; server acknowledges and synchronizes with SYN-ACK; client confirms with ACK, establishing the bidirectional TCP connection.",
                teacher));

        list.add(getOrCreateQuestion(tRoute,
                "In an IPv4 network configured with CIDR subnet mask /26, how many usable host IP addresses are available?",
                List.of("64", "62", "30", "126"),
                1, Question.Difficulty.MEDIUM,
                "A /26 mask has 32 - 26 = 6 host bits, giving 2^6 = 64 total addresses. Subtracting the network address (all 0s) and broadcast address (all 1s) leaves 62 assignable host addresses.",
                teacher));

        list.add(getOrCreateQuestion(tOsi,
                "Which protocol is used on a local Ethernet network to map a known Layer 3 IPv4 address to a physical Layer 2 MAC address?",
                List.of("DNS", "DHCP", "ARP", "ICMP"),
                2, Question.Difficulty.EASY,
                "Address Resolution Protocol (ARP) broadcasts a request on the local subnet asking who owns a specific IP address, and receives a unicast reply with the corresponding 48-bit MAC address.",
                teacher));

        list.add(getOrCreateQuestion(tRoute,
                "What technique is used in Distance Vector routing protocols like RIP to prevent routing loops caused by Count-to-Infinity?",
                List.of("Split Horizon with Poison Reverse",
                        "Dijkstra's Shortest Path First",
                        "Spanning Tree Protocol (STP)",
                        "BGP AS-Path prepending"),
                0, Question.Difficulty.MEDIUM,
                "Split Horizon prevents a router from advertising a route back out the interface it was learned from. Poison Reverse advertises an unreachable route with metric 16 (infinity) to break loops immediately.",
                teacher));

        list.add(getOrCreateQuestion(tOsi,
                "Which default transport protocol and port number are utilized for standard DNS domain name query resolution?",
                List.of("TCP port 80", "UDP port 53", "TCP port 443", "UDP port 67"),
                1, Question.Difficulty.EASY,
                "Standard DNS client queries use UDP on port 53 to minimize latency and packet overhead without requiring connection establishment.",
                teacher));

        list.add(getOrCreateQuestion(tOsi,
                "In TCP congestion control, how does the sender window cwnd grow during Slow Start compared to Congestion Avoidance?",
                List.of("Slow Start doubles cwnd exponentially every RTT; Congestion Avoidance increases cwnd linearly by 1 MSS per RTT",
                        "Slow Start increases cwnd linearly; Congestion Avoidance doubles cwnd exponentially",
                        "Slow Start decreases cwnd multiplicatively; Congestion Avoidance increases cwnd additively",
                        "Both phases grow cwnd exponentially at different slopes"),
                0, Question.Difficulty.HARD,
                "During Slow Start, cwnd doubles with every round-trip time (exponential growth). Once cwnd reaches the ssthresh threshold, it switches to Congestion Avoidance, increasing cwnd linearly by 1 MSS per RTT.",
                teacher));

        list.add(getOrCreateQuestion(tOsi,
                "What security advantage does Ephemeral Diffie-Hellman (ECDHE) provide in modern TLS 1.3 handshakes over static RSA?",
                List.of("Zero latency round-trip time",
                        "Perfect Forward Secrecy (PFS)",
                        "Post-quantum key encapsulation",
                        "Lossless payload compression"),
                1, Question.Difficulty.HARD,
                "Perfect Forward Secrecy ensures that even if a server's long-term private key is compromised in the future, past recorded encrypted sessions cannot be decrypted because each session used unique ephemeral keys.",
                teacher));

        list.add(getOrCreateQuestion(tOsi,
                "Why does IEEE 802.11 Wi-Fi use CSMA/CA (Collision Avoidance) instead of 802.3 Ethernet's CSMA/CD (Collision Detection)?",
                List.of("Wi-Fi radio transmitters overpower incoming signals, making it impossible to detect collisions while transmitting",
                        "CSMA/CD is proprietary to fiber optic cables",
                        "Wi-Fi frames do not have checksums",
                        "Wireless signals travel faster than Ethernet electrical signals"),
                0, Question.Difficulty.MEDIUM,
                "A wireless station's own transmission blinds its receiver, preventing it from detecting collisions mid-transmission. Therefore, wireless protocols use CSMA/CA with random backoff and RTS/CTS to avoid collisions.",
                teacher));

        list.add(getOrCreateQuestion(tRoute,
                "What primary function does Network Address Translation (NAT) with Port Address Translation (PAT) perform?",
                List.of("Converts IPv4 packets into IPv6 headers",
                        "Maps many private RFC 1918 internal IP addresses to a single public IP address using distinct source TCP/UDP ports",
                        "Encrypts all payload data with IPsec tunnels",
                        "Balances incoming web requests evenly across backend servers"),
                1, Question.Difficulty.MEDIUM,
                "PAT (also called NAT overload) maps multiple private IP addresses inside a local network to one shared public IP address by tracking unique Layer 4 source port numbers.",
                teacher));

        return list;
    }

    private List<Question> seedOsCuratedQuestions(Topic tCpu, Topic tMem, User teacher) {
        List<Question> list = new ArrayList<>();
        list.add(getOrCreateQuestion(tCpu,
                "Which event directly causes a process to transition from the RUNNING state to the BLOCKED (WAITING) state?",
                List.of("Expiration of the allocated CPU time quantum",
                        "Issuing a synchronous I/O request or waiting for an unavailable resource",
                        "Arrival of a higher priority process in the ready queue",
                        "Voluntary yield via a scheduling system call"),
                1, Question.Difficulty.EASY,
                "A process enters the BLOCKED state when it cannot continue execution until an external event (such as disk I/O completion or lock acquisition) occurs.",
                teacher));

        list.add(getOrCreateQuestion(tCpu,
                "Which group represents the four Coffman conditions that must all be satisfied simultaneously for a deadlock to occur?",
                List.of("Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait",
                        "Starvation, Race Condition, Busy Waiting, Deadlock",
                        "Priority Inversion, Context Switching, Paging, Thrashing",
                        "Virtual Memory, Swapping, Fragmentation, Interrupt Handling"),
                0, Question.Difficulty.MEDIUM,
                "The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If any one condition is broken, deadlock cannot occur.",
                teacher));

        list.add(getOrCreateQuestion(tMem,
                "What sequence of actions occurs when a CPU encounters a page whose valid/present bit in the page table is 0?",
                List.of("Process is killed with SIGSEGV",
                        "A Page Fault interrupt is triggered, prompting the OS kernel to load the missing page from disk into a physical RAM frame",
                        "The CPU clears the TLB and ignores the instruction",
                        "The memory controller falls back to contiguous allocation"),
                1, Question.Difficulty.MEDIUM,
                "A 0 present bit triggers a Page Fault trap. The OS kernel locates the desired page in secondary storage, finds an empty frame in RAM (or evicts one), updates the page table, and restarts the faulted instruction.",
                teacher));

        list.add(getOrCreateQuestion(tMem,
                "Which page replacement algorithm is susceptible to Belady's Anomaly, where increasing physical page frames can increase page faults?",
                List.of("Optimal Page Replacement (OPT)",
                        "Least Recently Used (LRU)",
                        "First-In, First-Out (FIFO)",
                        "Least Frequently Used (LFU)"),
                2, Question.Difficulty.EASY,
                "FIFO can suffer from Belady's Anomaly because it is not a stack algorithm. In certain reference strings, adding more physical memory frames increases the total number of page faults.",
                teacher));

        list.add(getOrCreateQuestion(tCpu,
                "What is the primary difference between a Mutex and a Counting Semaphore in multithreaded synchronization?",
                List.of("A Mutex has ownership semantics and can only be unlocked by the thread that locked it; a Semaphore is a signaling counter that can be incremented/decremented by any thread",
                        "A Mutex can be shared across separate machines, while a Semaphore is purely local",
                        "A Semaphore allows only 1 thread at a time, while a Mutex allows N threads",
                        "Mutexes operate only in user space, while Semaphores require kernel locks"),
                0, Question.Difficulty.MEDIUM,
                "A Mutex is a locking primitive with ownership: only the thread that acquired it may release it. A Semaphore is a signaling mechanism with an integer counter that any thread can increment (signal/post) or decrement (wait).",
                teacher));

        list.add(getOrCreateQuestion(tCpu,
                "Why is Shortest Job First (SJF) scheduling theoretically proven to be optimal among non-preemptive CPU scheduling algorithms?",
                List.of("It guarantees zero CPU idle cycles",
                        "It gives the minimum average waiting time for any given set of stationary processes",
                        "It completely eliminates starvation for long processes",
                        "It has O(1) context switching overhead"),
                1, Question.Difficulty.EASY,
                "Moving shorter CPU bursts ahead of longer ones minimizes the queuing time experienced by all subsequent processes, mathematically producing the lowest possible average waiting time.",
                teacher));

        list.add(getOrCreateQuestion(tMem,
                "What is the role of the Translation Lookaside Buffer (TLB) in CPU memory management?",
                List.of("Caches disk sectors before flushing to flash drive",
                        "Acts as a fast hardware associative cache for recent virtual-to-physical address translations",
                        "Stores swapped pages compressed in RAM",
                        "Tracks CPU instruction branch predictions"),
                1, Question.Difficulty.MEDIUM,
                "Translating virtual addresses to physical addresses through multi-level page tables in RAM is slow. The TLB is an on-chip associative cache that stores recent VPN-to-PFN translations, speeding up memory accesses.",
                teacher));

        list.add(getOrCreateQuestion(tCpu,
                "What is the primary purpose of Dijkstra's Banker's Algorithm in operating systems?",
                List.of("Deadlock recovery via process rollback",
                        "Deadlock avoidance by simulating resource allocation to ensure the system remains in a safe state",
                        "CPU frequency scaling for thermal control",
                        "Dynamic swap partition allocation"),
                1, Question.Difficulty.MEDIUM,
                "The Banker's Algorithm evaluates resource requests in advance. If granting a request could transition the system into an unsafe state where circular wait cannot be avoided, the request is denied or delayed.",
                teacher));

        list.add(getOrCreateQuestion(tCpu,
                "What happens in a pure User-Level Thread (ULT) implementation when one thread invokes a blocking I/O system call?",
                List.of("Only that user thread blocks; the thread runtime switches to another user thread in the same process",
                        "The entire process and all other user threads within it are blocked by the OS kernel",
                        "The thread is promoted automatically to a kernel-level thread",
                        "An asynchronous event interrupt cancels the system call"),
                1, Question.Difficulty.HARD,
                "Because the OS kernel only knows about the single process and not the user threads inside it, a blocking system call puts the entire process to sleep, preventing all peer user threads from running.",
                teacher));

        list.add(getOrCreateQuestion(tMem,
                "How does the SCAN (Elevator) disk scheduling algorithm service incoming track requests?",
                List.of("Services requests in pure First-Come, First-Served order",
                        "Moves the disk head in one direction servicing all requests until reaching the edge, then reverses direction",
                        "Always resets the disk arm to track 0 after each sweep",
                        "Jumps directly to the track with shortest seek time regardless of direction"),
                1, Question.Difficulty.EASY,
                "The SCAN algorithm sweeps the disk arm continuously back and forth across cylinders, servicing pending I/O requests along the current direction until hitting the boundary, then reverses direction.",
                teacher));

        return list;
    }

    private List<Question> seedSeCuratedQuestions(Topic tArch, Topic tPatterns, User teacher) {
        List<Question> list = new ArrayList<>();
        list.add(getOrCreateQuestion(tPatterns,
                "What does the Single Responsibility Principle (SRP) in SOLID class design state?",
                List.of("A class should have only one method",
                        "A class should have one, and only one, reason to change",
                        "A class should only be instantiated once during runtime",
                        "A class should only inherit from a single interface"),
                1, Question.Difficulty.EASY,
                "Single Responsibility Principle dictates that a class should have one, and only one, reason to change, meaning it encapsulates a single cohesive domain responsibility.",
                teacher));

        list.add(getOrCreateQuestion(tArch,
                "In distributed system architecture, what does the CAP Theorem state when a network partition (P) occurs?",
                List.of("The system can provide both Consistency (C) and Availability (A) by buffering writes",
                        "The system must choose between Consistency (CP) or Availability (AP); it cannot guarantee both",
                        "The system must revert to single-node monolithic execution",
                        "The partition must be resolved within 50 milliseconds to preserve ACID transactions"),
                1, Question.Difficulty.MEDIUM,
                "During an unavoidable network partition where nodes cannot communicate, a distributed system must choose between Consistency (refusing writes to prevent stale data) or Availability (accepting writes with potential inconsistency).",
                teacher));

        list.add(getOrCreateQuestion(tPatterns,
                "Which Gang of Four (GoF) design pattern defines a publish-subscribe dependency so that when one object changes state, all dependent objects are automatically notified?",
                List.of("Factory Pattern",
                        "Observer Pattern",
                        "Adapter Pattern",
                        "Decorator Pattern"),
                1, Question.Difficulty.EASY,
                "The Observer pattern defines a one-to-many relationship where observer objects register with a subject. When the subject changes state, all observers are notified and updated automatically.",
                teacher));

        list.add(getOrCreateQuestion(tArch,
                "How does the Cache-Aside (Lazy Loading) pattern differ from the Write-Through caching pattern?",
                List.of("In Cache-Aside, the application queries cache first and loads from DB on miss; in Write-Through, writes synchronously update cache and database together",
                        "Cache-Aside writes to cache only upon system shutdown",
                        "Write-Through never writes to the database until cache evicts",
                        "Cache-Aside guarantees immediate consistency under high write throughput"),
                0, Question.Difficulty.MEDIUM,
                "In Cache-Aside, application code manages caching: checking cache, reading DB on miss, and populating cache. In Write-Through, all data writes pass through the cache layer, which updates the cache and backing DB simultaneously.",
                teacher));

        list.add(getOrCreateQuestion(tArch,
                "What primary operational benefit is achieved by introducing a distributed message broker (such as Kafka or RabbitMQ) between services?",
                List.of("Guarantees zero database storage requirements",
                        "Decouples service dependencies, buffers high-traffic spikes, and enables asynchronous event processing",
                        "Enforces synchronous distributed ACID transactions",
                        "Eliminates need for load balancers"),
                1, Question.Difficulty.MEDIUM,
                "Message brokers decouple producers and consumers, enabling asynchronous processing, absorbing sudden traffic bursts without dropping requests, and supporting independent service scaling.",
                teacher));

        list.add(getOrCreateQuestion(tPatterns,
                "Why is the classic Singleton design pattern frequently considered an anti-pattern when used excessively in enterprise applications?",
                List.of("It prevents static method declarations",
                        "It introduces hidden global state, tight coupling, and makes unit testing difficult by hindering mock injection",
                        "It consumes twice the RAM of prototype beans in Spring Boot",
                        "It prevents garbage collection of local variables"),
                1, Question.Difficulty.MEDIUM,
                "Singletons act as global variables that hide component dependencies, retain state across unit test cases leading to flaky tests, and tightly couple callers to a specific concrete instance.",
                teacher));

        list.add(getOrCreateQuestion(tArch,
                "In database scalability, what is the key distinction between Horizontal Sharding and Vertical Partitioning?",
                List.of("Horizontal sharding splits rows across multiple database instances using a shard key; vertical partitioning separates columns or distinct tables into separate databases",
                        "Horizontal sharding increases RAM on a single node; vertical partitioning adds more CPU cores",
                        "Horizontal sharding is only for NoSQL; vertical partitioning is only for SQL",
                        "Horizontal sharding duplicates data across all nodes; vertical partitioning does not"),
                0, Question.Difficulty.MEDIUM,
                "Horizontal sharding partitions rows across multiple nodes based on a partition key (e.g., student ID). Vertical partitioning divides tables or column subsets (e.g., user profiles vs user billing) onto separate database servers.",
                teacher));

        list.add(getOrCreateQuestion(tPatterns,
                "What does the Dependency Inversion Principle (the 'D' in SOLID) mandate?",
                List.of("High-level modules should depend directly on low-level modules",
                        "High-level modules should not depend on low-level modules; both should depend on abstractions",
                        "All classes must use dependency injection frameworks",
                        "Database queries must be written directly inside REST controllers"),
                1, Question.Difficulty.EASY,
                "Dependency Inversion states that high-level business logic should not depend on low-level technical implementations (like specific SQL drivers or HTTP clients). Both must depend on shared abstractions (interfaces).",
                teacher));

        list.add(getOrCreateQuestion(tArch,
                "Which load balancing algorithm distributes incoming traffic by taking into account both the number of active requests per node and each server's relative hardware capacity?",
                List.of("Round Robin",
                        "Random Selection",
                        "Weighted Least Connections",
                        "IP Hash"),
                2, Question.Difficulty.EASY,
                "Weighted Least Connections tracks the number of open connections currently handled by each server and divides it by the server's configured weight, routing new requests to the least loaded server.",
                teacher));

        list.add(getOrCreateQuestion(tArch,
                "What distinguishes a Canary Deployment strategy in continuous software delivery?",
                List.of("Deploying the new release to 100% of servers during maintenance hours",
                        "Gradually rolling out the new release to a small fraction of real users (e.g. 5%) to validate stability before full fleet deployment",
                        "Keeping two identical production environments and toggling DNS traffic between them",
                        "Executing automated unit tests in isolated development environments"),
                1, Question.Difficulty.EASY,
                "A Canary deployment routes a small percentage of live production traffic to the new software version. If error rates and latency remain healthy, the deployment rolls out to 100% of the fleet.",
                teacher));

        return list;
    }

    private void assignQuizIfNotAssigned(Quiz quiz, ClassEntity targetClass) {
        boolean exists = quizAssignmentRepository.findAll().stream()
                .anyMatch(a -> a.getQuiz().getId().equals(quiz.getId()) && a.getTargetClass() != null && a.getTargetClass().getId().equals(targetClass.getId()));
        if (!exists) {
            quizAssignmentRepository.save(new QuizAssignment(quiz, targetClass, null));
        }
    }

    private List<Question> getQuestionsSlice(List<Question> questions, int start, int end) {
        if (questions.isEmpty()) return List.of();
        int s = Math.min(start, questions.size() - 1);
        int e = Math.min(end, questions.size());
        return questions.subList(s, e);
    }

    private void seedQuestionsForTopic(Topic topic, User creator) {
        String topicName = topic.getName();
        for (int i = 1; i <= 15; i++) {
            Question.Difficulty diff = (i % 3 == 0) ? Question.Difficulty.HARD : (i % 2 == 0 ? Question.Difficulty.MEDIUM : Question.Difficulty.EASY);
            String text = String.format("Concept %d: In the context of %s, which statement regarding theoretical behavior and structural invariants is correct?", i, topicName);
            List<String> options = List.of(
                    String.format("Option A: The worst-case invariant requires exhaustive sequential traversal under %s.", topicName),
                    String.format("Option B: The primary operational property guarantees mathematically optimal bounds when properly partitioned in %s.", topicName),
                    String.format("Option C: Memory consumption is completely unbound and non-deterministic.", topicName),
                    String.format("Option D: The structure completely ignores key ordering and comparison axioms.", topicName)
            );
            int correctIndex = (i % 4);
            String explanation = String.format("Theoretical Explanation for Concept %d in %s: Option %c is correct because it directly satisfies the fundamental invariants established by computer science literature.",
                    i, topicName, (char)('A' + correctIndex));

            try {
                String optionsJson = objectMapper.writeValueAsString(options);
                Question q = new Question(topic, text, optionsJson, correctIndex, diff, explanation, Question.Source.MANUAL, creator);
                questionRepository.save(q);
            } catch (Exception ignored) {
            }
        }
    }
}
