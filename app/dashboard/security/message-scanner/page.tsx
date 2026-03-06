import MessageScannerModule from '@/components/messageScanner/MessageScannerModule'

export default function MessageScannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Security - Message Scanner</h1>
        <p className="mt-2 text-slate-300">Simulated scam, abuse, and phishing classification workflow.</p>
      </div>
      <MessageScannerModule />
    </div>
  )
}
