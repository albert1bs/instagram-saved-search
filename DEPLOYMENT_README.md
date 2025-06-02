# 🚀 Instagram Saved Posts Search - Deployment Package

This folder contains **ONLY** the files you need to upload to GitHub for deployment.

## 📁 **What's Included (12 Files)**

### **🐳 Docker & Deployment**
- ✅ `Dockerfile` - Container configuration
- ✅ `requirements.txt` - Python dependencies
- ✅ `.dockerignore` - Docker exclusions
- ✅ `.gitignore` - Git exclusions

### **🚀 API Server**
- ✅ `api_server.py` - Main Instagram API server

### **📱 Mobile App**
- ✅ `App.js` - React Native mobile app
- ✅ `package.json` - Node.js dependencies
- ✅ `app.json` - Expo configuration
- ✅ `babel.config.js` - Babel configuration

### **🌐 Web App**
- ✅ `web-test.html` - Browser version with search

### **📚 Documentation**
- ✅ `README.md` - Project description
- ✅ `RENDER_DEPLOY.md` - Deployment guide

## 🚀 **How to Upload to GitHub**

### **1. Navigate to this folder:**
```bash
cd deployment
```

### **2. Initialize Git:**
```bash
git init
git add .
git commit -m "Instagram saved posts search app"
```

### **3. Create GitHub repository:**
- Go to [github.com](https://github.com)
- Click "New repository"
- Name: `instagram-saved-search` (or any name)
- Make it **Public**
- Don't initialize with README

### **4. Connect and push:**
```bash
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

## 🎯 **Deploy to Platform**

Once on GitHub, deploy to any platform:

### **🥇 Render.com (Easiest)**
1. Go to [render.com](https://render.com)
2. "New Web Service" → Connect GitHub repo
3. Runtime: **Docker**
4. Deploy!

### **🥈 Railway.app**
1. Go to [railway.app](https://railway.app)
2. "Deploy from GitHub" → Select repo
3. Auto-deploys!

### **🥉 Firebase/Cloud Run**
1. Go to [shell.cloud.google.com](https://shell.cloud.google.com)
2. Upload files
3. Run: `gcloud run deploy --source .`

## ✅ **What's NOT Included (Protected)**

These sensitive files are **excluded** for security:
- ❌ `sessions/` - Instagram login data
- ❌ `node_modules/` - Dependencies (auto-installed)
- ❌ `__pycache__/` - Python cache
- ❌ Test files and development helpers

## 🎉 **You're Ready!**

This deployment package contains everything needed for:
- ✅ **Real Instagram login** and saved posts access
- ✅ **Search functionality** through 2,000+ posts
- ✅ **Hebrew RTL interface**
- ✅ **Mobile and web versions**
- ✅ **Free cloud deployment**

**Total size:** ~67KB (very lightweight!)
**Deployment time:** 2-3 minutes on any platform

---

**🚀 Just upload this folder to GitHub and deploy to any free platform!** 