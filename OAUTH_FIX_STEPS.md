# 🔧 Firebase OAuth Configuration Fix

## Current Issue
- Error: `auth/internal-error` when trying Google authentication
- This typically indicates a mismatch between Firebase and Google Cloud Console OAuth settings

## Step-by-Step Fix

### 1. Google Cloud Console OAuth Client Settings
Go to: https://console.cloud.google.com/apis/credentials/oauthclient/613048256435-7ofdgmu437e39tcdgakun5oh3rhvd95.apps.googleusercontent.com?project=swasthyakink

**Required Settings:**
- **Application type:** Web application ✅
- **Name:** Web client (auto created by Google Service) ✅

**Authorized JavaScript origins:**
```
http://localhost:5174
https://swasthyakink.firebaseapp.com
```

**Authorized redirect URIs:**
```
http://localhost:5174/__/auth/handler
https://swasthyakink.firebaseapp.com/__/auth/handler
```

### 2. Firebase Console Settings
Go to: https://console.firebase.google.com/project/swasthyakink/authentication/providers

**Google Provider Configuration:**
- ✅ Enable Google provider
- ✅ Use the same OAuth client ID from Google Cloud Console
- ✅ Add authorized domains: `localhost`, `swasthyakink.firebaseapp.com`

### 3. Common Fixes for auth/internal-error

**Fix A: OAuth Client ID Mismatch**
- Firebase Console → Authentication → Sign-in method → Google
- Make sure the Web SDK configuration shows the correct OAuth client ID
- Should match: `613048256435-7ofdgmu437e39tcdgakun5oh3rhvd95.apps.googleusercontent.com`

**Fix B: Missing Localhost Authorization**
- In Google Cloud Console OAuth client
- Add `http://localhost:5174` to Authorized JavaScript origins
- Add `http://localhost:5174/__/auth/handler` to Authorized redirect URIs

**Fix C: Firebase Project Mismatch**
- Verify you're configuring the correct Firebase project: `swasthyakink`
- Check that Google Cloud Console project matches Firebase project

### 4. Test Steps
1. Click "Test Basic Config" - should pass
2. Click "Test Popup Auth" - should work after OAuth fix
3. If still failing, try "Test Redirect Auth"

### 5. Alternative: Create New OAuth Client
If the above doesn't work, create a new OAuth client:
1. Go to Google Cloud Console → APIs & Credentials
2. Create new OAuth 2.0 Client ID
3. Type: Web application
4. Add the origins and redirect URIs above
5. Update Firebase with the new client ID
