'use client'

import { useState, useEffect, useRef } from 'react'

const BRANDS = [
  { value: '', label: 'Select brand...' },
  { value: 'picasyfijas', label: 'Picas y Fijas' },
  { value: 'fluentaspeech', label: 'Fluentaspeech' },
  { value: 'comadrelab', label: 'ComadreLab' },
]

const PLAUSIBLE_LINKS: Record<string, string> = {
  picasyfijas: 'https://plausible.io/share/picasyfijas.com?auth=YAafqoFzHUj5ejoRtomWm',
  fluentaspeech: 'https://plausible.io/share/fluentaspeech.com?auth=f5SNg1FO936U9l7x-Wrb1',
  comadrelab: 'https://plausible.io/share/comadrelab.dev?auth=BkkiJFEUSELsrQ1ccWFLu',
}

type Stats = {
  summary: { total: number; replied: number; skipped: number; new: number; replyRate: number }
  byPlatform: Record<string, number>
  byScore: Record<string, number>
  dailyCounts: Record<string, number>
  gaps: { total: number; done: number }
  calendar: { total: number; posted: number }
}

export default function StatsView() {
  const [brand, setBrand] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!brand) {
      setStats(null)
      return
    }

    setLoading(true)
    fetch(`/api/stats?brand=${brand}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => {
        setStats(null)
        setLoading(false)
      })
  }, [brand])

  const selectClass = (active: boolean) =>
    `rounded-lg border px-3 py-2 pr-8 text-sm font-medium appearance-none ${
      active
        ? 'border-foreground bg-foreground text-surface'
        : 'border-border bg-surface text-foreground'
    }`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Brand</label>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className={selectClass(!!brand)}>
          {BRANDS.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
      </div>

      {!brand ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-20"
          style={{ borderColor: 'var(--border)' }}
        >
          <img src="/icon.png" alt="" className="h-12 w-12 opacity-40" />
          <p className="mt-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Select a brand to see stats
          </p>
        </div>
      ) : loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border p-5"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="mt-3 h-8 w-1/4 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="flex flex-col gap-6">
          <SummaryCards summary={stats.summary} gaps={stats.gaps} calendar={stats.calendar} />
          <PlatformBreakdown byPlatform={stats.byPlatform} total={stats.summary.total} />
          <DailyChart dailyCounts={stats.dailyCounts} />
          <ScoreDistribution byScore={stats.byScore} />
          <PlausibleEmbed brand={brand} />
        </div>
      ) : null}
    </div>
  )
}

function SummaryCards({
  summary,
  gaps,
  calendar,
}: {
  summary: Stats['summary']
  gaps: Stats['gaps']
  calendar: Stats['calendar']
}) {
  const cards = [
    { label: 'Total leads', value: summary.total, color: 'var(--foreground)' },
    { label: 'Replied', value: summary.replied, color: '#16a34a' },
    { label: 'Skipped', value: summary.skipped, color: '#dc2626' },
    { label: 'New', value: summary.new, color: '#ca8a04' },
    { label: 'Reply rate', value: `${summary.replyRate}%`, color: 'var(--accent)' },
    { label: 'Gaps found', value: gaps.total, color: 'var(--foreground)' },
    { label: 'Gaps actioned', value: gaps.done, color: '#16a34a' },
    { label: 'Content posted', value: calendar.posted, color: '#2563eb' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="card-animate rounded-xl border p-4"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{card.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: card.color }}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}

function PlatformBreakdown({
  byPlatform,
  total,
}: {
  byPlatform: Record<string, number>
  total: number
}) {
  const PLATFORM_COLORS: Record<string, string> = {
    reddit: '#c2410c',
    hackernews: '#b45309',
    bluesky: '#0284c7',
    mastodon: '#4f46e5',
    youtube: '#dc2626',
    linkedin: '#1d4ed8',
    threads: '#78716c',
  }

  const sorted = Object.entries(byPlatform).sort((a, b) => b[1] - a[1])
  const max = sorted.length > 0 ? sorted[0][1] : 1

  if (sorted.length === 0) return null

  return (
    <div
      className="card-animate rounded-xl border p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Leads by platform</p>
      <div className="mt-4 flex flex-col gap-3">
        {sorted.map(([platform, count]) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          const barWidth = Math.max((count / max) * 100, 4)
          const color = PLATFORM_COLORS[platform] || '#78716c'
          return (
            <div key={platform} className="flex items-center gap-3">
              <span className="w-24 text-xs font-medium" style={{ color: 'var(--muted)' }}>
                {platform}
              </span>
              <div className="flex-1">
                <div
                  className="h-5 rounded"
                  style={{ width: `${barWidth}%`, background: color, opacity: 0.8 }}
                />
              </div>
              <span className="w-16 text-right text-xs font-semibold tabular-nums" style={{ color }}>
                {count} ({pct}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DailyChart({ dailyCounts }: { dailyCounts: Record<string, number> }) {
  const entries = Object.entries(dailyCounts)
  const max = Math.max(...entries.map(([, v]) => v), 1)

  return (
    <div
      className="card-animate rounded-xl border p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Leads per day (last 14 days)</p>
      <div className="mt-4 flex items-end gap-1" style={{ height: 120 }}>
        {entries.map(([date, count]) => {
          const barHeight = Math.max((count / max) * 100, 2)
          const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'narrow' })
          return (
            <div key={date} className="flex flex-1 flex-col items-center gap-1">
              <span
                className="text-xs tabular-nums font-medium"
                style={{ color: count > 0 ? 'var(--foreground)' : 'var(--muted)', fontSize: 10 }}
              >
                {count > 0 ? count : ''}
              </span>
              <div
                className="w-full rounded-sm"
                style={{
                  height: `${barHeight}%`,
                  background: count > 0 ? 'var(--accent)' : 'var(--border)',
                  minHeight: 2,
                }}
              />
              <span className="text-xs" style={{ color: 'var(--muted)', fontSize: 10 }}>
                {dayLabel}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PlausibleEmbed({ brand }: { brand: string }) {
  const plausibleUrl = PLAUSIBLE_LINKS[brand]
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!plausibleUrl || !containerRef.current) return

    const embedUrl = plausibleUrl + '&embed=true&theme=dark'

    // Inject the raw HTML that Plausible expects
    containerRef.current.innerHTML = `
      <iframe
        plausible-embed
        src="${embedUrl}"
        scrolling="no"
        frameborder="0"
        loading="lazy"
        style="width: 1px; min-width: 100%; height: 1600px; color-scheme: auto;"
      ></iframe>
    `

    // Remove old script and re-add with cache bust so it re-scans for the new iframe
    const oldScript = document.querySelector('script[data-plausible-embed]')
    if (oldScript) oldScript.remove()

    const script = document.createElement('script')
    script.src = `https://plausible.io/js/embed.host.js?v=${Date.now()}`
    script.async = true
    script.setAttribute('data-plausible-embed', 'true')
    document.body.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      const s = document.querySelector('script[data-plausible-embed]')
      if (s) s.remove()
    }
  }, [plausibleUrl])

  if (!plausibleUrl) {
    return (
      <div
        className="card-animate rounded-xl border-2 border-dashed p-8 text-center"
        style={{ borderColor: 'var(--border)' }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
          No site analytics configured for this brand yet.
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
          Add a Plausible shared link to enable traffic tracking.
        </p>
      </div>
    )
  }

  return (
    <div
      className="card-animate rounded-xl border p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Site traffic</p>
      <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
        Are leads driving visits? Compare lead activity above with site traffic below.
      </p>
      <div className="mt-4 overflow-hidden rounded-lg" ref={containerRef} />
    </div>
  )
}

