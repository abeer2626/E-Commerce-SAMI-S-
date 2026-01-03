# SAMI'S - E-commerce Marketplace

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fstorehub)

A multi-vendor e-commerce marketplace built with Next.js 15, featuring:
- Multi-vendor product management
- Customer checkout with COD, Advance Payment, and Stripe
- Payment rules engine for flexible payment restrictions
- Admin and Vendor dashboards
- Wishlist, Reviews, and Order tracking

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL (via Prisma) |
| **Auth** | NextAuth.js |
| **Payments** | Stripe |
| **State** | Zustand |
| **Deployment** | Vercel |

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 18+ installed
- Git installed

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd storehub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   For local development with SQLite:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Visit http://localhost:3000

---

## Deploy on Vercel

### Option 1: One-Click Deploy (Recommended)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Configure environment variables (see below)
4. Deploy!

### Option 2: Manual Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

---

## Vercel Environment Variables

Configure these in your Vercel Project Settings (Settings > Environment Variables):

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) | `postgres://user:pass@host.pooler.vercel-storage.com/db` |
| `DIRECT_URL` | PostgreSQL direct connection string | `postgres://user:pass@host/db` |
| `NEXTAUTH_SECRET` | Secret for NextAuth session encryption | Generate with: `openssl rand -base64 32` |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | Auto-set by Vercel (usually `https://your-domain.vercel.app`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for online payments |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number for order notifications |
| `SMTP_HOST` | Email host for order confirmations |
| `SMTP_USER` | SMTP username |
| `SMTP_PASSWORD` | SMTP password |

---

## Database Setup for Vercel

### Choose a PostgreSQL Provider

For Vercel deployment, you need a PostgreSQL database. Choose one:

#### Option A: Vercel Postgres (Recommended)

1. In your Vercel project, go to **Storage** tab
2. Click **Create Database** → **Postgres**
3. Vercel will automatically add `DATABASE_URL` and `DIRECT_URL` to your environment variables
4. Run the following in your project terminal to push schema:
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```

#### Option B: Neon (Alternative)

1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use the pooling connection string (ends with `.pooler.neon.tech`)
5. Add to Vercel environment variables

#### Option C: Supabase (Alternative)

1. Sign up at [Supabase](https://supabase.com)
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string
5. Add to Vercel environment variables

### Push Database Schema

After setting up your database, push the Prisma schema:

```bash
npx prisma generate
npx prisma db push
```

---

## Project Structure

```
storehub/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── vendor/            # Vendor dashboard
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── ...
├── components/            # React components
├── contexts/              # React contexts (Cart, etc.)
├── lib/                   # Utility functions
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth config
│   └── ...
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
├── .env.example          # Environment variables template
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── vercel.json          # Vercel deployment settings
└── package.json         # Dependencies and scripts
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with sample data |

---

## Default Accounts

After running `npm run db:seed`, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@samis.com | admin123 |
| Vendor | vendor@samis.com | vendor123 |
| Customer | user@samis.com | user123 |

---

## Troubleshooting

### Build Fails on Vercel

1. Check the **Build Logs** in Vercel dashboard
2. Ensure `DATABASE_URL` is set correctly
3. Ensure `NEXTAUTH_SECRET` is set

### Database Connection Issues

1. Verify `DATABASE_URL` uses the **pooling** connection string
2. Verify `DIRECT_URL` uses the **direct** connection string
3. Check that your database allows connections from Vercel

### Environment Variables Not Working

1. Make sure to include all required variables in Vercel Project Settings
2. Redeploy after adding new environment variables
3. Use `vercel env pull` to sync local env with Vercel

---

## License

Copyright © 2024 SAMI'S Marketplace. All rights reserved.
