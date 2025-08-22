// 已配置好的 Supabase 客户端，同事无需手动设置
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 🔧 请将下面的两行替换为你的 Supabase 信息
const SUPABASE_URL = 'https://vmgezqjvmcwovjscdogo.supabase.co		' // 例如: https://vmgezqjvmcwovjscdogo.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2V6cWp2bWN3b3Zqc2Nkb2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjUyNzUsImV4cCI6MjA3MDUwMTI3NX0.Yk-QKM3S6ITlvKPdnTp20c-D_7hbUEpPeGAZ_3QOTsQ		' // 例如: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

let cached: SupabaseClient | null = null

export function getSupabaseConfig(): any {
  // 返回硬编码的配置，同事无需手动填写
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
  }
}

export function setSupabaseConfig(config: any) {
  // 此函数保留但不执行任何操作，因为配置已硬编码
  console.log('配置已硬编码，无需手动设置')
}

export async function getClientAsync(): Promise<SupabaseClient | null> {
  if (cached) return cached
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || 
      SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL_HERE' || 
      SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    console.error('请在 lib/supabase.ts 中填写正确的 Supabase URL 和 Anon Key')
    return null
  }

  cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { fetch: (...args) => fetch(...args) },
  })
  return cached
}

export function getClient(): SupabaseClient | null {
  return cached
} 