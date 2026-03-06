# EnCrypto SaaS MVP - Quick Start Guide

## 🎯 5-Minute Setup

### Step 1: Run Database Setup (2 minutes)

1. Go to [your Supabase dashboard](https://supabase.com/dashboard)
2. Open the SQL Editor
3. Create new query
4. Copy **all content** from `DATABASE_SETUP.sql` in this project
5. Paste it and click "Run"
6. Wait for success ✅

### Step 2: Verify Environment Variables (1 minute)

Check `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Get these from Supabase > Project Settings > API

### Step 3: Start Development Server (1 minute)

```bash
npm run dev
```

Visit `http://localhost:3000`

### Step 4: Test the App (1 minute)

1. Click "Create Account" at `/signup`
2. Enter email: `test@example.com` and password `Test123!`
3. Should redirect to dashboard

✅ **Done!**

---

## 🧪 Feature Quick Test

After login:

### Test 1: Social Accounts
1. Go to "📱 Social Accounts"
2. Select "Instagram"
3. Enter username: `@testuser`
4. Enter followers: `10000`
5. Click "Connect Account"
6. Should appear in list ✅

### Test 2: Scam Detector
1. Go to "⚠️ Scam Detector"
2. Paste message: `"Send me $500 for collaboration"`
3. Click "Analyze Message"
4. Should show red "🚨 Likely a Scam" ✅

### Test 3: Protected Content
1. Go to "🔒 Protected Content"
2. Enter URL: `https://instagram.com/p/ABC123`
3. Select "Instagram"
4. Click "Add to Protection List"
5. Should appear in list ✅

### Test 4: Dashboard Stats
1. Return to Overview
2. Security score should show (based on items added)
3. Stats cards should show counts ✅

---

## 📋 File Structure at a Glance

```
encrypto-saas/
├── app/
│   ├── api/
│   │   ├── dashboard/stats/route.ts
│   │   └── scam-detector/route.ts
│   ├── dashboard/
│   │   ├── layout.tsx (sidebar + navbar)
│   │   ├── page.tsx (overview)
│   │   ├── social/page.tsx
│   │   ├── scam-detector/page.tsx
│   │   └── protected-content/page.tsx
│   ├── login/page.js
│   ├── signup/page.js
│   └── layout.js
├── components/ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
├── hooks/
│   ├── useSocialAccounts.ts
│   ├── useProtectedContent.ts
│   └── useScamChecks.ts
├── lib/supabase/
│   ├── client.ts
│   └── server.ts
├── types/
│   └── database.ts
├── middleware.ts
├── DATABASE_SETUP.sql ← RUN THIS FIRST
├── SETUP_GUIDE.md (detailed guide)
└── PROJECT_STATUS.md (complete checklist)
```

---

## 🔑 Key Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

---

## ⚠️ Common Issues

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### "Missing environment variables"
- Check `.env.local` exists
- Verify values from Supabase dashboard (Settings > API)
- Restart dev server after changes

### "Table doesn't exist" error
- Run `DATABASE_SETUP.sql` in Supabase SQL Editor
- Check tables are created: social_accounts, scam_checks, protected_content

### "RLS policy violation"
- Verify RLS policies were created by DATABASE_SETUP.sql
- Check user is authenticated
- Ensure user_id matches session user

---

## 🎁 What's Inside

### Features Built
✅ Email/password authentication  
✅ Social account manager (Instagram, YouTube, TikTok, Twitter)  
✅ AI-like scam message detector with keyword analysis  
✅ Protected content tracker  
✅ Security score calculator  
✅ Dashboard with real-time stats  
✅ Beautiful Tailwind UI  
✅ Mobile responsive design  

### Tech Stack
- **Frontend:** React 19 + Next.js 15
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Deployment:** Vercel ready

---

## 🚀 Deploying to Production

### Vercel (1-Click)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) 
3. Import project
4. Add environment variables
5. Deploy!

### Environment Variables to Add
```
NEXT_PUBLIC_SUPABASE_URL = <from Supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY = <from Supabase>
```

---

## 📞 Support

If something doesn't work:

1. Check the **Troubleshooting** section in `SETUP_GUIDE.md`
2. Clear cache: `rm -rf .next` (or `rmdir /s .next` on Windows)
3. Restart dev server: `Ctrl+C` then `npm run dev`
4. Check Supabase dashboard > SQL Editor > View logs

---

## 🎯 Next Step

Read `SETUP_GUIDE.md` for detailed information about:
- Complete architecture
- API route documentation
- Database schema details
- Advanced customization
- Roadmap for future features

---

**You're all set! Start building! 🚀**
