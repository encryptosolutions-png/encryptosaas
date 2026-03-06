// Database types for Supabase tables
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface SocialAccount {
  id: string
  user_id: string
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter'
  username: string
  followers?: number
  connected_at?: string
  last_checked_at?: string
  status?: 'manual' | 'connecting' | 'connected' | 'error'
  monitoring_state?: 'inactive' | 'active' | 'paused'
  security_score?: number
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface SecurityAlert {
  id: string
  user_id: string
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter'
  alert_type:
    | 'SUSPICIOUS_LOGIN'
    | 'UNKNOWN_DEVICE'
    | 'LOGIN_LOCATION_CHANGE'
    | 'POSSIBLE_ACCOUNT_TAKEOVER'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  status: 'open' | 'investigating' | 'resolved' | 'reported'
  metadata?: Record<string, unknown>
  created_at: string
}

export interface SecurityActivityEvent {
  id: string
  user_id: string
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter'
  event_type: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'PASSWORD_CHANGE' | 'SESSION_REFRESH'
  device_hash?: string
  location_hint?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface ScamCheck {
  id: string
  user_id: string
  message: string
  result: 'safe' | 'suspicious' | 'scam'
  risk_level: number // 0-100
  created_at: string
}

export interface ProtectedContent {
  id: string
  user_id: string
  content_url: string
  platform: string
  created_at: string
}

export interface DashboardStats {
  totalSocialAccounts: number
  totalScamChecks: number
  totalProtectedContent: number
  securityScore: number
}
