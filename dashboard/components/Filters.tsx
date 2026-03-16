'use client'

import { useRouter, useSearchParams } from 'next/navigation'

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

function FilterSelect({
  label,
  options,
  current,
  paramName,
}: {
  label: string
  options: { value: string; label: string }[]
  current: string
  paramName: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value) {
      params.delete(paramName)
    } else {
      params.set(paramName, value)
    }
    router.push(`?${params.toString()}`)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
        {label}
      </label>
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className={`rounded-lg border px-3 py-2 pr-8 text-sm font-medium appearance-none ${
          current
            ? 'border-foreground bg-foreground text-surface'
            : 'border-border bg-surface text-foreground'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function Filters() {
  const searchParams = useSearchParams()
  const brand = searchParams.get('brand') || ''
  const platform = searchParams.get('platform') || ''
  const status = searchParams.get('status') || ''

  return (
    <div className="flex flex-wrap gap-3">
      <FilterSelect label="Brand" options={BRANDS} current={brand} paramName="brand" />
      <FilterSelect label="Platform" options={PLATFORMS} current={platform} paramName="platform" />
      <FilterSelect label="Status" options={STATUSES} current={status} paramName="status" />
    </div>
  )
}
