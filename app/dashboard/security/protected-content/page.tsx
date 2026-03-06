import ProtectedContentModule from '@/components/contentProtection/ProtectedContentModule'

export default function SecurityProtectedContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Security - Protected Content</h1>
        <p className="mt-2 text-slate-300">Simulated internet misuse detection and takedown workflow.</p>
      </div>
      <ProtectedContentModule />
    </div>
  )
}
