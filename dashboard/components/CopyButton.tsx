'use client'

import { useState } from 'react'

type CopyButtonProps = {
  text: string
  label?: string
}

export default function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="filter-chip rounded-lg border px-3.5 py-1.5 text-sm font-medium"
      style={{
        borderColor: copied ? '#86efac' : 'var(--border)',
        background: copied ? '#dcfce7' : 'var(--surface)',
        color: copied ? '#166534' : 'var(--foreground)',
      }}
    >
      {copied ? 'Copied' : label}
    </button>
  )
}
