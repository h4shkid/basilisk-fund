# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Basilisk Fund is a collaborative betting platform built with Next.js 15 where members pool USDC investments and share profits automatically based on investment percentages. The application features a public homepage for showcasing bets and fund statistics, and a protected admin panel for managing members, bets, and payouts.

## Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v4 with JWT sessions
- **Styling**: Tailwind CSS with dark theme
- **UI Components**: Radix UI primitives
- **Deployment**: Optimized for Vercel

## Essential Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Building & Production
npm run build           # Build for production (includes Prisma generate)
npm start               # Start production server

# Database Operations  
npx prisma migrate dev  # Create and apply migrations
npx prisma db seed      # Seed database with initial data
npx prisma studio       # Open database GUI
npx prisma generate     # Generate Prisma client

# Code Quality
npm run lint            # Run ESLint checks
```

## Architecture

### Directory Structure

- `/app` - Next.js App Router pages and API routes
  - `/admin` - Protected admin dashboard pages
  - `/api` - API endpoints for CRUD operations
- `/components` - Reusable React components
- `/lib` - Core utilities and configurations
  - `auth.ts` - NextAuth configuration
  - `prisma.ts` - Prisma client singleton
  - `utils.ts` - Helper functions
- `/prisma` - Database schema and migrations
- `/types` - TypeScript type definitions

### Authentication Flow

Authentication is handled by NextAuth.js with credentials provider:
- Admin login at `/admin/login`
- JWT session strategy
- Protected routes via middleware (`/admin/dashboard/*`)
- Session includes user ID via callback

### Database Models

Core entities managed through Prisma:
- **Member**: Fund members with investment tracking
- **Investment**: Individual investment records
- **Bet**: Betting activities with outcomes (pending/won/lost)
- **Payout**: Member withdrawal records
- **Admin**: Administrator accounts with bcrypt-hashed passwords

### Key Business Logic

**Investment Calculations**:
- Investment % = (Member Investment / Total Fund) × 100
- Profit Share = Total Profit × Investment %
- Balance = Investment + Earnings - Payouts

## API Endpoints

All API routes follow RESTful conventions:
- `GET/POST /api/members` - Member management
- `GET/PUT/DELETE /api/members/[id]` - Individual member operations
- `GET/POST /api/bets` - Bet management
- `GET/PUT/DELETE /api/bets/[id]` - Individual bet operations
- `GET/POST /api/investments` - Investment tracking
- `GET/POST /api/payouts` - Payout processing
- `POST /api/admin/recalculate` - Recalculate fund statistics

## Development Workflow

1. **Database Changes**: Modify `prisma/schema.prisma`, then run `npx prisma migrate dev`
2. **API Development**: Create route handlers in `/app/api/` following existing patterns
3. **UI Components**: Follow existing component patterns, use Radix UI for complex interactions
4. **Authentication**: All admin routes require session check via NextAuth
5. **State Management**: Server-side state via database, client-side via React hooks

## Environment Variables

Required for all environments:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - JWT signing secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Application URL (e.g., http://localhost:3000 or https://your-app.vercel.app)

## Deployment Notes

- Application is configured for Vercel deployment
- Database migrations must be run after deployment
- Initial admin account can be created via seed script or manual database entry
- Ensure environment variables are properly set in production