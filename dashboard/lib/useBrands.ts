'use client'

import { useState, useEffect } from 'react'
import type { BrandConfig } from './types'

let cachedBrands: BrandConfig[] | null = null

export function useBrands() {
  const [brands, setBrands] = useState<BrandConfig[]>(cachedBrands ?? [])
  const [loading, setLoading] = useState(!cachedBrands)

  useEffect(() => {
    if (cachedBrands) return

    fetch('/api/brands')
      .then((res) => res.json())
      .then((data) => {
        cachedBrands = data
        setBrands(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  function refresh() {
    cachedBrands = null
    setLoading(true)
    fetch('/api/brands')
      .then((res) => res.json())
      .then((data) => {
        cachedBrands = data
        setBrands(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  const brandOptions = [
    { value: '', label: 'Select brand...' },
    ...brands.map((b) => ({ value: b.slug, label: b.display_name })),
  ]

  const brandMap = Object.fromEntries(brands.map((b) => [b.slug, b]))

  return { brands, brandOptions, brandMap, loading, refresh }
}
