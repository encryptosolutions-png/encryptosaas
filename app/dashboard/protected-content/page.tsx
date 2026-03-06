'use client'

import { useState } from 'react'
import { useProtectedContent } from '@/hooks/useProtectedContent'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CheckIcon, LinkIcon, ShieldIcon } from '@/components/ui/Icons'

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'blog', label: 'Blog' },
  { value: 'other', label: 'Other' },
]

export default function ProtectedContentPage() {
  const { content, loading, addContent, removeContent } = useProtectedContent()
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    contentUrl: '',
    platform: 'instagram',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    try {
      if (!formData.contentUrl.trim()) {
        setFormError('URL is required')
        return
      }

      try {
        new URL(formData.contentUrl)
      } catch {
        setFormError('Please enter a valid URL')
        return
      }

      await addContent(formData.contentUrl, formData.platform)
      setFormData({ contentUrl: '', platform: 'instagram' })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error adding content')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (contentId: string) => {
    if (confirm('Are you sure you want to remove this protected content?')) {
      await removeContent(contentId)
    }
  }

  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return domain.replace('www.', '')
    } catch {
      return url
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Protected Content</h1>
        <p className="mt-2 text-slate-400">Track your content registry and protect your ownership footprint.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-300"><ShieldIcon className="h-4 w-4" /></span>
            <div>
              <p className="text-sm text-slate-400">Protected Items</p>
              <p className="text-2xl font-bold text-white">{content.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-300"><LinkIcon className="h-4 w-4" /></span>
            <div>
              <p className="text-sm text-slate-400">Platforms Tracked</p>
              <p className="text-2xl font-bold text-white">{new Set(content.map((item) => item.platform)).size}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-300"><CheckIcon className="h-4 w-4" /></span>
            <div>
              <p className="text-sm text-slate-400">Registry Status</p>
              <p className="text-2xl font-bold text-white">{content.length > 0 ? 'Synced' : 'Pending'}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Add Content" subtitle="Register a new piece of content for protection">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Content URL"
              type="url"
              placeholder="https://instagram.com/post/12345..."
              value={formData.contentUrl}
              onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Platform</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formError && <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{formError}</div>}

          <Button type="submit" isLoading={formLoading} className="w-full">
            Add to Protection List
          </Button>
        </form>
      </Card>

      <Card title="Your Protected Content" subtitle={`${content.length} content piece(s) protected`}>
        {content.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-lg text-slate-300">No protected content yet</p>
            <p className="text-slate-500">Start by adding content URLs above to build your protection library.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {content.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 p-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">{PLATFORMS.find((p) => p.value === item.platform)?.label}</span>
                    <span className="text-xs text-slate-500">{getDomainFromUrl(item.content_url)}</span>
                  </div>
                  <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-cyan-300 hover:text-cyan-200">
                    {item.content_url}
                  </a>
                  <p className="mt-1 text-xs text-slate-500">Added {new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)} className="ml-4 shrink-0">
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Protection Tips">
        <ul className="space-y-3 text-sm text-slate-300">
          <li className="flex gap-3"><span className="text-cyan-300">�</span> Register new content immediately after publishing.</li>
          <li className="flex gap-3"><span className="text-cyan-300">�</span> Use clear ownership metadata and archive original files.</li>
          <li className="flex gap-3"><span className="text-cyan-300">�</span> Track takedown status and escalation timelines.</li>
          <li className="flex gap-3"><span className="text-cyan-300">�</span> Review platform coverage weekly for gaps.</li>
        </ul>
      </Card>
    </div>
  )
}
