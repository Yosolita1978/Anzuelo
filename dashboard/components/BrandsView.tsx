'use client'

import { useState, useEffect } from 'react'
import { useBrands } from '@/lib/useBrands'
import type { BrandConfig } from '@/lib/types'

const EMPTY_FORM = {
  slug: '',
  display_name: '',
  color_bg: '#f5f5f4',
  color_fg: '#78716c',
  description: '',
  scoring_prompt: '',
  website_url: '',
  plausible_link: '',
}

const PLATFORMS = [
  { value: 'reddit', label: 'Reddit', configKey: 'queries' },
  { value: 'hackernews', label: 'Hacker News', configKey: 'keywords' },
  { value: 'bluesky', label: 'Bluesky', configKey: 'hashtags' },
  { value: 'mastodon', label: 'Mastodon', configKey: 'hashtags' },
  { value: 'youtube', label: 'YouTube', configKey: 'queries' },
  { value: 'threads', label: 'Threads', configKey: 'queries' },
  { value: 'linkedin', label: 'LinkedIn', configKey: 'queries' },
]

type SearchRow = {
  id?: string
  brand_slug: string
  platform: string
  config_key: string
  terms: string[]
}

export default function BrandsView() {
  const { brands, loading, refresh } = useBrands()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BrandConfig | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null)

  function handleNew() {
    setForm(EMPTY_FORM)
    setEditing(null)
    setShowForm(true)
    setError(null)
  }

  function handleEdit(brand: BrandConfig) {
    setForm({
      slug: brand.slug,
      display_name: brand.display_name,
      color_bg: brand.color_bg,
      color_fg: brand.color_fg,
      description: brand.description || '',
      scoring_prompt: brand.scoring_prompt || '',
      website_url: brand.website_url || '',
      plausible_link: brand.plausible_link || '',
    })
    setEditing(brand)
    setShowForm(true)
    setError(null)
  }

  async function handleSave() {
    if (!form.slug.trim() || !form.display_name.trim()) {
      setError('Slug and display name are required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const url = '/api/brands'
      const method = editing ? 'PATCH' : 'POST'
      const body = editing ? { id: editing.id, ...form } : form

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to save')
        setSaving(false)
        return
      }

      setShowForm(false)
      setEditing(null)
      setSaving(false)
      refresh()
    } catch {
      setError('Failed to save brand')
      setSaving(false)
    }
  }

  async function handleDelete(brand: BrandConfig) {
    if (!confirm(`Deactivate "${brand.display_name}"? It won't appear in dropdowns anymore.`)) return

    await fetch(`/api/brands?id=${brand.id}`, { method: 'DELETE' })
    refresh()
  }

  const inputClass =
    'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:border-gray-500'

  if (loading) {
    return <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading brands...</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={handleNew}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-surface"
        >
          Add brand
        </button>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {brands.length} active brand{brands.length !== 1 ? 's' : ''}
        </span>
      </div>

      {showForm && (
        <div
          className="rounded-xl border p-5 flex flex-col gap-4"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <h2 className="text-sm font-semibold">
            {editing ? `Edit: ${editing.display_name}` : 'New brand'}
          </h2>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
                Slug (lowercase, no spaces)
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                disabled={!!editing}
                className={inputClass}
                style={{ borderColor: 'var(--border)' }}
                placeholder="mybrand"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
                Display name
              </label>
              <input
                type="text"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                className={inputClass}
                style={{ borderColor: 'var(--border)' }}
                placeholder="My Brand"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
                Badge background color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color_bg}
                  onChange={(e) => setForm({ ...form, color_bg: e.target.value })}
                  className="h-9 w-9 cursor-pointer rounded border-0"
                />
                <input
                  type="text"
                  value={form.color_bg}
                  onChange={(e) => setForm({ ...form, color_bg: e.target.value })}
                  className={inputClass}
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
                Badge text color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color_fg}
                  onChange={(e) => setForm({ ...form, color_fg: e.target.value })}
                  className="h-9 w-9 cursor-pointer rounded border-0"
                />
                <input
                  type="text"
                  value={form.color_fg}
                  onChange={(e) => setForm({ ...form, color_fg: e.target.value })}
                  className={inputClass}
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
                Website URL
              </label>
              <input
                type="text"
                value={form.website_url}
                onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                className={inputClass}
                style={{ borderColor: 'var(--border)' }}
                placeholder="https://mybrand.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
                Plausible shared link (optional)
              </label>
              <input
                type="text"
                value={form.plausible_link}
                onChange={(e) => setForm({ ...form, plausible_link: e.target.value })}
                className={inputClass}
                style={{ borderColor: 'var(--border)' }}
                placeholder="https://plausible.io/share/..."
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
              Description (short, for your reference)
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              style={{ borderColor: 'var(--border)' }}
              placeholder="What does this brand/product do?"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--muted)' }}>
              Scoring prompt (used by the AI agent to evaluate leads)
            </label>
            <textarea
              value={form.scoring_prompt}
              onChange={(e) => setForm({ ...form, scoring_prompt: e.target.value })}
              rows={8}
              className={inputClass}
              style={{ borderColor: 'var(--border)' }}
              placeholder="You are evaluating whether a social media post represents a potential lead for..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
            >
              {saving ? 'Saving...' : editing ? 'Update brand' : 'Create brand'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditing(null) }}
              className="rounded-lg border px-4 py-2 text-sm font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="card-animate rounded-xl border"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <span
                  className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: brand.color_bg, color: brand.color_fg }}
                >
                  {brand.display_name}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {brand.slug}
                </span>
                {brand.description && (
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    — {brand.description}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpandedBrand(expandedBrand === brand.slug ? null : brand.slug)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  {expandedBrand === brand.slug ? 'Hide searches' : 'Searches'}
                </button>
                <button
                  onClick={() => handleEdit(brand)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(brand)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:border-red-400 hover:text-red-600"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  Deactivate
                </button>
              </div>
            </div>

            {expandedBrand === brand.slug && (
              <SearchConfigEditor brandSlug={brand.slug} />
            )}
          </div>
        ))}
      </div>

      <RunAgentSection />
    </div>
  )
}

