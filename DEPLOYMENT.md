# Deployment Guide for Basilisk Fund

## Your project has been pushed to GitHub! 🎉

Repository URL: https://github.com/h4shkid/basilisk-fund

## Complete Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Sign in with your GitHub account

2. **Import Your Repository**
   - Click "Import Git Repository"
   - Select `h4shkid/basilisk-fund` from your repositories
   - Click "Import"

3. **Configure Project**
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: Leave as is (.)
   - Build Settings: Leave defaults

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   DATABASE_URL = [Your PostgreSQL connection string]
   NEXTAUTH_URL = https://your-app-name.vercel.app
   NEXTAUTH_SECRET = [Generate with: openssl rand -base64 32]
   ```

   **Database Options:**
   
   a) **Vercel Postgres** (Easiest):
      - In Vercel Dashboard, go to Storage tab
      - Click "Create Database" → Select "Postgres"
      - Follow setup and it will auto-add DATABASE_URL

   b) **Supabase** (Free tier available):
      - Create account at https://supabase.com
      - Create new project
      - Go to Settings → Database
      - Copy the connection string
      - Replace `[YOUR-PASSWORD]` with your project password

   c) **Neon** (Free tier available):
      - Create account at https://neon.tech
      - Create new project
      - Copy the connection string from dashboard

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)

### Option 2: Deploy via CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Set up environment variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Post-Deployment Setup

### 1. Initialize Database

After deployment, you need to run migrations:

**Option A: Using Vercel Dashboard**
- Go to your project → Functions tab
- Create a serverless function to run migrations

**Option B: Using Local Connection**
```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Optional: Seed initial data
npx prisma db seed
```

### 2. Update NEXTAUTH_URL

Once deployed, update the NEXTAUTH_URL environment variable to your actual Vercel URL:
- Format: `https://basilisk-fund.vercel.app` (or your custom domain)

### 3. Create Admin Account

If you didn't run the seed script, create an admin account manually:

1. Use Prisma Studio:
   ```bash
   export DATABASE_URL="your-production-database-url"
   npx prisma studio
   ```

2. Or create via SQL in your database console:
   ```sql
   INSERT INTO "Admin" (id, email, password, name, "createdAt", "updatedAt")
   VALUES (
     'clxxxxx', 
     'admin@basiliskfund.com',
     '$2a$10$...' -- Hashed password for 'admin123'
     'Admin User',
     NOW(),
     NOW()
   );
   ```

## Troubleshooting

### Database Connection Issues
- Ensure your database allows connections from Vercel IPs
- For Supabase: Enable "Allow connections from anywhere" in settings
- Check connection string format matches your provider

### Build Errors
- Clear cache: `vercel --force`
- Check logs in Vercel dashboard → Functions tab

### NextAuth Issues
- Ensure NEXTAUTH_SECRET is set (32+ characters)
- NEXTAUTH_URL must match your deployment URL exactly
- No trailing slash in NEXTAUTH_URL

## Your Deployment URLs

- **GitHub Repository**: https://github.com/h4shkid/basilisk-fund
- **Vercel Project**: Will be created after deployment
- **Live Site**: Will be available at `https://basilisk-fund.vercel.app`

## Next Steps

1. Complete environment variable setup in Vercel
2. Deploy the application
3. Run database migrations
4. Test admin login
5. Add your fund members
6. Start tracking bets!

## Support

For issues with:
- Vercel deployment: https://vercel.com/docs
- Database setup: Check your provider's documentation
- Application bugs: Create issue at https://github.com/h4shkid/basilisk-fund/issues