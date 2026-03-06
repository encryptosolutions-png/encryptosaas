import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EnCrypto - Creator Security Platform',
  description: 'Protect social accounts, campaigns, and content from scams and impersonation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
