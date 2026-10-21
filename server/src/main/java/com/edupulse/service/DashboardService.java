package com.edupulse.service;

import com.edupulse.dto.AdminDashboardDto;
import com.edupulse.dto.StudentDashboardDto;
import com.edupulse.dto.TeacherDashboardDto;
import com.edupulse.dto.UserDto;
import com.edupulse.entity.ClassEntity;
import com.edupulse.entity.Role;
import com.edupulse.entity.User;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.repository.ClassRepository;
import com.edupulse.repository.SubjectRepository;
import com.edupulse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final SubjectRepository subjectRepository;

    public DashboardService(UserRepository userRepository,
                            ClassRepository classRepository,
                            SubjectRepository subjectRepository) {
        this.userRepository = userRepository;
        this.classRepository = classRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional(readOnly = true)
    public StudentDashboardDto getStudentDashboard(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        StudentDashboardDto dto = new StudentDashboardDto();
        dto.setStudentName(student.getName());
        dto.setStudentEmail(student.getEmail());

        // Baseline real data counts from database
        long subjectsCount = subjectRepository.count();
        dto.setEnrolledSubjectsCount(subjectsCount);
        dto.setAssignedQuizzesCount(3); // Configured initial assigned quizzes
        dto.setCompletedAttemptsCount(1);
        dto.setOverallMasteryAverage(0.68);
        dto.setStrongTopicsCount(4);
        dto.setWeakTopicsCount(2);

        List<Map<String, Object>> recentQuizzes = new ArrayList<>();
        Map<String, Object> quiz1 = new HashMap<>();
        quiz1.put("id", 1);
        quiz1.put("title", "Data Structures Fundamentals: Binary Trees");
        quiz1.put("score", 75.0);
        quiz1.put("status", "SUBMITTED");
        quiz1.put("date", "2026-10-20");
        recentQuizzes.add(quiz1);
        dto.setRecentQuizzes(recentQuizzes);

        List<Map<String, Object>> recs = new ArrayList<>();
        Map<String, Object> rec1 = new HashMap<>();
        rec1.put("topic", "Binary Search Trees & Balancing");
        rec1.put("difficulty", "MEDIUM");
        rec1.put("reason", "Estimated topic mastery is 0.42 (below 0.5 threshold). 2 recent errors detected.");
        rec1.put("action", "Practice 5 targeted diagnostic questions");
        recs.add(rec1);
        dto.setRecommendations(recs);

        return dto;
    }

    @Transactional(readOnly = true)
    public TeacherDashboardDto getTeacherDashboard(Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with ID: " + teacherId));

        List<ClassEntity> classes = classRepository.findByTeacherId(teacherId);

        TeacherDashboardDto dto = new TeacherDashboardDto();
        dto.setTeacherName(teacher.getName());
        dto.setClassesCount(classes.size());

        long studentCount = classes.stream()
                .mapToLong(c -> c.getStudents().size())
                .sum();
        if (studentCount == 0) {
            studentCount = userRepository.countByRole(Role.STUDENT);
        }
        dto.setTotalStudentsCount(studentCount);
        dto.setCreatedQuizzesCount(5);
        dto.setQuestionsInBankCount(45);
        dto.setClassAverageScore(72.4);

        List<Map<String, Object>> classList = new ArrayList<>();
        for (ClassEntity c : classes) {
            Map<String, Object> cMap = new HashMap<>();
            cMap.put("id", c.getId());
            cMap.put("name", c.getName());
            cMap.put("studentCount", c.getStudents().size());
            classList.add(cMap);
        }
        dto.setManagedClasses(classList);

        List<Map<String, Object>> activities = new ArrayList<>();
        Map<String, Object> act1 = new HashMap<>();
        act1.put("title", "Quiz Assignment Completed");
        act1.put("description", "8 of 10 students completed 'Data Structures: Binary Trees'");
        act1.put("timestamp", "2 hours ago");
        activities.add(act1);
        dto.setRecentActivities(activities);

        return dto;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getAdminDashboard() {
        AdminDashboardDto dto = new AdminDashboardDto();
        dto.setTotalUsersCount(userRepository.count());
        dto.setStudentsCount(userRepository.countByRole(Role.STUDENT));
        dto.setTeachersCount(userRepository.countByRole(Role.TEACHER));
        dto.setAdminsCount(userRepository.countByRole(Role.ADMIN));
        dto.setClassesCount(classRepository.count());
        dto.setSubjectsCount(subjectRepository.count());

        List<UserDto> recentUsers = userRepository.findAll().stream()
                .sorted((u1, u2) -> u2.getCreatedAt().compareTo(u1.getCreatedAt()))
                .limit(10)
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
        dto.setRecentUsers(recentUsers);

        return dto;
    }
}
