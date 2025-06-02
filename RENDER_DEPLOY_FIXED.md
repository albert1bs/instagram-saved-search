# 🚀 Render Deployment Guide - Fixed Version

## ✅ Problem Fixed
The Docker build error was caused by trying to copy a `/sessions` directory that doesn't exist in the repository. This has been fixed in the updated `Dockerfile`.

## 📋 Step-by-Step Deployment

### 1. Upload Files to GitHub
Make sure your GitHub repository contains these files:
- `api_server.py` ✅
- `requirements.txt` ✅
- `Dockerfile` ✅ (Fixed version)
- `.dockerignore` ✅ (Updated)

### 2. Deploy to Render

1. **Go to Render.com**
   - Sign up/login at https://render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Choose "Build and deploy from a Git repository"
   - Connect your GitHub account
   - Select your repository: `instagram-saved-search`

3. **Configure Service**
   ```
   Name: instagram-saved-search
   Region: Oregon (US West) or closest to you
   Branch: main
   Runtime: Docker
   ```

4. **Environment Variables**
   Add these in the "Environment" section:
   ```
   FLASK_ENV=production
   PORT=10000
   HOST=0.0.0.0
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

### 3. Get Your API URL
After deployment, you'll get a URL like:
```
https://instagram-saved-search-xxxx.onrender.com
```

### 4. Update Mobile/Web Apps
Update the API URL in your apps:

**For Mobile App (App.js):**
```javascript
const API_BASE_URL = 'https://your-app-name.onrender.com';
```

**For Web App (web-test.html):**
```javascript
const API_BASE_URL = 'https://your-app-name.onrender.com';
```

## 🔧 Troubleshooting

### If Build Still Fails:
1. Check the build logs in Render dashboard
2. Make sure all files are uploaded to GitHub
3. Verify the Dockerfile is the updated version

### If App Doesn't Start:
1. Check the service logs in Render
2. Verify environment variables are set correctly
3. Make sure PORT is set to 10000

### If API Doesn't Respond:
1. Test the health endpoint: `https://your-app.onrender.com/api/health`
2. Check if the service is sleeping (free tier sleeps after 15 minutes)
3. Make a request to wake it up

## 📱 Testing Your Deployment

1. **Health Check:**
   ```
   GET https://your-app.onrender.com/api/health
   ```

2. **Login Test:**
   ```
   POST https://your-app.onrender.com/api/login
   Content-Type: application/json
   
   {
     "username": "your_username",
     "password": "your_password"
   }
   ```

## 💡 Important Notes

- **Free Tier Limitations:**
  - Service sleeps after 15 minutes of inactivity
  - 750 hours per month (enough for personal use)
  - Cold start takes 30-60 seconds

- **Security:**
  - Your Instagram credentials are processed server-side
  - Sessions are stored temporarily in the container
  - No data is permanently stored

- **Performance:**
  - First request after sleep will be slow
  - Subsequent requests are fast
  - Consider upgrading to paid tier for production use

## 🎯 Next Steps

1. Deploy the API server to Render
2. Update your mobile/web apps with the new URL
3. Test the complete flow
4. Share your app with others!

Your Instagram saved posts search app will be live and accessible from anywhere! 🌟 