# Render Deployment Guide

## Deploy to Render (Free Tier)

### Step 1: Prepare Repository
1. Push your code to GitHub
2. Make sure both `frontend/` and `backend/` folders are in the root

### Step 2: Deploy Backend (Express API)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `swasthyalink-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: `18` or `20`
5. Add Environment Variables:
   - `NODE_ENV=production`
   - `PORT=3001`
6. Click "Create Web Service"

### Step 3: Deploy Frontend (React App)
1. In Render Dashboard, click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `swasthyalink-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Click "Create Static Site"

### Step 4: Update Frontend API URLs
1. Copy your backend URL from Render (e.g., `https://swasthyalink-backend.onrender.com`)
2. In Render frontend settings, add environment variable:
   - `VITE_API_BASE_URL=https://swasthyalink-backend.onrender.com`

### Step 5: Test Your App
- Frontend: `https://swasthyalink-frontend.onrender.com`
- Backend API: `https://swasthyalink-backend.onrender.com/api/health`

## Free Tier Limits
- **750 hours/month** per service
- **100GB bandwidth/month**
- **Services sleep after 15 minutes** of inactivity (wake up on first request)

## Cost: $0/month (within free tier limits)
