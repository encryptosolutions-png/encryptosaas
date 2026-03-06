# EnCrypto SaaS - Setup & Deployment Guide

## 🚀 Quick Start

### 1. Database Setup

Copy and paste the entire content of `DATABASE_SETUP.sql` into your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Click on "SQL Editor"
3. Click "New Query"
4. Paste the entire `DATABASE_SETUP.sql` content
5. Click "Run"

This creates:
- `social_accounts` table
- `scam_checks` table
- `protected_content` table
- Row Level Security (RLS) policies

### 2. Update Next.js Config

If you get TypeScript errors, you may need to update `tsconfig.json` to include:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "esModuleInterop": true,
    "moduleResolution": "bundler"
  }
}
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

Required packages:
- `next` - React framework
- `@supabase/supabase-js` - Database client
- `tailwindcss` - CSS framework (already configured)

### 4. Update Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Optional for server routes
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 📁 Project Structure

```
encrypto-saas/
├── app/
│   ├── api/
│   │   ├── dashboard/
│   │   │   └── stats/route.ts          # Dashboard stats API
│   │   └── scam-detector/
│   │       └── route.ts                 # Scam detection API
│   ├── dashboard/
│   │   ├── layout.tsx                  # Dashboard layout with sidebar
│   │   ├── page.tsx                    # Dashboard overview
│   │   ├── social/
│   │   │   └── page.tsx                # Social accounts manager
│   │   ├── scam-detector/
│   │   │   └── page.tsx                # Scam detector UI
│   │   └── protected-content/
│   │       └── page.tsx                # Protected content tracker
│   ├── login/
│   │   └── page.js                     # Login page
│   ├── signup/
│   │   └── page.js                     # Sign up page
│   └── layout.js                       # Root layout
├── components/
│   ├── ui/
│   │   ├── Button.tsx                  # Button component
│   │   ├── Card.tsx                    # Card component
│   │   └── Input.tsx                   # Input component
│   ├── AuthStatus.tsx                  # User status display
│   └── LoadingSpinner.tsx              # Loading state
├── hooks/
│   ├── useSocialAccounts.ts            # Social accounts hook
│   ├── useProtectedContent.ts          # Protected content hook
│   └── useScamChecks.ts                # Scam checks hook
├── lib/
│   └── supabase/
│       ├── client.ts                   # Browser client
│       └── server.ts                   # Server client
├── types/
│   └── database.ts                     # TypeScript interfaces
├── middleware.ts                       # Route protection
├── DATABASE_SETUP.sql                  # Database setup script
└── README.md
```

---

## 🔐 Features Implemented

### 1. **Authentication**
- Email/password sign up
- Email/password login
- Protected routes with middleware
- Session management

### 2. **Social Account Manager**
- Add social accounts (Instagram, YouTube, TikTok, Twitter)
- Track follower counts
- View and delete connected accounts
- Database persistence

### 3. **Scam Message Detector**
- Analyzes messages for scam keywords
- Returns risk level (0-100%)
- Flags high-risk patterns
- Saves analysis history

**Detection Logic:**
- High Risk: "send money", "wire transfer", "crypto payment", etc.
- Medium Risk: "urgent", "limited offer", "verify account", etc.
- Score: High-risk keywords = 40pts, Medium-risk = 20pts
- Result: 0 matches = Safe, 1-2 = Suspicious, 3+ = Scam

### 4. **Protected Content Tracker**
- Register content URLs
- Track by platform
- View all protected content
- Delete entries

### 5. **Dashboard**
- Security score calculation
- Quick stats overview
- Navigation to all features
- User profile display

**Security Score Calculation:**
- +20 per connected social account (max 40)
- +20 per protected content (max 30)
- +5 per scam check (max 30)
- Total max: 100

---

## 📊 API Routes

### Dashboard Stats
```
GET /api/dashboard/stats

Response:
{
  "totalSocialAccounts": 3,
  "totalScamChecks": 0,
  "totalProtectedContent": 5,
  "securityScore": 75
}
```

### Scam Detection
```
POST /api/scam-detector

Request:
{
  "message": "Send me $500 for collaboration"
}

Response:
{
  "result": "scam",
  "riskLevel": 70,
  "matchedKeywords": ["send money"],
  "analysis": {
    "description": "🚨 This message shows high scam risk..."
  }
}
```

---

## 🔑 Database Schema

### social_accounts
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → auth.users)
- `platform`: TEXT ('instagram' | 'youtube' | 'tiktok' | 'twitter')
- `username`: TEXT
- `followers`: INTEGER (optional)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### scam_checks
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → auth.users)
- `message`: TEXT
- `result`: TEXT ('safe' | 'suspicious' | 'scam')
- `risk_level`: INTEGER (0-100)
- `created_at`: TIMESTAMP

### protected_content
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → auth.users)
- `content_url`: TEXT
- `platform`: TEXT
- `created_at`: TIMESTAMP

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/encrypto-saas.git
git push -u origin main
```

2. Deploy to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repo
   - Set environment variables
   - Deploy!

### Environment Variables for Production

Add to Vercel:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (optional)
```

---

## 🔧 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists
- Restart dev server: `Ctrl+C` then `npm run dev`
- Verify keys are correct in Supabase dashboard

### "Cannot find module"
- Run `npm install`
- Clear Next.js cache: `rm -rf .next`
- Restart dev server

### Middleware not redirecting
- Check `middleware.ts` is at root level
- Ensure routes match the config matcher
- Verify auth session is being stored in cookies

### Database queryreturns empty
- Verify RLS policies are created correctly
- Check Row Level Security is enabled on tables
- Ensure user_id matches current session

---

## 📝 Next Steps / Future Features

1. **Email Verification**
   - Add email confirmation on signup
   - Resend email option

2. **Two-Factor Authentication**
   - TOTP support
   - SMS backup codes

3. **Content Watermarking**
   - Add watermarks to images
   - Host watermarked versions

4. **Advanced Analytics**
   - Monthly trends
   - Risk reports
   - Competitor monitoring

5. **Team Collaboration**
   - Multiple users per account
   - Shared content library
   - Audit logs

6. **API for Creators**
   - REST API
   - Webhook support
   - Third-party integrations

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hooks](https://react.dev/reference/react)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Support

For issues or questions:
1. Check troubleshooting section above
2. Review the code comments
3. Check Supabase dashboard for errors
4. Review browser DevTools console

---

**Happy Building! 🚀**
