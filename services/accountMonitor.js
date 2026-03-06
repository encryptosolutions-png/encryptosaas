import { supabaseServer } from '@/lib/supabase/server'

function getTrustedDeviceHashes(metadata) {
  if (!metadata || typeof metadata !== 'object') return []
  const hashes = metadata.trusted_device_hashes
  if (!Array.isArray(hashes)) return []
  return hashes.map((v) => String(v))
}

async function insertAlert(params) {
  const duplicateSince = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  const { data: existing } = await supabaseServer
    .from('security_alerts')
    .select('id')
    .eq('user_id', params.userId)
    .eq('platform', params.platform)
    .eq('alert_type', params.alertType)
    .gte('created_at', duplicateSince)
    .limit(1)

  if (existing && existing.length > 0) {
    return null
  }

  const { data, error } = await supabaseServer
    .from('security_alerts')
    .insert({
      user_id: params.userId,
      platform: params.platform,
      alert_type: params.alertType,
      severity: params.severity,
      message: params.message,
      status: 'open',
      metadata: params.metadata || {},
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

function calculateScore({ unknownDeviceCount, locationChangeCount, failedLoginCount, passwordChangeCount }) {
  let score = 100
  score -= unknownDeviceCount * 12
  score -= locationChangeCount * 10
  score -= Math.min(failedLoginCount, 10) * 4
  score -= passwordChangeCount >= 2 ? 15 : 0
  return Math.max(0, Math.min(score, 100))
}

async function analyzeEvents(account) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const trustedDeviceHashes = getTrustedDeviceHashes(account.metadata)
  const trustedTimezone = account.metadata?.trusted_timezone || null

  const { data: events, error } = await supabaseServer
    .from('security_activity_events')
    .select('*')
    .eq('user_id', account.user_id)
    .eq('platform', 'instagram')
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error) throw error

  const list = events || []
  const unknownDeviceEvents = list.filter((e) => e.device_hash && !trustedDeviceHashes.includes(e.device_hash))
  const locationChangeEvents = trustedTimezone
    ? list.filter((e) => e.location_hint && e.location_hint !== trustedTimezone)
    : []
  const failedLoginEvents = list.filter((e) => e.event_type === 'LOGIN_FAILURE')
  const passwordChangeEvents = list.filter((e) => e.event_type === 'PASSWORD_CHANGE')

  const score = calculateScore({
    unknownDeviceCount: unknownDeviceEvents.length,
    locationChangeCount: locationChangeEvents.length,
    failedLoginCount: failedLoginEvents.length,
    passwordChangeCount: passwordChangeEvents.length,
  })

  return {
    score,
    unknownDeviceEvents,
    locationChangeEvents,
    failedLoginEvents,
    passwordChangeEvents,
  }
}

export async function monitorInstagramAccount(account) {
  if (account.status !== 'connected') {
    return { alertsCreated: 0, score: account.security_score || 0 }
  }

  const analysis = await analyzeEvents(account)
  let alertsCreated = 0

  if (analysis.unknownDeviceEvents.length > 0) {
    const created = await insertAlert({
      userId: account.user_id,
      platform: 'instagram',
      alertType: 'UNKNOWN_DEVICE',
      severity: analysis.unknownDeviceEvents.length > 1 ? 'high' : 'medium',
      message: 'Suspicious login detected from an unknown device.',
      metadata: { events: analysis.unknownDeviceEvents.slice(0, 5) },
    })
    if (created) alertsCreated += 1
  }

  if (analysis.locationChangeEvents.length > 0) {
    const created = await insertAlert({
      userId: account.user_id,
      platform: 'instagram',
      alertType: 'LOGIN_LOCATION_CHANGE',
      severity: analysis.locationChangeEvents.length > 1 ? 'high' : 'medium',
      message: 'Login location pattern changed from your trusted baseline.',
      metadata: { events: analysis.locationChangeEvents.slice(0, 5) },
    })
    if (created) alertsCreated += 1
  }

  if (analysis.failedLoginEvents.length >= 3) {
    const created = await insertAlert({
      userId: account.user_id,
      platform: 'instagram',
      alertType: 'SUSPICIOUS_LOGIN',
      severity: analysis.failedLoginEvents.length >= 5 ? 'critical' : 'high',
      message: 'Multiple failed login attempts detected in a short window.',
      metadata: { failedAttempts: analysis.failedLoginEvents.length },
    })
    if (created) alertsCreated += 1
  }

  if (analysis.passwordChangeEvents.length >= 2 && analysis.failedLoginEvents.length >= 2) {
    const created = await insertAlert({
      userId: account.user_id,
      platform: 'instagram',
      alertType: 'POSSIBLE_ACCOUNT_TAKEOVER',
      severity: 'critical',
      message: 'Possible account takeover pattern detected from combined credential events.',
      metadata: {
        passwordChanges: analysis.passwordChangeEvents.length,
        failedAttempts: analysis.failedLoginEvents.length,
      },
    })
    if (created) alertsCreated += 1
  }

  await supabaseServer
    .from('social_accounts')
    .update({
      last_checked_at: new Date().toISOString(),
      monitoring_state: 'active',
      security_score: analysis.score,
    })
    .eq('id', account.id)

  return { alertsCreated, score: analysis.score }
}

export async function monitorUserAccounts(userId) {
  const { data: accounts, error } = await supabaseServer
    .from('social_accounts')
    .select('id, user_id, username, status, security_score, metadata')
    .eq('user_id', userId)
    .eq('platform', 'instagram')

  if (error) throw error

  let totalAlerts = 0
  for (const account of accounts || []) {
    const result = await monitorInstagramAccount(account)
    totalAlerts += result.alertsCreated
  }

  return { accountsScanned: accounts?.length || 0, alertsCreated: totalAlerts }
}

export async function monitorAllAccounts() {
  const { data: accounts, error } = await supabaseServer
    .from('social_accounts')
    .select('id, user_id, username, status, security_score, metadata')
    .eq('platform', 'instagram')
    .eq('status', 'connected')

  if (error) throw error

  let totalAlerts = 0
  for (const account of accounts || []) {
    const result = await monitorInstagramAccount(account)
    totalAlerts += result.alertsCreated
  }

  return { accountsScanned: accounts?.length || 0, alertsCreated: totalAlerts }
}
