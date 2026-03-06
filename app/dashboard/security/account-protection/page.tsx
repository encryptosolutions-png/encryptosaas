import AccountProtectionModule from '@/components/accountProtection/AccountProtectionModule'

export default function AccountProtectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Security - Account Protection</h1>
        <p className="mt-2 text-slate-300">Simulated workflow for social account safety monitoring.</p>
      </div>
      <AccountProtectionModule />
    </div>
  )
}
