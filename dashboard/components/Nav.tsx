'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/leads', label: 'Leads' },
  { href: '/gaps', label: 'Gaps' },
  { href: '/studio', label: 'Studio' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/stats', label: 'Stats' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b px-4 py-3 sm:px-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/leads" className="flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <Image src="/logo.png" alt="Anzuelo" width={120} height={32} priority />
        </Link>
        <div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: 'var(--background)' }}>
          {TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="filter-chip rounded-md px-3.5 py-1.5 text-sm font-medium"
                style={{
                  background: isActive ? 'var(--surface)' : 'transparent',
                  color: isActive ? 'var(--foreground)' : 'var(--muted)',
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
