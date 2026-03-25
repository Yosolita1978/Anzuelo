'use client'

import { useState, useEffect } from 'react'
import type { Lead } from '@/lib/types'
import { useBrands } from '@/lib/useBrands'
import LeadCard from './LeadCard'

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

const SCORES = [
  { value: '', label: 'All scores' },
  { value: '9-10', label: '9-10 Strong' },
  { value: '7-8', label: '7-8 Good' },
  { value: '5-6', label: '5-6 Weak' },
]

export default function LeadsView() {
  const { brandOptions } = useBrands()
  const [brand, setBrand] = useState('')
  const [platform, setPlatform] = useState('')
  const [status, setStatus] = useState('')
  const [scoreRange, setScoreRange] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [showCleanup, setShowCleanup] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ days: number; label: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteResult, setDeleteResult] = useState<string | null>(null)
  const [refetchKey, setRefetchKey] = useState(0)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchSkipping, setBatchSkipping] = useState(false)

  useEffect(() => {
    if (!brand) {
      setLeads([])
      return
    }

    const params = new URLSearchParams()
    params.set('brand', brand)
    if (platform) params.set('platform', platform)
    if (status) params.set('status', status)
    if (scoreRange) {
      const [min, max] = scoreRange.split('-')
      params.set('min_score', min)
      params.set('max_score', max)
    }

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
  }, [brand, platform, status, scoreRange, refetchKey])

  function handleRemove(id: string) {
    setLeads((prev) => prev.filter((lead) => lead.id !== id))
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)))
    }
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  async function handleBatchSkip() {
    if (selectedIds.size === 0) return
    setBatchSkipping(true)
    try {
      const res = await fetch('/api/leads/batch-skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)))
        exitSelectMode()
      }
    } catch (err) {
      console.error('Batch skip failed:', err)
    } finally {
      setBatchSkipping(false)
    }
  }

  function handleBatchDelete(days: number) {
    if (!brand) return
    setDeleting(true)
    setDeleteResult(null)
    const params = new URLSearchParams()
    params.set('brand', brand)
    params.set('older_than_days', String(days))
    params.set('status', 'skipped')

    fetch(`/api/leads?${params.toString()}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then((data) => {
        setDeleteResult(`Deleted ${data.deleted} skipped lead${data.deleted !== 1 ? 's' : ''}`)
        setConfirmDelete(null)
        setDeleting(false)
        setRefetchKey((k) => k + 1)
        setTimeout(() => setDeleteResult(null), 4000)
      })
      .catch(() => {
        setDeleteResult('Error deleting leads')
        setDeleting(false)
      })
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
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Score</label>
          <select value={scoreRange} onChange={(e) => setScoreRange(e.target.value)} className={selectClass(!!scoreRange)}>
            {SCORES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {brand && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCleanup(!showCleanup)}
            className="text-xs font-medium underline"
            style={{ color: 'var(--muted)' }}
          >
            {showCleanup ? 'Hide cleanup' : 'Clean up old leads'}
          </button>
          {deleteResult && (
            <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{deleteResult}</span>
          )}
        </div>
      )}

      {brand && showCleanup && (
        <div
          className="flex flex-wrap items-center gap-3 rounded-xl border p-4"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            Delete skipped leads older than:
          </span>
          {[
            { days: 7, label: '1 week' },
            { days: 14, label: '2 weeks' },
            { days: 30, label: '1 month' },
          ].map((opt) => (
            <button
              key={opt.days}
              onClick={() => setConfirmDelete(opt)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:border-red-400 hover:text-red-600"
              style={{ borderColor: 'var(--border)' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div
          className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-4"
        >
          <span className="text-sm">
            Delete all <strong>skipped</strong> leads older than <strong>{confirmDelete.label}</strong> for this brand?
          </span>
          <button
            onClick={() => handleBatchDelete(confirmDelete.days)}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Yes, delete'}
          </button>
          <button
            onClick={() => setConfirmDelete(null)}
            className="text-xs font-medium underline"
            style={{ color: 'var(--muted)' }}
          >
            Cancel
          </button>
        </div>
      )}

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
          <div className="flex items-center gap-3">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {leads.length} lead{leads.length !== 1 ? 's' : ''}
            </p>
            {!selectMode ? (
              <button
                onClick={() => setSelectMode(true)}
                className="rounded-lg border px-3 py-1 text-xs font-medium transition-colors hover:border-blue-400 hover:text-blue-600"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                Select
              </button>
            ) : (
              <>
                <button
                  onClick={toggleSelectAll}
                  className="rounded-lg border px-3 py-1 text-xs font-medium transition-colors hover:border-blue-400 hover:text-blue-600"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  {selectedIds.size === leads.length ? 'Deselect all' : 'Select all'}
                </button>
                <button
                  onClick={exitSelectMode}
                  className="text-xs font-medium underline"
                  style={{ color: 'var(--muted)' }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onRemove={handleRemove}
                selectMode={selectMode}
                selected={selectedIds.has(lead.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
          {selectMode && selectedIds.size > 0 && (
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={handleBatchSkip}
                  disabled={batchSkipping}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: '#991b1b' }}
                >
                  {batchSkipping ? 'Skipping...' : 'Skip all'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
