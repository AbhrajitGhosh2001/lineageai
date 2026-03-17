# Lineage AI

**Genetic-risk cascade screening platform for full-family testing.**

Lineage AI takes cascade testing coordination off the genetic counselor's desk. Upload a patient's test results, map the family tree, and the platform handles outreach, tracking, and compliance logging — all from one dashboard.

> Cascade testing rates are stuck at 30%. The coordination is the bottleneck. Lineage AI fixes that.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts, React Router |
| Backend | Node.js, Express, JWT auth, bcryptjs |
| Database | SQLite via Prisma ORM (Prisma 7 + better-sqlite3 adapter) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### 1. Backend

```bash
cd backend
npm install
npm run db:seed     # seed demo data
npm run dev         # starts on http://localhost:3001
```

**Demo credentials:** `demo@lineage.ai` / `demo1234`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev         # starts on http://localhost:5173
```

The frontend proxies `/api` requests to the backend automatically.

---

## Features

- **Landing page** — value proposition, pricing tiers, market stats
- **Auth** — JWT-based register/login, protected routes
- **Dashboard** — cascade rate gauge vs. 30% industry baseline, status breakdown charts, recent outreach activity
- **Patients** — searchable list of probands with cascade rate indicators
- **Patient detail** — full patient info, at-risk relative management, outreach logging, status updates
- **Outreach tracking** — log email / SMS / phone / letter contacts per family member
- **Status pipeline** — not-contacted → contacted → scheduled → completed / declined

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/patients
POST   /api/patients
GET    /api/patients/:id
PUT    /api/patients/:id
DELETE /api/patients/:id

GET    /api/patients/:patientId/family
POST   /api/patients/:patientId/family
PUT    /api/patients/:patientId/family/:memberId
DELETE /api/patients/:patientId/family/:memberId

GET    /api/family/:memberId/outreach
POST   /api/family/:memberId/outreach
PUT    /api/family/:memberId/outreach/:outreachId

GET    /api/stats/dashboard
```

---

## Business Model (from research)

| Tier | Price |
|------|-------|
| Lead Magnet | Free cascade testing webinar |
| Pilot | $99/clinic for first 3 months |
| Core | $100–$500/user/month |
| Continuity | $200–$500/month add-ons |
| Enterprise | $25K–$100K/year |

**Target market:** 5,500+ US genetic counselors, health systems, payers  
**Genetic testing market:** $58.71B by 2033 (12.4% CAGR)  
**Main competitors:** Progeny, CancerIQ (neither manages family-wide coordination)
