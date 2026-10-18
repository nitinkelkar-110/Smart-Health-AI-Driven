# 🌐 MediGrid AI — Production Deployment Guide

MediGrid AI is built with a unified, zero-friction full-stack architecture. In production, a single Node.js instance serves both the **backend API gateway** (`/api/*`) and the **React 19 single-page application** (`dist/`) on one single port, eliminating CORS complications.

---

## 🎯 Quick Deploy Options

### 1. Render.com (Recommended — 100% Free Tier Available)
1. Push your repository to GitHub using [`push_to_github.bat`](./push_to_github.bat) or `npm run push`.
2. Go to **[dashboard.render.com](https://dashboard.render.com/)** and click **New + > Web Service**.
3. Select your GitHub repository.
4. Render automatically detects the configuration from [`render.yaml`](./render.yaml):
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. *(Optional)* Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `GROQ_API_KEY`: Your Groq Cloud API Key
   - `OPENROUTER_API_KEY`: Your OpenRouter API Key
6. Click **Create Web Service**. Your app is live with automatic SSL (`https://medigrid-ai.onrender.com`)!

---

### 2. Railway.app (Instant Deploy)
1. Go to **[railway.app](https://railway.app/)** and click **New Project > Deploy from GitHub Repo**.
2. Select your repository.
3. Railway automatically runs `npm run build` and starts the app with `npm start`.
4. Add your optional API keys under the **Variables** tab.
5. Under **Settings > Domains**, generate a public domain. Done!

---

### 3. Docker Container (Self-Hosted / Cloud VM)
Run the application anywhere with Docker:

```bash
# 1. Build and launch with Docker Compose
docker compose up -d --build

# 2. View running application
open http://localhost:3001
```

Or build and run manually:
```bash
docker build -t medigrid-ai .
docker run -p 3001:3001 --env-file backend/.env medigrid-ai
```

---

### 4. Linux VPS (Ubuntu / Debian / AWS EC2 / DigitalOcean)
```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /var/www/medigrid
cd /var/www/medigrid

# 2. Install dependencies & build
npm ci
npm run build

# 3. Manage with PM2
npm install -g pm2
pm2 start backend/dist/server.js --name "medigrid-ai"
pm2 save
pm2 startup
```

---

## 🔒 Security in Production
- All third-party provider keys (Google Gemini, Groq, OpenRouter) remain securely on the server.
- The client browser never receives raw secret keys; requests route exclusively through `/api/ai/chat`.
- No sensitive `.env` files are tracked in Git.
