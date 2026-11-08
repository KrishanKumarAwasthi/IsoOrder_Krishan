# Deployment & Operations Guide — IsoOrder

This document outlines the complete production deployment architecture, step-by-step instructions, and operational procedures for **IsoOrder**, a restaurant chain direct ordering web platform with real-time Kitchen Display System (KDS), Central Menu CMS, and AI-powered prep-time estimation.

---

## 1. Architecture Overview

```
                      [End Users & Mobile Devices]
                                   │
                                   ▼ HTTPS
                    ┌──────────────────────────────┐
                    │      Vercel Edge Network     │
                    │   React 18 SPA (Vite Bundled)│
                    │   https://isoorder.vercel.app│
                    └──────────────┬───────────────┘
                                   │
              REST API (HTTPS)     │     WebSockets (WSS)
              /api/*               │     order & kitchen rooms
                                   ▼
                    ┌──────────────────────────────┐
                    │      Render Web Service      │
                    │   Node.js / Express Backend  │
                    │  https://isoorder-api.onrender.com
                    └──────────────┬───────────────┘
                                   │
                                   ▼ Mongoose Driver (TLS)
                    ┌──────────────────────────────┐
                    │      MongoDB Atlas (M0)      │
                    │   ap-south-1 (Mumbai, India) │
                    └──────────────────────────────┘
```

- **Frontend (`/client`)**: React 18, Vite, Tailwind CSS, Lucide Icons, Socket.IO client, deployed on **Vercel**.
- **Backend (`/server`)**: Node.js, Express, Socket.IO, Helmet, CORS, deployed on **Render** (Root directory: `server`).
- **Database**: **MongoDB Atlas** M0 cluster deployed in AWS `ap-south-1` (Mumbai) for lowest latency to Hyderabad.
- **AI Service**: Google Gemini API with heuristic fallback for kitchen load-based prep time prediction.

---

## 2. Production Preparations (Already Completed)

The codebase has been refactored to be 100% cloud-ready:
1. **Self-Contained Packages**: Removed `"iso-order": "file:.."` dependencies from both `server/package.json` and `client/package.json`.
2. **Vendored Shared Constants**: `constants.js` is bundled inside `server/src/shared/constants.js` and `client/src/shared/constants.js` so each tier builds independently.
3. **Smart URL Normalization**: Centralized in `client/src/config/api.js`. Handles trailing slashes, omitted `/api` paths, and automatically synchronizes WebSocket URLs.
4. **Vercel SPA Rewrites**: Configured `client/vercel.json` to prevent 404 errors on browser refresh across customer, KDS, and admin routes.
5. **Dynamic CORS & Helmet**: Server dynamically accepts Vercel production domains, Vercel preview domains (`*.vercel.app`), and local development environments.

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Push Code to GitHub

```bash
cd c:\Users\krish\.vscode\IsoCode_project
git init
git add .
git commit -m "feat: production-ready IsoOrder direct ordering platform"

# Link to your remote GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/isoorder.git
git branch -M main
git push -u origin main
```

---

### Step 2: Set Up MongoDB Atlas

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a free **M0 Cluster** in **AWS Mumbai (`ap-south-1`)**.
3. **Security → Database Access**:
   - Create a database user (e.g., `isoorder_admin`).
   - Grant `readWriteAnyDatabase` or `Atlas Admin` privileges.
4. **Security → Network Access**:
   - Click **Add IP Address** → Choose **Allow Access from Anywhere** (`0.0.0.0/0`) to allow dynamic cloud worker connections from Render.
5. **Deployment → Database → Connect → Drivers**:
   - Copy the SRV connection string:
     ```
     mongodb+srv://isoorder_admin:<PASSWORD>@cluster0.xxxxx.mongodb.net/isoorder?retryWrites=true&w=majority
     ```

---

### Step 3: Deploy Backend on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `YOUR_USERNAME/isoorder`.
4. Configure the Web Service settings:
   - **Name**: `isoorder-api`
   - **Region**: Singapore or Frankfurt (closest free region)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Add the following **Environment Variables** in Render:

| Key | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production security & optimizations |
| `PORT` | `5000` | Port listened to by Express |
| `MONGODB_URI` | `mongodb+srv://...` | Connection string from MongoDB Atlas |
| `JWT_SECRET` | `supersecretjwtkey_min_32_characters_isoorder_2026` | 32+ character key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | Token expiration period |
| `CLIENT_URL` | `https://your-app.vercel.app` | Vercel production URL (update after Step 4) |
| `GEMINI_API_KEY` | `AIzaSy...` *(optional)* | Google Gemini API Key for prep time AI |

6. Click **Create Web Service**. Wait for the logs to confirm:
   ```
   [Server] IsoOrder Backend running on port 5000 in production mode
   [Database] MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
   ```
7. Copy your backend URL: `https://isoorder-api.onrender.com`.

---

### Step 4: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your `isoorder` GitHub repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Expand **Environment Variables** and add:

| Key | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://isoorder-api.onrender.com` | Render Backend URL |
| `VITE_SOCKET_URL` | `https://isoorder-api.onrender.com` | Root URL for WebSockets |

6. Click **Deploy**. Vercel will build the React SPA in ~30 seconds.
7. Note your generated production URL: `https://isoorder.vercel.app`.

---

### Step 5: Final Cross-Origin Synchronization & Database Seed

1. **Update Render CORS**:
   - Go to your Render Web Service → **Environment**.
   - Set `CLIENT_URL` to your Vercel URL: `https://isoorder.vercel.app`.
   - Save changes (Render will trigger an instant zero-downtime redeploy).
2. **Seed Production Database**:
   From your local development machine, seed your MongoDB Atlas cluster with Hyderabadi outlets, menu items, coupons, demo users, and test orders:
   ```bash
   cd c:\Users\krish\.vscode\IsoCode_project\server
   set MONGODB_URI=mongodb+srv://isoorder_admin:<PASSWORD>@cluster0.xxxxx.mongodb.net/isoorder?retryWrites=true&w=majority
   npm run seed
   ```

---

## 4. Verification & Smoke Testing Checklist

| Component | Target URL | Expected Result |
|---|---|---|
| API Health | `https://isoorder-api.onrender.com/api/health` | Returns status 200 with DB status `connected` |
| Client Landing | `https://isoorder.vercel.app/` | Hero section, 4 role cards, dynamic connection pill |
| Customer Auth | `https://isoorder.vercel.app/login` | Quick fill button logs in demo customer, displays loyalty points |
| Kitchen KDS | `https://isoorder.vercel.app/kitchen` | Live Kanban columns, countdown timers, late order badges |
| Admin CMS | `https://isoorder.vercel.app/admin` | Item stock toggle, city-based pricing, category filters |
| Bulk Catering | `https://isoorder.vercel.app/party` | 24-hour advance notice validation, budget calculation |
| WebSockets | Browser DevTools Console | `[Socket] Connected to server, ID: <id>` logged |

---

## 5. Maintenance & Operational Runbook

### Handling Inactive Render Free Instance Spin-Downs
- On Render's Free tier, the web service sleeps after 15 minutes of inactivity. The first incoming request spins it back up in ~30–50 seconds.
- **Production Tip**: Use a free uptime monitor (e.g., [UptimeRobot](https://uptimerobot.com) or [CronJob.org](https://cron-job.org)) configured to ping `https://isoorder-api.onrender.com/api/health` every 10 minutes to keep the service warm 24/7.
