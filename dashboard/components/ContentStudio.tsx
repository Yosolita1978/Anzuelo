'use client'

import { useState } from 'react'
import CopyButton from './CopyButton'

const BRANDS = [
  { value: 'picasyfijas', label: 'Picas y Fijas' },
  { value: 'fluentaspeech', label: 'Fluentaspeech' },
  { value: 'comadrelab', label: 'ComadreLab' },
]

const PLATFORMS = [
  { value: 'reddit', label: 'Reddit' },
  { value: 'bluesky', label: 'Bluesky' },
  { value: 'mastodon', label: 'Mastodon' },
  { value: 'hackernews', label: 'Hacker News' },
  { value: 'linkedin', label: 'LinkedIn' },
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

type ContentStudioProps = {
  initialTopic?: string
  initialBrand?: string
  initialFormat?: string
}

export default function ContentStudio({
  initialTopic = '',
  initialBrand = 'picasyfijas',
  initialFormat = 'standalone_post',
}: ContentStudioProps) {
  const [brand, setBrand] = useState(initialBrand)
  const [platform, setPlatform] = useState('bluesky')
  const [contentType, setContentType] = useState(initialFormat)
  const [language, setLanguage] = useState('auto')
  const [topic, setTopic] = useState(initialTopic)
  const [result, setResult] = useState('')
  const [generating, setGenerating] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleGenerate() {
    if (!topic.trim()) return

    setGenerating(true)
    setResult('')
    setSaved(false)

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand, platform, contentType, topic, language }),
    })

    if (!response.ok || !response.body) {
      setResult('Error generating content. Please try again.')
      setGenerating(false)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let text = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      text += decoder.decode(value, { stream: true })
      setResult(text)
    }

    setGenerating(false)
  }

  async function handleSaveToCalendar() {
    if (!result.trim()) return

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
    }
  }

  const selectClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none'

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Brand</label>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className={selectClass}>
            {BRANDS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
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

      <button
        onClick={handleGenerate}
        disabled={generating || !topic.trim()}
        className="self-start rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
      >
        {generating ? 'Generating...' : 'Generate'}
      </button>

      {result && (
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-gray-200 bg-white p-4">
            <p className="mb-2 text-xs font-medium text-gray-500">Generated content</p>
            <p className="whitespace-pre-wrap text-sm text-gray-800">{result}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyButton text={result} label="📋 Copy" />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              🔄 Regenerate
            </button>
            {!showCalendar && !saved && (
              <button
                onClick={() => setShowCalendar(true)}
                className="rounded-md bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-200"
              >
                📅 Save to calendar
              </button>
            )}
            {saved && (
              <span className="rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800">
                ✓ Saved
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
