# 🚨 URGENT: Add Environment Variables to Vercel

## CRITICAL SECURITY ISSUE

Your admin panel at **www.mayaallan.com/admin** is currently BLOCKED because the required authentication environment variables are NOT set in Vercel production.

---

## ✅ STEP-BY-STEP FIX (5 minutes)

### Step 1: Go to Vercel Dashboard

1. Open your browser
2. Go to: **https://vercel.com**
3. Log in with your account
4. You should see your projects dashboard

### Step 2: Select Your Project

1. Find and click on: **mayaallan** (or whatever your project is named)
2. This will open your project dashboard

### Step 3: Open Environment Variables Settings

1. Click **"Settings"** in the top navigation bar
2. In the left sidebar, click **"Environment Variables"**
3. You should now see the Environment Variables page

### Step 4: Add Each Variable (Do this 3 times)

For EACH of the 3 variables below, follow these steps:

#### Variable 1: SESSION_SECRET

1. Click the **"Add New"** button (or similar)
2. In the **"Key"** field, type exactly: `SESSION_SECRET`
3. In the **"Value"** field, paste: `008a2b4f12ffc21302cc0c8544e627108ecca8b754cd11f2f06b5b877f410c4d`
4. Under "Environment", make sure ALL THREE are checked:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

#### Variable 2: ADMIN_EMAIL

1. Click **"Add New"** again
2. **Key**: `ADMIN_EMAIL`
3. **Value**: `maya@mayaallan.com`
4. **Environment**: Check all three (Production, Preview, Development)
5. Click **"Save"**

#### Variable 3: ADMIN_PASSWORD

1. Click **"Add New"** again
2. **Key**: `ADMIN_PASSWORD`
3. **Value**: `magicfire88`
4. **Environment**: Check all three (Production, Preview, Development)
5. Click **"Save"**

### Step 5: Verify Variables Are Saved

You should now see 3 environment variables in the list:
- ✅ SESSION_SECRET
- ✅ ADMIN_EMAIL
- ✅ ADMIN_PASSWORD

### Step 6: Redeploy Your Site

**IMPORTANT:** Environment variables only take effect after a new deployment!

1. Go to the **"Deployments"** tab in Vercel
2. Find the latest deployment (should be at the top)
3. Click the **three dots (...)** menu next to it
4. Click **"Redeploy"**
5. Confirm the redeployment
6. Wait for the deployment to complete (usually 1-2 minutes)

---

## ✅ How to Test After Redeployment

1. Open a **new incognito/private browser window**
2. Go to: **https://www.mayaallan.com/admin**
3. You should be **automatically redirected** to: **https://www.mayaallan.com/admin/login**
4. Enter your credentials:
   - Email: `maya@mayaallan.com`
   - Password: `magicfire88`
5. Click "Sign in"
6. You should now be logged into the admin panel ✅

---

## ❌ Common Mistakes to Avoid

1. **Missing checkboxes**: Make sure ALL environments are checked (Production, Preview, Development)
2. **Typos**: Copy-paste the variable names and values exactly
3. **Not redeploying**: Variables only work after redeployment
4. **Browser cache**: Use incognito window to test

---

## 🔒 What This Fixes

**Before (INSECURE):**
- ❌ www.mayaallan.com/admin loads directly
- ❌ No login required
- ❌ Anyone can access admin panel
- ❌ CRITICAL SECURITY VULNERABILITY

**After (SECURE):**
- ✅ www.mayaallan.com/admin redirects to login
- ✅ Login required with email + password
- ✅ Only you can access admin panel
- ✅ Triple-layer authentication protection

---

## 📞 Troubleshooting

### Problem: Still seeing error page after redeployment

**Solution:**
1. Clear browser cache
2. Try in incognito/private window
3. Wait 5 minutes for CDN to update
4. Check that all 3 variables are in Vercel settings

### Problem: Can't find "Environment Variables" in Vercel

**Solution:**
1. Make sure you're in your PROJECT settings (not account settings)
2. Look in the left sidebar under "Settings"
3. It might be under "General" → "Environment Variables"

### Problem: Login says "Login failed"

**Solution:**
1. Make sure ADMIN_EMAIL is exactly: `maya@mayaallan.com`
2. Make sure ADMIN_PASSWORD is exactly: `magicfire88`
3. Check for extra spaces in the values
4. Try copying and pasting from this document

---

## 🎯 Quick Reference

Copy these exact values:

```
Key: SESSION_SECRET
Value: 008a2b4f12ffc21302cc0c8544e627108ecca8b754cd11f2f06b5b877f410c4d

Key: ADMIN_EMAIL
Value: maya@mayaallan.com

Key: ADMIN_PASSWORD
Value: magicfire88
```

**Remember:** Check ALL environments (Production, Preview, Development) for each variable!

---

## ✅ Checklist

- [ ] Added SESSION_SECRET to Vercel
- [ ] Added ADMIN_EMAIL to Vercel
- [ ] Added ADMIN_PASSWORD to Vercel
- [ ] All 3 variables have Production checked
- [ ] All 3 variables have Preview checked
- [ ] All 3 variables have Development checked
- [ ] Redeployed the site
- [ ] Waited for deployment to complete
- [ ] Tested in incognito window
- [ ] Admin login works ✅

---

**Need help?** Let me know which step you're stuck on!
