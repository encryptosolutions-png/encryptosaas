# EnCrypto Architecture & System Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Components (TSX/JSX)              │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ • Login Page          (/app/login/page.js)           │   │
│  │ • Signup Page         (/app/signup/page.js)          │   │
│  │ • Dashboard Layout    (/app/dashboard/layout.tsx)    │   │
│  │ • Dashboard Overview  (/app/dashboard/page.tsx)      │   │
│  │ • Social Manager      (/app/dashboard/social/...)    │   │
│  │ • Scam Detector UI    (/app/dashboard/scam-...)      │   │
│  │ • Protected Content   (/app/dashboard/protected-...) │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Hooks & Utilities (/hooks, /lib)             │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ • useSocialAccounts()      (fetch & manage)          │   │
│  │ • useProtectedContent()    (fetch & manage)          │   │
│  │ • useScamChecks()          (fetch & manage)          │   │
│  │ • supabase client          (browser instance)        │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          UI Component Library (/components)          │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ • Button (primary/secondary/danger)                  │   │
│  │ • Card                                               │   │
│  │ • Input (with validation)                            │   │
│  │ • LoadingSpinner                                     │   │
│  │ • AuthStatus                                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Styling: Tailwind CSS                     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Responsive, dark-mode ready, utility-first           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
                      HTTPS / REST
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Backend                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          API Routes (/app/api)                       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ POST /api/scam-detector                              │   │
│  │   → Analyzes message for scam keywords               │   │
│  │   → Returns: result, riskLevel, matchedKeywords      │   │
│  │                                                       │   │
│  │ GET /api/dashboard/stats                             │   │
│  │   → Returns: totalAccounts, totalChecks, etc.        │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Middleware (/middleware.ts)                   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ • Checks auth session                                │   │
│  │ • Redirects /dashboard → /login if not auth          │   │
│  │ • Redirects /login → /dashboard if auth              │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     Server Utilities (/lib/supabase/server.ts)       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Supabase client with service role key                │   │
│  │ (for trusted server-side operations)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
                      HTTPS / REST
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Tables:                                              │   │
│  │ ┌─ social_accounts                                  │   │
│  │ │  id, user_id, platform, username, followers       │   │
│  │ │                                                     │   │
│  │ ├─ scam_checks                                       │   │
│  │ │  id, user_id, message, result, risk_level         │   │
│  │ │                                                     │   │
│  │ └─ protected_content                                 │   │
│  │    id, user_id, content_url, platform               │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Row Level Security (RLS) Policies             │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ • Each user sees only their data                     │   │
│  │ • Full isolation between users                       │   │
│  │ • Enforced at database level                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Authentication (JWT Sessions)              │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ • Email/password auth                                │   │
│  │ • Session tokens in cookies                          │   │
│  │ • Automatic token refresh                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## User Flow Diagrams

### Authentication Flow

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       ↓
┌──────────────────────────┐
│  Anonymous User          │
├──────────────────────────┤
│  Home page (/)           │
│  ├─ Signup button        │
│  └─ Login button         │
└──────┬──────────────────┬┘
       │                   │
       ↓                   ↓
   [Signup]           [Login]
       │                   │
       ↓                   ↓
  New Email? ─────→ Email in DB?
       ↓                   ↓
    YES (create)       YES (auth)
       │                   │
       ↓                   ↓
  [Set Password]    [Enter Password]
       │                   │
       ↓                   ↓
  [Verify Email]    [Check Password]
       │                   │
       ↓ ✓                 ↓ ✓
       │                   │
       └────────┬──────────┘
                ↓
        ┌───────────────────┐
        │ Create Session    │
        │ (JWT Token)       │
        └────────┬──────────┘
                 ↓
        ┌───────────────────┐
        │ Redirect to       │
        │ /dashboard        │
        └────────┬──────────┘
                 ↓
        ┌───────────────────┐
        │ Authenticated     │
        │ User in Dashboard │
        └───────────────────┘
```

### Feature Usage Flow

```
Dashboard
    ↓
