# Deploy to Vercel - Complete Guide

This guide will walk you through deploying your Spelinsikt BetBlocker app to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free - sign up at https://vercel.com)
- Your NextDNS API Key and Profile ID

## Step 1: Prepare for Deployment

### Check Your Files

Make sure you have these files in your `webapp/` directory:
- ✅ `package.json`
- ✅ `next.config.mjs`
- ✅ `src/app/` folder with your pages
- ✅ `.gitignore` (to protect secrets)

### Verify .gitignore

Your `.gitignore` should include:
```
# Don't commit these to GitHub:
.env*.local
.env
/certs
certs/
*.pem
```

This ensures your API keys and certificates stay private!

## Step 2: Push to GitHub

### If you don't have a Git repository yet:

```bash
# Navigate to your project
cd /Users/alexandermalmqvist/Documents/Github/betblockerWeb

# Initialize git (if not already done)
git init

# Add webapp folder
git add webapp/

# Create first commit
git commit -m "Initial commit - BetBlocker webapp"

# Create a new repository on GitHub
# Go to: https://github.com/new
# Repository name: betblockerWeb
# Make it Private (recommended - your API keys might be in history)
# Don't initialize with README (you already have files)
# Click "Create repository"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/betblockerWeb.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### If you already have a Git repository:

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for Vercel deployment"
git push
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Website (Easiest)

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Click "Sign Up" (or "Login" if you have an account)
   - Sign in with GitHub

2. **Import Your Repository:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `betblockerWeb`
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** Click "Edit" → Select `webapp`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - Click "Deploy"

4. **Wait for Build:**
   - Vercel will build your app (takes 1-3 minutes)
   - You'll see a success screen with your URL!

### Option B: Deploy via Vercel CLI (Advanced)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to webapp directory
cd webapp

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? betblocker-web
# - Directory? ./ (current)
# - Override settings? No

# Deploy to production
vercel --prod
```

## Step 4: Configure Environment Variables

⚠️ **IMPORTANT:** Your app won't work until you add your NextDNS credentials!

### Add Environment Variables in Vercel:

1. **Go to your project dashboard:**
   - https://vercel.com/your-username/betblocker-web

2. **Click "Settings" tab**

3. **Click "Environment Variables" in sidebar**

