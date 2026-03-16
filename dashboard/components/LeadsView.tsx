'use client'

import { useState, useEffect } from 'react'
import type { Lead } from '@/lib/types'
import LeadCard from './LeadCard'

const BRANDS = [
  { value: '', label: 'Select brand...' },
  { value: 'picasyfijas', label: 'Picas y Fijas' },
  { value: 'fluentaspeech', label: 'Fluentaspeech' },
  { value: 'comadrelab', label: 'ComadreLab' },
]

const PLATFORMS = [
  { value: '', label: 'All platforms' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'hackernews', label: 'Hacker News' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'mastodon', label: 'Mastodon' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'threads', label: 'Threads' },
]

const STATUSES = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'replied', label: 'Replied' },
  { value: 'skipped', label: 'Skipped' },
]

export default function LeadsView() {
  const [brand, setBrand] = useState('')
  const [platform, setPlatform] = useState('')
  const [status, setStatus] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!brand) {
      setLeads([])
      return
    }

    const params = new URLSearchParams()
    params.set('brand', brand)
    if (platform) params.set('platform', platform)
    if (status) params.set('status', status)

    setLoading(true)
    fetch(`/api/leads?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setLeads(data)
        setLoading(false)
      })
      .catch(() => {
        setLeads([])
        setLoading(false)
      })
  }, [brand, platform, status])

  function handleRemove(id: string) {
    setLeads((prev) => prev.filter((lead) => lead.id !== id))
  }

  const selectClass = (active: boolean) =>
    `rounded-lg border px-3 py-2 pr-8 text-sm font-medium appearance-none ${
      active
        ? 'border-foreground bg-foreground text-surface'
        : 'border-border bg-surface text-foreground'
    }`

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Brand</label>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className={selectClass(!!brand)}>
            {BRANDS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={selectClass(!!platform)}>
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass(!!status)}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {!brand ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-20"
          style={{ borderColor: 'var(--border)' }}
        >
          <img src="/icon.png" alt="" className="h-12 w-12 opacity-40" />
          <p className="mt-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
            Select a brand to see your leads
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
              <div className="mt-3 h-3 w-full rounded bg-gray-200" />
              <div className="mt-2 h-3 w-2/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <p className="py-16 text-center text-sm" style={{ color: 'var(--muted)' }}>
          No leads match these filters.
        </p>
      ) : (
        <>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {leads.length} lead{leads.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-col gap-4">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onRemove={handleRemove} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
