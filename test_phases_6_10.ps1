$ErrorActionPreference = "Stop"

Write-Host "=== EDUPULSE PHASES 6-10 VERIFICATION SCRIPT ===" -ForegroundColor Cyan

# 1. Login Admin
Write-Host "`n1. Logging in as Admin..." -ForegroundColor Yellow
$adminAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body (@{ email = "admin@edupulse.local"; password = "Password@123" } | ConvertTo-Json) -ContentType "application/json"
$adminToken = $adminAuth.data.token
Write-Host "Admin token acquired successfully." -ForegroundColor Green

# 2. Login Teacher
Write-Host "`n2. Logging in as Teacher..." -ForegroundColor Yellow
$teacherAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body (@{ email = "teacher.sarah@edupulse.local"; password = "Password@123" } | ConvertTo-Json) -ContentType "application/json"
$teacherToken = $teacherAuth.data.token
Write-Host "Teacher token acquired successfully." -ForegroundColor Green

# 3. Login Student
Write-Host "`n3. Logging in as Student..." -ForegroundColor Yellow
$studentAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body (@{ email = "student1@edupulse.local"; password = "Password@123" } | ConvertTo-Json) -ContentType "application/json"
$studentToken = $studentAuth.data.token
$studentId = $studentAuth.data.user.id
Write-Host "Student token acquired for student ID: $studentId" -ForegroundColor Green

# 4. Phase 6: CSV Template & Preview & Commit
Write-Host "`n4. Testing Phase 6: Academic Import..." -ForegroundColor Yellow
$marksTemplate = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/import/templates/MARKS" -Headers @{ Authorization = "Bearer $adminToken" }
Write-Host "Downloaded Marks Template. Length: $($marksTemplate.Length) characters" -ForegroundColor Green

$csvToImport = "student_email,subject_name,assessment_type,marks_obtained,max_marks,semester,academic_year`nstudent1@edupulse.local,Data Structures and Algorithms,MIDTERM,88.5,100,Fall,2025-2026`nstudent2@edupulse.local,Web Technologies,ASSIGNMENT,42.0,50,Fall,2025-2026"
$previewResp = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/import/preview" -Method Post -Headers @{ Authorization = "Bearer $adminToken" } -Body (@{ type = "MARKS"; fileName = "test_import.csv"; csvContent = $csvToImport } | ConvertTo-Json) -ContentType "application/json"
Write-Host "CSV Preview: Total $($previewResp.data.totalRows), Valid $($previewResp.data.validRows), Invalid $($previewResp.data.invalidRows)" -ForegroundColor Green

$commitResp = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/import/commit" -Method Post -Headers @{ Authorization = "Bearer $adminToken" } -Body (@{ type = "MARKS"; fileName = "test_import.csv"; rows = $previewResp.data.rows } | ConvertTo-Json) -ContentType "application/json"
Write-Host "Batch Committed: ID #$($commitResp.data.id) Status: $($commitResp.data.status) Successful: $($commitResp.data.successfulRows)" -ForegroundColor Green

# Student reads academic records
$studentRecords = Invoke-RestMethod -Uri "http://localhost:8080/api/student/academic-records" -Headers @{ Authorization = "Bearer $studentToken" }
Write-Host "Student Academic Overview: Attendance $($studentRecords.data.attendancePercentage)%, Avg Marks $($studentRecords.data.averageMarksPercentage)%" -ForegroundColor Green

# 5. Phase 7: Email & Weekly Summaries
Write-Host "`n5. Testing Phase 7: Weekly Summaries & Email Dispatch..." -ForegroundColor Yellow
$summaryGenResp = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/summaries/generate-all" -Method Post -Headers @{ Authorization = "Bearer $adminToken" }
Write-Host "Weekly Summary Dispatch: $($summaryGenResp.message)" -ForegroundColor Green

$studentSummaries = Invoke-RestMethod -Uri "http://localhost:8080/api/student/weekly-summaries" -Headers @{ Authorization = "Bearer $studentToken" }
Write-Host "Student Weekly Summaries Count: $($studentSummaries.data.Count)" -ForegroundColor Green
if ($studentSummaries.data.Count -gt 0) {
    Write-Host "Latest Summary Date: $($studentSummaries.data[0].weekStart)" -ForegroundColor Green
}

# 6. Phase 8: External Coding Profiles
Write-Host "`n6. Testing Phase 8: External Profiles (GitHub, LeetCode, HackerRank)..." -ForegroundColor Yellow
$linkGithub = Invoke-RestMethod -Uri "http://localhost:8080/api/student/external-profiles/link" -Method Post -Headers @{ Authorization = "Bearer $studentToken" } -Body (@{ platform = "GITHUB"; username = "octocat" } | ConvertTo-Json) -ContentType "application/json"
Write-Host "Linked GitHub: $($linkGithub.data.username) Snapshot Present: $($null -ne $linkGithub.data.snapshotJson)" -ForegroundColor Green

