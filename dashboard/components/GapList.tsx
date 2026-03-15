'use client'

import { useState } from 'react'
import type { ContentOpportunity } from '@/lib/types'
import GapCard from './GapCard'

type GapListProps = {
  opportunities: ContentOpportunity[]
}

export default function GapList({ opportunities: initial }: GapListProps) {
  const [opportunities, setOpportunities] = useState(initial)

  function handleRemove(id: string) {
    setOpportunities((prev) => prev.filter((o) => o.id !== id))
  }

  if (opportunities.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">
        No content opportunities found.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {opportunities.map((opp) => (
        <GapCard key={opp.id} opportunity={opp} onRemove={handleRemove} />
      ))}
    </div>
  )
}
