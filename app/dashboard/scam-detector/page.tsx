'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useScamChecks } from '@/hooks/useScamChecks'
import { AlertIcon, CheckIcon, GraphIcon } from '@/components/ui/Icons'

interface AnalysisResult {
  result: 'safe' | 'suspicious' | 'scam'
  riskLevel: number
  matchedKeywords: string[]
  analysis: {
    description: string
  }
}

export default function ScamDetectorPage() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const { checks, loading: checksLoading, addCheck } = useScamChecks()

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      if (!message.trim()) {
        setError('Please enter a message to analyze')
        return
      }

      const response = await fetch('/api/scam-detector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Analysis failed')
      }

      const data: AnalysisResult = await response.json()
      setResult(data)
      await addCheck(message, data.result, data.riskLevel)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analyzing message')
    } finally {
      setLoading(false)
    }
  }

  const getResultColor = (analysisResult: string) => {
    if (analysisResult === 'scam') return 'border-rose-400/30 bg-rose-400/10 text-rose-300'
    if (analysisResult === 'suspicious') return 'border-amber-400/30 bg-amber-400/10 text-amber-300'
    return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
  }

  const getRiskBarColor = (riskLevel: number) => {
    if (riskLevel >= 70) return 'bg-rose-400'
    if (riskLevel >= 40) return 'bg-amber-400'
    return 'bg-emerald-400'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Scam Message Detector</h1>
        <p className="mt-2 text-slate-400">Analyze suspicious messages and receive an instant risk score.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-300"><AlertIcon className="h-4 w-4" /></span>
            <div>
              <p className="text-sm text-slate-400">Checks Performed</p>
              <p className="text-2xl font-bold text-white">{checks.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-300"><GraphIcon className="h-4 w-4" /></span>
            <div>
              <p className="text-sm text-slate-400">Latest Risk</p>
              <p className="text-2xl font-bold text-white">{result ? `${result.riskLevel}%` : '--'}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-300"><CheckIcon className="h-4 w-4" /></span>
            <div>
              <p className="text-sm text-slate-400">Current Status</p>
              <p className="text-2xl font-bold text-white">{result?.result ?? 'Ready'}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Analyze a Message" subtitle="Paste a suspicious message to check for scam indicators">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Message to Analyze</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste the suspicious message here..."
              rows={6}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
              maxLength={5000}
            />
            <p className="mt-1 text-xs text-slate-500">{message.length}/5000 characters</p>
          </div>

          {error && <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

          <Button type="submit" isLoading={loading} className="w-full">
            Analyze Message
          </Button>
        </form>
      </Card>

      {result && (
        <Card title="Analysis Result">
          <div className={`rounded-xl border p-6 ${getResultColor(result.result)}`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {result.result === 'scam'
                  ? 'Likely Scam'
                  : result.result === 'suspicious'
                  ? 'Suspicious Message'
                  : 'Appears Safe'}
              </h3>
              <span className="text-3xl font-bold">{result.riskLevel}%</span>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-sm font-medium">Risk Level</p>
              <div className="h-2 w-full rounded-full bg-slate-800">
                <div className={`h-2 rounded-full transition-all ${getRiskBarColor(result.riskLevel)}`} style={{ width: `${result.riskLevel}%` }} />
              </div>
            </div>

            <p className="mb-4 text-sm">{result.analysis.description}</p>

            {result.matchedKeywords.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">Detected Red Flags</p>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords.map((keyword) => (
                    <span key={keyword} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-200">
                      &quot;{keyword}&quot;
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card title="Recent Checks" subtitle={`You have analyzed ${checks.length} message(s)`}>
        {checksLoading ? (
          <LoadingSpinner />
        ) : checks.length === 0 ? (
          <p className="py-8 text-center text-slate-400">No messages analyzed yet. Start by analyzing one above.</p>
        ) : (
          <div className="space-y-3">
            {checks.slice(0, 10).map((check) => (
              <div key={check.id} className={`rounded-xl border p-4 ${getResultColor(check.result)}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold capitalize">{check.result}</span>
                  <span className="text-sm text-slate-300">{new Date(check.created_at).toLocaleDateString()}</span>
                </div>
                <p className="truncate text-sm text-slate-100">{check.message}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
