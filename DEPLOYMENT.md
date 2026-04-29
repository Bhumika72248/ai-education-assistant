# Deployment Guide

## ✅ Changes Made

### Frontend Changes
- Updated `frontend/src/api/client.js` to use Render backend URL
- Created `.env` file with `VITE_API_URL` configuration
- Now supports both local development and production deployment

### Backend Changes
- Updated `backend/main.py` CORS settings to allow Vercel frontend
- Added `https://edu-ai-ebon.vercel.app` to allowed origins

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Render

Your backend is already deployed at: `https://ai-education-assistant-1.onrender.com`

**Set Environment Variable on Render:**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service: `ai-education-assistant-1`
3. Click **Environment** tab
4. Add this variable:
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://edu-ai-ebon.vercel.app`
5. Click **Save Changes** (auto-redeploys)

### Step 2: Deploy Frontend to Vercel

Your frontend is already deployed at: `https://edu-ai-ebon.vercel.app`

**Set Environment Variable on Vercel:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `edu-ai`
3. Go to **Settings** → **Environment Variables**
4. Add this variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://ai-education-assistant-1.onrender.com`
5. Click **Save**
6. Go to **Deployments** tab
7. Click **Redeploy** on the latest deployment

### Step 3: Push Changes to Git

```bash
# From project root
git add .
git commit -m "Fix: Update API URL for production deployment"
git push origin main
```

This will trigger auto-deployment on both Vercel and Render.

---

## 🧪 Testing After Deployment

1. Wait 2-3 minutes for deployments to complete
2. Visit: `https://edu-ai-ebon.vercel.app`
3. Try to **Register** a new account
4. Try to **Login**
5. Open browser console (F12) and check:
   - Network tab should show requests to `https://ai-education-assistant-1.onrender.com`
   - No CORS errors
   - Authentication should work

---

## 🔧 Local Development

For local development, the app will still work with localhost:

```bash
# Backend (Terminal 1)
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000

# Frontend (Terminal 2)
cd frontend
npm run dev
```

The frontend will automatically use `http://localhost:8000` when running locally.

---

## ⚠️ Troubleshooting

### Issue: Still getting CORS errors
**Solution:** Make sure you saved the environment variable on Render and the service redeployed.

### Issue: 404 errors on API calls
**Solution:** Check that your Render backend is running at `https://ai-education-assistant-1.onrender.com/health`

### Issue: Frontend not updated
**Solution:** 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check Vercel deployment logs

### Issue: Backend sleeping (Render free tier)
**Solution:** First request may take 30-60 seconds to wake up the backend. This is normal for Render's free tier.

---

## 📝 Environment Variables Summary

### Backend (Render)
- `FRONTEND_URL` = `https://edu-ai-ebon.vercel.app`
- `GEMINI_API_KEY` = (your existing key)
- `JWT_SECRET` = (your existing secret)
- Other existing variables...

### Frontend (Vercel)
- `VITE_API_URL` = `https://ai-education-assistant-1.onrender.com`

---

## ✅ What's Fixed

- ✅ Frontend now calls Render backend instead of localhost
- ✅ Backend allows requests from Vercel frontend
- ✅ Authentication (register/login) will work on deployed site
- ✅ All features remain unchanged
- ✅ Local development still works
- ✅ No breaking changes

---

## 🎯 Next Steps

1. Set environment variables on Render and Vercel (see Step 1 & 2 above)
2. Push changes to Git
3. Wait for auto-deployment
4. Test authentication on live site

**Your deployed app will be fully functional after these steps!**
