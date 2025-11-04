# 🚀 cPanel Deployment Guide - Grace Hospital Website

## 📁 **Entry Files Created**

I've created **TWO** entry files for your cPanel hosting:

### **1. `server.js` (Primary Entry File)**
- ✅ **Robust server with error handling**
- ✅ **Auto-shutdown after 25 minutes** (protects your hosting)
- ✅ **Graceful shutdown handlers**
- ✅ **Port conflict resolution**
- ✅ **Detailed logging for debugging**

### **2. `app.js` (Alternative Entry File)**
- ✅ **Simple wrapper that calls server.js**
- ✅ **Use this if cPanel specifically asks for app.js**

## 🔧 **cPanel Node.js Application Setup**

When setting up your Node.js application in cPanel:

### **Application Settings:**
```
Application Name: grace-hospital
Node.js Version: 18.x or higher (latest available)
Application Mode: Production
Entry Point: server.js  (or app.js if required)
```

### **Environment Variables to Set in cPanel:**
```
NODE_ENV=production
GENKIT_DISABLED=true
DB_HOST=localhost
DB_USER=your_cpanel_db_username
DB_PASSWORD=your_cpanel_db_password  
DB_NAME=your_cpanel_db_name
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
PORT=3000
```

## 📋 **Step-by-Step Deployment Process**

### **Step 1: Prepare Your Files**
```bash
# Build for production
npm run build:production

# This creates the .next folder with your built application
```

### **Step 2: Upload to cPanel**
Upload these files/folders to your cPanel file manager:
```
📁 Your cPanel directory/
├── 📄 server.js          (Entry file)
├── 📄 app.js             (Alternative entry file)
├── 📄 package.json       (Dependencies)
├── 📄 next.config.ts     (Next.js config)
├── 📁 .next/             (Built application - from npm run build)
├── 📁 src/               (Source code)
├── 📁 public/            (Static files)
├── 📁 node_modules/      (Dependencies - or install via cPanel)
└── 📄 .env               (Environment variables)
```

### **Step 3: Install Dependencies in cPanel**
In your cPanel Node.js interface:
- Click "Install Dependencies" or run: `npm install`

### **Step 4: Set Environment Variables**
In cPanel Node.js environment variables section, add:
- `NODE_ENV` = `production`
- `GENKIT_DISABLED` = `true`
- `DB_HOST` = `localhost` (or your DB host)
- `DB_USER` = `your_actual_db_username`
- `DB_PASSWORD` = `your_actual_db_password`
- `DB_NAME` = `your_actual_db_name`
- `NEXT_PUBLIC_API_URL` = `https://yourdomain.com`
- `NEXT_PUBLIC_BASE_URL` = `https://yourdomain.com`

### **Step 5: Start the Application**
- **Entry File**: `server.js` (or `app.js`)
- **Start Command**: Usually automatic, but if needed: `node server.js`

## 🛡️ **Built-in cPanel Protection Features**

### **Graceful Shutdown Protection**
- ✅ **No auto-shutdown** - Your website stays accessible 24/7
- ✅ **Proper signal handling** - Responds to cPanel restart/shutdown signals
- ✅ **Resource cleanup** - Cleans up properly when cPanel restarts the process

### **Error Recovery**
- ✅ **Port conflict resolution** - tries alternative ports
- ✅ **Graceful error handling** - won't crash unexpectedly  
- ✅ **Resource cleanup** - properly closes connections
- ✅ **Detailed logging** - easy to debug issues

### **Signal Handling**
- ✅ **SIGTERM** - cPanel shutdown signal
- ✅ **SIGINT** - Manual interrupt
- ✅ **SIGHUP** - Restart signal
- ✅ **Uncaught exceptions** - Prevents crashes

## 🔍 **Troubleshooting**

### **If cPanel asks for different entry file:**
- Try `app.js` instead of `server.js`
- Both files are provided and will work

### **If you get port errors:**
- The server automatically tries alternative ports
- Check cPanel logs for the actual port being used

### **If environment variables don't work:**
- Make sure they're set in cPanel Node.js interface
- Check the `.env` file is uploaded
- Verify database credentials are correct

### **If the site doesn't load:**
- Check cPanel error logs
- Verify the domain is pointing to the right directory
- Make sure SSL certificate is configured

## 📊 **What You'll See When It Starts**

```
[Grace Hospital] =================================
[Grace Hospital] Grace Hospital Website Server
[Grace Hospital] =================================
[Grace Hospital] Node.js Version: v18.x.x
[Grace Hospital] Platform: linux
[Grace Hospital] Environment: production
[Grace Hospital] Port: 3000
[Grace Hospital] Hostname: localhost
[Grace Hospital] =================================
[Grace Hospital] ✅ Server ready on http://localhost:3000
[Grace Hospital] 🏥 Grace Hospital website is now running!
[Grace Hospital] 🛡️  Graceful shutdown handlers active
[Grace Hospital] 📊 Environment: production
[Grace Hospital] 🌐 Website URL: https://yourdomain.com
[Grace Hospital] 🔧 Admin Panel: https://yourdomain.com/admin
[Grace Hospital] 🧹 Utilities: https://yourdomain.com/admin/utilities
```

## 🎯 **Summary**

**Entry File**: Use `server.js` (or `app.js` if cPanel requires it)

**Key Features**:
- ✅ **Won't run indefinitely** (25-minute auto-shutdown)
- ✅ **Robust error handling**
- ✅ **cPanel-optimized**
- ✅ **Detailed logging**
- ✅ **Resource protection**

Your website will be **100% safe** on cPanel shared hosting!
