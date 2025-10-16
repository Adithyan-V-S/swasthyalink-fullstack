# State Diagrams - Swasthyalink Platform

## 1. User Authentication State
```mermaid
stateDiagram-v2
    [*] --> Unauthenticated: Initial state
    Unauthenticated --> Authenticating: Login attempt
    Authenticating --> Authenticated: Success
    Authenticating --> Unauthenticated: Failure
    
    Authenticated --> VerifyingEmail: Email verification required
    VerifyingEmail --> Verified: Email verified
    VerifyingEmail --> Authenticated: Skip verification
    
    Verified --> RoleAssigned: Role determined
    RoleAssigned --> PatientState: Patient role
    RoleAssigned --> DoctorState: Doctor role
    RoleAssigned --> AdminState: Admin role
    
    PatientState --> LoggedIn: Dashboard access
    DoctorState --> LoggedIn: Dashboard access
    AdminState --> LoggedIn: Dashboard access
    
    LoggedIn --> SessionExpired: Token expired
    SessionExpired --> Authenticating: Re-login
    
    LoggedIn --> LoggingOut: User logout
    LoggingOut --> Unauthenticated: Logged out
    
    Authenticated --> [*]: Account deleted
    LoggedIn --> [*]: Account deleted
```

## 2. Family Request Lifecycle
```mermaid
stateDiagram-v2
    [*] --> RequestCreated: User sends request
    
    RequestCreated --> Pending: Request stored
    Pending --> RecipientNotified: Notification sent
    
    RecipientNotified --> Viewed: Recipient views
    Viewed --> DecisionPending: Awaiting response
    
    DecisionPending --> Accepted: Recipient accepts
    DecisionPending --> Declined: Recipient declines
    DecisionPending --> Expired: Timeout
    
    Accepted --> NetworksUpdated: Update both networks
    NetworksUpdated --> BothNotified: Success notifications
    BothNotified --> [*]: Request complete
    
    Declined --> SenderNotified: Decline notification
    SenderNotified --> [*]: Request closed
    
    Expired --> Cleanup: Remove request
    Cleanup --> [*]: Request archived
```

## 3. Appointment States
```mermaid
stateDiagram-v2
    [*] --> Available: Doctor sets availability
    
    Available --> Booked: Patient books
    Booked --> Confirmed: Doctor confirms
    Confirmed --> ReminderSent: 24h before
    
    ReminderSent --> InProgress: Appointment starts
    InProgress --> Completed: Session ends
    Completed --> FeedbackRequested: Rate experience
    
    Booked --> Cancelled: Patient cancels
    Confirmed --> Cancelled: Either party cancels
    Cancelled --> RefundProcessed: If applicable
    
    Completed --> [*]: Appointment closed
    Cancelled --> [*]: Appointment closed
    FeedbackRequested --> [*]: Process complete
```

## 4. Health Record States
```mermaid
stateDiagram-v2
    [*] --> Uploading: User uploads file
    
    Uploading --> Processing: Validate file
    Processing --> Validated: File valid
    Processing --> Rejected: Invalid file
    
    Validated --> Encrypted: Encrypt storage
    Encrypted --> Stored: Save to database
    Stored --> Indexed: Add to search
    
    Stored --> Private: Default state
    Private --> SharedWithFamily: Share access
    Private --> SharedWithDoctor: Share access
    
    SharedWithFamily --> AccessGranted: Family views
    SharedWithDoctor --> AccessGranted: Doctor views
    
    AccessGranted --> AccessLogged: Track usage
    AccessLogged --> Private: Revoke access
    
    Stored --> Archived: After retention period
    Archived --> Deleted: Permanent deletion
    
    Deleted --> [*]: Record removed
```

## 5. Chatbot Session States
```mermaid
stateDiagram-v2
    [*] --> SessionInit: User starts chat
    
    SessionInit --> Active: Session created
    Active --> AwaitingInput: Ready for message
    
    AwaitingInput --> Processing: User sends message
    Processing --> GeneratingResponse: AI processing
    GeneratingResponse --> ResponseReady: Response generated
    
    ResponseReady --> Displaying: Show to user
    Displaying --> AwaitingInput: Ready for next
    
    Active --> TimeoutWarning: 5 min inactive
    TimeoutWarning --> Active: User responds
    TimeoutWarning --> SessionExpired: No response
    
    SessionExpired --> Archived: Save conversation
    Archived --> [*]: Session closed
    
    Active --> UserEnded: User closes chat
    UserEnded --> Archived: Save conversation
```

## 6. Notification States
```mermaid
stateDiagram-v2
    [*] --> NotificationCreated: Event triggered
    
    NotificationCreated --> Queued: Add to queue
    Queued --> Processing: Prepare notification
    
    Processing --> EmailPrepared: Email type
    Processing --> SMSPrepared: SMS type
    Processing --> PushPrepared: Push type
    
    EmailPrepared --> EmailSent: Send email
    SMSPrepared --> SMSSent: Send SMS
    PushPrepared --> PushSent: Send push
    
    EmailSent --> Delivered: Email delivered
    SMSSent --> Delivered: SMS delivered
    PushSent --> Delivered: Push delivered
    
    Delivered --> Unread: Default state
    Unread --> Read: User opens
    Read --> Actioned: User responds
    
    Unread --> Expired: After 7 days
    Read --> Expired: After 30 days
    
    Expired --> Archived: Move to archive
    Actioned --> Archived: Process complete
    
    Archived --> [*]: Notification lifecycle end
```

## 7. User Profile States
```mermaid
stateDiagram-v2
    [*] --> ProfileCreated: Account created
    
    ProfileCreated --> Incomplete: Basic info only
    Incomplete --> BasicComplete: Add name, email
    
    BasicComplete --> VerificationPending: Email verification
    VerificationPending --> Verified: Email confirmed
    
    Verified --> ProfileSetup: Add details
    ProfileSetup --> PatientProfile: Patient info
    ProfileSetup --> DoctorProfile: Doctor info
    
    PatientProfile --> HealthInfo: Medical details
    HealthInfo --> EmergencyContact: Add contacts
    EmergencyContact --> ProfileComplete: All info added
    
    DoctorProfile --> ProfessionalInfo: License, specialization
    ProfessionalInfo --> Availability: Set schedule
    Availability --> ProfileComplete: All info added
    
    ProfileComplete --> Active: Ready to use
    
    Active --> UpdateRequired: Info outdated
    UpdateRequired --> ProfileComplete: Update info
    
    ProfileComplete --> Suspended: Policy violation
    Suspended --> ReviewPending: Under review
    
    ReviewPending --> Active: Reinstated
    ReviewPending --> Deleted: Account removed
    
    Deleted --> [*]: Account lifecycle end
```

## 8. System Health Monitoring
```mermaid
stateDiagram-v2
    [*] --> MonitoringActive: System online
    
    MonitoringActive --> Healthy: All metrics normal
    Healthy --> Warning: Threshold exceeded
    
    Warning --> Investigating: Check logs
    Investigating --> IssueFound: Problem identified
    
    IssueFound --> Resolving: Fix in progress
    Resolving --> Testing: Verify fix
    
    Testing --> Healthy: Issue resolved
    Testing --> Critical: Fix failed
    
    Critical --> Escalating: Alert team
    Escalating --> EmergencyMode: Reduced functionality
    
    EmergencyMode --> Recovery: Restore services
    Recovery --> Testing: Verify recovery
    
    Healthy --> Maintenance: Scheduled maintenance
    Maintenance --> Testing: Verify changes
    
    MonitoringActive --> [*]: System shutdown
