# Account Protection Setup (Internal Logic)

This mode uses internal telemetry and anomaly detection.
No Meta/Facebook OAuth setup is required.

## 1) Database Migration

Run full SQL from [DATABASE_SETUP.sql](./DATABASE_SETUP.sql) in Supabase SQL Editor.

It will:
- extend `social_accounts` for monitoring state/score
- create `security_activity_events`
- create `security_alerts`
- create indexes + RLS + policies

## 2) Environment Variables

Copy `.env.example` to `.env.local` and set values.

Required for internal mode:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MONITOR_CRON_SECRET`
- `MONITOR_API_BASE_URL`
- `ACCOUNT_MONITOR_INTERVAL_MINUTES` (optional, default `10`)

## 3) Run Services

Terminal 1:

```powershell
npm run dev
```

Terminal 2:

```powershell
npm run monitor:worker
```

## 4) Verify Flow

1. Open `/dashboard/security/account-protection`
2. Enter Instagram username and click `Connect Instagram`
3. Trigger scan using `View Security Alerts`
4. Review alerts and generate recovery request

## 5) Notes

- Monitoring is based on real internal telemetry events (`LOGIN_SUCCESS`, `LOGIN_FAILURE`, `PASSWORD_CHANGE`, `SESSION_REFRESH`) captured by EnCrypto.
- The engine applies deterministic risk rules (unknown device, location change, repeated failures, combined takeover patterns).
