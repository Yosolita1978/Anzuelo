'use client'

import { useState } from 'react'
import type { CalendarEntry } from '@/lib/types'
import { BrandBadge, PlatformBadge } from './StatusBadge'
import CopyButton from './CopyButton'

type CalendarGridProps = {
  entries: CalendarEntry[]
}

function getWeekLabel(dateStr: string | null): string {
  if (!dateStr) return 'Unscheduled'
  const date = new Date(dateStr)
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} — ${fmt(end)}`
}

function groupByWeek(entries: CalendarEntry[]): Map<string, CalendarEntry[]> {
  const groups = new Map<string, CalendarEntry[]>()
  for (const entry of entries) {
    const week = getWeekLabel(entry.scheduled_for)
    const existing = groups.get(week) || []
    existing.push(entry)
    groups.set(week, existing)
  }
  return groups
}

export default function CalendarGrid({ entries: initial }: CalendarGridProps) {
  const [entries, setEntries] = useState(initial)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function updateStatus(id: string, status: 'posted' | 'skipped') {
    const response = await fetch('/api/calendar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })

    if (response.ok) {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      )
    }
  }

  if (entries.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">
        No content scheduled yet. Generate content in the Studio and save it here.
      </p>
    )
  }

  const groups = groupByWeek(entries)

  return (
    <div className="flex flex-col gap-8">
      {Array.from(groups.entries()).map(([week, weekEntries]) => (
        <div key={week}>
          <h2 className="mb-3 text-sm font-semibold text-gray-500">{week}</h2>
          <div className="flex flex-col gap-3">
            {weekEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <BrandBadge brand={entry.brand} />
                  <PlatformBadge platform={entry.platform} />
                  {entry.content_type && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {entry.content_type.replace('_', ' ')}
                    </span>
                  )}
                  {entry.scheduled_for && (
                    <span className="ml-auto text-xs text-gray-400">
                      {new Date(entry.scheduled_for).toLocaleDateString()}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      entry.status === 'posted'
                        ? 'bg-green-100 text-green-800'
                        : entry.status === 'skipped'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {entry.content.length > 80 && !expandedIds.has(entry.id)
                      ? entry.content.slice(0, 80) + '...'
                      : entry.content}
                  </p>
                  {entry.content.length > 80 && (
                    <button
                      onClick={() => toggleExpand(entry.id)}
                      className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      {expandedIds.has(entry.id) ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>

                {entry.status === 'draft' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CopyButton text={entry.content} label="📋 Copy" />
                    <button
                      onClick={() => updateStatus(entry.id, 'posted')}
                      className="rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-200"
                    >
                      ✓ Mark posted
                    </button>
                    <button
                      onClick={() => updateStatus(entry.id, 'skipped')}
                      className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-200"
                    >
                      ✕ Skip
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
