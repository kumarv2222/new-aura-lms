# 🎓 Aura LMS

A full-stack Learning Management System built with **Next.js 14 + Tailwind** (frontend), **Express + TypeScript** (backend), and **MySQL on Aiven** (database). Deployed on **Vercel** (frontend) + **Render** (backend).

---

## ✨ Features

- **JWT Auth** — 15-min access tokens + 30-day HTTP-only refresh tokens (DB-backed, revocable)
- **Sequential video locking** — complete lesson N before unlocking N+1 (enforced in backend)
- **YouTube embed player** — resume from last position, auto-track completion
- **Progress tracking** — per-video position + completion, per-subject stats
- **Minimalist dark UI** — Cormorant Garamond display font, glass morphism, gold accents

---

## 🏗 Project Structure

```
lms-backend/          Express + TypeScript API
  src/
    config/           env, db (Knex), security
    modules/
      auth/           register, login, refresh, logout
      subjects/       list, get, tree-with-progress
      videos/         get video + prev/next/locked
      progress/       upsert + subject stats
      health/         GET /api/health
    middleware/       auth, error handler, request logger
    utils/            jwt, password (argon2), ordering
  migrations/         run.ts — creates all tables

lms-frontend/         Next.js 14 App Router
  app/
    page.tsx          Homepage — course listing + search
    auth/login        Sign in
    auth/register     Create account
    subjects/[id]/    Subject layout with sidebar
      page.tsx        Subject overview + start/continue
      video/[vid]/    Video player page
    profile/          Progress dashboard
  components/
    Layout/AppShell   Top nav bar
    Sidebar/          Course tree with lock indicators
    Video/            YouTube player, meta, progress bar
    Auth/AuthGuard    Route protection
    common/           Alert, Spinner
  lib/                apiClient (axios + refresh interceptor), auth, progress
  store/              authStore, sidebarStore, videoStore (Zustand)
  styles/globals.css  Tailwind + custom design system
```

---

## 🚀 Setup

### 1. Database (Aiven MySQL)

1. Create a free MySQL instance on [Aiven](https://aiven.io)
2. Copy your connection credentials

### 2. Backend

```bash
cd lms-backend
cp .env.example .env
# Fill in DB credentials, JWT secrets, CORS origin
npm install
npm run migrate          # Creates all tables
npm run dev              # http://localhost:5000
```

**Required `.env` values:**
```env
DB_HOST=your-aiven-host
DB_PORT=3306
DB_NAME=lms_db
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_SSL=true
JWT_ACCESS_SECRET=at_least_32_random_characters_here
JWT_REFRESH_SECRET=another_32_random_characters_here
CORS_ORIGIN=http://localhost:3000
COOKIE_DOMAIN=localhost
```

### 3. Frontend

```bash
cd lms-frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
npm install
npm run dev              # http://localhost:3000
```

---

## 🌐 Deployment

### Backend → Render

1. Push `lms-backend/` to a Git repo
2. Create a new **Web Service** on Render
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Add all env vars from `.env.example`
6. Run migrations once via Render Shell: `npm run migrate`

### Frontend → Vercel

1. Push `lms-frontend/` to a Git repo
2. Import into Vercel
3. Set env var: `NEXT_PUBLIC_API_BASE_URL=https://your-render-backend-url`
4. Deploy

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register + get tokens |
| POST | /api/auth/login | — | Login + get tokens |
| POST | /api/auth/refresh | Cookie | Rotate refresh token |
| POST | /api/auth/logout | Cookie | Revoke refresh token |
| GET | /api/subjects | Optional | List published courses |
| GET | /api/subjects/:id | Optional | Course metadata |
| GET | /api/subjects/:id/tree | ✅ | Full sidebar tree with locked status |
| GET | /api/videos/:id | ✅ | Video + prev/next/locked |
| GET | /api/subjects/:id/first-video | ✅ | First unlocked video |
| GET | /api/progress/subjects/:id | ✅ | Subject completion stats |
| GET | /api/progress/videos/:id | ✅ | Video position + completed |
| POST | /api/progress/videos/:id | ✅ | Upsert progress (idempotent) |
| GET | /api/health | — | Health check |

---

## 🎨 Design System

- **Display font**: Cormorant Garamond (elegant serif)
- **Body font**: DM Sans (clean, readable)
- **Mono font**: JetBrains Mono
- **Primary accent**: Gold `#f0b429`
- **Success**: Jade `#00c9a7`
- **Error**: Crimson `#ff4d6d`
- **Background**: Ink `#0a0a0f`
- **Glass morphism** cards with backdrop blur
- **Noise texture** overlay for depth

---

## 🧠 Key Design Decisions

| Decision | Reason |
|----------|--------|
| JWT in `Authorization: Bearer` header | Accessible to JS, easy to refresh |
| Refresh token in HTTP-only cookie | Can't be stolen by XSS |
| DB-backed refresh tokens | Enables revocation (logout all devices) |
| Strict backend ordering | `order_index` is source of truth — UI can't cheat |
| Upsert progress with caps | Idempotent, safe for multi-tab + retries |
| Debounced progress saves (3s) | Reduces write load while keeping progress accurate |
| Single tree endpoint for sidebar | One request feeds entire sidebar; avoids waterfalls |

---

## 🛡 Security Notes

- Passwords hashed with **Argon2id**
- CORS restricted to `CORS_ORIGIN` env var
- Access tokens expire in **15 minutes**
- Refresh tokens expire in **30 days** and are revoked on logout
- All video locking computed server-side — client can't unlock by faking requests
