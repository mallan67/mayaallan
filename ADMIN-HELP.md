# Admin Help Guide

## Forgot Admin Password?

Your admin login is stored in Vercel environment variables.

### To Reset Password:
1. Go to https://vercel.com
2. Select your project (mayaallan)
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Find `ADMIN_PASSWORD` → Click three dots → **Edit**
6. Enter new password → Save
7. Go to **Deployments** → Click **Redeploy** on latest

### To Change Admin Email:
Same steps, but edit `ADMIN_EMAIL` instead.

---

## Admin URLs

- **Admin Panel:** https://mayaallan.com/admin
- **Login:** https://mayaallan.com/admin/login
- **Books:** https://mayaallan.com/admin/books
- **Media:** https://mayaallan.com/admin/media
- **Events:** https://mayaallan.com/admin/events
- **Navigation:** https://mayaallan.com/admin/navigation
- **Settings:** https://mayaallan.com/admin/settings

---

## Database (Supabase)

Your data is stored in Supabase: https://supabase.com

### Tables Used:
| Feature | Table Name |
|---------|------------|
| Books | `books` |
| Events | `Event` |
| Media | `media_items` |
| Navigation | `navigation_items` |
| Settings | `site_settings` |
| Subscribers | `email_subscribers` |
| Contact Form | `contact_submissions` |

---

## Need Help?

Contact your developer or check the GitHub repository for code.