function SearchConfigEditor({ brandSlug }: { brandSlug: string }) {
  const [searches, setSearches] = useState<SearchRow[]>([])
  const [loading, setLoading] = useState(true)
  const [savingPlatform, setSavingPlatform] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/brands/searches?brand_slug=${brandSlug}`)
      .then((res) => res.json())
      .then((data) => {
        setSearches(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [brandSlug])

  function getTermsForPlatform(platform: string): string {
    const row = searches.find((s) => s.platform === platform)
    return row ? row.terms.join('\n') : ''
  }

  function getIdForPlatform(platform: string): string | undefined {
    return searches.find((s) => s.platform === platform)?.id
  }

  async function handleSavePlatform(platform: string, configKey: string, termsText: string) {
    const terms = termsText
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    setSavingPlatform(platform)

    if (terms.length === 0) {
      const existingId = getIdForPlatform(platform)
      if (existingId) {
        await fetch(`/api/brands/searches?id=${existingId}`, { method: 'DELETE' })
        setSearches((prev) => prev.filter((s) => s.platform !== platform))
      }
      setSavingPlatform(null)
      return
    }

    const res = await fetch('/api/brands/searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand_slug: brandSlug,
        platform,
        config_key: configKey,
        terms,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setSearches((prev) => {
        const filtered = prev.filter((s) => s.platform !== platform)
        return [...filtered, data]
      })
    }

    setSavingPlatform(null)
  }

  if (loading) {
    return (
      <div className="border-t px-5 py-4" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>Loading search config...</p>
      </div>
    )
  }

  return (
    <div className="border-t px-5 py-4 flex flex-col gap-4" style={{ borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
        Search terms per platform (one per line)
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((p) => (
          <PlatformTermsEditor
            key={p.value}
            label={p.label}
            configKey={p.configKey}
            initialTerms={getTermsForPlatform(p.value)}
            saving={savingPlatform === p.value}
            onSave={(terms) => handleSavePlatform(p.value, p.configKey, terms)}
          />
        ))}
      </div>
    </div>
  )
}

function PlatformTermsEditor({
  label,
  configKey,
  initialTerms,
  saving,
  onSave,
}: {
  label: string
  configKey: string
  initialTerms: string
  saving: boolean
  onSave: (terms: string) => void
}) {
  const [terms, setTerms] = useState(initialTerms)
  const [dirty, setDirty] = useState(false)

  function handleChange(value: string) {
    setTerms(value)
    setDirty(value !== initialTerms)
  }

  function handleSave() {
    onSave(terms)
    setDirty(false)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
          {label}
        </label>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {configKey}
        </span>
      </div>
      <textarea
        value={terms}
        onChange={(e) => handleChange(e.target.value)}
        rows={4}
        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
        style={{ borderColor: dirty ? 'var(--accent)' : 'var(--border)' }}
        placeholder={configKey === 'hashtags' ? 'puzzlegame\nlogicpuzzle\nindiegame' : 'search query one\nsearch query two'}
      />
      {dirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="self-start rounded-lg bg-foreground px-3 py-1 text-xs font-medium text-surface disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      )}
    </div>
  )
}

function RunAgentSection() {
  const [triggering, setTriggering] = useState(false)
  const [status, setStatus] = useState<{
    status: string
    conclusion: string | null
    started_at: string | null
    html_url: string | null
  } | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)

  async function checkStatus() {
    try {
      const res = await fetch('/api/agent/status')
      const data = await res.json()
      if (data.error) return
      setStatus(data)
      return data
    } catch {
      return null
    }
  }

  async function handleRun() {
    setTriggering(true)
    setMessage(null)

    try {
      const res = await fetch('/api/agent/run', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Failed to trigger agent')
        setTriggering(false)
        return
      }

      setMessage('Agent triggered! Waiting for it to start...')
      setTriggering(false)

      // Poll for status
      setPolling(true)
      const poll = setInterval(async () => {
        const s = await checkStatus()
        if (s && (s.status === 'completed' || s.conclusion)) {
          clearInterval(poll)
          setPolling(false)
          setMessage(
            s.conclusion === 'success'
              ? 'Agent run completed successfully!'
              : `Agent run finished: ${s.conclusion || s.status}`
          )
        }
      }, 5000)

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(poll)
        setPolling(false)
      }, 300000)
    } catch {
      setMessage('Failed to trigger agent')
      setTriggering(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

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

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Run Agent
          </h3>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Triggers the search agent via GitHub Actions. Runs across all active brands.
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={triggering || polling}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
        >
          {triggering ? 'Triggering...' : polling ? 'Running...' : 'Run now'}
        </button>
      </div>

      {status && (
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
          <span>
            Last run: {status.conclusion === 'success' ? 'success' : status.conclusion || status.status}
          </span>
          {status.started_at && (
            <span>{timeAgo(status.started_at)}</span>
          )}
          {status.html_url && (
            <a
              href={status.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: 'var(--accent)' }}
            >
              View on GitHub
            </a>
          )}
          {polling && (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              Polling for updates...
            </span>
          )}
        </div>
      )}

      {message && (
        <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
          {message}
        </p>
      )}
    </div>
  )
}