┌───┴───┬──────────┬──────────────┐
│       │          │              │
↓       ↓          ↓              ↓
Social  Scam       Protected      Stats
Accounts Detector  Content
│       │          │
│       │          │
Form    Input      Form
│       │          │
↓       ↓          ↓
Validate Keyword   Validate
│       Match      │
↓       │          ↓
API     ↓          API
(Add)   API        (Add)
│       (Analyze)  │
↓       │          ↓
DB      ↓          DB
Save    DB         Save
        Save
        │
        ↓
    DB Record
        │
        ↓
    UI Display
```

### Data Flow for Each Feature

#### Social Accounts
```
User Input Form
    ↓
useSocialAccounts.addAccount()
    ↓
Supabase Insert
    ↓
RLS Policy Check (user_id match)
    ↓
Database Record Created
    ↓
Real-time UI Update
    ↓
Display in List
```

#### Scam Detector
```
User Types Message
    ↓
Submit to /api/scam-detector
    ↓
Keyword Analysis Algorithm
    ├─ Count high-risk matches
    ├─ Count medium-risk matches
    └─ Calculate risk level (0-100%)
    ↓
Determine Result
├─ Safe (0 matches)
├─ Suspicious (1-2 matches)
└─ Scam (3+ or any high-risk)
    ↓
useScamChecks.addCheck()
    ↓
Supabase Insert
    ↓
Database Record Created
    ↓
Display Results & History
```

#### Protected Content
```
User Enters URL
    ↓
URL Validation
    ↓
useProtectedContent.addContent()
    ↓
Supabase Insert
    ↓
RLS Policy Check
    ↓
Database Record Created
    ↓
UI Updates with New Entry
    ↓
Display List with Delete Option
```

---

## Component Hierarchy

```
RootLayout (/app/layout.js)
    │
    ├─→ LoginPage (/app/login/page.js)
    │   ├─ Button
    │   ├─ Input
    │   └─ Card
    │
    ├─→ SignupPage (/app/signup/page.js)
    │   ├─ Button
    │   ├─ Input
    │   └─ Card
    │
    └─→ DashboardLayout (/app/dashboard/layout.tsx)
        ├─ Sidebar Navigation
        ├─ Header
        ├─ AuthStatus
        │
        ├─→ DashboardPage (/app/dashboard/page.tsx)
        │   ├─ Card (Welcome)
        │   ├─ Card (Security Score)
        │   └─ Card (Stats Grid)
        │       ├─ Card (Social Count)
        │       ├─ Card (Scam Count)
        │       └─ Card (Protected Count)
        │
        ├─→ SocialAccountsPage (/app/dashboard/social/page.tsx)
        │   ├─ Card (Add Form)
        │   │  ├─ Input
        │   │  └─ Button
        │   └─ Card (Accounts List)
        │      ├─ List Item
        │      └─ Delete Button
        │
        ├─→ ScamDetectorPage (/app/dashboard/scam-detector/page.tsx)
        │   ├─ Card (Input Form)
        │   │  ├─ TextArea
        │   │  └─ Button
        │   └─ Card (Results)
        │      ├─ Risk Level Bar
        │      └─ Keywords List
        └─→ ProtectedContentPage (/app/dashboard/protected-content/page.tsx)
            ├─ Card (Add Form)
            │  ├─ Input
            │  ├─ Select
            │  └─ Button
            └─ Card (Content List)
               ├─ List Item
               └─ Delete Button
```

---

## State Management Flow

```
┌──────────────────┐
│  useAuth Hook    │ (via middleware & AuthStatus)
├──────────────────┤
│ • user (from    │
│   supabase.auth) │
│ • loading        │
│ • session        │
└──────────────────┘
        ↓
┌──────────────────────────┐
│ Page Level State         │
├──────────────────────────┤
│ useSocialAccounts()      │
│ useProtectedContent()    │
│ useScamChecks()          │
└──────────────────────────┘
        ↓
┌──────────────────────────┐
│ Form Level State         │
├──────────────────────────┤
│ useState (form data)     │
│ useState (error)         │
│ useState (loading)       │
│ useState (result)        │
└──────────────────────────┘
        ↓
