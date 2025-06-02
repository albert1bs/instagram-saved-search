# 🚀 Deploy to Render.com (FREE)

**Render.com** is perfect for your Instagram API server - completely free with no credit card required!

## ✨ Why Render?
- 🆓 **100% Free** for your use case
- 🔄 **Auto-deploy** from GitHub
- 🐳 **Docker support** (detects your Dockerfile)
- 🌐 **Custom domains** included
- 🔒 **HTTPS** automatically enabled
- ⚡ **Fast deployment** (2-3 minutes)

## 📋 Step-by-Step Deployment

### **Step 1: Push to GitHub**
```bash
# If you haven't already:
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### **Step 2: Deploy to Render**

1. **Go to [render.com](https://render.com)**
2. **Sign up** with your GitHub account (free)
3. **Click "New +"** → **"Web Service"**
4. **Connect your repository:**
   - Click "Connect account" if needed
   - Find your `instegrmserche` repository
   - Click "Connect"

5. **Configure the service:**
   ```
   Name: instagram-api-server
   Region: Oregon (US West) - or closest to you
   Branch: main
   Runtime: Docker
   ```

6. **Environment Variables** (click "Advanced"):
   ```
   FLASK_ENV=production
   PORT=10000
   HOST=0.0.0.0
   ```

7. **Click "Create Web Service"**

### **Step 3: Wait for Deployment**
- Render will build your Docker container (2-3 minutes)
- You'll see build logs in real-time
- When done, you'll get a URL like: `https://instagram-api-server.onrender.com`

### **Step 4: Test Your Deployment**
```bash
# Test health endpoint
curl https://your-app-name.onrender.com/api/health

# Should return: {"success": true, "message": "השרת פועל תקין"}
```

## 🔧 Update Your Apps

### **Mobile App (App.js)**
Change line ~15:
```javascript
// From:
const API_BASE = 'http://localhost:5000/api';

// To:
const API_BASE = 'https://your-app-name.onrender.com/api';
```

### **Web App (web-test.html)**
Change line ~180:
```javascript
// From:
const API_BASE = 'http://localhost:5000/api';

// To:
const API_BASE = 'https://your-app-name.onrender.com/api';
```

## ⚠️ Important Notes

### **Free Tier Limitations:**
- **Sleep after 15 minutes** of inactivity
- **Wakes up automatically** when someone visits (takes ~30 seconds)
- **750 hours/month** (enough for 24/7 if you upgrade to paid)

### **Keep It Awake (Optional):**
If you want to prevent sleeping, you can:
1. **Upgrade to paid** ($7/month for always-on)
2. **Use a ping service** like UptimeRobot (free) to ping every 14 minutes

## 🔄 Auto-Deploy

Every time you push to GitHub, Render will automatically:
1. Pull your latest code
2. Rebuild the Docker container
3. Deploy the new version
4. Zero downtime!

## 📊 Monitoring

Render provides:
- **Real-time logs**
- **Metrics dashboard**
- **Health checks**
- **Custom domains**

## 🆓 Alternative Free Platforms

If Render doesn't work for you:

1. **Railway.app** - $5 monthly credit (usually enough)
2. **Fly.io** - 3 free VMs
3. **Koyeb** - No sleep, 512MB RAM
4. **Heroku** - 550 hours/month (with credit card)

## 🎉 You're Done!

Your Instagram saved posts API will be live at:
`https://your-app-name.onrender.com`

Features available:
- ✅ Real Instagram login
- ✅ Search 2,000+ saved posts
- ✅ Hebrew RTL interface
- ✅ Mobile & web apps
- ✅ Global access
- ✅ HTTPS security
- ✅ Auto-deploy from GitHub

**Total cost: $0** 🎉 