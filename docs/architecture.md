# EduPulse Architecture & Security Specifications

## 1. Overview
EduPulse is built as a modular micro-service/layered hybrid architecture designed to run efficiently on standard consumer hardware (8 GB RAM) while maintaining enterprise-grade security and academic rigor.

## 2. Authentication & Authorization Flow

```text
+----------+             +----------------------+             +----------------+
|  Client  |             |  Spring Boot Filter  |             | MySQL Database |
+----------+             +----------------------+             +----------------+
     |                              |                                  |
     | 1. POST /api/auth/login      |                                  |
     |----------------------------->| 2. BCrypt verify password        |
     |                              |--------------------------------->|
     |                              | 3. Issue signed JWT (24h expiry) |
     | 4. Return token & user data  |                                  |
     |<-----------------------------|                                  |
     |                              |                                  |
     | 5. GET /api/student/dashboard|                                  |
     |    (Header: Bearer <token>)  |                                  |
     |----------------------------->| 6. JwtAuthenticationFilter:      |
     |                              |    - Verify cryptographic key    |
     |                              |    - Extract email & roles       |
     |                              |    - Check Role Authorization    |
     |                              | 7. If role matches: Fetch data   |
     |                              |--------------------------------->|
     | 8. 200 OK + Real DB metrics  |                                  |
     |<-----------------------------|                                  |
     |                              |                                  |
     | 9. GET /api/admin/dashboard  |                                  |
     |    (With student token)      |                                  |
     |----------------------------->| 10. Role Mismatch Detected!      |
     | 11. 403 Forbidden Response   |     (Delegates to AccessDenied)  |
     |<-----------------------------|                                  |
```

## 3. Role Matrix

| Endpoint Group | Allowed Roles | Description |
| :--- | :--- | :--- |
| `/api/auth/**` | Public | Login, registration, token validation |
| `/api/student/**` | `ROLE_STUDENT` | Student dashboard, adaptive learning, quizzes, own records |
| `/api/teacher/**` | `ROLE_TEACHER` | Class oversight, question bank management, quiz creation |
| `/api/admin/**` | `ROLE_ADMIN` | Platform overview, user accounts, system configuration |
| `/swagger-ui/**`, `/v3/api-docs/**` | Public | OpenAPI documentation |

## 4. Database Seed Policy
* Seeding is handled idempotently via `DatabaseSeeder.java`.
* If user records already exist in `users`, demo seeding is skipped automatically, preventing duplicate records upon server restarts.