┌──────────────────────────┐
│ Display / Update UI      │
└──────────────────────────┘
```

---

## API Endpoint Structure

```
GET /api/dashboard/stats
├─ Auth: Required (checks session)
├─ Returns:
│  ├─ totalSocialAccounts: number
│  ├─ totalScamChecks: number
│  ├─ totalProtectedContent: number
│  └─ securityScore: number (0-100)
└─ Status Codes: 200 (OK), 401 (Unauthorized), 500 (Error)

POST /api/scam-detector
├─ Body: { message: string }
├─ Process:
│  ├─ Validate message length (1-5000 chars)
│  ├─ Count keyword matches
│  ├─ Calculate risk level
│  ├─ Determine result (safe/suspicious/scam)
│  └─ Save to database (if user authenticated)
├─ Returns:
│  ├─ result: 'safe' | 'suspicious' | 'scam'
│  ├─ riskLevel: number (0-100)
│  ├─ matchedKeywords: string[]
│  └─ analysis.description: string
└─ Status Codes: 200 (OK), 400 (Invalid), 500 (Error)
```

---

## Keyword Detection Algorithm

```
Scam Detection Logic:
┌─────────────────────────────────────────┐
│  Input: User Message (lowercased)       │
└─────────────────────────┬───────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │ Check against HIGH_RISK keywords│
        ├─────────────────────────────────┤
        │ • send money                    │
        │ • wire transfer                 │
        │ • crypto payment                │
        │ • collaboration fee             │
        │ • guaranteed profit             │
        │ • bitcoin                       │
        │ • western union                 │
        │ • moneygram                     │
        │ • paypal transfer               │
        └─────────────────┬───────────────┘
                          ↓
                   Count matches
                          ↓
        ┌─────────────────────────────────┐
        │ Check against MEDIUM_RISK       │
        ├─────────────────────────────────┤
        │ • urgent                        │
        │ • limited offer                 │
        │ • verify account                │
        │ • click this link                │
        │ • investment opportunity        │
        │ • act now                       │
        │ • confirm identity              │
        │ • update payment                │
        │ • claim reward                  │
        └─────────────────┬───────────────┘
                          ↓
                   Count matches
                          ↓
        ┌─────────────────────────────────┐
        │ Calculate Risk Level            │
        ├─────────────────────────────────┤
        │ riskLevel = min(               │
        │   high_count * 40 +            │
        │   medium_count * 20,           │
        │   100                          │
        │ )                              │
        └─────────────────┬───────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │ Determine Result                │
        ├─────────────────────────────────┤
        │ IF high_count >= 1              │
        │    OR total_count >= 3          │
        │ THEN result = "scam"           │
        │ ---                            │
        │ ELSE IF total_count >= 1       │
        │ THEN result = "suspicious"     │
        │ ---                            │
        │ ELSE result = "safe"           │
        └─────────────────┬───────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │ Return: {                       │
        │   result,                       │
        │   riskLevel,                    │
        │   matchedKeywords               │
        │ }                               │
        └─────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────┐
│      Frontend Security              │
├─────────────────────────────────────┤
│ • Middleware redirects non-auth     │
│ • Form validation before submit     │
│ • Loading states prevent double-sub │
│ • Error messages don't leak info    │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│      API Security                   │
├─────────────────────────────────────┤
│ • Auth check on each route          │
│ • Input validation (length, type)   │
│ • Error handling (no internals)     │
│ • Rate limiting ready               │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│      Database Security (RLS)        │
├─────────────────────────────────────┤
│ • User isolation via RLS policies   │
│ • Foreign key constraints           │
│ • No direct table access            │
│ • All via authenticated client      │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│      Auth Security                  │
├─────────────────────────────────────┤
│ • Supabase JWT tokens               │
│ • HttpOnly cookies (Supabase)       │
│ • Session refresh automatic         │
│ • CSRF protection (Next.js built-in)│
└─────────────────────────────────────┘
```

---

This architecture provides:
- ✅ Separation of concerns
- ✅ Type safety (TypeScript)
- ✅ Security by design (RLS + Auth)
- ✅ Scalability (modular components)
- ✅ Maintainability (clear structure)
- ✅ Performance (optimized queries)
