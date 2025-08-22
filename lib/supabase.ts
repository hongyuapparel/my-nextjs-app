// Supabase 配置和服务
import { createClient } from '@supabase/supabase-js'

// 正确的 Supabase 配置
const SUPABASE_URL = 'https://vmgezqjvmcwovjscdogo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2V6cWp2bWN3b3Zqc2Nkb2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjUyNzUsImV4cCI6MjA3MDUwMTI3NX0.Yk-QKM3S6ITlvKPdnTp20c-D_7hbUEpPeGAZ_3QOTsQ'

// 物流记录接口
export interface LogisticsRecord {
  id: string
  tracking_number: string
  carrier: string
  carrier_name?: string | null
  status?: string | null
  destination?: string | null
  recipient?: string | null
  is_favorite: boolean
  last_update: string
  created_at: string
}

// 创建 Supabase 客户端
let supabaseClient: any = null

export async function initSupabaseClient() {
  try {
    console.log('🔄 初始化 Supabase 客户端...')
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase 配置缺失')
    }

    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      realtime: {
        params: {
          eventsPerSecond: 2
        }
      }
    })

    // 测试连接
    const { data, error } = await supabaseClient
      .from('logistics_records')
      .select('count(*)')
      .limit(1)

    if (error) {
      console.error('❌ Supabase 连接测试失败:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Supabase 连接成功')
    return { success: true, client: supabaseClient }
    
  } catch (error: any) {
    console.error('❌ Supabase 初始化失败:', error)
    return { success: false, error: error.message }
  }
}

export function getSupabaseClient() {
  return supabaseClient
}

// 物流数据服务类
export class LogisticsDataService {
  private client: any

  constructor(client: any) {
    this.client = client
  }

  // 获取所有记录
  async getAllRecords(): Promise<{ data: LogisticsRecord[] | null; error: any }> {
    try {
      console.log('📄 获取所有物流记录...')
      
      const { data, error } = await this.client
        .from('logistics_records')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ 获取记录失败:', error)
        return { data: null, error }
      }

      console.log(`✅ 成功获取 ${data?.length || 0} 条记录`)
      return { data: data || [], error: null }
      
    } catch (error: any) {
      console.error('❌ 获取记录异常:', error)
      return { data: null, error: error.message }
    }
  }

  // 添加新记录
  async addRecord(record: Partial<LogisticsRecord>): Promise<{ data: LogisticsRecord | null; error: any }> {
    try {
      console.log('➕ 添加新记录:', record.tracking_number)
      
      const newRecord = {
        id: record.id || crypto.randomUUID(),
        tracking_number: record.tracking_number,
        carrier: record.carrier,
        carrier_name: record.carrier_name,
        status: record.status || '已揽收',
        destination: record.destination,
        recipient: record.recipient,
        is_favorite: record.is_favorite || false,
        last_update: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      const { data, error } = await this.client
        .from('logistics_records')
        .insert([newRecord])
        .select()
        .single()

      if (error) {
        console.error('❌ 添加记录失败:', error)
        return { data: null, error }
      }

      console.log('✅ 记录添加成功:', data.tracking_number)
      return { data, error: null }
      
    } catch (error: any) {
      console.error('❌ 添加记录异常:', error)
      return { data: null, error: error.message }
    }
  }

  // 更新记录
  async updateRecord(id: string, updates: Partial<LogisticsRecord>): Promise<{ data: LogisticsRecord | null; error: any }> {
    try {
      console.log('🔄 更新记录:', id)
      
      const updateData = {
        ...updates,
        last_update: new Date().toISOString()
      }

      const { data, error } = await this.client
        .from('logistics_records')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ 更新记录失败:', error)
        return { data: null, error }
      }

      console.log('✅ 记录更新成功')
      return { data, error: null }
      
    } catch (error: any) {
      console.error('❌ 更新记录异常:', error)
      return { data: null, error: error.message }
    }
  }

  // 删除记录
  async deleteRecord(id: string): Promise<{ error: any }> {
    try {
      console.log('🗑️ 删除记录:', id)
      
      const { error } = await this.client
        .from('logistics_records')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ 删除记录失败:', error)
        return { error }
      }

      console.log('✅ 记录删除成功')
      return { error: null }
      
    } catch (error: any) {
      console.error('❌ 删除记录异常:', error)
      return { error: error.message }
    }
  }

  // 订阅实时变更
  subscribeToChanges(callback: (payload: any) => void) {
    try {
      console.log('🔄 订阅实时变更...')
      
      const subscription = this.client
        .channel('logistics_records_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'logistics_records' 
          }, 
          callback
        )
        .subscribe()

      console.log('✅ 实时订阅已启动')
      return subscription
      
    } catch (error: any) {
      console.error('❌ 订阅失败:', error)
    return null
  }
  }

  // 测试连接
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.client
        .from('logistics_records')
        .select('count(*)')
        .limit(1)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

// 导出便捷函数
export async function getLogisticsService() {
  const result = await initSupabaseClient()
  if (!result.success || !result.client) {
    throw new Error(result.error || 'Supabase 初始化失败')
  }
  return new LogisticsDataService(result.client)
} 