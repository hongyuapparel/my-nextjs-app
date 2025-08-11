'use client'

import { useEffect } from 'react'
import { useAppStore } from '../../../lib/store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useAppStore()

  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDarkMode])

  return <>{children}</>
} 