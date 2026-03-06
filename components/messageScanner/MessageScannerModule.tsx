'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type Classification = 'SAFE' | 'SUSPICIOUS' | 'SCAM' | 'HATE SPEECH' | 'PHISHING ATTEMPT'

const CLASSIFICATIONS: Classification[] = ['SAFE', 'SUSPICIOUS', 'SCAM', 'HATE SPEECH', 'PHISHING ATTEMPT']

const EXPLANATIONS: Record<Classification, string> = {
  SAFE: 'No high-risk abuse or fraud patterns were detected in this message.',
  SUSPICIOUS: 'The message includes unusual intent and pressure language that requires caution.',
  SCAM: 'This message contains patterns commonly used in scam attempts.',
  'HATE SPEECH': 'Detected abusive or hateful language indicators that may violate platform policy.',
  'PHISHING ATTEMPT': 'Detected social-engineering patterns asking for credentials or sensitive data.',
}

function classifyMessage(input: string): Classification {
  const text = input.toLowerCase()

  if (/otp|password|verify your account|click here|urgent action/.test(text)) return 'PHISHING ATTEMPT'
  if (/hate|slur|kill|abuse|harass/.test(text)) return 'HATE SPEECH'
  if (/send money|investment guaranteed|crypto doubling|lottery/.test(text)) return 'SCAM'
  if (/suspicious|strange|unknown/.test(text)) return 'SUSPICIOUS'

  return CLASSIFICATIONS[Math.floor(Math.random() * CLASSIFICATIONS.length)]
}

export default function MessageScannerModule() {
  const [message, setMessage] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Classification | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [report, setReport] = useState('')

  const explanation = useMemo(() => (result ? EXPLANATIONS[result] : ''), [result])

  const analyze = () => {
    if (!message.trim()) return

    setAnalyzing(true)
    setProgress(0)
    setReport('')

    const duration = 2200 + Math.floor(Math.random() * 2500)
    const start = Date.now()

    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const value = Math.min(100, Math.floor((elapsed / duration) * 100))
      setProgress(value)

      if (value >= 100) {
        clearInterval(timer)
        const cls = classifyMessage(message)
        const conf = cls === 'SAFE' ? 65 + Math.floor(Math.random() * 25) : 75 + Math.floor(Math.random() * 23)
        setResult(cls)
        setConfidence(conf)
        setAnalyzing(false)
      }
    }, 110)
  }

  const generateAbuseReport = () => {
    if (!result || confidence === null) return

    const text = `Message text: ${message}\nDetection result: ${result}\nConfidence: ${confidence}%\nTimestamp: ${new Date().toLocaleString()}\nRecommended action: ${result === 'SAFE' ? 'No immediate escalation required.' : 'Escalate for moderation and user protection workflow.'}`
    setReport(text)
  }

  const copyReport = async () => {
    if (!report) return
    await navigator.clipboard.writeText(report)
  }

  return (
    <div className="space-y-6">
      <Card title="Scam / Hate Message Detection" subtitle="Analyze suspicious comments and DMs with realistic simulated output">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Paste suspicious message here"
          className="w-full rounded-xl border border-purple-400/30 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={analyze} disabled={analyzing || !message.trim()}>
            {analyzing ? 'Analyzing message...' : 'Analyze Message'}
          </Button>
        </div>

        {analyzing && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm text-slate-300">
              <span>Analyzing message...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </Card>

      {result && confidence !== null && (
        <Card title="Detection Result" subtitle={result}>
          <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900 p-4">
            <p className="text-white">Result: {result}</p>
            <p className="text-slate-300">Confidence: {confidence}%</p>
            <p className="text-slate-300">{explanation}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={generateAbuseReport}>Generate Abuse Report</Button>
            <Button variant="secondary" onClick={copyReport} disabled={!report}>Copy Report</Button>
          </div>

          {report && (
            <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">{report}</pre>
          )}
        </Card>
      )}
    </div>
  )
}
