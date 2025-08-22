<<<<<<< HEAD
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimezone(timezone: string) {
  return timezone.replace(/_/g, ' ').replace('/', ' / ')
}

export function getTimeDifference(timezone: string): string {
  const now = new Date()
  const localTime = now.getTime()
  const localOffset = now.getTimezoneOffset() * 60000
  const utc = localTime + localOffset
  
  const targetTime = new Date(utc + (getTimezoneOffset(timezone) * 3600000))
  const diff = Math.round((targetTime.getTime() - now.getTime()) / 3600000)
  
  if (diff === 0) return '本地时间'
  if (diff > 0) return `+${diff}小时`
  return `${diff}小时`
}

function getTimezoneOffset(timezone: string): number {
  const now = new Date()
  const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
  const targetTime = new Date(utcTime.toLocaleString('en-US', { timeZone: timezone }))
  return (targetTime.getTime() - utcTime.getTime()) / 3600000
=======
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimezone(timezone: string) {
  return timezone.replace(/_/g, ' ').replace('/', ' / ')
}

export function getTimeDifference(timezone: string): string {
  const now = new Date()
  const localTime = now.getTime()
  const localOffset = now.getTimezoneOffset() * 60000
  const utc = localTime + localOffset
  
  const targetTime = new Date(utc + (getTimezoneOffset(timezone) * 3600000))
  const diff = Math.round((targetTime.getTime() - now.getTime()) / 3600000)
  
  if (diff === 0) return '本地时间'
  if (diff > 0) return `+${diff}小时`
  return `${diff}小时`
}

function getTimezoneOffset(timezone: string): number {
  const now = new Date()
  const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
  const targetTime = new Date(utcTime.toLocaleString('en-US', { timeZone: timezone }))
  return (targetTime.getTime() - utcTime.getTime()) / 3600000
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
} 