4. **Add these variables:**

   **Variable 1:**
   ```
   Name: NEXTDNS_API_KEY
   Value: [paste your actual NextDNS API key]
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

   **Variable 2:**
   ```
   Name: NEXTDNS_PROFILE_ID
   Value: [paste your actual profile ID, e.g., d8e475]
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

   **Variable 3 (Optional - if you want removal password):**
   ```
   Name: REMOVAL_PASSWORD
   Value: [your password, e.g., ContactYourSponsor]
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

   **Variables 4-6 (Optional - if using signed certificates):**
   ```
   Name: SIGNING_CERT_PATH
   Value: [leave empty unless you're using signing]
   
   Name: SIGNING_KEY_PATH
   Value: [leave empty unless you're using signing]
   
   Name: SIGNING_CA_PATH
   Value: [leave empty unless you're using signing]
   ```

5. **Click "Save" for each variable**

6. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"
   - Wait for new deployment to finish

## Step 5: Test Your Deployment

### Check if it's working:

1. **Visit your Vercel URL:**
   ```
   https://betblocker-web-xxxxx.vercel.app
   ```
   (Your actual URL will be shown in Vercel dashboard)

2. **Test features:**
   - ✅ Page loads correctly
   - ✅ Click "Refresh" to fetch blocklist
   - ✅ Try adding a test domain
   - ✅ Download the iOS profile
   - ✅ Visit the setup guide

3. **Check browser console:**
   - Press F12 → Console tab
   - Look for errors
   - Should see no red errors

### Common Issues:

**Error: "NEXTDNS_API_KEY is not configured"**
- You forgot to add environment variables
- Go back to Step 4

**Error: "Failed to fetch blocklist (403)"**
- Your API key is wrong
- Double-check the key in Vercel settings

**Profile download not working:**
- Check that the URL works
- Try downloading directly: `https://your-app.vercel.app/api/apple-profile`

## Step 6: Set Up Custom Domain (Optional)

### Use your own domain instead of vercel.app:

1. **Buy a domain** (if you don't have one):
   - Namecheap, Google Domains, etc.
   - Example: `betblocker.se` or `spelinsikt.se`

2. **Add domain in Vercel:**
   - Project Settings → Domains
   - Click "Add"
   - Enter your domain: `betblocker.se`
   - Follow DNS configuration instructions

3. **Configure DNS:**
   - Go to your domain registrar
   - Add the DNS records Vercel shows you
   - Wait 24-48 hours for propagation

4. **SSL Certificate:**
   - Vercel automatically provisions free SSL
   - Your site will be `https://betblocker.se`

## Step 7: Enable Auto-Deploy

**Already enabled by default!**

Every time you push to GitHub, Vercel automatically:
1. Detects the push
2. Builds your app
3. Deploys the new version
4. Your site updates automatically

### To make changes:

```bash
# Edit files locally
# Test: npm run dev

# Commit changes
git add .
git commit -m "Update blocklist UI"

# Push to GitHub
git push

# Vercel automatically deploys in 1-3 minutes!
```

## Step 8: Share Your App

Your app is now live! Share it with users:

### Share the URL:
```
https://your-app-name.vercel.app
```

### Users can:
1. Visit your URL
2. Download the iOS profile
3. Follow the setup guide
4. Add/remove domains from the universal blocklist

### For accountability partners:
- Give them the URL
- They can manage the blocklist remotely
- Changes affect all users instantly

## Monitoring & Analytics

### View Deployment Logs:

1. **Vercel Dashboard:**
   - Go to "Deployments" tab
   - Click any deployment
   - Click "Build Logs" or "Function Logs"

2. **Check API Errors:**
   - Look for red errors in logs
   - Most common: missing environment variables

### Usage Analytics:

Vercel provides:
- Page views
- Function invocations
- Bandwidth used
- Build times

**Free tier limits:**
- 100 GB bandwidth/month
- Unlimited static hosting
- 100 GB-hours serverless function execution

(More than enough for 100+ users!)

## Security Best Practices

### 1. Keep Repository Private (if possible)
```
GitHub → Repository → Settings → General
→ Danger Zone → Change visibility → Make private
```

### 2. Never Commit .env.local
```
# Already in .gitignore - double check:
cat .gitignore | grep env
```

### 3. Rotate API Keys Periodically
```
Every 6-12 months:
- Generate new NextDNS API key
- Update in Vercel
- Delete old key
```

### 4. Monitor Access
```
Check Vercel analytics for unusual traffic
Check NextDNS logs for suspicious activity
```

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
```bash
# Make sure package.json is correct
# Redeploy with:
vercel --prod --force
```

**Error: "Build timeout"**
```
Usually resolves on retry
Click "Redeploy" in Vercel dashboard
```

### Runtime Errors

**Error: "Internal Server Error"**
```
Check Function Logs in Vercel dashboard
Usually missing environment variables
```

**API returns 500:**
```
Check that:
- NEXTDNS_API_KEY is set correctly
- NEXTDNS_PROFILE_ID is correct
- No extra spaces in values
```

### DNS/Domain Issues

**Domain not working:**
```
- Wait 24-48 hours for DNS propagation
- Check DNS with: https://dnschecker.org
- Verify DNS records in domain registrar
```

## Cost Breakdown

### Free Tier (Hobby):
- ✅ Unlimited sites
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL
- ✅ Preview deployments
- ✅ Analytics
- ✅ Perfect for 100-200 users

### Pro Tier ($20/month):
- Everything in Free, plus:
- 1 TB bandwidth/month
- Advanced analytics
- Team collaboration
- Custom deployment protection
- Better for 500+ users

**Recommendation:** Start with Free tier!

## Next Steps

After deployment:

1. ✅ **Test thoroughly** on multiple devices
2. ✅ **Share with beta testers** (5-10 people first)
3. ✅ **Gather feedback** on usability
4. ✅ **Monitor analytics** in Vercel
5. ✅ **Add domains to blocklist** as needed
6. ✅ **Document any issues** for future improvements

## Useful Vercel Commands

```bash
# Deploy to preview (testing)
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Remove deployment
vercel remove [deployment-url]

# List all deployments
vercel ls

# Pull environment variables locally
vercel env pull
```

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **NextDNS API Docs:** https://nextdns.github.io/api/
- **Next.js Docs:** https://nextjs.org/docs

## Congratulations! 🎉

Your BetBlocker app is now live on Vercel! 

**Your deployment URL:** Check Vercel dashboard

**Next:** Share with your users and start helping people block gambling sites!

