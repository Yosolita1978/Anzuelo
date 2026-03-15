const BRAND_STYLES: Record<string, { bg: string; fg: string }> = {
  picasyfijas: { bg: '#f3f0ff', fg: '#7c3aed' },
  fluentaspeech: { bg: '#eff6ff', fg: '#2563eb' },
  comadrelab: { bg: '#fdf2f8', fg: '#db2777' },
}

const BRAND_LABELS: Record<string, string> = {
  picasyfijas: 'Picas y Fijas',
  fluentaspeech: 'Fluentaspeech',
  comadrelab: 'ComadreLab',
}

const PLATFORM_STYLES: Record<string, { bg: string; fg: string }> = {
  reddit: { bg: '#fff7ed', fg: '#c2410c' },
  hackernews: { bg: '#fffbeb', fg: '#b45309' },
  bluesky: { bg: '#f0f9ff', fg: '#0284c7' },
  mastodon: { bg: '#eef2ff', fg: '#4f46e5' },
  youtube: { bg: '#fef2f2', fg: '#dc2626' },
  linkedin: { bg: '#eff6ff', fg: '#1d4ed8' },
}

const DEFAULT_STYLE = { bg: '#f5f5f4', fg: '#78716c' }

export function BrandBadge({ brand }: { brand: string }) {
  const style = BRAND_STYLES[brand] || DEFAULT_STYLE
  const label = BRAND_LABELS[brand] || brand
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: style.bg, color: style.fg }}
    >
      {label}
    </span>
  )
}

export function PlatformBadge({ platform }: { platform: string }) {
  const style = PLATFORM_STYLES[platform] || DEFAULT_STYLE
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: style.bg, color: style.fg }}
    >
      {platform}
    </span>
  )
}

export function ScoreDot({ score }: { score: number }) {
  const color = score >= 9 ? '#dc2626' : score >= 7 ? '#ea580c' : '#ca8a04'
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      <span className="text-xs font-semibold tabular-nums" style={{ color }}>
        {score}
      </span>
    </span>
  )
}

export function FormatBadge({ format }: { format: string }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: 'var(--background)', color: 'var(--muted)' }}
    >
      {format.replaceAll('_', ' ')}
    </span>
  )
}
