// 纯前端 Demo：从 localStorage 读取 Supabase 配置，创建客户端
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const LS_KEY = 'supabase-config'

export type SupabaseConfig = {
  url: string
  anonKey: string
}

let cached: SupabaseClient | null = null
let initTried = false

export function getSupabaseConfig(): SupabaseConfig | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.url || !parsed?.anonKey) return null
    return parsed
  } catch {
    return null
  }
}

export function setSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(LS_KEY, JSON.stringify(config))
  cached = null
}

async function initFromServerEnv(): Promise<SupabaseConfig | null> {
  if (initTried) return null
  initTried = true
  try {
    const res = await fetch('/api/public-config', { cache: 'no-store' })
    const data = await res.json()
    if (data?.ok && data.url && data.anon) {
      const cfg = { url: data.url as string, anonKey: data.anon as string }
      setSupabaseConfig(cfg)
      return cfg
    }
  } catch {}
  return null
}

export async function getClientAsync(): Promise<SupabaseClient | null> {
  if (cached) return cached
  let cfg = getSupabaseConfig()
  if (!cfg) cfg = await initFromServerEnv()
  if (!cfg) return null
  cached = createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: false },
    global: { fetch: (...args) => fetch(...args) },
  })
  return cached
}

export function getClient(): SupabaseClient | null {
  // 同步版本：若还未初始化，返回 null；组件可调用 getClientAsync 进行懒加载
  return cached
} 