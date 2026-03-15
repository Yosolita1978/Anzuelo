'use client'

import { useState } from 'react'
import type { Lead } from '@/lib/types'
import LeadCard from './LeadCard'

type LeadListProps = {
  leads: Lead[]
}

export default function LeadList({ leads: initialLeads }: LeadListProps) {
  const [leads, setLeads] = useState(initialLeads)

  function handleRemove(id: string) {
    setLeads((prev) => prev.filter((lead) => lead.id !== id))
  }

  if (leads.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">
        No leads found for these filters.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} onRemove={handleRemove} />
      ))}
    </div>
  )
}
