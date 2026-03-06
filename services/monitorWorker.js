const intervalMinutes = Number(process.env.ACCOUNT_MONITOR_INTERVAL_MINUTES || '10')
const apiBase = process.env.MONITOR_API_BASE_URL || 'http://localhost:3000'
const secret = process.env.MONITOR_CRON_SECRET || ''

if (!secret) {
  console.error('[AccountMonitor] MONITOR_CRON_SECRET is required for worker mode.')
  process.exit(1)
}

async function runCycle() {
  try {
    const response = await fetch(`${apiBase}/api/security/scan`, {
      method: 'POST',
      headers: {
        'x-monitor-secret': secret,
      },
    })

    const payload = await response.json()
    if (!response.ok) {
      throw new Error(payload.error || 'Scan request failed')
    }

    console.log('[AccountMonitor] scan complete', payload)
  } catch (error) {
    console.error('[AccountMonitor] scan failed', error)
  }
}

console.log(`[AccountMonitor] worker started. Interval: ${intervalMinutes} minute(s)`)
runCycle()
setInterval(runCycle, intervalMinutes * 60 * 1000)
