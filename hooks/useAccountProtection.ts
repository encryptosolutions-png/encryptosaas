import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface AccountStatus {
  id: string
  platform: string
  username: string
  status: string
  monitoring_state: string
  connected_at: string | null
  last_checked_at: string | null
  security_score: number | null
}

interface SecurityAlert {
  id: string
  alert_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  created_at: string
  status: string
}

interface RecoveryReport {
  subject: string
  body: string
}

function hashString(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(16)
}

function getDeviceHash() {
  if (typeof window === 'undefined') return ''
  const payload = [
    navigator.userAgent,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    String(window.screen.width),
    String(window.screen.height),
    String(window.devicePixelRatio || 1),
  ].join('|')

  return hashString(payload)
}

export function useAccountProtection() {
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [status, setStatus] = useState<'NOT_CONNECTED' | 'CONNECTING' | 'CONNECTED' | 'MONITORING_ACTIVE'>('NOT_CONNECTED')
  const [account, setAccount] = useState<AccountStatus | null>(null)
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<RecoveryReport | null>(null)
  const [reportLoading, setReportLoading] = useState(false)

  const getAuthHeader = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      throw new Error('Missing authenticated session')
    }

    return { Authorization: `Bearer ${session.access_token}` }
  }, [])

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const headers = await getAuthHeader()
      const response = await fetch('/api/social/instagram/status', {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.error || 'Failed to load account protection status')
      }

      const payload = await response.json()
      setStatus(payload.connectionState)
      setAccount(payload.account)
      setAlerts(payload.alerts || [])
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Failed to load account protection')
    } finally {
      setLoading(false)
    }
  }, [getAuthHeader])

  const trackActivity = useCallback(
    async (eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'PASSWORD_CHANGE' | 'SESSION_REFRESH') => {
      try {
        const headers = {
          ...(await getAuthHeader()),
          'Content-Type': 'application/json',
        }
        await fetch('/api/security/activity', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            eventType,
            deviceHash: getDeviceHash(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
            metadata: { source: 'account_protection_page' },
          }),
        })
      } catch {
        // Telemetry failures should not break UX
      }
    },
    [getAuthHeader],
  )

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (account?.status === 'connected') {
      trackActivity('SESSION_REFRESH')
    }
  }, [account?.status, trackActivity])

  const connectInstagram = useCallback(
    async (username: string) => {
      setConnecting(true)
      setError(null)

      try {
        const headers = {
          ...(await getAuthHeader()),
          'Content-Type': 'application/json',
        }

        const response = await fetch('/api/social/instagram/connect', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            username,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
            deviceHash: getDeviceHash(),
          }),
        })

        if (!response.ok) {
          const payload = await response.json()
          throw new Error(payload.error || 'Failed to connect Instagram')
        }

        await trackActivity('LOGIN_SUCCESS')
        await fetchStatus()
      } catch (connectError) {
        setError(connectError instanceof Error ? connectError.message : 'Failed to connect account')
      } finally {
        setConnecting(false)
      }
    },
    [fetchStatus, getAuthHeader, trackActivity],
  )

  const runSecurityScan = useCallback(async () => {
    const headers = await getAuthHeader()
    const response = await fetch('/api/security/scan', {
      method: 'POST',
      headers,
    })

    if (!response.ok) {
      const payload = await response.json()
      throw new Error(payload.error || 'Failed to run security scan')
    }

    await fetchStatus()
  }, [fetchStatus, getAuthHeader])

  const generateRecoveryRequest = useCallback(
    async (alertId: string, userConfirmed: boolean) => {
      setReportLoading(true)
      setError(null)

      try {
        const headers = {
          ...(await getAuthHeader()),
          'Content-Type': 'application/json',
        }

        const response = await fetch('/api/security/generate-report', {
          method: 'POST',
          headers,
          body: JSON.stringify({ alertId, userConfirmed }),
        })

        if (!response.ok) {
          const payload = await response.json()
          throw new Error(payload.error || 'Failed to generate report')
        }

        const payload = await response.json()
        setReport(payload)
      } catch (reportError) {
        setError(reportError instanceof Error ? reportError.message : 'Failed to generate report')
      } finally {
        setReportLoading(false)
      }
    },
    [getAuthHeader],
  )

  const highRiskAlert = useMemo(
    () => alerts.find((a) => a.severity === 'high' || a.severity === 'critical') || null,
    [alerts],
  )

  return {
    loading,
    connecting,
    status,
    account,
    alerts,
    error,
    report,
    reportLoading,
    highRiskAlert,
    connectInstagram,
    runSecurityScan,
    generateRecoveryRequest,
    refresh: fetchStatus,
  }
}
