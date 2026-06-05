# 🚀 TechPulse — Deployment & Handover Guide

A full-stack **Next.js 16** blog platform (frontend + backend together), deployed on **Vercel**.
Database: **MongoDB Atlas** · Images: **Cloudinary** · Auth: **NextAuth**.

> ⚠️ **Secrets** (passwords, API keys, DB URI) are NOT in this file or in the repo.
> They live only in your local `.env` and in the Vercel dashboard. Keep them private.

---

## 1. Live URLs

| What | URL |
|------|-----|
| Public site | `https://<your-project>.vercel.app` |
| Admin panel | `https://<your-project>.vercel.app/admin/login` |
| GitHub repo | `https://github.com/TechPulse979/techpulse-website` |

---

## 2. Admin Access

- **Login page:** `/admin/login`
- **Email:** `deepaktechpulse@gmail.com`
- **Password:** _(shared privately — not stored in the repo)_

After login you get: **Write Blog**, **Manage Blogs**, **Users** (add team + copy credentials),
**Messages** (contact-form inbox).

> To add more admins/editors: Admin → **Users** → "Add New Admin". The password can be
> copied right after creating the user (it is hashed in the DB and can't be shown again later).

---

## 3. Environment Variables (set these in Vercel)

Vercel → Project → **Settings → Environment Variables**. Add these **5** (values from your `.env`):

| Name | What it is |
|------|-----------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXTAUTH_SECRET` | Random secret for login sessions (`openssl rand -base64 32`) |

> `NEXTAUTH_URL` is **optional** — NextAuth auto-detects the URL on Vercel.
> Only add it if login misbehaves: set it to your live URL, then redeploy.

After adding/changing any variable → **Redeploy**.

---

## 4. Database — MongoDB Atlas (one-time)

1. Go to **cloud.mongodb.com** → your project.
2. **Security → Database & Network Access → Network Access**.
3. **+ ADD IP ADDRESS** → **Allow Access from Anywhere** (`0.0.0.0/0`) → **Confirm**.
   *(Required because Vercel's serverless IPs change. The DB is still protected by username/password.)*
4. Wait until status is **Active**.

---

## 5. Deploy on Vercel

1. **vercel.com** → **Add New → Project** → **Import** `TechPulse979/techpulse-website`.
2. Add the 5 environment variables (section 3).
3. Click **Deploy**. Branch = `main` (production).
4. Wait for **Build Completed → Ready**. Open the given `.vercel.app` URL. ✅

**Future updates:** just `git push` to `main` → Vercel redeploys automatically.

---

## 6. Connect a Custom Domain (e.g. from GoDaddy)

1. Vercel → Project → **Settings → Domains** → add your domain (e.g. `techpulse.com`).
2. Vercel shows DNS records. Add them at GoDaddy (**My Products → DNS → Manage DNS**):
   - **A record:** Name `@` → Value `76.76.21.21`
   - **CNAME:** Name `www` → Value `cname.vercel-dns.com`
   *(Remove any old conflicting A/CNAME records.)*
3. Save. DNS takes a few minutes–hours. Vercel issues **SSL (https)** automatically.
4. (Optional) Set `NEXTAUTH_URL` to the new domain → Redeploy.

**Domain on someone else's GoDaddy account?** They can give you DNS access via
GoDaddy → Account Settings → **Delegate Access → Invite to Access** (level: *Products, Domains & Purchase*).

---

## 7. Run Locally (for development)

```bash
git clone https://github.com/TechPulse979/techpulse-website
cd techpulse-website
cp .env.example .env      # then fill in the real values
npm install
npm run dev               # http://localhost:3000
```

Create the first admin (if DB is empty):
```bash
node src/scripts/seed-admin.mjs
```

---

## 8. Features

- 🏠 Modern responsive homepage (hero, featured story, blog grid, newsletter)
- 📝 Blog with categories, search, auto reading-time, individual post pages
- 🔐 Admin panel: write/edit/delete posts (rich-text editor + image upload)
- 👥 User management with copy-able credentials on creation
- 📨 Contact form → saved to DB → Admin **Messages** inbox (reply / mark-read / delete)
- 📱 Fully mobile-responsive (incl. admin panel drawer menu)

---

## 9. Troubleshooting

| Problem | Fix |
|--------|-----|
| Build fails on `npm install` (ERESOLVE) | `.npmrc` already has `legacy-peer-deps=true` — keep it |
| Site loads but no data / 500 errors | Check env vars in Vercel + MongoDB Network Access (`0.0.0.0/0`) |
| Can't log in to admin | Confirm `NEXTAUTH_SECRET` is set; ensure an admin user exists in the DB |
| Images don't upload | Check the 3 Cloudinary env vars |

---

_Generated as a handover reference. Update URLs/values as needed._
