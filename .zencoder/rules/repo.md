---
description: Repository Information Overview
alwaysApply: true
---

# Repository Information Overview

## Repository Summary
Swasthyalink is a comprehensive digital healthcare platform connecting patients, doctors, and family members through secure health record management and real-time communication. The platform provides secure, accessible, and user-friendly interfaces for managing medical records, appointments, and family health information.

## Repository Structure
- **frontend/**: React application with Vite build system
- **backend/**: Express.js server with Dialogflow integration
- **firestore.rules**: Firebase Firestore security rules
- **.zencoder/**: Configuration directory

### Main Repository Components
- **Frontend**: React-based UI for patients, doctors, and family members
- **Backend**: Express.js server with Dialogflow chatbot integration
- **Firebase**: Authentication, database, and hosting services

## Projects

### Frontend (React Application)
**Configuration File**: frontend/package.json

#### Language & Runtime
**Language**: JavaScript (React)
**Version**: React 19.1.0
**Build System**: Vite 7.0.4
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- react: ^19.1.0
- react-dom: ^19.1.0
- firebase: ^11.10.0
- react-router-dom: ^7.6.3
- axios: ^1.11.0
- react-qr-code: ^2.0.18

**Development Dependencies**:
- @vitejs/plugin-react: ^4.6.0
- tailwindcss: ^3.4.17
- eslint: ^9.30.1
- postcss: ^8.5.6
- autoprefixer: ^10.4.21

#### Build & Installation
```bash
cd frontend
npm install
npm run dev
```

#### Testing
**Framework**: Not implemented yet (placeholder in package.json)
**Run Command**:
```bash
npm run test
```

### Backend (Express.js Server)
**Configuration File**: backend/package.json

#### Language & Runtime
**Language**: JavaScript (Node.js)
**Version**: Node.js v18.0+ (from README requirements)
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- express: ^4.21.1
- @google-cloud/dialogflow: ^7.2.0
- cors: ^2.8.5
- uuid: ^11.1.0

**Development Dependencies**:
- nodemon: ^3.1.7

#### Build & Installation
```bash
cd backend
npm install
npm run dev
```

### Firebase Configuration
**Configuration File**: frontend/src/firebaseConfig.js

#### Services
**Authentication**: Firebase Authentication for user management
**Database**: Firestore for data storage
**Security**: Custom Firestore security rules

#### Setup
```bash
# Update firebaseConfig.js with your Firebase credentials
# Deploy Firestore rules
firebase deploy --only firestore:rules
```

## Additional Information

### Firebase Integration
- **Authentication**: User login/registration system
- **Firestore**: NoSQL database for storing health records
- **Security Rules**: Custom rules for data access control

### Application Features
- **Patient Portal**: Health record management, QR code access, family control
- **Doctor Dashboard**: Patient management, appointments, medical records
- **Family Access**: Controlled health record viewing, emergency access
- **Chatbot**: Dialogflow integration for patient assistance

### Deployment
- **Frontend**: Build with `npm run build`, deploy to Firebase Hosting
- **Backend**: Node.js server deployable to any Node.js hosting
- **Firebase**: Configuration for authentication and database