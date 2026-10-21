package com.edupulse.service;

import com.edupulse.dto.ImportDto.*;
import com.edupulse.entity.*;
import com.edupulse.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;

@Service
public class AcademicImportService {

    private static final Logger log = LoggerFactory.getLogger(AcademicImportService.class);

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final AcademicRecordRepository academicRecordRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ImportBatchRepository importBatchRepository;
    private final ObjectMapper objectMapper;

    public AcademicImportService(UserRepository userRepository,
                                 SubjectRepository subjectRepository,
                                 AcademicRecordRepository academicRecordRepository,
                                 AttendanceRecordRepository attendanceRecordRepository,
                                 ImportBatchRepository importBatchRepository,
                                 ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.academicRecordRepository = academicRecordRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.importBatchRepository = importBatchRepository;
        this.objectMapper = objectMapper;
    }

    public String getTemplateCsv(String type) {
        if ("ATTENDANCE".equalsIgnoreCase(type)) {
            return "student_email,subject_name,attendance_date,status\n" +
                   "student1@edupulse.local,Data Structures and Algorithms,2025-10-15,PRESENT\n" +
                   "student2@edupulse.local,Database Management Systems,2025-10-15,ABSENT\n" +
                   "student3@edupulse.local,Web Technologies,2025-10-15,EXCUSED\n";
        }
        return "student_email,subject_name,assessment_type,marks_obtained,max_marks,semester,academic_year\n" +
               "student1@edupulse.local,Data Structures and Algorithms,MIDTERM,85.5,100,Fall,2025-2026\n" +
               "student2@edupulse.local,Database Management Systems,QUIZ_1,18.0,20,Fall,2025-2026\n" +
               "student3@edupulse.local,Web Technologies,ASSIGNMENT,45.0,50,Fall,2025-2026\n";
    }

    public ImportPreviewResponse previewFile(MultipartFile file, String type) {
        ImportPreviewResponse response = new ImportPreviewResponse();
        response.setType(type);
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "import_file";
        response.setFileName(fileName);

        List<ImportRowResult> rows = new ArrayList<>();
        String lowerName = fileName.toLowerCase();

        try {
            if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
                rows = parseExcelFile(file.getInputStream(), type);
            } else {
                rows = parseCsvStream(file.getInputStream(), type);
            }
        } catch (Exception e) {
            log.error("Failed to parse uploaded import file {}: {}", fileName, e.getMessage());
            ImportRowResult errRow = new ImportRowResult();
            errRow.setRowNumber(0);
            errRow.setValid(false);
            errRow.setError("File parsing error: " + e.getMessage());
            rows.add(errRow);
        }

