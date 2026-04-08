# HopeCard Admin - Microservices Architecture

## Project Structure

```
hopecard-admin/
├── frontend/          # Next.js Frontend Application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env           # Frontend config with NEXT_PUBLIC_BACKEND_URL
│
├── backend/           # Express.js Backend API
│   ├── src/
│   │   ├── routes/
│   │   ├── lib/
│   │   └── server.ts
│   ├── package.json
│   └── .env           # Backend config with SUPABASE credentials
```

## Quick Start

### Terminal 1 - Backend Server
```bash
cd backend
npm run dev          # Runs on http://localhost:5000
```

### Terminal 2 - Frontend Server
```bash
npm run dev          # Runs on http://localhost:3000
```

## Architecture Overview

### Frontend (Next.js 16.2.2)
- Client-side React components
- Server-side rendering and optimization
- Makes HTTP calls to backend API
- Located at `http://localhost:3000`

### Backend (Express.js)
- RESTful API endpoints
- Database integration with Supabase
- Business logic and service layer
- CORS configured for frontend
- Located at `http://localhost:5000`

## API Endpoints

### Dashboard Service
- `GET /api/dashboard/metrics` - Fetch dashboard analytics

### Health Check
- `GET /health` - Server status

## Environment Variables

### Frontend (.env)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Backend (.env)
```
PORT=5000
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
FRONTEND_URL=http://localhost:3000
```

## Tech Stack

- **Frontend**: Next.js 16.2.2, React 19.2.4, TypeScript 5
- **Backend**: Express.js 4, TypeScript 5, Supabase
- **Database**: Supabase (PostgreSQL)
- **API**: RESTful with JSON

## Features Implemented

### ✅ Dashboard Metrics (Feature 1/6)
- Real-time metrics fetching from database
- Backend microservice at `/api/dashboard/metrics`
- Supports metrics: Total Beneficiaries, Pending Approvals, Total Donations, Active Campaigns

## Next Features to Implement
1. Recent Activity Feed
2. List of Beneficiary
3. Approval List (Beneficiaries)
4. Approval List (Campaign Manager)
5. Approval List (Digital Donor)

---
*This is a true microservices architecture with separated frontend and backend for scalability and maintainability.*
