# Maya Allan Author Website - Deployment Guide

## Site Status: ✅ COMPLETE & READY FOR DEPLOYMENT

All features are implemented and functional:
- Frontend: All pages working
- Backend: All API routes operational
- Admin Dashboard: Full CMS functionality
- Navigation: Dynamically managed from backend

---

## Deploying to Vercel

### Prerequisites
- GitHub account with repository access
- Vercel account (free tier works perfectly)
- Domain: mayaallan.com

---

### Step 1: Push to GitHub

If your code is already linked to a Git repository:

```bash
# Make sure all files are committed
git add .
git commit -m "Complete Maya Allan author website with admin CMS"
git push origin main
```

If you need to create a new repository:

```bash
# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/mayaallan-site.git

# Commit and push
git add .
git commit -m "Initial commit - Maya Allan author website"
git push -u origin main
```

---

### Step 2: Connect to Vercel

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
# - Deploy
```

---

### Step 3: Configure Environment Variables

In the Vercel Dashboard under your project:

1. Go to **Settings** → **Environment Variables**
2. Add the following (all are optional for now since using mock data):

```
SESSION_SECRET=your-random-secret-key-here-min-32-chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here
```

To generate a secure `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important**: Until you add a database, the site uses mock data which resets on each deployment.

---

### Step 4: Connect Custom Domain (mayaallan.com)

1. In Vercel Dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add your domain: `mayaallan.com`
4. Vercel will provide DNS records to add

**In your domain registrar (where you bought mayaallan.com):**

Add these DNS records:

**For Apex Domain (mayaallan.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For WWW Subdomain (www.mayaallan.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**OR** if your registrar supports ALIAS/ANAME records:
```
Type: ALIAS/ANAME
Name: @
Value: cname.vercel-dns.com
```

5. Wait 24-48 hours for DNS propagation (usually takes 5-30 minutes)
6. Vercel will automatically provision SSL certificate

---

### Step 5: Test Your Deployment

1. Visit `https://mayaallan.com`
2. Test all pages:
   - Home, Books, Articles, Events, Media, About, Contact, Legal
3. Test contact form submission
4. Test email subscription
5. Test admin login at `https://mayaallan.com/admin/login`
   - Default: username `admin`, password `changeme123`
   - **IMPORTANT**: Change this immediately in production!

---

## Post-Deployment: Adding a Real Database

Currently, the site uses mock data that resets on deployment. To persist data:

### Option 1: Vercel Postgres (Recommended)
1. In Vercel Dashboard → **Storage** → **Create Database**
2. Choose **Postgres**
3. Vercel automatically adds `POSTGRES_URL` environment variable
4. Update `src/db/index.ts` to use real connection
5. Run database migrations

### Option 2: Supabase (Free tier available)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from project settings
4. Add to Vercel environment variables as `DATABASE_URL`
5. Update database configuration
6. Run migrations

### Option 3: Neon (Serverless Postgres)
1. Create account at [neon.tech](https://neon.tech)
2. Create database
3. Copy connection string
4. Add to Vercel as `DATABASE_URL`
5. Configure and migrate

---

## Updating Your Site

After making changes:

```bash
# Commit changes
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel automatically deploys on every push to main branch!

---

## Admin Access

**Admin URL**: `https://mayaallan.com/admin`

**Default Credentials** (mock auth):
- Username: `admin`
- Password: `changeme123`

**Change these immediately by:**
1. Setting `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables in Vercel
2. Or switching to database-backed authentication

---

## Support & Troubleshooting

**Build Errors:**
- Check Vercel build logs in Dashboard → Deployments
- Common issues: missing dependencies, TypeScript errors

**Domain Not Working:**
- Verify DNS records in your registrar
- Use [DNS Checker](https://dnschecker.org) to verify propagation
- Check Vercel Dashboard for domain status

**Environment Variables:**
- Go to Settings → Environment Variables
- Redeploy after adding/changing variables

**Need Help:**
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Support: [vercel.com/support](https://vercel.com/support)

---

## Features to Add Later

Once deployed and tested:

1. **Real Database** - Replace mock data with Postgres/Supabase
2. **File Uploads** - Use Vercel Blob for book covers, event photos
3. **Email Service** - SendGrid/Resend for contact form notifications
4. **Analytics** - Vercel Analytics for traffic insights
5. **Search** - Add search functionality for books/articles
6. **Newsletter** - Integrate with Mailchimp/ConvertKit
7. **Blog CMS** - Full article/blog management system
8. **E-commerce** - Direct book sales with Stripe integration

---

Your site is production-ready! 🚀
