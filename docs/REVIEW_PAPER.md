## Swasthyalink: A Secure, Family-Centered Digital Healthcare Platform for India

### Abstract
Swasthyalink is a modern web platform that connects patients, doctors, and family members with secure access to health records, consultations, and real-time notifications. This review presents an overview of the system goals, architecture, security model, implementation details, and alignment with Indian digital health initiatives. We summarize the platform's key modules (patient, doctor, family), backend services (authentication, Firestore data, notifications, presence, OTP), conversational agents (Dialogflow, Gemini), and ML-based health analytics. We discuss design decisions, evaluate strengths and limitations, and outline a roadmap for future research and development.

### Keywords
Digital health, Electronic health records, Family-centered care, Firebase, Dialogflow, Generative AI, Health analytics, India, Privacy, Security

### 1. Introduction
Digitization of healthcare in India demands secure, accessible, and culturally aligned systems for diverse stakeholders. Swasthyalink addresses this need by enabling patients to manage records, doctors to monitor and prescribe, and families to participate in care with permissioned access. The platform emphasizes usability, privacy, and policy alignment (e.g., Ayushman Bharat, NDHM).

Objectives:
- Provide secure digital health records with fine-grained access.
- Enable family participation with explicit permissions and emergency features.
- Support doctors with dashboards, prescriptions, and patient monitoring.
- Offer guidance via chatbots and proactive notifications.
- Incorporate ML analytics for risk scoring and recommendations.

### 2. System Overview
Swasthyalink comprises a React frontend and a Node.js/Express backend integrated with Firebase services. Conversational features use Dialogflow and a Gemini proxy. ML endpoints provide risk assessments and recommendations.

Core user roles:
- Patient: personal record management, appointments, notifications.
- Doctor: patient access (authorized), prescriptions, dashboards.
- Family: permissioned viewing, emergency access, notifications.
- Admin: doctor onboarding, approvals, and status management.

### 3. Architecture
High-level architecture reflects a SPA frontend with RESTful APIs and Firebase integration.

- Frontend (React + Vite + Tailwind)
  - Routing and access control via `PrivateRoute`/`PublicRoute`.
  - Context-based auth (`AuthContext`) backed by Firebase Auth.
  - Pages: patient/doctor/admin/family dashboards; login, register, settings, analytics.
  - Chatbot UI (`GeminiChatbot`) and notification toasts.

- Backend (Node.js/Express)
  - AuthN/AuthZ: Firebase Admin SDK; custom middleware (`src/middleware/auth.js`).
  - Dialogflow integration with simulated fallback.
  - Gemini proxy endpoint using GoogleAuth OAuth flow.
  - Domain APIs: notifications, presence, patient-doctor relations, OTP, prescriptions, family network management, admin and doctor operations.
  - Firestore used for persistent data (e.g., `familyNetworks`, users, prescriptions).

- Data & Services
  - Firebase: Authentication, Firestore, Hosting (optionally), Cloud Functions (planned or partial).
  - ML services: health risk assessment, disease risk predictions, health stats, recommendations.

### 4. Key Features
- Patient Portal: record management, QR access, appointments, notifications.
- Doctor Dashboard: patient lists, prescriptions, analytics hooks.
- Family Access: permissioned viewing, mutual network, emergency workflows.
- Admin Tools: doctor registration approval, disable/suspend, statistics.
- Conversational Assistants: Dialogflow-based helper; Gemini proxy for LLM responses.
- Notifications & Presence: routes for real-time user engagement.
- Security & Compliance: role-based access, security headers, Firestore rules alignment.

### 5. Security and Privacy
Security practices include:
- Transport security (expected HTTPS in production) and security headers (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`).
- Firebase Auth for identity; Admin SDK for server-side operations.
- Role-based guards on admin/doctor endpoints (`requireAdmin`, `requireDoctor`).
- Firestore rules (see `firestore.rules` and `updated_firestore.rules`) for least privilege.
- Data minimization on profile updates (removal of sensitive fields in server handlers).

Compliance alignment:
- HIPAA-inspired controls (not certification by default): access control, auditability, data segregation.
- Supports Indian policy goals (Ayushman Bharat, NDHM) by enabling digital records and family support mechanisms.

Security considerations and recommendations:
- Centralize configuration secrets; remove credentials from repo and use environment variables and secret managers.
- Enforce robust CORS in production and origin allowlists per environment.
- Add rate-limiting and bot protection to auth and OTP endpoints.
- Expand audit logging for admin actions and sensitive data access.
- Adopt end-to-end encryption for at-rest documents where appropriate.

### 6. Family Network Model
The family module manages bidirectional relationships and permissions:
- Requests: pending/accepted/declined states, unique constraints to avoid duplicates.
- Relationships: inverse mapping (e.g., Parent ↔ Child, Spouse ↔ Spouse).
- Storage: `familyNetworks/{uid}` with array members; migration endpoint ensures reciprocity.
- APIs: search, request, accept/reject, get network, and mutual network retrieval.

Design benefits:
- Explicit consent and reciprocity improve correctness and user control.
- Inverse relationship logic reduces data anomalies.

### 7. Conversational Agents
- Dialogflow: primary NLU pipeline; fallback simulation when credentials unavailable ensures graceful UX.
- Gemini proxy: server-side OAuth using `google-auth-library` and Generative Language API; frontends call `/api/gemini` to avoid exposing keys.

Use cases:
- FAQs (appointments, doctor info), guidance, health tips, and triage-style interactions.

### 8. Machine Learning Components
Endpoints provide:
- Health Risk Assessment: input validation, normalization, risk and health score, insights.
- Health Trends Prediction: forecast trends from historical arrays.
- Disease Risk: disease-specific risk scores and interpretation.
- Health Stats: aggregate metrics with optional filtering.
- Recommendations: immediate/short-term/long-term/lifestyle suggestions.

Current approach:
- Rule-based helpers and service abstractions with clear interfaces; suitable for gradual upgrade to learned models.

### 9. Implementation Notes
- Frontend
  - React 19, Vite, Tailwind; ESLint; Router-based guards; Notification UI and chatbots.
  - Login page supports Google Sign-In, email/password, and test/demo flows to aid development.

- Backend
  - Express app initializes Firebase Admin and Dialogflow client with simulated fallback.
  - Routes grouped by domain: `routes/notifications`, `routes/presence`, `routes/patientDoctor`, `routes/otp`, `routes/prescriptions`, `routes/admin`, `routes/doctor`.
  - Admin endpoints manage doctor lifecycle and statistics; doctor endpoints manage auth, profile and status.

### 10. Evaluation
Strengths:
- Clear role separation and permission model.
- Practical family network with reciprocity and migration tooling.
- Resilient chatbot integration (simulation when offline).
- ML endpoints enabling analytics-driven features.
- Modern frontend stack with responsive UI.

Limitations:
- Credentials present in repository in early versions; requires secret management hardening.
- Some endpoints rely on in-memory structures for demo; must be migrated to persistent stores.
- Limited automated tests; CI/CD and coverage to be expanded.
- ML logic is heuristic-first; model-based validation and calibration are future work.

### 11. Roadmap and Future Work
- Security & Compliance: Vault/secret manager, full audit trails, structured logging, DLP.
- Data Model: Migrate in-memory queues/lists to Firestore with durable workflows.
- Interoperability: NDHM Health ID integration, FHIR resources for clinical data.
- ML/AI: Learned models for risk and recommendations; personalization and drift monitoring.
- Observability: metrics, tracing, SLOs; autoscaling and error budgets.
- Mobile: PWA hardening or native apps for low-connectivity environments.
- Accessibility & i18n: WCAG AA+ improvements; multilingual support.

### 12. Related Work (Brief)
Prior digital health systems in India emphasize digital records, telemedicine, and public-private integrations. Swasthyalink contributes a family-centered access model and pragmatic conversational/ML integrations. Future work should benchmark interoperability with FHIR/NDHM and assess outcomes in clinical pilots.

### 13. Conclusion
Swasthyalink demonstrates a practical, extensible approach to digital healthcare delivery centered on patients and families. By combining secure access, role-based permissions, conversational support, and analytics, it lays a foundation for scalable deployments aligned with Indian policy goals. Further work will focus on compliance, interoperability, robustness, and clinically validated ML models.

### Acknowledgments
We thank healthcare professionals and the open-source community. This work aligns with India’s digital health initiatives and is licensed under MIT.

### References
1. National Digital Health Mission (NDHM). Government of India.
2. Ayushman Bharat Digital Mission.
3. HL7 FHIR Specification.
4. Firebase Documentation.
5. Dialogflow Documentation.
6. Google Generative Language API (Gemini) Documentation.



