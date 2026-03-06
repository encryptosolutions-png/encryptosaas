import Link from 'next/link'
import { AlertIcon, GraphIcon, LinkIcon, ShieldIcon } from '@/components/ui/Icons'

const FEATURES = [
  {
    title: 'Account Protection & Risk Scoring',
    description:
      'Continuous monitoring of connected social accounts to detect suspicious logins, behavioral anomalies, and takeover attempts, with real-time alerts and dynamic vulnerability scoring.',
    icon: ShieldIcon,
  },
  {
    title: 'Abuse Detection & Assisted Takedowns',
    description:
      'AI-powered scanning of comments and uploaded DMs to identify harassment, hate speech, and policy violations, generating one-click takedown requests for platform submission.',
    icon: AlertIcon,
  },
  {
    title: 'Scam & Fake Collaboration Analyzer',
    description:
      'On-demand verification engine that classifies uploaded emails or DMs as legitimate, fraudulent, or impersonation-based using social engineering pattern analysis.',
    icon: GraphIcon,
  },
  {
    title: 'Content ID & Infringement Surveillance',
    description:
      'Unique Content ID generation with web-wide monitoring to detect unauthorized reposts, duplication, or IP misuse, along with automated takedown drafting.',
    icon: LinkIcon,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen text-slate-100">
      <nav className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="text-xl font-bold text-cyan-300">EnCrypto</div>
          <div className="space-x-3">
            <Link
              href="/login"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-cyan-300 hover:text-cyan-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-200"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 soft-grid opacity-25" />
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-bold leading-tight md:text-6xl">
            Indias First Cyber Security SaaS For Digital Creators
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300">
            EnCrypto helps creators and agencies detect scams, protect content, and respond faster with unified monitoring.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-cyan-300 px-7 py-3 font-semibold text-slate-900 hover:bg-cyan-200"
            >
              Launch Free Workspace
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-700 px-7 py-3 font-semibold text-slate-100 hover:border-cyan-300 hover:text-cyan-200"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Core Security Modules</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="glass-panel rounded-2xl p-6">
                  <div className="mb-4 inline-flex rounded-lg border border-fuchsia-300/30 bg-fuchsia-400/10 p-2 text-fuchsia-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-slate-300">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_35%),radial-gradient(circle_at_80%_30%,_rgba(244,63,94,0.2),_transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Pricing</p>
            <h2 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">Pick A Plan Built For Creator Growth</h2>
            <p className="text-lg text-slate-300">
              Start lean, scale with confidence, and protect every campaign with faster response and deeper monitoring.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/15 bg-white/5 p-7 backdrop-blur">
              <p className="mb-3 inline-flex rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">Basic</p>
              <h3 className="mb-2 text-3xl font-bold">Rs 799</h3>
              <p className="mb-6 text-sm text-slate-300">per month, billed monthly</p>
              <ul className="mb-8 space-y-3 text-slate-100">
                <li>Check suspicious links and DMs instantly</li>
                <li>Monitor up to 3 social profiles</li>
                <li>Protect 25 posts, reels, or videos</li>
                <li>Weekly safety score updates</li>
              </ul>
              <Link
                href="/signup"
                className="block rounded-xl border border-white/20 py-3 text-center font-semibold hover:border-cyan-300 hover:text-cyan-200"
              >
                Choose Starter
              </Link>
            </div>

            <div className="relative rounded-3xl border-2 border-cyan-300 bg-gradient-to-b from-cyan-400/20 to-slate-900 p-7 shadow-[0_0_35px_rgba(34,211,238,0.25)]">
              <p className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-cyan-300 px-4 py-1 text-xs font-bold uppercase tracking-wide text-slate-900">Most Chosen</p>
              <p className="mb-3 mt-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100">Creator +</p>
              <h3 className="mb-2 text-3xl font-bold">Rs 1,499</h3>
              <p className="mb-6 text-sm text-slate-200">per month, billed monthly</p>
              <ul className="mb-8 space-y-3 text-slate-100">
                <li>Everything in Starter</li>
                <li>Advanced scan with AI risk scoring</li>
                <li>Live creator threat dashboard</li>
                <li>Priority chat support</li>
                <li>Branded weekly incident reports</li>
              </ul>
              <Link href="/signup" className="block rounded-xl bg-cyan-300 py-3 text-center font-semibold text-slate-900 hover:bg-cyan-200">
                Start Growth Trial
              </Link>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/5 p-7 backdrop-blur">
              <p className="mb-3 inline-flex rounded-full bg-fuchsia-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-fuchsia-200">Elite</p>
              <h3 className="mb-2 text-3xl font-bold">Rs 2,499</h3>
              <p className="mb-6 text-sm text-slate-300">per month, billed monthly</p>
              <ul className="mb-8 space-y-3 text-slate-100">
                <li>Everything in Growth</li>
                <li>Unlimited account and campaign coverage</li>
                <li>Fast-track takedown support</li>
                <li>Dedicated success manager</li>
                <li>API and white-label reporting access</li>
              </ul>
              <Link
                href="/signup"
                className="block rounded-xl border border-white/20 py-3 text-center font-semibold hover:border-fuchsia-300 hover:text-fuchsia-200"
              >
                Talk To Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-400">
          Copyright 2026 EnCrypto. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