function ScoreDistribution({ byScore }: { byScore: Record<string, number> }) {
  const SCORE_COLORS: Record<number, string> = {
    5: '#ca8a04',
    6: '#ca8a04',
    7: '#ea580c',
    8: '#ea580c',
    9: '#dc2626',
    10: '#dc2626',
  }

  const scores = [5, 6, 7, 8, 9, 10]
  const max = Math.max(...scores.map((s) => byScore[s] || 0), 1)

  const hasData = scores.some((s) => (byScore[s] || 0) > 0)
  if (!hasData) return null

  return (
    <div
      className="card-animate rounded-xl border p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Score distribution</p>
      <div className="mt-4 flex items-end gap-2" style={{ height: 100 }}>
        {scores.map((score) => {
          const count = byScore[score] || 0
          const barHeight = Math.max((count / max) * 100, 2)
          const color = SCORE_COLORS[score] || '#78716c'
          return (
            <div key={score} className="flex flex-1 flex-col items-center gap-1">
              <span
                className="text-xs font-medium tabular-nums"
                style={{ color: count > 0 ? color : 'var(--muted)', fontSize: 10 }}
              >
                {count > 0 ? count : ''}
              </span>
              <div
                className="w-full rounded-sm"
                style={{
                  height: `${barHeight}%`,
                  background: count > 0 ? color : 'var(--border)',
                  opacity: 0.8,
                  minHeight: 2,
                }}
              />
              <span className="text-xs font-semibold" style={{ color, fontSize: 11 }}>
                {score}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
