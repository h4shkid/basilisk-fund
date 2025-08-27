# Basilisk Fund

A collaborative betting platform where friends pool USDC investments and share profits automatically based on investment percentages.

## Features

### Public Homepage
- **Visual Bet Showcase**: 9:16 aspect ratio image gallery of placed bets
- **Investment Leaderboard**: Rankings by total investment and earnings
- **Fund Overview Dashboard**: Real-time fund statistics
- **Individual Member Stats**: Investment tracking and profit distribution

### Admin Panel
- **Member Management**: Add/edit members and track investments
- **Bet Management**: Record bets with outcomes and profit/loss
- **Financial Calculations**: Automatic profit distribution based on investment percentage
- **Payout Processing**: Track member withdrawals

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with dark theme
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Optimized for Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)

### Installation

1. Clone the repository:
```bash
cd basilisk-fund
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your deployment URL

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed
```

This creates the database tables and seeds initial data including:
- Admin account: `admin@basiliskfund.com` / `admin123`
- Sample members and bets

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment on Vercel

1. Push your code to GitHub

2. Import the project in Vercel

3. Configure environment variables in Vercel:
   - `DATABASE_URL`: Use Vercel Postgres or external database
   - `NEXTAUTH_URL`: Your production URL
   - `NEXTAUTH_SECRET`: Secure random string

4. Deploy!

## Database Schema

### Core Models

- **Member**: Fund members with investment tracking
- **Investment**: Individual investment records
- **Bet**: Betting activities with outcomes
- **Payout**: Member withdrawal records
- **Admin**: Administrator accounts

### Key Calculations

```
Investment % = (Member Investment / Total Fund) × 100
Profit Share = Total Profit × Investment %
Balance = Investment + Earnings - Payouts
```

## Security

- Admin-only authentication for dashboard access
- Password hashing with bcrypt
- Session management with NextAuth
- Input validation and sanitization
- Protected API routes

## Future Enhancements

- Email notifications for members
- Advanced analytics and reporting
- Multi-currency support beyond USDC
- Mobile app companion
- API integration with betting platforms

## License

Private project - All rights reserved

## Support

For issues or questions, contact the development team.