        applyDuplicateAndDatabaseChecks(rows, type);
        finalizePreviewStats(response, rows);
        return response;
    }

    public ImportPreviewResponse previewCsv(ImportPreviewRequest request) {
        ImportPreviewResponse response = new ImportPreviewResponse();
        response.setType(request.getType());
        response.setFileName(request.getFileName() != null ? request.getFileName() : "import.csv");

        List<ImportRowResult> rows = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new StringReader(request.getCsvContent()))) {
            String line;
            int lineNum = 0;
            while ((line = reader.readLine()) != null) {
                lineNum++;
                line = line.trim();
                if (line.isEmpty() || lineNum == 1) {
                    continue; // Skip empty lines & header
                }

                String[] cols = line.split(",", -1);
                ImportRowResult row = new ImportRowResult();
                row.setRowNumber(lineNum);

                if ("ATTENDANCE".equalsIgnoreCase(request.getType())) {
                    parseAttendanceRow(cols, row);
                } else {
                    parseMarksRow(cols, row);
                }
                rows.add(row);
            }
        } catch (Exception e) {
            ImportRowResult errRow = new ImportRowResult();
            errRow.setRowNumber(0);
            errRow.setValid(false);
            errRow.setError("CSV parsing error: " + e.getMessage());
            rows.add(errRow);
        }

        applyDuplicateAndDatabaseChecks(rows, request.getType());
        finalizePreviewStats(response, rows);
        return response;
    }

    private List<ImportRowResult> parseCsvStream(InputStream is, String type) throws Exception {
        List<ImportRowResult> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            int lineNum = 0;
            while ((line = reader.readLine()) != null) {
                lineNum++;
                line = line.trim();
                if (line.isEmpty() || lineNum == 1) {
                    continue;
                }
                String[] cols = line.split(",", -1);
                ImportRowResult row = new ImportRowResult();
                row.setRowNumber(lineNum);
                if ("ATTENDANCE".equalsIgnoreCase(type)) {
                    parseAttendanceRow(cols, row);
                } else {
                    parseMarksRow(cols, row);
                }
                rows.add(row);
            }
        }
        return rows;
    }

    private List<ImportRowResult> parseExcelFile(InputStream is, String type) throws Exception {
        List<ImportRowResult> rows = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            int lineNum = 0;
            for (Row poiRow : sheet) {
                lineNum++;
                if (lineNum == 1) continue; // Skip header

                List<String> colList = new ArrayList<>();
                for (int c = 0; c < poiRow.getLastCellNum(); c++) {
                    Cell cell = poiRow.getCell(c, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                    colList.add(formatter.formatCellValue(cell).trim());
                }

                if (colList.stream().allMatch(String::isEmpty)) continue;

                String[] cols = colList.toArray(new String[0]);
                ImportRowResult row = new ImportRowResult();
                row.setRowNumber(lineNum);

                if ("ATTENDANCE".equalsIgnoreCase(type)) {
                    parseAttendanceRow(cols, row);
                } else {
                    parseMarksRow(cols, row);
                }
                rows.add(row);
            }
        }
        return rows;
    }

    private void applyDuplicateAndDatabaseChecks(List<ImportRowResult> rows, String type) {
        Set<String> seenKeys = new HashSet<>();
        boolean isAttendance = "ATTENDANCE".equalsIgnoreCase(type);

        for (ImportRowResult row : rows) {
            if (!row.isValid()) continue;

            String studentEmail = row.getStudentEmail() != null ? row.getStudentEmail().toLowerCase() : "";
            String subjectName = row.getSubjectName() != null ? row.getSubjectName().toLowerCase() : "";

            // 1. In-batch Duplicate Detection
            String batchKey = isAttendance
                    ? studentEmail + "|" + subjectName + "|" + row.getAttendanceDate()
                    : studentEmail + "|" + subjectName + "|" + (row.getAssessmentType() != null ? row.getAssessmentType().toLowerCase() : "");

            if (!seenKeys.add(batchKey)) {
                row.setValid(false);
                row.setDuplicate(true);
                row.setError("Duplicate record within upload batch: Already defined in an earlier row.");
                continue;
            }

            // 2. Database Duplicate Warning
            try {
                User student = userRepository.findByEmail(row.getStudentEmail()).orElse(null);
                Subject subject = findSubjectForgiving(row.getSubjectName()).orElse(null);
                if (student != null && subject != null) {
                    if (isAttendance && row.getAttendanceDate() != null) {
                        LocalDate date = LocalDate.parse(row.getAttendanceDate());
                        List<AttendanceRecord> existing = attendanceRecordRepository.findByStudentId(student.getId());
                        boolean dbDuplicate = existing.stream().anyMatch(a ->
                                a.getSubject().getId().equals(subject.getId()) && a.getAttendanceDate().equals(date));
                        if (dbDuplicate) {
                            row.setWarning("Record for date " + date + " already exists in system (will record additional session).");
                        }
                    } else if (!isAttendance && row.getAssessmentType() != null) {
                        List<AcademicRecord> existing = academicRecordRepository.findByStudentId(student.getId());
                        boolean dbDuplicate = existing.stream().anyMatch(a ->
                                a.getSubject().getId().equals(subject.getId()) &&
                                a.getAssessmentName().equalsIgnoreCase(row.getAssessmentType()));
                        if (dbDuplicate) {
                            row.setWarning("Assessment '" + row.getAssessmentType() + "' already exists in database for this student.");
                        }
                    }
                }
            } catch (Exception ignored) {}
        }
    }

    private void finalizePreviewStats(ImportPreviewResponse response, List<ImportRowResult> rows) {
        int validCount = 0;
        int invalidCount = 0;
        for (ImportRowResult r : rows) {
            if (r.isValid()) validCount++;
            else invalidCount++;
        }
        response.setTotalRows(rows.size());
        response.setValidRows(validCount);
        response.setInvalidRows(invalidCount);
        response.setRows(rows);
    }

    private void parseMarksRow(String[] cols, ImportRowResult row) {
        if (cols.length < 5) {
            row.setValid(false);
            row.setError("Expected at least 5 columns (student_email, subject_name, assessment_type, marks_obtained, max_marks)");
            return;
        }

        String email = cols[0].trim();
        String subjectName = cols[1].trim();
        String assessment = cols[2].trim();
        String marksStr = cols[3].trim();
        String maxMarksStr = cols[4].trim();
        String semester = cols.length > 5 ? cols[5].trim() : "Semester 1";
        String academicYear = cols.length > 6 ? cols[6].trim() : "2025-2026";

        row.setStudentEmail(email);
        row.setSubjectName(subjectName);
        row.setAssessmentType(assessment);
        row.setSemester(semester);
        row.setAcademicYear(academicYear);

        Optional<User> studentOpt = userRepository.findByEmail(email);
        if (studentOpt.isEmpty()) {
            row.setValid(false);
            row.setError("Student email not found: " + email);
            return;
        }
        row.setStudentName(studentOpt.get().getName());

        Optional<Subject> subjectOpt = findSubjectForgiving(subjectName);
        if (subjectOpt.isEmpty()) {
            row.setValid(false);
            row.setError("Subject not found: " + subjectName);
            return;
        }

        try {
            double marks = Double.parseDouble(marksStr);
            double maxMarks = Double.parseDouble(maxMarksStr);
            if (maxMarks <= 0 || marks < 0 || marks > maxMarks) {
                row.setValid(false);
                row.setError("Invalid marks: obtained=" + marks + ", max=" + maxMarks);
                return;
            }
            row.setMarksObtained(marks);
            row.setMaxMarks(maxMarks);
            row.setValid(true);
        } catch (NumberFormatException e) {
            row.setValid(false);
            row.setError("Numeric parse error for marks: " + marksStr + " / " + maxMarksStr);
        }
    }

    private void parseAttendanceRow(String[] cols, ImportRowResult row) {
        if (cols.length < 4) {
            row.setValid(false);
            row.setError("Expected at least 4 columns (student_email, subject_name, attendance_date, status)");
            return;
        }

        String email = cols[0].trim();
        String subjectName = cols[1].trim();
        String dateStr = cols[2].trim();
        String statusStr = cols[3].trim().toUpperCase();

        row.setStudentEmail(email);
        row.setSubjectName(subjectName);
        row.setAttendanceDate(dateStr);
        row.setAttendanceStatus(statusStr);

        Optional<User> studentOpt = userRepository.findByEmail(email);
        if (studentOpt.isEmpty()) {
            row.setValid(false);
            row.setError("Student email not found: " + email);
            return;
        }
        row.setStudentName(studentOpt.get().getName());

        Optional<Subject> subjectOpt = findSubjectForgiving(subjectName);
        if (subjectOpt.isEmpty()) {
            row.setValid(false);
            row.setError("Subject not found: " + subjectName);
            return;
        }

        try {
            LocalDate.parse(dateStr);
        } catch (Exception e) {
            row.setValid(false);
            row.setError("Invalid date format (must be YYYY-MM-DD): " + dateStr);
            return;
        }

        try {
            AttendanceRecord.Status.valueOf(statusStr);
            row.setValid(true);
        } catch (IllegalArgumentException e) {
            row.setValid(false);
            row.setError("Invalid status '" + statusStr + "'. Expected PRESENT, ABSENT, or EXCUSED");
        }
    }

    private Optional<Subject> findSubjectForgiving(String subjectName) {
        if (subjectName == null || subjectName.trim().isEmpty()) return Optional.empty();
        Optional<Subject> opt = subjectRepository.findByName(subjectName.trim());
        if (opt.isPresent()) return opt;

        List<Subject> allSubs = subjectRepository.findAll();
        String cleanInput = subjectName.toLowerCase().replace("&", "and").replaceAll("\\s+", " ").trim();
        for (Subject s : allSubs) {
            String cleanS = s.getName().toLowerCase().replace("&", "and").replaceAll("\\s+", " ").trim();
            if (cleanS.equals(cleanInput) || cleanS.contains(cleanInput) || cleanInput.contains(cleanS)) {
                return Optional.of(s);
            }
        }
        return Optional.empty();
    }

    @Transactional
    public ImportBatch commitImport(ImportCommitRequest request, Long uploaderId) {
        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new RuntimeException("Uploader user not found"));

        ImportBatch batch = new ImportBatch(uploader, request.getFileName() != null ? request.getFileName() : "import.csv");
        batch.setStatus(ImportBatch.Status.PROCESSING);
        batch = importBatchRepository.save(batch);

        int total = request.getRows() != null ? request.getRows().size() : 0;
        int successful = 0;
        int failed = 0;
        List<Map<String, Object>> errorLog = new ArrayList<>();

        boolean isAttendance = "ATTENDANCE".equalsIgnoreCase(request.getType());

        if (request.getRows() != null) {
            for (ImportRowResult row : request.getRows()) {
                if (!row.isValid()) {
                    failed++;
                    Map<String, Object> err = new HashMap<>();
                    err.put("rowNumber", row.getRowNumber());
                    err.put("error", row.getError());
                    errorLog.add(err);
                    continue;
                }

                try {
                    User student = userRepository.findByEmail(row.getStudentEmail()).orElse(null);
                    Subject subject = findSubjectForgiving(row.getSubjectName()).orElse(null);

                    if (student == null || subject == null) {
                        failed++;
                        Map<String, Object> err = new HashMap<>();
                        err.put("rowNumber", row.getRowNumber());
                        err.put("error", "Student or Subject resolved to null during commit");
                        errorLog.add(err);
                        continue;
                    }

                    if (isAttendance) {
                        AttendanceRecord att = new AttendanceRecord(
                                student,
                                subject,
                                LocalDate.parse(row.getAttendanceDate()),
                                AttendanceRecord.Status.valueOf(row.getAttendanceStatus()),
                                AttendanceRecord.Source.MANUAL_IMPORT,
                                batch.getId()
                        );
                        attendanceRecordRepository.save(att);
                    } else {
                        AcademicRecord rec = new AcademicRecord(
                                student,
                                subject,
                                row.getAssessmentType(),
                                row.getMarksObtained(),
                                row.getMaxMarks(),
                                LocalDate.now(),
                                AcademicRecord.Source.MANUAL_IMPORT,
                                batch.getId()
                        );
                        academicRecordRepository.save(rec);
                    }
                    successful++;
                } catch (Exception ex) {
                    failed++;
                    Map<String, Object> err = new HashMap<>();
                    err.put("rowNumber", row.getRowNumber());
                    err.put("error", ex.getMessage());
                    errorLog.add(err);
                }
            }
        }

        batch.setTotalRows(total);
        batch.setSuccessfulRows(successful);
        batch.setFailedRows(failed);
        batch.setStatus(failed > 0 && successful == 0 ? ImportBatch.Status.FAILED : ImportBatch.Status.COMPLETED);

        try {
            batch.setErrorLog(objectMapper.writeValueAsString(errorLog));
        } catch (Exception e) {
            batch.setErrorLog("[]");
        }

        return importBatchRepository.save(batch);
    }

    public List<ImportBatch> getImportBatches() {
        return importBatchRepository.findAllByOrderByCreatedAtDesc();
    }

    public Map<String, Object> getStudentAcademicOverview(Long studentId) {
        List<AcademicRecord> marks = academicRecordRepository.findByStudentId(studentId);
        List<AttendanceRecord> attendance = attendanceRecordRepository.findByStudentId(studentId);

        long presentCount = attendance.stream()
                .filter(a -> a.getStatus() == AttendanceRecord.Status.PRESENT)
                .count();
        double attendancePct = attendance.isEmpty() ? 100.0 : ((double) presentCount / attendance.size()) * 100.0;

        double totalPct = 0;
        int count = 0;
        for (AcademicRecord m : marks) {
            if (m.getMaximumMarks() != null && m.getMaximumMarks() > 0) {
                totalPct += (m.getMarksObtained() / m.getMaximumMarks()) * 100.0;
                count++;
            }
        }
        double avgMarksPct = count > 0 ? totalPct / count : 0.0;

        Map<String, Object> overview = new HashMap<>();
        overview.put("marksRecords", marks);
        overview.put("attendanceRecords", attendance);
        overview.put("attendancePercentage", Math.round(attendancePct * 10.0) / 10.0);
        overview.put("averageMarksPercentage", Math.round(avgMarksPct * 10.0) / 10.0);
        overview.put("totalAssessments", count);
        overview.put("totalAttendanceClasses", attendance.size());
        return overview;
    }
}
