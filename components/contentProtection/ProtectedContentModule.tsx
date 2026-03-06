'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const RESULT_POOL = [
  'No misuse detected',
  'Possible unauthorized repost detected',
  'Possible copyright infringement detected',
]

const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'X']

function randomResult() {
  return RESULT_POOL[Math.floor(Math.random() * RESULT_POOL.length)]
}

export default function ProtectedContentModule() {
  const [contentInput, setContentInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState('')
  const [misuseLink, setMisuseLink] = useState('')
  const [platformDetected, setPlatformDetected] = useState('')
  const [confidence, setConfidence] = useState<number | null>(null)
  const [report, setReport] = useState('')

  const runScan = () => {
    if (!contentInput.trim()) return

    setScanning(true)
    setProgress(0)
    setResult('')
    setReport('')

    const duration = 2500 + Math.floor(Math.random() * 2500)
    const start = Date.now()

    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const value = Math.min(100, Math.floor((elapsed / duration) * 100))
      setProgress(value)

      if (value >= 100) {
        clearInterval(timer)
        const simulated = randomResult()
        setResult(simulated)

        if (simulated !== 'No misuse detected') {
          const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)]
          const score = 65 + Math.floor(Math.random() * 30)
          setPlatformDetected(platform)
          setMisuseLink(`https://${platform.toLowerCase()}.com/suspected/post/${Math.floor(Math.random() * 100000)}`)
          setConfidence(score)
        } else {
          setPlatformDetected('')
          setMisuseLink('')
          setConfidence(30 + Math.floor(Math.random() * 20))
        }

        setScanning(false)
      }
    }, 100)
  }

  const generateTakedownReport = () => {
    if (!result || result === 'No misuse detected') return

    const text = `Original content: ${contentInput}\nDetected misuse link: ${misuseLink}\nTimestamp: ${new Date().toLocaleString()}\nConfidence: ${confidence}%\n\nCopyright claim:\nI am the original rights owner of the referenced content. This appears to be unauthorized usage and I request takedown review under applicable copyright policy.`

    setReport(text)
  }

  const copyReport = async () => {
    if (!report) return
    await navigator.clipboard.writeText(report)
  }

  return (
    <div className="space-y-6">
      <Card title="Protected Content Monitoring" subtitle="Track possible unauthorized reposts using simulated internet scan">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            placeholder="Enter content URL or content ID"
            className="flex-1 rounded-xl border border-purple-400/30 bg-slate-900 px-4 py-2.5 text-white outline-none placeholder:text-slate-500"
          />
          <Button onClick={runScan} disabled={scanning || !contentInput.trim()}>
            {scanning ? 'Scanning the Internet for unauthorized use...' : 'Start Monitoring Scan'}
          </Button>
        </div>

        {scanning && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm text-slate-300">
              <span>Scanning the Internet for unauthorized use...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-red-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </Card>

      {result && (
        <Card title="Scan Result" subtitle={result}>
          <div className="space-y-3 rounded-xl border border-white/10 bg-slate-900 p-4">
            <p className="text-white">Result: {result}</p>
            <p className="text-slate-300">Confidence: {confidence}%</p>
            {misuseLink && (
              <>
                <p className="text-slate-200">Platform detected: {platformDetected}</p>
                <p className="break-all text-purple-200">Suspected misuse URL: {misuseLink}</p>
              </>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={generateTakedownReport} disabled={!misuseLink}>Generate Copyright Takedown Request</Button>
            <Button variant="secondary" onClick={copyReport} disabled={!report}>Copy Request</Button>
          </div>

          {report && (
            <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">{report}</pre>
          )}
        </Card>
      )}
    </div>
  )
}
