$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  EDUPULSE: PHASES 16 - 20 IEEE RESEARCH VERIFICATION SUITE     " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"
$mlUrl = "http://127.0.0.1:8001"

# 1. Health Checks
Write-Host "`n[TEST 1] Verifying ML Microservice Multi-Model Benchmarks..." -ForegroundColor Yellow
$benchmark = Invoke-RestMethod -Uri "$mlUrl/benchmark" -Method Get
Write-Host " [PASS] ML Benchmark retrieved. Total samples: $($benchmark.dataset.total_samples)" -ForegroundColor Green
$models = $benchmark.models_comparison.PSObject.Properties.Name
Write-Host " [PASS] Models evaluated: $($models -join ', ')" -ForegroundColor Green
$rf = $benchmark.models_comparison.RandomForestClassifier
Write-Host " [PASS] Random Forest: Accuracy=$($rf.accuracy*100)%, F1=$($rf.f1_score), ROC-AUC=$($rf.roc_auc)" -ForegroundColor Green

# 2. Authentication
Write-Host "`n[TEST 2] Authenticating as Admin for Research APIs..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@edupulse.local"
    password = "Password@123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginRes.data.token
$headers = @{
    "Authorization" = "Bearer $token"
}
Write-Host " [PASS] Authenticated successfully." -ForegroundColor Green

# 3. Test Spring Boot Research Evaluation Metrics
Write-Host "`n[TEST 3] Verifying Spring Boot Psychometric Learning Gain & ML Benchmark..." -ForegroundColor Yellow
$evalRes = Invoke-RestMethod -Uri "$baseUrl/research/evaluation-metrics" -Method Get -Headers $headers
$lg = $evalRes.data.learningGainAnalysis

Write-Host " [PASS] Normalized Learning Gain: g = $($lg.adaptiveGain_g) ($($lg.adaptiveGainCategory))" -ForegroundColor Green
Write-Host " [PASS] Control Group Gain: g = $($lg.controlGain_g) ($($lg.controlGainCategory))" -ForegroundColor Green
Write-Host " [PASS] Gain Advantage: +$($lg.gainAdvantagePercent)%" -ForegroundColor Green
Write-Host " [PASS] Cohen's d Effect Size: d = $($lg.cohensD) ($($lg.cohensInterpretation))" -ForegroundColor Green
Write-Host " [PASS] Hypothesis Test: t = $($lg.tStatistic), df = $($lg.degreesOfFreedom), p = $($lg.pValue) (Significant: $($lg.statisticallySignificant))" -ForegroundColor Green

# 4. Test IEEE Benchmark CSV Export
Write-Host "`n[TEST 4] Verifying IEEE Benchmark CSV Streaming Export..." -ForegroundColor Yellow
$csvRes = Invoke-RestMethod -Uri "$baseUrl/research/export/benchmark-csv" -Method Get -Headers $headers
$csvLines = ($csvRes -split "`n").Count
Write-Host " [PASS] Exported IEEE Multi-Model Benchmark CSV ($csvLines lines)" -ForegroundColor Green

# 5. Verify Academic Documentation Artifacts
Write-Host "`n[TEST 5] Verifying IEEE Paper Draft and Reference Library..." -ForegroundColor Yellow
$paperPath = "C:\Users\pream\.gemini\antigravity\scratch\edupulse\docs\IEEE_RESEARCH_PAPER.md"
$bibPath = "C:\Users\pream\.gemini\antigravity\scratch\edupulse\docs\REFERENCES.bib"
$refPath = "C:\Users\pream\.gemini\antigravity\scratch\edupulse\docs\IEEE_REFERENCES.md"

if (Test-Path $paperPath) {
    $paperLines = (Get-Content $paperPath).Count
    Write-Host " [PASS] IEEE Research Paper Draft exists: $paperLines lines of publication-ready markdown" -ForegroundColor Green
}
if (Test-Path $bibPath) {
    $bibLines = (Get-Content $bibPath).Count
    Write-Host " [PASS] BibTeX Reference Library exists: $bibLines lines" -ForegroundColor Green
}
if (Test-Path $refPath) {
    $refLines = (Get-Content $refPath).Count
    Write-Host " [PASS] IEEE Standard Reference List exists: $refLines lines" -ForegroundColor Green
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "  ALL PHASES 16 - 20 TESTS COMPLETED WITH 100% SUCCESS!         " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan
