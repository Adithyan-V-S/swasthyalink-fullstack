# Patient-Doctor Connection Implementation TODO

This TODO tracks progress on fixing console errors, improving patient dashboard UI for doctor connections (QR/email/OTP/phone), and enabling digital prescriptions via secure patient-doctor links.

## Current Work
Implementing patient-doctor connections for prescriptions: Doctors request access via QR scan (uid lookup) or email/phone (OTP invite), patient verifies/accepts in dashboard pending section, grants write access to prescriptions in patient's Firestore account. Fixes port errors (5000->3001), hydration warnings. Uses existing OTP/nodemailer for invites.

## Key Technical Concepts
- Backend: Express (port 3001), Firebase Admin/Firestore for 'patientDoctorRequests' (pending), 'patientDoctorConnections' (active), 'prescriptions' (doctor writes to patient uid).
- Frontend: React/Vite, useAuth for uid, fetch API to backend, Firestore listeners for real-time.
- Email: Nodemailer (Gmail) for OTP invites with verification.
- Security: OTP (6-digit, 10min expire), auth middleware for doctor sends.
- No new frameworks; use existing models/services.

## Relevant Files and Code
- frontend/src/pages/patientdashboard.jsx
  - Current: Mock data, QR with uid, no pending/OTP/prescriptions real integration.
  - Changes: Add suppressHydrationWarning, pending requests fetch/display/modal, prescriptions list.
- backend/routes/patientDoctor.js
  - Current: Existing routes (to be read/updated).
  - Changes: Add GET /requests, POST /accept/{id}.
- backend/src/services/patientDoctorService.js (new)
  - New: Methods for sendRequest (OTP+store pending), getPending, accept (verify OTP+create connection).
- frontend/src/services/patientDoctorService.js (new)
  - New: API wrappers for requests/accept.
- backend/src/services/otpService.js
  - Current: Email OTP sending.
  - Changes: Minor – customize HTML for prescription invites.
- Search: frontend/src for "5000" to fix port.

## Problem Solving
- Port error: Replace hardcoded 5000 with 3001 in services.
- Hydration: Suppress warnings on dynamic elements.
- Pending requests: Firestore query for patientUid pending.
- Email invite: Doctor calls sendRequest -> OTP email -> patient verifies.
- Prescriptions: On accept, doctor POST to /api/prescriptions {patientUid, data} if connected.

## Pending Tasks and Next Steps
- [ ] Step 1: Use search_files to find "localhost:5000" in frontend/src, then edit_file to replace with "localhost:3001" (fix connection refused).
- [ ] Step 2: Read backend/routes/patientDoctor.js to assess current endpoints and plan updates. (Direct quote from conversation: "fixing the console errors, improving the UI and i want to sent a email invitation to that patient" – focusing on patient-doctor for prescriptions.)
- [ ] Step 3: Create backend/src/services/patientDoctorService.js with sendConnectionRequest, getPendingRequests, acceptRequest methods integrating otpService.
- [ ] Step 4: Edit backend/routes/patientDoctor.js to add /requests GET and /accept POST endpoints using the new service.
- [ ] Step 5: Create frontend/src/services/patientDoctorService.js with API fetch functions for getPendingRequests and acceptRequest (base URL 3001).
- [ ] Step 6: Edit frontend/src/pages/patientdashboard.jsx – add suppressHydrationWarning to <main>, new "Pending Doctor Connections" section (useEffect fetch pending, display cards), OTP verification modal (input+accept button), prescriptions section (fetch /api/prescriptions?patientUid={uid} or Firestore).
- [ ] Step 7: Minor edit backend/src/services/otpService.js – update email HTML for "Prescription Access Request from Dr. [name]: Verify to grant access. Code: [otp]".
- [ ] Step 8: Ensure backend/.env has EMAIL_USER and EMAIL_PASSWORD (Gmail app password); if not, user to provide.
- [ ] Step 9: Test – execute_command 'cd backend && node server.js', frontend dev server, browser_action to load dashboard, simulate invite (manual POST or test script), verify pending/accept/no errors.
- [ ] Step 10: Update TESTING_GUIDE.md with new flows: "Doctor Connection via Email/QR: Send invite -> Patient verify OTP -> Accept -> Doctor writes prescription."
- [ ] Step 11: Mark complete in this TODO.md, attempt_completion.

Progress will be updated as steps complete.

## PatientDashboard Map Error Fix TODO

This section tracks the fix for "Cannot read properties of undefined (reading 'map')" error in frontend/src/pages/patientdashboard.jsx, likely from sidebar rendering or state race conditions.

### Current Work
Fixing runtime error causing blank page on patient dashboard load. Error at line 35:9 during .map() on potentially undefined array (e.g., notifications in getSidebarLinks). Plan: Move function inside component, add safety checks.

### Key Technical Concepts
- React: useState initialization, optional chaining (?.) for safe array access, closure for state in functions.
- No new deps; defensive coding to prevent undefined .map()/.filter().

### Relevant Files and Code
- frontend/src/pages/patientdashboard.jsx
  - Current: getSidebarLinks defined outside component, passes notifications; multiple .map() on states.
  - Changes: Move getSidebarLinks inside, use (notifications || []), add ?. to .map() calls.

### Problem Solving
- Race condition: notifications may be undefined briefly; safety ensures render without crash.
- Sidebar always renders; fix there first.

### Pending Tasks and Next Steps
- [x] Step 1: Move getSidebarLinks function inside PatientDashboard component to access notifications via closure; update call to getSidebarLinks() without param.
- [x] Step 2: In getSidebarLinks, wrap badge filters with (notifications || []).filter(...) for safety.
- [x] Step 3: Add optional chaining to all .map() calls: e.g., {familyMembers?.map || () => null}, {pendingRequests?.map || () => <p>No requests</p>}, similarly for connectedDoctors, notifications, records (though records is static).
- [x] Step 4: Use edit_file on patientdashboard.jsx to apply changes in one go (multiple diffs).
- [x] Step 5: Test – execute_command 'cd frontend && npm run dev', browser_action to load patient dashboard page, verify no console errors, sidebar badges show (0+), switch tabs (e.g., Doctors) without crash.
- [x] Step 6: If fixed, mark [x] steps, remove this section or note complete; if issues, investigate notificationService.js.

**Complete:** PatientDashboard map error fixed. Hooks violation resolved by unconditional useCurrentUser call. Removed unused mockNotifications. Added suppressHydrationWarning to main. File now renders without runtime errors.
