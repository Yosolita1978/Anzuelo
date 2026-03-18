'use client'

import { useState } from 'react'
import type { Lead } from '@/lib/types'
import { BrandBadge, PlatformBadge, ScoreDot } from './StatusBadge'
import CopyButton from './CopyButton'

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

type LeadCardProps = {
  lead: Lead
  onRemove: (id: string) => void
}

export default function LeadCard({ lead, onRemove }: LeadCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)

  const contentPreview = lead.content && lead.content.length > 300 && !expanded
    ? lead.content.slice(0, 300) + '...'
    : lead.content

  async function updateStatus(status: 'replied' | 'skipped', ignoreAuthor = false) {
    setUpdating(true)
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ignore_author: ignoreAuthor }),
      })
      onRemove(lead.id)
    } catch (err) {
      console.error('Failed to update lead status:', err)
      setUpdating(false)
    }
  }

  return (
    <div
      className="card-animate rounded-xl border p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ScoreDot score={lead.score} />
          <PlatformBadge platform={lead.platform} />
          <BrandBadge brand={lead.brand} />
        </div>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {timeAgo(lead.found_at)}
        </span>
      </div>

      {lead.author && (
        <p className="mt-3 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          @{lead.author}
        </p>
      )}

      {lead.content && (
        <div
          className="mt-2 cursor-pointer rounded-lg p-3 text-sm leading-relaxed"
          style={{ background: 'var(--background)', color: 'var(--foreground)' }}
          onClick={() => setExpanded(!expanded)}
        >
          {contentPreview}
          {lead.content.length > 300 && !expanded && (
            <span className="ml-1 text-xs" style={{ color: 'var(--accent)' }}>
              show more
            </span>
          )}
        </div>
      )}

      {lead.score_reason && (
        <p className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
          <span className="font-semibold">Why:</span> {lead.score_reason}
        </p>
      )}

      {lead.suggested_reply && (
        <div
          className="mt-3 rounded-lg border p-3"
          style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
        >
          <p className="mb-1.5 text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            Suggested reply
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
            {lead.suggested_reply}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {lead.suggested_reply && (
          <CopyButton text={lead.suggested_reply} label="Copy reply" />
        )}
        {lead.url && (
          <a
            href={lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className="filter-chip rounded-lg border px-3.5 py-1.5 text-sm font-medium"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--surface)' }}
          >
            Open post
          </a>
        )}
        <button
          onClick={() => updateStatus('replied')}
          disabled={updating}
          className="filter-chip rounded-lg px-3.5 py-1.5 text-sm font-medium disabled:opacity-40"
          style={{ background: '#dcfce7', color: '#166534' }}
        >
          Replied
        </button>
        <button
          onClick={() => updateStatus('skipped')}
          disabled={updating}
          className="filter-chip rounded-lg px-3.5 py-1.5 text-sm font-medium disabled:opacity-40"
          style={{ background: '#fee2e2', color: '#991b1b' }}
        >
          Skip
        </button>
        {lead.author && (
          <button
            onClick={() => updateStatus('skipped', true)}
            disabled={updating}
            className="filter-chip rounded-lg px-3.5 py-1.5 text-sm font-medium disabled:opacity-40"
            style={{ background: '#fecaca', color: '#7f1d1d' }}
            title={`Skip and never show leads from @${lead.author} again`}
          >
            Skip &amp; Ignore @{lead.author}
          </button>
        )}
      </div>
    </div>
  )
}