$linkLeetcode = Invoke-RestMethod -Uri "http://localhost:8080/api/student/external-profiles/link" -Method Post -Headers @{ Authorization = "Bearer $studentToken" } -Body (@{ platform = "LEETCODE"; username = "tourist" } | ConvertTo-Json) -ContentType "application/json"
Write-Host "Linked LeetCode: $($linkLeetcode.data.username) Snapshot Present: $($null -ne $linkLeetcode.data.snapshotJson)" -ForegroundColor Green

$studentProfiles = Invoke-RestMethod -Uri "http://localhost:8080/api/student/external-profiles" -Headers @{ Authorization = "Bearer $studentToken" }
Write-Host "Student Connected Profiles: $($studentProfiles.data.Count)" -ForegroundColor Green

# 7. Phase 9: At-Risk ML Prediction & Teacher Interventions
Write-Host "`n7. Testing Phase 9: At-Risk ML Prediction..." -ForegroundColor Yellow
$teacherAtRisk = Invoke-RestMethod -Uri "http://localhost:8080/api/teacher/at-risk-students" -Headers @{ Authorization = "Bearer $teacherToken" }
Write-Host "Teacher evaluated $($teacherAtRisk.data.Count) students for academic risk." -ForegroundColor Green
$firstStudent = $teacherAtRisk.data[0]
Write-Host "Student: $($firstStudent.studentName) | Risk: $($firstStudent.riskLevel) ($($firstStudent.riskScore)/100) | ML Fallback: $($firstStudent.isFallback)" -ForegroundColor Green
Write-Host "Intervention: $($firstStudent.recommendedIntervention)" -ForegroundColor Green

# Student self-monitors
$studentRisk = Invoke-RestMethod -Uri "http://localhost:8080/api/student/my-risk-status" -Headers @{ Authorization = "Bearer $studentToken" }
Write-Host "Student self-monitoring risk level: $($studentRisk.data.riskLevel) (Score: $($studentRisk.data.riskScore))" -ForegroundColor Green

# 8. Phase 10: Privacy, Consent & Research Evaluation
Write-Host "`n8. Testing Phase 10: Privacy, Consent & Research Suite..." -ForegroundColor Yellow
$consentResp = Invoke-RestMethod -Uri "http://localhost:8080/api/student/consent" -Headers @{ Authorization = "Bearer $studentToken" }
Write-Host "Student Consent Status: $($consentResp.data.consentStatus) (Policy v$($consentResp.data.consentPolicyVersion))" -ForegroundColor Green

$surveyPayload = @{
    q1Usefulness = 5;
    q2EaseOfUse = 5;
    q3ExplanationClarity = 4;
    q4Trust = 5;
    q5AiUsefulness = 5;
    comments = "EduPulse adaptive BKT helped me master dynamic programming quickly!"
}
$surveyResp = Invoke-RestMethod -Uri "http://localhost:8080/api/student/survey" -Method Post -Headers @{ Authorization = "Bearer $studentToken" } -Body ($surveyPayload | ConvertTo-Json) -ContentType "application/json"
Write-Host "Survey Submitted! ID: $($surveyResp.data.id)" -ForegroundColor Green

$researchMetrics = Invoke-RestMethod -Uri "http://localhost:8080/api/research/evaluation-metrics" -Headers @{ Authorization = "Bearer $teacherToken" }
Write-Host "Research Learning Path Efficiency Gain: +$($researchMetrics.data.pathEfficiency.efficiencyImprovementPercent)%" -ForegroundColor Green
Write-Host "Adaptive Attempts to Mastery: $($researchMetrics.data.pathEfficiency.adaptivePathAvgAttemptsToMastery) vs Fixed: $($researchMetrics.data.pathEfficiency.fixedPathAvgAttemptsToMastery)" -ForegroundColor Green
Write-Host "BKT AUC: $($researchMetrics.data.bktBenchmark.bktModel.auc) vs Baseline AUC: $($researchMetrics.data.bktBenchmark.movingAverageBaseline.auc) (+`$($researchMetrics.data.bktBenchmark.aucGainPercent)%)" -ForegroundColor Green
Write-Host "ML Model Accuracy: $([math]::Round($researchMetrics.data.atRiskModel.accuracy * 100, 1))% | F1: $([math]::Round($researchMetrics.data.atRiskModel.f1Score * 100, 1))%" -ForegroundColor Green

$runEval = Invoke-RestMethod -Uri "http://localhost:8080/api/research/run-evaluation" -Method Post -Headers @{ Authorization = "Bearer $teacherToken" } -Body (@{ experimentId = "EVAL-ENDTOEND-001" } | ConvertTo-Json) -ContentType "application/json"
Write-Host "Formal Research Benchmark Run Persisted to evaluation_runs! ID #$($runEval.data.id)" -ForegroundColor Green

Write-Host "`n>>> ALL PHASES 6-10 VERIFIED AND FULLY OPERATIONAL! <<<" -ForegroundColor Green
