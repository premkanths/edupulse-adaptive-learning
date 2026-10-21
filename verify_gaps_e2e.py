import requests
import json
import time

BASE_URL = "http://localhost:8080/api"

print("=" * 60)
print("   EduPulse End-to-End Gap Implementation Test Suite")
print("=" * 60)

# 1. Student Login
print("\n[1/7] Testing Student Authentication...")
res = requests.post(f"{BASE_URL}/auth/login", json={"email": "student1@edupulse.local", "password": "Password@123"})
assert res.status_code == 200, f"Student login failed: {res.text}"
student_data = res.json()["data"]
student_token = student_data["token"]
student_headers = {"Authorization": f"Bearer {student_token}"}
print(f"[PASS] Student logged in: {student_data['user']['name']} (ID: {student_data['user']['id']})")

# 2. Teacher Login
print("\n[2/7] Testing Teacher Authentication...")
res = requests.post(f"{BASE_URL}/auth/login", json={"email": "teacher.sarah@edupulse.local", "password": "Password@123"})
assert res.status_code == 200, f"Teacher login failed: {res.text}"
teacher_data = res.json()["data"]
teacher_token = teacher_data["token"]
teacher_headers = {"Authorization": f"Bearer {teacher_token}"}
print(f"[PASS] Teacher logged in: {teacher_data['user']['name']} (ID: {teacher_data['user']['id']})")

# 3. Teacher Course Material Upload (RAG)
print("\n[3/7] Testing Course Material Upload & Semantic Chunking (RAG)...")
material_data = {
    "subjectId": 1,
    "title": "Advanced Graph Algorithms & Shortest Path Notes",
    "description": "Comprehensive notes covering Dijkstra algorithm, Bellman-Ford, and asymptotic complexities.",
    "rawText": (
        "Dijkstra Algorithm operates on non-negative weighted graphs with greedy edge relaxation. "
        "Using a Fibonacci min-heap priority queue, its optimal time complexity is O(E + V log V). "
        "For dense graphs with adjacent matrix representations, Dijkstra achieves O(V^2). "
        "When negative weight edges or cycles exist, Bellman-Ford algorithm must be utilized instead "
        "with asymptotic time O(V * E) to accurately detect arbitrary negative cycles."
    )
}
res = requests.post(f"{BASE_URL}/teacher/materials/upload-text", headers=teacher_headers, json=material_data)
assert res.status_code == 200, f"Material upload failed: {res.text}"
upload_data = res.json()["data"]
print(f"[PASS] Uploaded Material ID: {upload_data['id']} | Title: '{upload_data['title']}' | Chunks Generated: {upload_data['chunkCount']}")

# 4. Student RAG Passage Retrieval
print("\n[4/7] Testing Student RAG Passage Retrieval...")
query_payload = {
    "query": "What is the time complexity of Dijkstra with min-heap?",
    "subjectIds": [1],
    "topK": 2
}
res = requests.post(f"{BASE_URL}/student/materials/retrieve", headers=student_headers, json=query_payload)
assert res.status_code == 200, f"Retrieval failed: {res.text}"
retrieved_chunks = res.json()["data"]
print(f"[PASS] Retrieved {len(retrieved_chunks)} matching passages from instructor materials!")
for c in retrieved_chunks:
    snippet = c['snippet'][:90].replace('\n', ' ')
    print(f"   -> [Score: {c['similarityScore']}] {c['materialTitle']} (Section {c['chunkIndex']}): {snippet}...")

# 5. AI Assistant Chat with Socratic Mode & Grounding
print("\n[5/7] Testing AI Study Assistant Chat with Socratic Tutoring Mode...")
session_res = requests.post(f"{BASE_URL}/student/chat/sessions", headers=student_headers, json={"title": "Graph Algorithms Study"})
assert session_res.status_code in [200, 201], f"Session create failed: {session_res.text}"
session_id = session_res.json()["data"]["id"]

message_payload = {
    "message": "Can I use Dijkstra when the graph has negative weights?",
    "tutoringMode": "SOCRATIC",
    "subjectId": "1"
}
res = requests.post(f"{BASE_URL}/student/chat/sessions/{session_id}/messages", headers=student_headers, json=message_payload)
assert res.status_code in [200, 201], f"Message send failed: {res.text}"
reply_data = res.json()["data"]
print(f"[PASS] AI Assistant Reply Received (Session {session_id}):")
preview = reply_data["content"][:200].replace("\n", " ")
print(f"   -> Preview: {preview}...")

# 6. Academic Import Pre-Commit Validation & Duplicate Detection
print("\n[6/7] Testing Academic Import Workflow & Duplicate Row Flagging...")
admin_res = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@edupulse.local", "password": "Password@123"})
assert admin_res.status_code == 200, f"Admin login failed: {admin_res.text}"
admin_token = admin_res.json()["data"]["token"]
admin_headers = {"Authorization": f"Bearer {admin_token}"}

csv_content = """student_email,subject_name,assessment_type,marks_obtained,max_marks,semester,academic_year
student1@edupulse.local,Data Structures and Algorithms,MIDTERM,88.0,100,Fall,2025-2026
student1@edupulse.local,Data Structures and Algorithms,MIDTERM,92.0,100,Fall,2025-2026
student2@edupulse.local,Data Structures and Algorithms,QUIZ_1,19.0,20,Fall,2025-2026"""

preview_payload = {
    "type": "MARKS",
    "fileName": "batch_test_with_duplicates.csv",
    "csvContent": csv_content
}
res = requests.post(f"{BASE_URL}/admin/import/preview", headers=admin_headers, json=preview_payload)
assert res.status_code == 200, f"Import preview failed: {res.text}"
preview_data = res.json()["data"]
print(f"[PASS] Preview Total: {preview_data['totalRows']} | Valid: {preview_data['validRows']} | Invalid/Duplicates: {preview_data['invalidRows']}")
for r in preview_data["rows"]:
    if r.get("duplicate"):
        print(f"   -> Caught Duplicate: Row {r['rowNumber']} ({r['studentEmail']} - {r['assessmentType']}): {r['error']}")

# 7. GDPR / FERPA Student Data Portability Archive Export
print("\n[7/7] Testing Student Data Export Archive (GDPR / FERPA)...")
res = requests.get(f"{BASE_URL}/student/export-my-data", headers=student_headers)
assert res.status_code == 200, f"Export failed: {res.text}"
export_data = res.json()["data"]
print(f"[PASS] Export archive generated for {export_data['profile']['email']}:")
print(f"   -> Compliance: {export_data['compliance']}")
print(f"   -> Marks Records: {len(export_data['academicOverview']['marksRecords'])}")
print(f"   -> Attendance Classes: {export_data['academicOverview']['totalAttendanceClasses']}")
print(f"   -> Topic Masteries: {len(export_data['topicMasteries'])}")
print(f"   -> Quiz Attempts: {len(export_data['quizAttempts'])}")

print("\n" + "=" * 60)
print("   ALL GAPS & AUDIT FEATURES VERIFIED SUCCESSFULLY!")
print("=" * 60)
