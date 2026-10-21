package com.edupulse.dto;

import java.util.ArrayList;
import java.util.List;

public class ImportDto {

    public static class ImportPreviewRequest {
        private String type; // MARKS or ATTENDANCE
        private String csvContent;
        private String fileName;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getCsvContent() { return csvContent; }
        public void setCsvContent(String csvContent) { this.csvContent = csvContent; }
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
    }

    public static class ImportRowResult {
        private int rowNumber;
        private boolean valid;
        private String error;
        private String studentEmail;
        private String studentName;
        private String subjectName;
        private String assessmentType;
        private Double marksObtained;
        private Double maxMarks;
        private String semester;
        private String academicYear;
        private String attendanceDate;
        private String attendanceStatus;
        private boolean duplicate;
        private String warning;

        public int getRowNumber() { return rowNumber; }
        public void setRowNumber(int rowNumber) { this.rowNumber = rowNumber; }
        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public boolean isDuplicate() { return duplicate; }
        public void setDuplicate(boolean duplicate) { this.duplicate = duplicate; }
        public String getWarning() { return warning; }
        public void setWarning(String warning) { this.warning = warning; }
        public String getStudentEmail() { return studentEmail; }
        public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
        public String getAssessmentType() { return assessmentType; }
        public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }
        public Double getMarksObtained() { return marksObtained; }
        public void setMarksObtained(Double marksObtained) { this.marksObtained = marksObtained; }
        public Double getMaxMarks() { return maxMarks; }
        public void setMaxMarks(Double maxMarks) { this.maxMarks = maxMarks; }
        public String getSemester() { return semester; }
        public void setSemester(String semester) { this.semester = semester; }
        public String getAcademicYear() { return academicYear; }
        public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
        public String getAttendanceDate() { return attendanceDate; }
        public void setAttendanceDate(String attendanceDate) { this.attendanceDate = attendanceDate; }
        public String getAttendanceStatus() { return attendanceStatus; }
        public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }
    }

    public static class ImportPreviewResponse {
        private String type;
        private String fileName;
        private int totalRows;
        private int validRows;
        private int invalidRows;
        private List<ImportRowResult> rows = new ArrayList<>();

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public int getTotalRows() { return totalRows; }
        public void setTotalRows(int totalRows) { this.totalRows = totalRows; }
        public int getValidRows() { return validRows; }
        public void setValidRows(int validRows) { this.validRows = validRows; }
        public int getInvalidRows() { return invalidRows; }
        public void setInvalidRows(int invalidRows) { this.invalidRows = invalidRows; }
        public List<ImportRowResult> getRows() { return rows; }
        public void setRows(List<ImportRowResult> rows) { this.rows = rows; }
    }

    public static class ImportCommitRequest {
        private String type;
        private String fileName;
        private List<ImportRowResult> rows;

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public List<ImportRowResult> getRows() { return rows; }
        public void setRows(List<ImportRowResult> rows) { this.rows = rows; }
    }
}
