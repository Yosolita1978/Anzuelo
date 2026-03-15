'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ContentOpportunity } from '@/lib/types'
import { BrandBadge, FormatBadge } from './StatusBadge'
import CopyButton from './CopyButton'

type GapCardProps = {
  opportunity: ContentOpportunity
  onRemove: (id: string) => void
}

export default function GapCard({ opportunity, onRemove }: GapCardProps) {
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  async function dismiss() {
    setUpdating(true)
    try {
      await fetch(`/api/gaps/${opportunity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' }),
      })
      onRemove(opportunity.id)
    } catch (err) {
      console.error('Failed to dismiss gap:', err)
      setUpdating(false)
    }
  }

  function openInStudio() {
    const params = new URLSearchParams()
    if (opportunity.suggested_content) params.set('topic', opportunity.suggested_content)
    params.set('brand', opportunity.brand)
    if (opportunity.suggested_format) params.set('format', opportunity.suggested_format)
    router.push(`/studio?${params.toString()}`)
  }

  return (
    <div
      className="card-animate rounded-xl border p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <BrandBadge brand={opportunity.brand} />
        {opportunity.suggested_format && (
          <FormatBadge format={opportunity.suggested_format} />
        )}
      </div>

      {opportunity.gap_summary && (
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
          <span className="font-semibold" style={{ color: 'var(--muted)' }}>Gap:</span>{' '}
          {opportunity.gap_summary}
        </p>
      )}

      {opportunity.suggested_content && (
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
          <span className="font-semibold" style={{ color: 'var(--muted)' }}>Suggested:</span>{' '}
          {opportunity.suggested_content}
        </p>
      )}

      {opportunity.source_platforms && opportunity.source_platforms.length > 0 && (
        <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
          Sources: {opportunity.source_platforms.join(', ')}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {opportunity.suggested_content && (
          <CopyButton text={opportunity.suggested_content} label="Copy" />
        )}
        <button
          onClick={openInStudio}
          className="filter-chip rounded-lg px-3.5 py-1.5 text-sm font-medium"
          style={{ background: '#dbeafe', color: '#1e40af' }}
        >
          Open in Studio
        </button>
        <button
          onClick={dismiss}
          disabled={updating}
          className="filter-chip rounded-lg px-3.5 py-1.5 text-sm font-medium disabled:opacity-40"
          style={{ background: '#fee2e2', color: '#991b1b' }}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
