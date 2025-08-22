// 已配置好的 Supabase 客户端，同事无需手动设置
import { createClient, SupabaseClient, AuthSession, User } from '@supabase/supabase-js'

// 配置信息 - 已硬编码，无需用户配置
const SUPABASE_URL = 'https://vmgezqjvmcwovjscdogo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2V6cWp2bWN3b3Zqc2Nkb2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjUyNzUsImV4cCI6MjA3MDUwMTI3NX0.Yk-QKM3S6ITlvKPdnTp20c-D_7hbUEpPeGAZ_3QOTsQ'

// 数据库表结构类型定义
export interface LogisticsRecord {
  id: string
  user_id?: string | null  // 改为string类型
  tracking_number: string
  carrier: string
  carrier_name?: string | null
  status?: string | null
  destination?: string | null
  origin?: string | null
  recipient?: string | null
  notes?: string | null
  tags?: string[] | null
  is_favorite: boolean
  is_delivered: boolean
  delivery_date?: string | null
  estimated_delivery?: string | null
  last_update: string
  created_at: string
  updated_at: string
  query_count: number
  last_queried?: string | null
  is_api_available: boolean
  api_status: string
  official_url?: string | null
  events?: any[] | null
  metadata?: any | null
}

// 全局 Supabase 客户端
let supabaseClient: SupabaseClient | null = null

// 初始化 Supabase 客户端
export function createSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

  return supabaseClient
}

// 获取 Supabase 客户端
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    return createSupabaseClient()
  }
  return supabaseClient
}

// 用户认证相关功能
export class SupabaseAuthService {
  private client: SupabaseClient

  constructor() {
    this.client = getSupabaseClient()
  }

  // 匿名登录（用于演示）
  async signInAnonymously(): Promise<{ user: User | null; error: any }> {
    try {
      // 对于演示项目，我们使用一个固定的匿名用户ID
      const anonymousUserId = 'anonymous-demo-user'
      
      // 检查是否已经有匿名会话
      const { data: { session } } = await this.client.auth.getSession()
      
      if (session?.user) {
        return { user: session.user, error: null }
      }

      // 创建匿名会话（在演示环境中简化处理）
      return { user: { id: anonymousUserId } as User, error: null }
    } catch (error) {
      console.error('匿名登录失败:', error)
      return { user: null, error }
    }
  }

  // 获取当前用户
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.client.auth.getUser()
      return user || { id: 'anonymous-demo-user' } as User
    } catch (error) {
      console.error('获取用户失败:', error)
      return { id: 'anonymous-demo-user' } as User
    }
  }

  // 监听认证状态变化
  onAuthStateChange(callback: (user: User | null) => void) {
    return this.client.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}

// 物流记录数据服务
export class LogisticsDataService {
  private client: SupabaseClient
  private authService: SupabaseAuthService

  constructor() {
    this.client = getSupabaseClient()
    this.authService = new SupabaseAuthService()
  }

  // 获取所有物流记录
  async getAllRecords(): Promise<{ data: LogisticsRecord[] | null; error: any }> {
    try {
      const { data, error } = await this.client
        .from('logistics_records')
        .select('*')
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('获取物流记录失败:', error)
      return { data: null, error }
    }
  }

  // 添加物流记录
  async addRecord(record: Partial<LogisticsRecord>): Promise<{ data: LogisticsRecord | null; error: any }> {
    try {
      const user = await this.authService.getCurrentUser()
      
      const newRecord = {
        ...record,
        user_id: user?.id || null,
        id: record.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_update: new Date().toISOString(),
        is_favorite: record.is_favorite || false,
        is_delivered: record.is_delivered || false,
        query_count: record.query_count || 0,
        is_api_available: record.is_api_available !== false,
        api_status: record.api_status || 'active',
      }

      const { data, error } = await this.client
        .from('logistics_records')
        .insert([newRecord])
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('添加物流记录失败:', error)
      return { data: null, error }
    }
  }

  // 更新物流记录
  async updateRecord(id: string, updates: Partial<LogisticsRecord>): Promise<{ data: LogisticsRecord | null; error: any }> {
    try {
      const { data, error } = await this.client
        .from('logistics_records')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('更新物流记录失败:', error)
      return { data: null, error }
    }
  }

  // 删除物流记录
  async deleteRecord(id: string): Promise<{ error: any }> {
    try {
      const { error } = await this.client
        .from('logistics_records')
        .delete()
        .eq('id', id)

      return { error }
    } catch (error) {
      console.error('删除物流记录失败:', error)
      return { error }
    }
  }

  // 订阅实时变更
  subscribeToChanges(callback: (payload: any) => void) {
    return this.client
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
  }

  // 测试数据库连接
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const { data, error } = await this.client
        .from('logistics_records')
        .select('count')
        .limit(1)

      if (error) {
        return { success: false, message: `连接失败: ${error.message}` }
      }

      return { 
        success: true, 
        message: '连接成功', 
        data: data 
      }
    } catch (error) {
      return { 
        success: false, 
        message: `连接异常: ${error}` 
      }
    }
  }
}

// 导出实例
export const supabaseAuth = new SupabaseAuthService()
export const supabaseData = new LogisticsDataService()

// 兼容性导出
export const getSupabaseConfig = () => ({
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY
})

export const initSupabaseClient = createSupabaseClient
export const getClientAsync = async () => getSupabaseClient()
export const setSupabaseConfig = () => console.log('配置已硬编码，无需设置') 