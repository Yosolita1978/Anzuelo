'use client'

import { useState, useEffect, useRef } from 'react'
import { useBrands } from '@/lib/useBrands'
import CopyButton from './CopyButton'

const PLATFORMS = [
  { value: 'reddit', label: 'Reddit' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'mastodon', label: 'Mastodon' },
  { value: 'hackernews', label: 'Hacker News' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'threads', label: 'Threads' },
  { value: 'youtube', label: 'YouTube' },
]

const CONTENT_TYPES = [
  { value: 'standalone_post', label: 'Standalone post' },
  { value: 'reply', label: 'Reply to thread' },
  { value: 'thread', label: 'Thread' },
  { value: 'short_caption', label: 'Short caption' },
]

const LANGUAGES = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'es', label: 'Spanish' },
  { value: 'en', label: 'English' },
  { value: 'bilingual', label: 'Bilingual' },
]

type Phase = 'idle' | 'connecting' | 'writing' | 'done' | 'error' | 'cancelled'

type ContentStudioProps = {
  initialTopic?: string
  initialBrand?: string
  initialFormat?: string
}

export default function ContentStudio({
  initialTopic = '',
  initialBrand = '',
  initialFormat = 'standalone_post',
}: ContentStudioProps) {
  const { brands } = useBrands()
  const [brand, setBrand] = useState(initialBrand)
  const [platform, setPlatform] = useState('bluesky')
  const [contentType, setContentType] = useState(initialFormat)
  const [language, setLanguage] = useState('auto')
  const [topic, setTopic] = useState(initialTopic)
  const [result, setResult] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [showCalendar, setShowCalendar] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [saved, setSaved] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const isGenerating = phase === 'connecting' || phase === 'writing'

  // Elapsed timer
  useEffect(() => {
    if (isGenerating) {
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isGenerating])

  function handleCancel() {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setPhase(result ? 'done' : 'cancelled')
  }

  async function handleGenerate() {
    if (!topic.trim()) return

    // Cancel any previous request
    if (abortRef.current) abortRef.current.abort()

    const controller = new AbortController()
    abortRef.current = controller

    setPhase('connecting')
    setResult('')
    setSaved(false)
    setShowCalendar(false)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, platform, contentType, topic, language }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        setResult('Error generating content. Please try again.')
        setPhase('error')
        return
      }

      setPhase('writing')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setResult(text)
      }

      setPhase('done')
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setPhase(result ? 'done' : 'cancelled')
      } else {
        setResult('Error generating content. Please try again.')
        setPhase('error')
      }
    }
  }

  async function handleSaveToCalendar() {
    if (!result.trim()) return

    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          platform,
          content: result,
          content_type: contentType,
          scheduled_for: scheduledDate || null,
        }),
      })

      if (response.ok) {
        setSaved(true)
        setShowCalendar(false)
      } else {
        const err = await response.json()
        console.error('Calendar save error:', err)
        alert(`Failed to save: ${err.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Calendar save error:', err)
      alert('Failed to save to calendar. Check the console for details.')
    }
  }

  const selectClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none'

  const phaseLabel =
    phase === 'connecting'
      ? 'Connecting to AI...'
      : phase === 'writing'
        ? 'Writing your content...'
        : phase === 'cancelled'
          ? 'Generation cancelled'
          : phase === 'error'
            ? 'Something went wrong'
            : null

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Brand</label>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className={selectClass}>
            <option value="">Select brand...</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>{b.display_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={selectClass}>
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Type</label>
          <select value={contentType} onChange={(e) => setContentType(e.target.value)} className={selectClass}>
            {CONTENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass}>
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Topic</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What should the content be about?"
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="self-start rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : result ? 'Regenerate' : 'Generate'}
        </button>

        {isGenerating && (
          <button
            onClick={handleCancel}
            className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Cancel
          </button>
        )}

        {phaseLabel && (
          <span className="flex items-center gap-2 text-xs text-gray-500">
            {isGenerating && (
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            )}
            {phaseLabel}
            {isGenerating && elapsed > 0 && (
              <span className="tabular-nums text-gray-400">{elapsed}s</span>
            )}
          </span>
        )}
      </div>

      {/* Skeleton placeholder while connecting (no text yet) */}
      {phase === 'connecting' && !result && (
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="mb-3 text-xs font-medium text-gray-500">Generated content</p>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-4/6 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      )}

      {/* Streaming content with blinking cursor */}
      {result && (
        <div className="flex flex-col gap-3">
          <div ref={resultRef} className="rounded-md border border-gray-200 bg-white p-4">
            <p className="mb-2 text-xs font-medium text-gray-500">Generated content</p>
            <p className="whitespace-pre-wrap text-sm text-gray-800">
              {result}
              {phase === 'writing' && (
                <span className="ml-0.5 inline-block animate-pulse text-gray-400">&#9611;</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyButton text={result} label="Copy" />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              Regenerate
            </button>
            {!showCalendar && !saved && !isGenerating && (
              <button
                onClick={() => setShowCalendar(true)}
                className="rounded-md bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-200"
              >
                Save to calendar
              </button>
            )}
            {saved && (
              <span className="rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800">
                Saved
              </span>
            )}
          </div>

          {showCalendar && (
            <div className="flex items-end gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Schedule for (optional)
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSaveToCalendar}
                className="rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Save
              </button>
              <button
                onClick={() => setShowCalendar(false)}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
