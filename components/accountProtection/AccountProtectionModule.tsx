'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type Severity = 'low' | 'medium' | 'high'

interface SecurityAlert {
  id: string
  message: string
  severity: Severity
  timestamp: string
}

const ALERT_POOL = [
  'Suspicious login attempt detected',
  'Login from unknown device',
  'Unusual location access',
  'Repeated failed authentication attempts',
  'Session activity spike detected',
]

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function severityClass(severity: Severity) {
  if (severity === 'high') return 'border-red-500/40 bg-red-500/10 text-red-200'
  if (severity === 'medium') return 'border-purple-500/40 bg-purple-500/10 text-purple-200'
  return 'border-white/20 bg-white/5 text-slate-200'
}

export default function AccountProtectionModule() {
  const [platform, setPlatform] = useState('instagram')
  const [accountName, setAccountName] = useState('')
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [securityScore, setSecurityScore] = useState<number | null>(null)
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [report, setReport] = useState('')

  const latestAlert = alerts[0]

  const scoreBand = useMemo(() => {
    if (securityScore === null) return 'Not Scanned'
    if (securityScore >= 80) return 'Strong'
    if (securityScore >= 60) return 'Moderate'
    return 'At Risk'
  }, [securityScore])

  const startScan = () => {
    if (!accountName.trim()) return

    setScanning(true)
    setProgress(0)
    setReport('')

    const duration = 3000 + Math.floor(Math.random() * 2000)
    const start = Date.now()

    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const value = Math.min(100, Math.floor((elapsed / duration) * 100))
      setProgress(value)

      if (value >= 100) {
        clearInterval(timer)
        const score = 55 + Math.floor(Math.random() * 45)
        const alertCount = 1 + Math.floor(Math.random() * 3)
        const generatedAlerts: SecurityAlert[] = Array.from({ length: alertCount }).map((_, idx) => ({
          id: `${Date.now()}-${idx}`,
          message: randomItem(ALERT_POOL),
          severity: randomItem(['low', 'medium', 'high']),
          timestamp: new Date(Date.now() - idx * 900000).toLocaleString(),
        }))

        setSecurityScore(score)
        setAlerts(generatedAlerts)
        setScanning(false)
      }
    }, 120)
  }

  const generateRecoveryReport = () => {
    if (!latestAlert) return

    const generated = `Account: ${accountName}\nPlatform: ${platform}\nDetected issue: ${latestAlert.message}\nSeverity: ${latestAlert.severity.toUpperCase()}\nTimestamp: ${latestAlert.timestamp}\nRecommended action: Reset password, revoke unknown sessions, enable 2FA, and review linked devices immediately.`
    setReport(generated)
  }

  const copyReport = async () => {
    if (!report) return
    await navigator.clipboard.writeText(report)
  }

  return (
    <div className="space-y-6">
      <Card title="Connect Social Account" subtitle="Simulated account hardening workflow for MVP demo">
        <div className="grid gap-4 md:grid-cols-3">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="rounded-xl border border-purple-400/30 bg-slate-900 px-4 py-2.5 text-white outline-none"
          >
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
          </select>
          <input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="@account_handle"
            className="rounded-xl border border-purple-400/30 bg-slate-900 px-4 py-2.5 text-white outline-none placeholder:text-slate-500"
          />
          <Button onClick={startScan} disabled={scanning || !accountName.trim()}>
            {scanning ? 'Scanning Account Security...' : 'Connect Social Account'}
          </Button>
        </div>

        {scanning && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm text-slate-300">
              <span>Scanning Account Security...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </Card>

      {securityScore !== null && (
        <Card title="Security Score" subtitle="Simulated account risk posture">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
              <p className="text-4xl font-bold text-white">{securityScore}/100</p>
              <p className="mt-1 text-sm text-purple-200">{scoreBand}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900 p-4">
              <div className="mb-2 h-3 rounded-full bg-slate-800">
                <div className="h-3 rounded-full bg-gradient-to-r from-red-500 to-purple-500" style={{ width: `${securityScore}%` }} />
              </div>
              <p className="text-sm text-slate-300">Security score gauge</p>
            </div>
          </div>
        </Card>
      )}

      <Card title="Security Alerts" subtitle="Detected suspicious behavior patterns">
        {alerts.length === 0 ? (
          <p className="text-slate-400">No alerts yet. Connect an account to begin scanning.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`rounded-xl border p-4 ${severityClass(alert.severity)}`}>
                <p className="font-semibold">{alert.message}</p>
                <p className="mt-1 text-xs uppercase tracking-wide">Severity: {alert.severity}</p>
                <p className="mt-1 text-xs">{alert.timestamp}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={generateRecoveryReport} disabled={!latestAlert}>Generate Takedown / Recovery Request</Button>
          <Button variant="secondary" onClick={copyReport} disabled={!report}>Copy Report</Button>
        </div>

        {report && (
          <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">{report}</pre>
        )}
      </Card>
    </div>
  )
}
