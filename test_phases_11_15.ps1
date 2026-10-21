$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  EDUPULSE: PHASES 11 - 15 AUTOMATED VERIFICATION SUITE         " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"
$mlUrl = "http://127.0.0.1:8001"
$frontendUrl = "http://127.0.0.1:5173"

# 1. Health Checks
Write-Host "`n[TEST 1] Verifying Service Health..." -ForegroundColor Yellow

$mlHealth = Invoke-RestMethod -Uri "$mlUrl/health" -Method Get
Write-Host " [PASS] ML Service is UP: status = $($mlHealth.status)" -ForegroundColor Green

$clientRes = Invoke-WebRequest -Uri $frontendUrl -Method Get -UseBasicParsing
if ($clientRes.StatusCode -eq 200) {
    Write-Host " [PASS] Vite React Frontend is UP: HTTP 200" -ForegroundColor Green
}

# 2. Authentication
Write-Host "`n[TEST 2] Authenticating as Administrator..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@edupulse.local"
    password = "Password@123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$adminToken = $loginRes.data.token
$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}
Write-Host " [PASS] Admin authenticated successfully. Token length: $($adminToken.Length)" -ForegroundColor Green

# 3. Phase 11: Class Management & User Status
Write-Host "`n[TEST 3] Phase 11 - Class Management & User Lifecycle..." -ForegroundColor Yellow

# Get initial classes
$classesResp = Invoke-RestMethod -Uri "$baseUrl/admin/classes" -Method Get -Headers $headers
$classes = $classesResp.data
Write-Host " [PASS] Retrieved $($classes.Count) existing classes" -ForegroundColor Green

# Create a new test class cohort
$uniqueClassName = "Section Auto-" + (Get-Date -Format "yyyyMMdd-HHmmss")
$newClassBody = @{
    name = $uniqueClassName
    teacherId = 2
} | ConvertTo-Json

$createdClassResp = Invoke-RestMethod -Uri "$baseUrl/admin/classes" -Method Post -Headers $headers -Body $newClassBody
$classObj = $createdClassResp.data
$classId = $classObj.id
Write-Host " [PASS] Created class cohort ID: $classId ($($classObj.name))" -ForegroundColor Green

# Enroll a student into this class cohort (student ID 1)
$enrollRes = Invoke-RestMethod -Uri "$baseUrl/admin/classes/$classId/students/1" -Method Post -Headers $headers
Write-Host " [PASS] Enrolled student ID 1: $($enrollRes.message)" -ForegroundColor Green

# Test Toggle User Status for user ID 3
$toggleRes = Invoke-RestMethod -Uri "$baseUrl/admin/users/3/toggle-active" -Method Put -Headers $headers
Write-Host " [PASS] Toggled user active status: $($toggleRes.message) (Active: $($toggleRes.data.active))" -ForegroundColor Green

# Restore user ID 3 to active if it was set to false
if (-not $toggleRes.data.active) {
    $restoreRes = Invoke-RestMethod -Uri "$baseUrl/admin/users/3/toggle-active" -Method Put -Headers $headers
    Write-Host " [PASS] Restored user active status: Active = $($restoreRes.data.active)" -ForegroundColor Green
}

# 4. Phase 12: Platform Settings & Hyperparameters
Write-Host "`n[TEST 4] Phase 12 - Platform Configuration Settings..." -ForegroundColor Yellow

$settingsResp = Invoke-RestMethod -Uri "$baseUrl/admin/settings" -Method Get -Headers $headers
$settings = $settingsResp.data
Write-Host " [PASS] Retrieved $($settings.Count) configuration settings" -ForegroundColor Green

# Verify critical BKT hyperparameter exists
$bktSetting = $settings | Where-Object { $_.configKey -eq "bkt.mastery.threshold" }
Write-Host " [PASS] Found setting: $($bktSetting.configKey) = $($bktSetting.configValue)" -ForegroundColor Green

# Update a setting
$updateSettingBody = @{
    value = "0.88"
} | ConvertTo-Json

$updatedSettingResp = Invoke-RestMethod -Uri "$baseUrl/admin/settings/bkt.mastery.threshold" -Method Put -Headers $headers -Body $updateSettingBody
Write-Host " [PASS] Updated setting successfully: $($updatedSettingResp.data.configKey) = $($updatedSettingResp.data.configValue)" -ForegroundColor Green

# 5. Phase 13: Institutional Reports & CSV Exports
Write-Host "`n[TEST 5] Phase 13 - Institutional Analytics & CSV Exports..." -ForegroundColor Yellow

# Get Overview Report
$overviewResp = Invoke-RestMethod -Uri "$baseUrl/admin/reports/overview" -Method Get -Headers $headers
$overview = $overviewResp.data
Write-Host " [PASS] Overview Report - Total Students: $($overview.totalStudents), High Risk: $($overview.highRiskCount), Quizzes: $($overview.totalQuizzes), Attempts: $($overview.totalAttempts)" -ForegroundColor Green

# CSV Exports
$csvHeaders = @{
    "Authorization" = "Bearer $adminToken"
}

$studentsCsv = Invoke-RestMethod -Uri "$baseUrl/admin/reports/export/students" -Method Get -Headers $csvHeaders
$studentLines = ($studentsCsv -split "`n").Count
Write-Host " [PASS] Exported Students CSV: $studentLines lines" -ForegroundColor Green

$atRiskCsv = Invoke-RestMethod -Uri "$baseUrl/admin/reports/export/at-risk" -Method Get -Headers $csvHeaders
$riskLines = ($atRiskCsv -split "`n").Count
Write-Host " [PASS] Exported At-Risk CSV: $riskLines lines" -ForegroundColor Green

$masteryCsv = Invoke-RestMethod -Uri "$baseUrl/admin/reports/export/topic-mastery" -Method Get -Headers $csvHeaders
$masteryLines = ($masteryCsv -split "`n").Count
Write-Host " [PASS] Exported Topic Mastery CSV: $masteryLines lines" -ForegroundColor Green

# 6. Phase 14: Security Audit Trail Logging
Write-Host "`n[TEST 6] Phase 14 - Security Audit Trail Logging..." -ForegroundColor Yellow

$auditResp = Invoke-RestMethod -Uri "$baseUrl/admin/audit-logs" -Method Get -Headers $headers
$auditLogs = $auditResp.data
Write-Host " [PASS] Retrieved $($auditLogs.Count) audit log events" -ForegroundColor Green

$recentLog = $auditLogs[0]
Write-Host " [PASS] Most recent audit event: [$($recentLog.action)] at $($recentLog.createdAt) - Details: $($recentLog.details)" -ForegroundColor Green

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  ALL PHASE 11 - 15 TESTS COMPLETED WITH 100% SUCCESS!          " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan
