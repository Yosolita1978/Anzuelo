import { useBrands } from '@/lib/useBrands'

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
  const { brandMap } = useBrands()
  const config = brandMap[brand]
  const style = config ? { bg: config.color_bg, fg: config.color_fg } : DEFAULT_STYLE
  const label = config?.display_name || brand
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
