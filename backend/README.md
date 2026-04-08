# HopeCard Admin Backend (NestJS)

NestJS-based backend API for HopeCard Admin Dashboard using microservices architecture.

## Project Structure

```
backend/
├── src/
│   ├── lib/
│   │   └── supabaseClient.ts        # Supabase initialization
│   ├── dashboard/
│   │   ├── dashboard.module.ts      # Dashboard module
│   │   ├── dashboard.controller.ts  # HTTP endpoints
│   │   ├── dashboard.service.ts     # Business logic
│   │   └── interfaces/
│   │       └── dashboard-metrics.interface.ts
│   ├── app.module.ts                # Root module
│   └── main.ts                      # Application entry point
├── .env                            # Environment variables
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript config
```

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env` file with:

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
FRONTEND_URL=http://localhost:3000
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Build and Run Production
```bash
npm run build
npm start
```

## API Endpoints

### Dashboard Metrics
- **GET** `/api/dashboard/metrics` - Get dashboard metrics
  - Returns: `totalBeneficiaries`, `pendingApprovals`, `totalDonationsSent`, `activeCampaigns`

## Architecture

This backend implements a **NestJS microservices architecture** with:
- **Modules**: Organized feature-based modules (Dashboard, etc.)
- **Controllers**: Handle HTTP requests and route them to services
- **Services**: Encapsulate business logic
- **Dependency Injection**: Built-in IoC container
- **CORS Support**: Configured for frontend communication
- **Error Handling**: Global exception filters

## Database Requirements

Requires Supabase tables:
- `beneficiaries` (id, status, ...)
- `donations` (id, amount, ...)
- `campaigns` (id, status, ...)

## Technology Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Supabase** - PostgreSQL database
- **Express** - Underlying HTTP server (default transport)

