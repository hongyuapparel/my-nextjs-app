<<<<<<< HEAD
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
=======
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
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
} 