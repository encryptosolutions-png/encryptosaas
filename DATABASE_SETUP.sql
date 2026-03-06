-- Supabase SQL Migration for EnCrypto Account Protection (Internal Logic)
-- Safe for existing projects where social_accounts/scam_checks/protected_content already exist.

-- 1) Extend social_accounts for internal protection monitoring
ALTER TABLE public.social_accounts
  ADD COLUMN IF NOT EXISTS connected_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS monitoring_state TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS security_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'social_accounts_status_check'
  ) THEN
    ALTER TABLE public.social_accounts
      ADD CONSTRAINT social_accounts_status_check
      CHECK (status IN ('manual', 'connecting', 'connected', 'error'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'social_accounts_monitoring_state_check'
  ) THEN
    ALTER TABLE public.social_accounts
      ADD CONSTRAINT social_accounts_monitoring_state_check
      CHECK (monitoring_state IN ('inactive', 'active', 'paused'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'social_accounts_security_score_check'
  ) THEN
    ALTER TABLE public.social_accounts
      ADD CONSTRAINT social_accounts_security_score_check
      CHECK (security_score >= 0 AND security_score <= 100);
  END IF;
END $$;

-- 2) Internal telemetry events used by anomaly detection
CREATE TABLE IF NOT EXISTS public.security_activity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'youtube', 'tiktok', 'twitter')),
  event_type TEXT NOT NULL CHECK (event_type IN ('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'PASSWORD_CHANGE', 'SESSION_REFRESH')),
  device_hash TEXT,
  location_hint TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3) Security alerts output table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'youtube', 'tiktok', 'twitter')),
  alert_type TEXT NOT NULL CHECK (
    alert_type IN (
      'SUSPICIOUS_LOGIN',
      'UNKNOWN_DEVICE',
      'LOGIN_LOCATION_CHANGE',
      'POSSIBLE_ACCOUNT_TAKEOVER'
    )
  ),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'reported')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4) Indexes
CREATE INDEX IF NOT EXISTS social_accounts_user_id_idx ON public.social_accounts(user_id);
CREATE INDEX IF NOT EXISTS scam_checks_user_id_idx ON public.scam_checks(user_id);
CREATE INDEX IF NOT EXISTS protected_content_user_id_idx ON public.protected_content(user_id);
CREATE INDEX IF NOT EXISTS social_accounts_user_platform_unique ON public.social_accounts(user_id, platform);
CREATE INDEX IF NOT EXISTS security_activity_events_user_id_idx ON public.security_activity_events(user_id);
CREATE INDEX IF NOT EXISTS security_activity_events_platform_idx ON public.security_activity_events(platform);
CREATE INDEX IF NOT EXISTS security_activity_events_created_at_idx ON public.security_activity_events(created_at DESC);
CREATE INDEX IF NOT EXISTS security_alerts_user_id_idx ON public.security_alerts(user_id);
CREATE INDEX IF NOT EXISTS security_alerts_platform_idx ON public.security_alerts(platform);
CREATE INDEX IF NOT EXISTS security_alerts_created_at_idx ON public.security_alerts(created_at DESC);

-- 5) Enable RLS
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protected_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- 6) Policies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='social_accounts' AND policyname='Users can view their own social accounts'
  ) THEN
    CREATE POLICY "Users can view their own social accounts"
      ON public.social_accounts FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='social_accounts' AND policyname='Users can insert their own social accounts'
  ) THEN
    CREATE POLICY "Users can insert their own social accounts"
      ON public.social_accounts FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='social_accounts' AND policyname='Users can update their own social accounts'
  ) THEN
    CREATE POLICY "Users can update their own social accounts"
      ON public.social_accounts FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='social_accounts' AND policyname='Users can delete their own social accounts'
  ) THEN
    CREATE POLICY "Users can delete their own social accounts"
      ON public.social_accounts FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='scam_checks' AND policyname='Users can view their own scam checks'
  ) THEN
    CREATE POLICY "Users can view their own scam checks"
      ON public.scam_checks FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='scam_checks' AND policyname='Users can insert their own scam checks'
  ) THEN
    CREATE POLICY "Users can insert their own scam checks"
      ON public.scam_checks FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='protected_content' AND policyname='Users can view their own protected content'
  ) THEN
    CREATE POLICY "Users can view their own protected content"
      ON public.protected_content FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='protected_content' AND policyname='Users can insert their own protected content'
  ) THEN
    CREATE POLICY "Users can insert their own protected content"
      ON public.protected_content FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='protected_content' AND policyname='Users can update their own protected content'
  ) THEN
    CREATE POLICY "Users can update their own protected content"
      ON public.protected_content FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='protected_content' AND policyname='Users can delete their own protected content'
  ) THEN
    CREATE POLICY "Users can delete their own protected content"
      ON public.protected_content FOR DELETE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='security_activity_events' AND policyname='Users can view their own security activity events'
  ) THEN
    CREATE POLICY "Users can view their own security activity events"
      ON public.security_activity_events FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='security_activity_events' AND policyname='Users can insert their own security activity events'
  ) THEN
    CREATE POLICY "Users can insert their own security activity events"
      ON public.security_activity_events FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='security_alerts' AND policyname='Users can view their own security alerts'
  ) THEN
    CREATE POLICY "Users can view their own security alerts"
      ON public.security_alerts FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='security_alerts' AND policyname='Users can insert their own security alerts'
  ) THEN
    CREATE POLICY "Users can insert their own security alerts"
      ON public.security_alerts FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='security_alerts' AND policyname='Users can update their own security alerts'
  ) THEN
    CREATE POLICY "Users can update their own security alerts"
      ON public.security_alerts FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;
