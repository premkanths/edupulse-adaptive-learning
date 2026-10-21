package com.edupulse.service;

import com.edupulse.entity.ClassEntity;
import com.edupulse.entity.Role;
import com.edupulse.entity.User;
import com.edupulse.exception.BadRequestException;
import com.edupulse.exception.ResourceNotFoundException;
import com.edupulse.repository.ClassRepository;
import com.edupulse.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ClassManagementService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;

    public ClassManagementService(ClassRepository classRepository, UserRepository userRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> getAllClasses() {
        List<ClassEntity> classes = classRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (ClassEntity c : classes) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("teacherId", c.getTeacher().getId());
            map.put("teacherName", c.getTeacher().getName());
            map.put("teacherEmail", c.getTeacher().getEmail());
            map.put("studentCount", c.getStudents().size());
            map.put("createdAt", c.getCreatedAt());
            result.add(map);
        }
        return result;
    }

    public Map<String, Object> getClassDetails(Long classId) {
        ClassEntity c = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classId));

        Map<String, Object> result = new HashMap<>();
        result.put("id", c.getId());
        result.put("name", c.getName());
        result.put("teacherId", c.getTeacher().getId());
        result.put("teacherName", c.getTeacher().getName());
        result.put("teacherEmail", c.getTeacher().getEmail());

        List<Map<String, Object>> studentList = new ArrayList<>();
        for (User s : c.getStudents()) {
            Map<String, Object> sm = new HashMap<>();
            sm.put("id", s.getId());
            sm.put("name", s.getName());
            sm.put("email", s.getEmail());
            sm.put("isActive", s.isActive());
            studentList.add(sm);
        }
        result.put("students", studentList);
        result.put("studentCount", studentList.size());
        result.put("createdAt", c.getCreatedAt());

        return result;
    }

    @Transactional
    public ClassEntity createClass(String name, Long teacherId) {
        if (classRepository.existsByName(name)) {
            throw new BadRequestException("Class with name '" + name + "' already exists");
        }
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + teacherId));

        if (teacher.getRole() != Role.TEACHER && teacher.getRole() != Role.ADMIN) {
            throw new BadRequestException("Assigned user must have TEACHER or ADMIN role");
        }

        ClassEntity newClass = new ClassEntity(name, teacher);
        return classRepository.save(newClass);
    }

    @Transactional
    public ClassEntity enrollStudent(Long classId, Long studentId) {
        ClassEntity c = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classId));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        c.getStudents().add(student);
        return classRepository.save(c);
    }

    @Transactional
    public ClassEntity removeStudent(Long classId, Long studentId) {
        ClassEntity c = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classId));

        c.getStudents().removeIf(s -> s.getId().equals(studentId));
        return classRepository.save(c);
    }

    @Transactional
    public void deleteClass(Long classId) {
        if (!classRepository.existsById(classId)) {
            throw new ResourceNotFoundException("Class not found: " + classId);
        }
        classRepository.deleteById(classId);
    }

    @Transactional
    public User toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setRole(newRole);
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserDetails(Long userId, String name, String email) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (email != null && !email.trim().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(email.trim())) {
                throw new BadRequestException("Email already in use: " + email);
            }
            user.setEmail(email.trim());
        }
        if (name != null && !name.trim().isEmpty()) {
            user.setName(name.trim());
        }
        return userRepository.save(user);
    }
}
