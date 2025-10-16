# Notification System Setup Guide

## Current Issue
The notification system is not working because the **Cloud Firestore API is not enabled** for the project `ceremonial-team-434816-h2`.

## Steps to Fix

### 1. Enable Cloud Firestore API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `ceremonial-team-434816-h2`
3. Navigate to **APIs & Services** > **Library**
4. Search for "Cloud Firestore API"
5. Click **Enable**

Alternatively, visit this direct link:
https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=ceremonial-team-434816-h2

### 2. Set up Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Click **Create database**
5. Choose **Start in test mode** (for development)
6. Select a location (preferably close to your users)

### 3. Deploy Firestore Security Rules
Copy the rules from `firestore.rules` to your Firebase Console:
1. Go to **Firestore Database** > **Rules**
2. Replace the existing rules with the content from `firestore.rules`
3. Click **Publish**

### 4. Test the System
Once the API is enabled and database is set up:

1. **Backend Test**: 
   ```bash
   curl http://localhost:3001/api/notifications/test
   ```

2. **Frontend Test**: 
   - Go to the Family Dashboard
   - Use the Notification Manager component to create test notifications
   - Check if notifications appear in real-time

## Notification Features

### 1. Real-time Notifications
- ✅ Chat messages
- ✅ Family requests
- ✅ Emergency alerts
- ✅ Health record sharing
- ✅ Appointment reminders

### 2. Notification Types
```javascript
NOTIFICATION_TYPES = {
  FAMILY_REQUEST: 'family_request',
  FAMILY_REQUEST_ACCEPTED: 'family_request_accepted',
  FAMILY_REQUEST_REJECTED: 'family_request_rejected',
  CHAT_MESSAGE: 'chat_message',
  EMERGENCY_ALERT: 'emergency_alert',
  HEALTH_RECORD_SHARED: 'health_record_shared',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  MEDICATION_REMINDER: 'medication_reminder',
  SYSTEM_ALERT: 'system_alert'
}
```

### 3. Notification Components
- **Header Notification Bell**: `EnhancedNotificationCenter`
- **Sidebar Notification Bell**: `FamilyNotificationSystem`
- **Management Interface**: `NotificationManager` (for testing)

### 4. Presence System
- ✅ Online/Offline status
- ✅ Last seen timestamps
- ✅ Away detection (5 minutes inactive)
- ✅ Offline detection (30 minutes inactive)
- ✅ Real-time presence updates

## API Endpoints

### Backend Notification Routes
- `GET /api/notifications/:userId` - Get user notifications
- `GET /api/notifications/test` - Test Firebase connection
- `PATCH /api/notifications/:notificationId/read` - Mark as read
- `DELETE /api/notifications/:notificationId` - Delete notification

### Backend Presence Routes
- `GET /api/presence/:userId` - Get user presence
- `POST /api/presence/:userId` - Update user presence

## Troubleshooting

### Common Issues
1. **"Cloud Firestore API has not been used"**
   - Solution: Enable the API as described above

2. **"Permission denied"**
   - Check Firestore security rules
   - Ensure user is authenticated

3. **Notifications not appearing**
   - Check browser console for errors
   - Verify Firebase config
   - Test with NotificationManager component

4. **Presence not updating**
   - Check if user is authenticated
   - Verify presence service initialization
   - Check browser activity detection

### Debug Tools
1. **NotificationManager Component**: Test notification creation and management
2. **Browser Console**: Check for Firebase errors
3. **Firebase Console**: Monitor Firestore data in real-time
4. **Network Tab**: Check API calls to backend

## Production Deployment

### Remove Debug Components
Before deploying to production, remove these debug components:
- `NotificationManager` from `EnhancedFamilyDashboard.jsx`
- Console.log statements from notification services
- Test notification creation functions

### Security
- Update Firestore rules for production security
- Enable proper authentication
- Set up proper CORS policies
- Use environment variables for sensitive data

## File Structure
```
frontend/src/
├── components/
│   ├── EnhancedNotificationCenter.jsx    # Header notifications
│   ├── FamilyNotificationSystem.jsx      # Sidebar notifications
│   └── NotificationManager.jsx           # Debug/management tool
├── services/
│   ├── notificationService.js            # Notification CRUD operations
│   ├── presenceService.js                # Presence management
│   └── chatService.js                    # Chat with notifications
└── utils/
    └── clearTestData.js                  # Cleanup utilities

backend/
├── routes/
│   ├── notifications.js                 # Notification API
│   └── presence.js                      # Presence API
└── server.js                           # Main server file
```