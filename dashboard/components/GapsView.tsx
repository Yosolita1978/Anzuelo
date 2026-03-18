'use client'

import { useState, useEffect } from 'react'
import type { ContentOpportunity } from '@/lib/types'
import { useBrands } from '@/lib/useBrands'
import GapCard from './GapCard'

const STATUSES = [
  { value: '', label: 'New (default)' },
  { value: 'new', label: 'New' },
  { value: 'done', label: 'Done' },
  { value: 'dismissed', label: 'Dismissed' },
]

export default function GapsView() {
  const { brandOptions } = useBrands()
  const [brand, setBrand] = useState('')
  const [status, setStatus] = useState('')
  const [opportunities, setOpportunities] = useState<ContentOpportunity[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!brand) {
      setOpportunities([])
      return
    }

    const params = new URLSearchParams()
    params.set('brand', brand)
    if (status) params.set('status', status)

    setLoading(true)
    fetch(`/api/gaps?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setOpportunities(data)
        setLoading(false)
      })
      .catch(() => {
        setOpportunities([])
        setLoading(false)
      })
  }, [brand, status])

  function handleRemove(id: string) {
    setOpportunities((prev) => prev.filter((o) => o.id !== id))
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
            {brandOptions.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
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
            Select a brand to see content opportunities
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
              <div className="h-4 w-1/4 rounded bg-gray-200" />
              <div className="mt-3 h-3 w-full rounded bg-gray-200" />
              <div className="mt-2 h-3 w-3/4 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <p className="py-16 text-center text-sm" style={{ color: 'var(--muted)' }}>
          No content opportunities for this brand yet.
        </p>
      ) : (
        <>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {opportunities.length} opportunit{opportunities.length !== 1 ? 'ies' : 'y'}
          </p>
          <div className="flex flex-col gap-4">
            {opportunities.map((opp) => (
              <GapCard key={opp.id} opportunity={opp} onRemove={handleRemove} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
