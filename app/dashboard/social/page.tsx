'use client'

import { useState } from 'react'
import { useSocialAccounts } from '@/hooks/useSocialAccounts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { LinkIcon, ShieldIcon, UserIcon } from '@/components/ui/Icons'

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'twitter', label: 'Twitter / X' },
]

export default function SocialAccountsPage() {
  const { accounts, loading, addAccount, removeAccount } = useSocialAccounts()
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    platform: 'instagram',
    username: '',
    followers: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    try {
      if (!formData.username.trim()) {
        setFormError('Username is required')
        return
      }

      await addAccount(
        formData.platform,
        formData.username,
        formData.followers ? parseInt(formData.followers, 10) : undefined,
      )

      setFormData({ platform: 'instagram', username: '', followers: '' })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error adding account')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (accountId: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      await removeAccount(accountId)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Social Accounts</h1>
        <p className="mt-2 text-slate-400">Connect and monitor all creator channels from one place.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="md:col-span-1">
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-300">
              <UserIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm text-slate-400">Connected Accounts</p>
              <p className="text-2xl font-bold text-white">{accounts.length}</p>
            </div>
          </div>
        </Card>
        <Card className="md:col-span-1">
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-300">
              <LinkIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm text-slate-400">Supported Platforms</p>
              <p className="text-2xl font-bold text-white">{PLATFORMS.length}</p>
            </div>
          </div>
        </Card>
        <Card className="md:col-span-1">
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-300">
              <ShieldIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm text-slate-400">Coverage Status</p>
              <p className="text-2xl font-bold text-white">{accounts.length > 0 ? 'Active' : 'Setup'}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Add New Account" subtitle="Connect your social media profiles for continuous monitoring">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

            <Input
              label="Username"
              placeholder="@your_username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />

            <Input
              label="Followers (Optional)"
              type="number"
              placeholder="10000"
              value={formData.followers}
              onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
            />
          </div>

          {formError && <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{formError}</div>}

          <Button type="submit" isLoading={formLoading} className="w-full">
            Connect Account
          </Button>
        </form>
      </Card>

      <Card title="Connected Accounts" subtitle={`You have ${accounts.length} account(s) connected`}>
        {accounts.length === 0 ? (
          <p className="py-8 text-center text-slate-400">No accounts connected yet. Add one above to get started.</p>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 p-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-100">{account.username}</p>
                  <p className="text-sm text-slate-400">
                    {PLATFORMS.find((p) => p.value === account.platform)?.label}
                    {account.followers ? ` � ${account.followers.toLocaleString()} followers` : ''}
                  </p>
                </div>
                <Button variant="danger" size="sm" onClick={() => handleDelete(account.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
