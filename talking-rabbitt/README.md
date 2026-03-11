# 🐇 Talking Rabbitt

> Conversational AI for Business Data — Upload any CSV and ask questions in plain English.

## What It Does

- **Upload any CSV** — sales data, orders, churn, revenue, anything
- **Ask questions in plain English** — "Which region had highest revenue in Q3?"
- **Get AI-powered answers** with charts auto-generated from your real data
- **Powered by Grok (xAI)** — fast, accurate business analysis

## Local Development

### 1. Clone and install

```bash
git clone <your-repo-url>
cd talking-rabbitt
npm run install:all
```

### 2. Run the backend server (Terminal 1)

```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

### 3. Run the frontend (Terminal 2)

```bash
cd client
npm run dev
# App opens at http://localhost:5173
```

### 4. Open the app

Go to `http://localhost:5173`, enter your xAI API key, and start asking questions.

---

## Deploy to Render (Free)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/talking-rabbitt.git
git push -u origin main
```

### Step 2 — Create Render Web Service

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub account
4. Select your `talking-rabbitt` repository
5. Fill in:
   - **Name**: `talking-rabbitt`
   - **Region**: Singapore (closest to India)
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3 — Deploy

Click **"Create Web Service"**. Render will:
1. Pull your code from GitHub
2. Run `npm run build` (installs deps + builds React)
3. Run `npm start` (starts Express server)
4. Give you a URL like: `https://talking-rabbitt.onrender.com`

**Note**: Free tier spins down after 15 min of inactivity. First load may take 30–60 seconds to wake up. Upgrade to Starter ($7/mo) for always-on.

---

## How Users Get Their API Key

The app asks users for their own xAI Grok API key on first load.
- Get key at: [console.x.ai](https://console.x.ai)
- Keys are never stored — only used in-session

## Tech Stack

- **Frontend**: React + Vite (no external UI libraries)
- **Backend**: Node.js + Express
- **CSV Parsing**: PapaParse
- **AI**: Grok-3 via xAI API (OpenAI-compatible)
- **Charts**: Pure SVG (no chart library dependencies)
- **Deploy**: Render (free tier)
