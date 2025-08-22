'use client'

<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Truck, Package, Star, StarOff, Trash2, Plus, Cloud, CloudOff, Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import { getLogisticsService, LogisticsRecord } from '../../../lib/supabase'

// 快递公司配置
const CARRIERS = {
  auto: '自动识别',
  shunfeng: '顺丰速运',
  zhongtong: '中通快递',
  yuantong: '圆通速递',
  yunda: '韵达速递',
  申通: '申通快递',
  ems: 'EMS',
  dhl: 'DHL',
  fedex: 'FedEx',
  ups: 'UPS'
}

// 状态颜色映射
const STATUS_COLORS = {
  '已揽收': 'default',
  '运输中': 'secondary',
  '派送中': 'outline',
  '已签收': 'default',
  '异常': 'destructive'
} as const

// 同步状态接口
interface SyncStatus {
  isConnected: boolean
  isOnline: boolean
  pendingChanges: number
  lastSync: string | null
}

export default function LogisticsTracker() {
  // 基础状态
  const [records, setRecords] = useState<LogisticsRecord[]>([])
  const [trackingNumber, setTrackingNumber] = useState('')
  const [selectedCarrier, setSelectedCarrier] = useState('auto')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // 云同步状态
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    isOnline: navigator.onLine,
    pendingChanges: 0,
    lastSync: null
  })
  
  // Supabase 服务
  const [logisticsService, setLogisticsService] = useState<any>(null)
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null)

  // 初始化云端服务
  const initializeCloudService = useCallback(async () => {
    try {
      console.log('🔄 初始化云端服务...')
      const service = await getLogisticsService()
      setLogisticsService(service)
      
      // 测试连接
      const testResult = await service.testConnection()
      setSyncStatus(prev => ({
        ...prev,
        isConnected: testResult.success,
        lastSync: testResult.success ? new Date().toISOString() : null
      }))
      
      if (testResult.success) {
        console.log('✅ 云端服务初始化成功')
        toast.success('云端同步已连接')
        return service
      } else {
        console.error('❌ 云端连接失败:', testResult.error)
        toast.error('云端连接失败，将使用本地模式')
        return null
      }
    } catch (error: any) {
      console.error('❌ 云端服务初始化失败:', error)
      toast.error('云端服务初始化失败')
      setSyncStatus(prev => ({ ...prev, isConnected: false }))
      return null
    }
  }, [])

  // 加载云端记录
  const loadCloudRecords = useCallback(async (service: any) => {
    if (!service) return false
    
    try {
      console.log('📄 加载云端记录...')
      const { data, error } = await service.getAllRecords()
      
      if (error) {
        console.error('❌ 加载云端记录失败:', error)
        return false
      }
      
      if (data && Array.isArray(data)) {
        setRecords(data)
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date().toISOString(),
          pendingChanges: 0
        }))
        console.log(`✅ 成功加载 ${data.length} 条云端记录`)
        return true
      }
      
      return false
    } catch (error: any) {
      console.error('❌ 加载云端记录异常:', error)
      return false
    }
  }, [])

  // 启用实时订阅
  const setupRealtimeSubscription = useCallback((service: any) => {
    if (!service || realtimeSubscription) return
    
    try {
      console.log('🔄 设置实时订阅...')
      const subscription = service.subscribeToChanges((payload: any) => {
        console.log('📡 收到实时更新:', payload)
        
        const { eventType, new: newRecord, old: oldRecord } = payload
        
        setRecords(prev => {
          switch (eventType) {
            case 'INSERT':
              if (newRecord && !prev.find(r => r.id === newRecord.id)) {
                toast.success('收到新的物流记录')
                return [newRecord, ...prev]
              }
              return prev
              
            case 'UPDATE':
              if (newRecord) {
                return prev.map(r => r.id === newRecord.id ? newRecord : r)
              }
              return prev
              
            case 'DELETE':
              if (oldRecord) {
                toast.info('记录已删除')
                return prev.filter(r => r.id !== oldRecord.id)
              }
              return prev
              
            default:
              return prev
          }
        })
        
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date().toISOString()
        }))
      })
      
      setRealtimeSubscription(subscription)
      console.log('✅ 实时订阅已启用')
      
    } catch (error: any) {
      console.error('❌ 实时订阅失败:', error)
    }
  }, [realtimeSubscription])

  // 组件初始化
  useEffect(() => {
    const initialize = async () => {
      setLoading(true)
      
      try {
        // 初始化云端服务
        const service = await initializeCloudService()
        
        if (service) {
          // 加载云端记录
          const cloudLoaded = await loadCloudRecords(service)
          
          if (cloudLoaded) {
            // 启用实时订阅
            setupRealtimeSubscription(service)
          } else {
            // 云端加载失败，加载本地记录
            loadLocalRecords()
        }
      } else {
          // 云端服务不可用，使用本地模式
          loadLocalRecords()
        }
        
      } catch (error: any) {
        console.error('❌ 初始化失败:', error)
        loadLocalRecords()
      } finally {
        setLoading(false)
      }
    }
    
    initialize()
    
    // 网络状态监听
    const handleOnline = () => setSyncStatus(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, isOnline: false }))
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      // 清理实时订阅
      if (realtimeSubscription) {
        try {
          realtimeSubscription.unsubscribe()
    } catch (error) {
          console.warn('清理订阅时出错:', error)
        }
      }
    }
  }, [initializeCloudService, loadCloudRecords, setupRealtimeSubscription])

  // 加载本地记录
  const loadLocalRecords = useCallback(() => {
    try {
      const saved = localStorage.getItem('logistics-records')
      if (saved) {
        const localRecords = JSON.parse(saved)
        setRecords(Array.isArray(localRecords) ? localRecords : [])
        console.log('📱 已加载本地记录')
      }
    } catch (error) {
      console.error('❌ 加载本地记录失败:', error)
      setRecords([])
    }
  }, [])

  // 保存到本地
  const saveToLocal = useCallback((newRecords: LogisticsRecord[]) => {
    try {
      localStorage.setItem('logistics-records', JSON.stringify(newRecords))
    } catch (error) {
      console.error('❌ 保存到本地失败:', error)
    }
  }, [])

  // 添加记录
  const addRecord = async () => {
=======
import { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAppStore } from '../../../lib/store'
import { Search, Package, Clock, MapPin, Truck, CheckCircle, XCircle, History, Star, Trash2, ExternalLink, Copy, Plus, Tag, Calendar, Check } from 'lucide-react'
import { toast } from 'sonner'

interface TrackingRecord {
  id: string
  trackingNumber: string
  carrier: string
  carrierName: string
  status: string
  destination?: string
  origin?: string
  lastUpdate: string
  estimatedDelivery?: string
  officialUrl: string
  note?: string
  tags: string[]
  isFavorite: boolean
  queryCount: number
  lastQueried: string
  isApiAvailable?: boolean
  apiStatus?: string
  events?: TrackingEvent[]
  isDelivered?: boolean // 新增：是否已签收
  deliveryDate?: string // 新增：实际签收日期
}

interface TrackingEvent {
  timestamp: string
  status: string
  location: string
  description: string
}

interface CarrierInfo {
  name: string
  code: string
  patterns: RegExp[]
  officialUrl: string
  trackingUrl: string
  icon: string
}

export function LogisticsTracker() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [note, setNote] = useState('')
  const [newTag, setNewTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [trackingHistory, setTrackingHistory] = useState<TrackingRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCarrier, setSelectedCarrier] = useState<string>('auto')
  const [activeTab, setActiveTab] = useState<'add' | 'history' | 'favorites'>('add')
  const [selectedTagFilter, setSelectedTagFilter] = useState('all') // 新增：标签筛选
  const [searchType, setSearchType] = useState<'all' | 'number' | 'recipient' | 'carrier'>('all') // 新增：搜索类型
  const [editingRecord, setEditingRecord] = useState<string | null>(null) // 正在编辑的记录ID
  const [tempEstimatedDate, setTempEstimatedDate] = useState('') // 临时预计到达时间
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<'all' | 'delivered' | 'pending'>('all') // 签收状态筛选
  const [showRecipientSuggestions, setShowRecipientSuggestions] = useState(false) // 收件人建议下拉
  const [showResponsibleSuggestions, setShowResponsibleSuggestions] = useState(false) // 负责人建议下拉
  const [editingRecipient, setEditingRecipient] = useState<string | null>(null) // 正在编辑收件人的记录ID
  const [tempRecipientName, setTempRecipientName] = useState('') // 临时收件人名称
  const [showEditRecipientSuggestions, setShowEditRecipientSuggestions] = useState(false) // 编辑收件人时的建议下拉
  const [editingResponsible, setEditingResponsible] = useState<string | null>(null) // 正在编辑负责人的记录ID
  const [tempResponsibleName, setTempResponsibleName] = useState('') // 临时负责人名称
  const [showEditResponsibleSuggestions, setShowEditResponsibleSuggestions] = useState(false) // 编辑负责人时的建议下拉

  // 17track API 密钥（直接配置）
  const API_KEY = 'E4865F7B475AE7C6007F4A2773944B21'

  // 快递公司信息数据库
  const carriers: CarrierInfo[] = [
    {
      name: 'DHL',
      code: 'dhl',
      patterns: [/^\d{10}$/, /^\d{11}$/, /^[A-Z]{3}\d{7}$/, /^[A-Z]{4}\d{6}$/],
      officialUrl: 'https://www.dhl.com',
      trackingUrl: 'https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=',
      icon: '🚛'
    },
    {
      name: 'FedEx',
      code: 'fedex',
      patterns: [/^\d{12}$/, /^\d{14}$/, /^\d{20}$/, /^96\d{20}$/],
      officialUrl: 'https://www.fedex.com',
      trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr=',
      icon: '✈️'
    },
    {
      name: 'UPS',
      code: 'ups',
      patterns: [/^1Z[A-Z0-9]{16}$/, /^\d{18}$/, /^T\d{10}$/],
      officialUrl: 'https://www.ups.com',
      trackingUrl: 'https://www.ups.com/track?tracknum=',
      icon: '📦'
    },
    {
      name: '中国邮政',
      code: 'china-post',
      patterns: [/^[A-Z]{2}\d{9}[A-Z]{2}$/, /^[A-Z]{1}\d{8}[A-Z]{2}$/],
      officialUrl: 'http://www.chinapost.com.cn',
      trackingUrl: 'http://www.chinapost.com.cn/query/index.html?id=',
      icon: '🇨🇳'
    },
    {
      name: 'EMS',
      code: 'ems',
      patterns: [/^[A-Z]{2}\d{9}[A-Z]{2}$/, /^E[A-Z]\d{9}[A-Z]{2}$/],
      officialUrl: 'https://www.ems.com.cn',
      trackingUrl: 'https://www.ems.com.cn/queryList?mailNum=',
      icon: '📮'
    },
    {
      name: 'USPS',
      code: 'usps',
      patterns: [/^\d{20,22}$/, /^94\d{20}$/, /^[A-Z]{2}\d{9}US$/],
      officialUrl: 'https://www.usps.com',
      trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=',
      icon: '🇺🇸'
    },
    {
      name: 'TNT',
      code: 'tnt',
      patterns: [/^\d{9}$/, /^[A-Z]{2}\d{7}$/],
      officialUrl: 'https://www.tnt.com',
      trackingUrl: 'https://www.tnt.com/express/en_us/site/shipping-tools/tracking.html?searchType=con&cons=',
      icon: '🚚'
    },
    {
      name: 'Aramex',
      code: 'aramex',
      patterns: [/^\d{10,11}$/],
      officialUrl: 'https://www.aramex.com',
      trackingUrl: 'https://www.aramex.com/us/en/track/shipments?ShipmentNumber=',
      icon: '🌍'
    }
  ]

  // 从localStorage加载历史记录
  useEffect(() => {
    const saved = localStorage.getItem('tracking-history')
    if (saved) {
      try {
        const loadedHistory = JSON.parse(saved)
        // 确保所有记录都有必要的字段（兼容旧数据）
        const normalizedHistory = loadedHistory.map((record: any) => ({
          ...record,
          tags: record.tags || [], // 如果tags不存在，设置为空数组
          isFavorite: record.isFavorite || false,
          queryCount: record.queryCount || 1,
          lastQueried: record.lastQueried || record.lastUpdate || new Date().toISOString(),
          isDelivered: record.isDelivered || false, // 新增字段
          deliveryDate: record.deliveryDate || undefined, // 新增字段
          estimatedDelivery: record.estimatedDelivery || undefined // 确保字段存在
        }))
        setTrackingHistory(normalizedHistory)
      } catch (error) {
        console.error('Failed to load tracking history:', error)
      }
    }
  }, [])

  // 保存历史记录到localStorage
  const saveHistory = (history: TrackingRecord[]) => {
    localStorage.setItem('tracking-history', JSON.stringify(history))
    setTrackingHistory(history)
  }

  // 智能识别快递公司
  const detectCarrier = (trackingNo: string): CarrierInfo => {
    const cleanNumber = trackingNo.replace(/\s/g, '').toUpperCase()
    
    for (const carrier of carriers) {
      if (carrier.patterns.some(pattern => pattern.test(cleanNumber))) {
        return carrier
      }
    }
    
    // 默认返回DHL
    return carriers[0]
  }

  // 调用17track API查询
  const queryTrackingAPI = async (trackingNo: string, carrier: CarrierInfo): Promise<{ isApiAvailable: boolean, apiStatus: string, events?: TrackingEvent[] }> => {
    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber: trackingNo,
          apiKey: API_KEY,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return {
          isApiAvailable: true,
          apiStatus: data.status || '查询成功',
          events: data.events || []
        }
      } else {
        return {
          isApiAvailable: false,
          apiStatus: 'API查询失败'
        }
      }
    } catch (error) {
      return {
        isApiAvailable: false,
        apiStatus: 'API不可用'
      }
    }
  }

  // 添加新的追踪记录
  const handleAddTracking = async () => {
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
    if (!trackingNumber.trim()) {
      toast.error('请输入快递单号')
      return
    }

<<<<<<< HEAD
    if (records.some(r => r.tracking_number === trackingNumber.trim())) {
      toast.error('该快递单号已存在')
      return
    }

    setLoading(true)
    
    try {
      const newRecord: Partial<LogisticsRecord> = {
        tracking_number: trackingNumber.trim(),
        carrier: selectedCarrier,
        carrier_name: CARRIERS[selectedCarrier as keyof typeof CARRIERS],
        status: '已揽收',
        is_favorite: false
      }

      // 尝试保存到云端
      if (logisticsService && syncStatus.isConnected && syncStatus.isOnline) {
        const { data, error } = await logisticsService.addRecord(newRecord)
        
        if (error) {
          console.error('❌ 云端添加失败:', error)
          // 云端失败，保存到本地
          addRecordLocally(newRecord)
          setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
          toast.warning('已添加到本地，将在云端恢复时同步')
        } else {
          console.log('✅ 已添加到云端')
          toast.success('添加成功并已同步到云端')
          // 实时订阅会自动更新列表，无需手动添加
        }
      } else {
        // 云端不可用，保存到本地
        addRecordLocally(newRecord)
        setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
        toast.success('已添加到本地，将在连接恢复时同步')
      }

      setTrackingNumber('')
      setSelectedCarrier('auto')
      
    } catch (error: any) {
      console.error('❌ 添加记录失败:', error)
      toast.error('添加失败')
    } finally {
      setLoading(false)
    }
  }

  // 本地添加记录
  const addRecordLocally = (record: Partial<LogisticsRecord>) => {
    const newRecord: LogisticsRecord = {
      id: crypto.randomUUID(),
      tracking_number: record.tracking_number!,
      carrier: record.carrier!,
      carrier_name: record.carrier_name || null,
      status: record.status || '已揽收',
      destination: record.destination || null,
      recipient: record.recipient || null,
      is_favorite: record.is_favorite || false,
      last_update: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    
    const updatedRecords = [newRecord, ...records]
    setRecords(updatedRecords)
    saveToLocal(updatedRecords)
  }

  // 切换收藏状态
  const toggleFavorite = async (id: string) => {
    const record = records.find(r => r.id === id)
    if (!record) return

    const updates = { is_favorite: !record.is_favorite }

    // 尝试更新云端
    if (logisticsService && syncStatus.isConnected && syncStatus.isOnline) {
      const { error } = await logisticsService.updateRecord(id, updates)
      
      if (error) {
        console.error('❌ 云端更新失败:', error)
        // 云端失败，更新本地
        updateRecordLocally(id, updates)
        setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
        toast.warning('已在本地更新，将在云端恢复时同步')
      } else {
        toast.success('收藏状态已更新')
        // 实时订阅会自动更新列表
      }
    } else {
      // 云端不可用，更新本地
      updateRecordLocally(id, updates)
      setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
      toast.success('已在本地更新')
    }
  }

  // 本地更新记录
  const updateRecordLocally = (id: string, updates: Partial<LogisticsRecord>) => {
    const updatedRecords = records.map(record =>
      record.id === id 
        ? { ...record, ...updates, last_update: new Date().toISOString() }
        : record
    )
    setRecords(updatedRecords)
    saveToLocal(updatedRecords)
  }

  // 删除记录
  const deleteRecord = async (id: string) => {
    // 尝试从云端删除
    if (logisticsService && syncStatus.isConnected && syncStatus.isOnline) {
      const { error } = await logisticsService.deleteRecord(id)
      
      if (error) {
        console.error('❌ 云端删除失败:', error)
        // 云端失败，本地删除
        deleteRecordLocally(id)
        setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
        toast.warning('已在本地删除，将在云端恢复时同步')
          } else {
        toast.success('记录已删除')
        // 实时订阅会自动更新列表
          }
        } else {
      // 云端不可用，本地删除
      deleteRecordLocally(id)
      setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
      toast.success('已在本地删除')
    }
  }

  // 本地删除记录
  const deleteRecordLocally = (id: string) => {
    const updatedRecords = records.filter(record => record.id !== id)
    setRecords(updatedRecords)
    saveToLocal(updatedRecords)
  }

  // 手动同步
  const manualSync = async () => {
    if (!logisticsService) {
      toast.error('云端服务不可用')
      return
    }

    setLoading(true)
    
    try {
      const success = await loadCloudRecords(logisticsService)
      if (success) {
        toast.success('同步成功')
      } else {
        toast.error('同步失败')
      }
    } catch (error) {
      toast.error('同步失败')
    } finally {
      setLoading(false)
    }
  }

  // 过滤记录
  const filteredRecords = records.filter(record =>
    record.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.carrier_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.recipient || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const favoriteRecords = filteredRecords.filter(record => record.is_favorite)

  return (
    <div className="space-y-6">
      {/* 同步状态指示器 */}
      <Card className="border-2">
        <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              物流信息管理
              {syncStatus.isConnected ? (
                <Badge variant="default" className="bg-green-100 text-green-700">
                  <Cloud className="h-3 w-3 mr-1" />
                  云端已连接
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  <CloudOff className="h-3 w-3 mr-1" />
                  本地模式
                </Badge>
              )}
              {!syncStatus.isOnline && (
                <Badge variant="destructive">
                  <WifiOff className="h-3 w-3 mr-1" />
                  离线
                </Badge>
              )}
            </CardTitle>
            
          <div className="flex items-center gap-2">
              {syncStatus.pendingChanges > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {syncStatus.pendingChanges} 个待同步
                </Badge>
              )}
              
            <Button
                variant="outline"
                size="sm"
                onClick={manualSync}
                disabled={loading || !logisticsService}
                className="flex items-center gap-1"
              >
                <Wifi className="h-3 w-3" />
                同步
            </Button>
            </div>
          </div>
          
          {syncStatus.lastSync && (
            <p className="text-xs text-muted-foreground">
              最后同步: {new Date(syncStatus.lastSync).toLocaleString()}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 添加记录表单 */}
          <div className="flex gap-2">
              <Input
              placeholder="输入快递单号 (如DHL、FedEx、UPS等)"
                value={trackingNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTrackingNumber(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter') {
                  addRecord()
                }
              }}
              className="flex-1"
            />
            
              <select
                value={selectedCarrier}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCarrier(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {Object.entries(CARRIERS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                  </option>
                ))}
              </select>
            
            <Button
              onClick={addRecord}
              disabled={loading || !trackingNumber.trim()}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              添加
            </Button>
          </div>
          
          {/* 搜索框 */}
          <Input
            placeholder="搜索单号、快递公司、收件人、负责人..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* 记录统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-muted-foreground">全部记录</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{favoriteRecords.length}</div>
            <p className="text-xs text-muted-foreground">收藏记录</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {records.filter(r => r.status === '运输中').length}
            </div>
            <p className="text-xs text-muted-foreground">运输中</p>
          </CardContent>
        </Card>
              </div>
          
      {/* 记录列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">我的物流管理</CardTitle>
          <p className="text-sm text-muted-foreground">
            共 {filteredRecords.length} 个单号，显示 {filteredRecords.length} 条记录
          </p>
        </CardHeader>
        
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? '没有找到匹配的记录' : '暂无记录'}
              </p>
              </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                      <Truck className="h-5 w-5 text-muted-foreground" />
            </div>
            
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {record.tracking_number}
                  </span>
                        <Badge variant="outline" className="text-xs">
                          {record.carrier_name || record.carrier}
                        </Badge>
                        {record.status && (
                          <Badge 
                            variant={STATUS_COLORS[record.status as keyof typeof STATUS_COLORS] || 'default'}
                            className="text-xs"
                          >
                            {record.status}
                          </Badge>
                          )}
          </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {record.destination && (
                          <span>目的地: {record.destination} • </span>
                        )}
                        {record.recipient && (
                          <span>收件人: {record.recipient} • </span>
                        )}
                        最后更新: {new Date(record.last_update).toLocaleString()}
                  </div>
                            </div>
                        </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(record.id)}
                      className="h-8 w-8 p-0"
                    >
                      {record.is_favorite ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    
                      <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRecord(record.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
=======
    const cleanTrackingNumber = trackingNumber.trim().replace(/\s/g, '')
    
    // 检查是否已存在
    const existingIndex = trackingHistory.findIndex(record => 
      record.trackingNumber === cleanTrackingNumber
    )

    if (existingIndex !== -1) {
      // 更新已存在的记录
      const updatedHistory = [...trackingHistory]
      updatedHistory[existingIndex] = {
        ...updatedHistory[existingIndex],
        queryCount: (updatedHistory[existingIndex].queryCount || 0) + 1,
        lastQueried: new Date().toISOString(),
        note: note || updatedHistory[existingIndex].note,
        tags: updatedHistory[existingIndex].tags || [] // 确保tags字段存在
      }
      saveHistory(updatedHistory)
      toast.success('已更新现有记录')
      setTrackingNumber('')
      setNote('')
      return
    }

    setIsLoading(true)
    
    try {
      const detectedCarrier = selectedCarrier === 'auto' 
        ? detectCarrier(cleanTrackingNumber)
        : carriers.find(c => c.code === selectedCarrier) || carriers[0]
      
      // 尝试API查询
      const apiResult = await queryTrackingAPI(cleanTrackingNumber, detectedCarrier)
      
      const newRecord: TrackingRecord = {
        id: Date.now().toString(),
        trackingNumber: cleanTrackingNumber,
        carrier: detectedCarrier.code,
        carrierName: detectedCarrier.name,
        status: '运输中',
        lastUpdate: new Date().toISOString(),
        officialUrl: detectedCarrier.trackingUrl + cleanTrackingNumber,
        note: note || '',
        tags: newTag ? [newTag] : [],
        isFavorite: false,
        queryCount: 1,
        lastQueried: new Date().toISOString(),
        isApiAvailable: apiResult.isApiAvailable,
        apiStatus: apiResult.apiStatus,
        isDelivered: false, // 新增：默认未签收
        deliveryDate: undefined, // 新增：默认无签收日期
        events: apiResult.events
      }

      const updatedHistory = [newRecord, ...trackingHistory]
      saveHistory(updatedHistory)
      
      toast.success(`已添加 ${detectedCarrier.name} 快递单号`)
      setTrackingNumber('')
      setNote('')
      setNewTag('')
      setActiveTab('history')
      
    } catch (error) {
      toast.error('添加失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 删除记录
  const handleDelete = (id: string) => {
    const updatedHistory = trackingHistory.filter(record => record.id !== id)
    saveHistory(updatedHistory)
    toast.success('已删除记录')
  }

  // 切换收藏状态
  const toggleFavorite = (id: string) => {
    const updatedHistory = trackingHistory.map(record =>
      record.id === id ? { ...record, isFavorite: !record.isFavorite } : record
    )
    saveHistory(updatedHistory)
  }

  // 复制单号
  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber)
    toast.success('已复制单号')
  }

  // 设置预计到达时间
  const setEstimatedDelivery = (recordId: string, date: string) => {
    if (!date) return // 如果没有选择日期，不进行保存
    
    const updatedHistory = trackingHistory.map(record =>
      record.id === recordId 
        ? { ...record, estimatedDelivery: date }
        : record
    )
    saveHistory(updatedHistory)
    setEditingRecord(null)
    setTempEstimatedDate('')
    toast.success('已设置预计到达时间')
  }

  // 开始编辑收件人
  const startEditingRecipient = (recordId: string, currentRecipient: string) => {
    setEditingRecipient(recordId)
    setTempRecipientName(currentRecipient || '')
  }

  // 保存收件人修改
  const saveRecipientEdit = (recordId: string, newRecipient: string) => {
    const updatedHistory = trackingHistory.map(record =>
      record.id === recordId 
        ? { ...record, note: newRecipient.trim() || '' }
        : record
    )
    saveHistory(updatedHistory)
    setEditingRecipient(null)
    setTempRecipientName('')
    setShowEditRecipientSuggestions(false)
    
    if (newRecipient.trim()) {
      toast.success('已更新收件人信息')
    } else {
      toast.success('已清空收件人信息')
    }
  }

  // 取消编辑收件人
  const cancelRecipientEdit = () => {
    setEditingRecipient(null)
    setTempRecipientName('')
    setShowEditRecipientSuggestions(false)
  }

  // 开始编辑负责人
  const startEditingResponsible = (recordId: string, currentResponsible: string) => {
    setEditingResponsible(recordId)
    setTempResponsibleName(currentResponsible || '')
  }

  // 保存负责人修改
  const saveResponsibleEdit = (recordId: string, newResponsible: string) => {
    const updatedHistory = trackingHistory.map(record => {
      if (record.id === recordId) {
        const updatedTags = [...record.tags]
        if (newResponsible.trim()) {
          // 如果有输入新的负责人，更新第一个tag（负责人位置）
          if (updatedTags.length > 0) {
            updatedTags[0] = newResponsible.trim()
          } else {
            updatedTags.unshift(newResponsible.trim())
          }
        } else {
          // 如果清空负责人，移除第一个tag
          if (updatedTags.length > 0) {
            updatedTags.shift()
          }
        }
        return { ...record, tags: updatedTags }
      }
      return record
    })
    saveHistory(updatedHistory)
    setEditingResponsible(null)
    setTempResponsibleName('')
    setShowEditResponsibleSuggestions(false)
    
    if (newResponsible.trim()) {
      toast.success('已更新负责人信息')
    } else {
      toast.success('已清空负责人信息')
    }
  }

  // 取消编辑负责人
  const cancelResponsibleEdit = () => {
    setEditingResponsible(null)
    setTempResponsibleName('')
    setShowEditResponsibleSuggestions(false)
  }

  // 标记为已签收
  const markAsDelivered = (recordId: string) => {
    const updatedHistory = trackingHistory.map(record =>
      record.id === recordId 
        ? { 
            ...record, 
            isDelivered: true, 
            deliveryDate: new Date().toISOString(),
            status: '已签收'
          }
        : record
    )
    saveHistory(updatedHistory)
    toast.success('已标记为签收')
  }

  // 取消已签收状态
  const unmarkDelivered = (recordId: string) => {
    const updatedHistory = trackingHistory.map(record =>
      record.id === recordId 
        ? { 
            ...record, 
            isDelivered: false, 
            deliveryDate: undefined,
            status: '运输中'
          }
        : record
    )
    saveHistory(updatedHistory)
    toast.success('已取消签收状态')
  }

  // 开始编辑预计时间
  const startEditingEstimate = (recordId: string, currentDate?: string) => {
    setEditingRecord(recordId)
    setTempEstimatedDate(currentDate || '')
    
    // 延迟打开日期选择器
    setTimeout(() => {
      const dateInput = document.querySelector(`input[type="date"]`) as HTMLInputElement
      if (dateInput && dateInput.showPicker) {
        dateInput.showPicker()
      }
    }, 50)
  }

  // 快速查询（更新查询计数）
  const handleQuickQuery = (record: TrackingRecord) => {
    const updatedHistory = trackingHistory.map(r =>
      r.id === record.id 
        ? { ...r, queryCount: r.queryCount + 1, lastQueried: new Date().toISOString() }
        : r
    )
    saveHistory(updatedHistory)
    
    // 打开官网查询链接
    window.open(record.officialUrl, '_blank')
    toast.success(`已跳转到 ${record.carrierName} 官网查询`)
  }

  // 获取所有负责人
  const getAllResponsible = () => {
    const allResponsible = new Set<string>()
    trackingHistory.forEach(record => {
      if (record.tags && record.tags.length > 0) {
        record.tags.forEach(tag => allResponsible.add(tag))
      }
    })
    return Array.from(allResponsible).sort()
  }

  // 获取所有收件人
  const getAllRecipients = () => {
    const allRecipients = new Set<string>()
    trackingHistory.forEach(record => {
      if (record.note && record.note.trim()) {
        allRecipients.add(record.note.trim())
      }
    })
    return Array.from(allRecipients).sort()
  }

  // 过滤和排序记录
  const filteredHistory = trackingHistory
    .filter(record => {
      // 搜索匹配
      let matchesSearch = !searchQuery
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        switch (searchType) {
          case 'number':
            matchesSearch = record.trackingNumber.toLowerCase().includes(query)
            break
                  case 'recipient':
          matchesSearch = record.note?.toLowerCase().includes(query) || false
          break
          case 'carrier':
            matchesSearch = record.carrierName.toLowerCase().includes(query)
            break
          default: // 'all'
                      matchesSearch = record.trackingNumber.toLowerCase().includes(query) ||
                        record.carrierName.toLowerCase().includes(query) ||
                        record.note?.toLowerCase().includes(query) ||
                        (record.tags && record.tags.some(responsible => responsible.toLowerCase().includes(query)))
        }
      }

      // 标签筛选
      const matchesTag = selectedTagFilter === 'all' || 
        (record.tags && record.tags.includes(selectedTagFilter))

      // 签收状态筛选
      const matchesDeliveryStatus = deliveryStatusFilter === 'all' ||
        (deliveryStatusFilter === 'delivered' && record.isDelivered) ||
        (deliveryStatusFilter === 'pending' && !record.isDelivered)

      // 收藏筛选
      if (activeTab === 'favorites') {
        return matchesSearch && matchesTag && matchesDeliveryStatus && record.isFavorite
      }
      
      return matchesSearch && matchesTag && matchesDeliveryStatus
    })
    .sort((a, b) => {
      // 已签收的记录排在最后
      if (a.isDelivered && !b.isDelivered) return 1
      if (!a.isDelivered && b.isDelivered) return -1
      
      // 其他按最后查询时间倒序排列
      return new Date(b.lastQueried).getTime() - new Date(a.lastQueried).getTime()
    })

  // 获取载体图标
  const getCarrierIcon = (carrierCode: string) => {
    const carrier = carriers.find(c => c.code === carrierCode)
    return carrier?.icon || '📦'
  }

  return (
    <div className="space-y-6">
      {/* 添加新单号 */}
      <Card className="p-4">
        {/* 大屏幕：一行显示 */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-gray-700">
            <Package className="w-5 h-5" />
            <span className="font-medium whitespace-nowrap">添加快递单号</span>
          </div>
          
          {/* 快递单号输入 - 缩短宽度 */}
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="输入快递单号 (支持DHL、FedEx、UPS等)"
              className="h-10"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTracking()}
            />
          </div>

          {/* 载体选择 */}
          <div className="w-32">
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="w-full h-10 px-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="auto">🤖 自动识别</option>
              {carriers.map(carrier => (
                <option key={carrier.code} value={carrier.code}>
                  {carrier.icon} {carrier.name}
                </option>
              ))}
            </select>
          </div>

          {/* 收件人输入 - 增加宽度 */}
          <div className="w-40 relative">
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onFocus={() => setShowRecipientSuggestions(true)}
              onBlur={() => setTimeout(() => setShowRecipientSuggestions(false), 200)}
              placeholder="收件人"
              className="h-10 text-sm"
            />
            {showRecipientSuggestions && getAllRecipients().length > 0 && (
              <div className="absolute z-10 w-full min-w-48 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
                {getAllRecipients().filter(recipient => 
                  recipient.toLowerCase().includes(note.toLowerCase())
                ).map(recipient => (
                  <div
                    key={recipient}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm whitespace-nowrap"
                    onClick={() => {
                      setNote(recipient)
                      setShowRecipientSuggestions(false)
                    }}
                  >
                    👤 {recipient}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 负责人输入 - 增加宽度 */}
          <div className="w-32 relative">
            <Input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onFocus={() => setShowResponsibleSuggestions(true)}
              onBlur={() => setTimeout(() => setShowResponsibleSuggestions(false), 200)}
              placeholder="负责人"
              className="h-10 text-sm"
            />
            {showResponsibleSuggestions && getAllResponsible().length > 0 && (
              <div className="absolute z-10 w-full min-w-40 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
                {getAllResponsible().filter(responsible => 
                  responsible.toLowerCase().includes(newTag.toLowerCase())
                ).map(responsible => (
                  <div
                    key={responsible}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm whitespace-nowrap"
                    onClick={() => {
                      setNewTag(responsible)
                      setShowResponsibleSuggestions(false)
                    }}
                  >
                    👨‍💼 {responsible}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 添加按钮 */}
          <Button 
            onClick={handleAddTracking} 
            className="h-10 px-4 whitespace-nowrap" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                正在添加...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                添加到我的物流列表
              </>
            )}
          </Button>
        </div>

        {/* 小屏幕：紧凑布局 */}
        <div className="lg:hidden space-y-3">
          <div className="flex items-center space-x-2 text-gray-700 mb-3">
            <Package className="w-5 h-5" />
            <span className="font-medium">添加快递单号</span>
          </div>
          
          {/* 第一行：单号 + 载体 */}
          <div className="flex space-x-2">
            <div className="flex-1 max-w-xs">
              <Input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="输入快递单号"
                className="h-10"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTracking()}
              />
            </div>
            <div className="w-28">
              <select
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value)}
                className="w-full h-10 px-2 text-xs border border-gray-300 rounded-md"
              >
                <option value="auto">🤖 自动</option>
                {carriers.map(carrier => (
                  <option key={carrier.code} value={carrier.code}>
                    {carrier.icon} {carrier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 第二行：收件人 + 负责人 + 按钮 */}
          <div className="flex space-x-2">
            <div className="flex-1 relative min-w-0">
              <Input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onFocus={() => setShowRecipientSuggestions(true)}
                onBlur={() => setTimeout(() => setShowRecipientSuggestions(false), 200)}
                placeholder="收件人 (可选)"
                className="h-10 text-sm"
              />
              {showRecipientSuggestions && getAllRecipients().length > 0 && (
                <div className="absolute z-10 w-full min-w-48 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
                  {getAllRecipients().filter(recipient => 
                    recipient.toLowerCase().includes(note.toLowerCase())
                  ).map(recipient => (
                    <div
                      key={recipient}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm whitespace-nowrap"
                      onClick={() => {
                        setNote(recipient)
                        setShowRecipientSuggestions(false)
                      }}
                    >
                      👤 {recipient}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="w-24 relative">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onFocus={() => setShowResponsibleSuggestions(true)}
                onBlur={() => setTimeout(() => setShowResponsibleSuggestions(false), 200)}
                placeholder="负责人"
                className="h-10 text-sm"
              />
              {showResponsibleSuggestions && getAllResponsible().length > 0 && (
                <div className="absolute z-10 w-full min-w-40 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
                  {getAllResponsible().filter(responsible => 
                    responsible.toLowerCase().includes(newTag.toLowerCase())
                  ).map(responsible => (
                    <div
                      key={responsible}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm whitespace-nowrap"
                      onClick={() => {
                        setNewTag(responsible)
                        setShowResponsibleSuggestions(false)
                      }}
                    >
                      👨‍💼 {responsible}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleAddTracking} 
              className="h-10 px-3 whitespace-nowrap" 
              disabled={isLoading}
            >
              {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span className="ml-1 hidden sm:inline">添加</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 历史记录管理 */}
      <Card className="p-6">
        {/* 一行式标题栏 */}
            <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-bold text-gray-800">📋 我的物流管理</h3>
            <span className="text-sm text-gray-500">共 {trackingHistory.length} 个单号</span>
            <span className="text-sm text-gray-500">显示 {filteredHistory.length} 条记录</span>
          </div>
          <div className="text-sm text-gray-400">
            物流追踪管理
          </div>
        </div>

        {/* 标签页和高级筛选 - 一行显示 */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* 标签页 */}
              <div className="flex items-center space-x-2">
                <Button
              size="sm"
              variant={activeTab === 'history' ? 'default' : 'outline'}
              onClick={() => setActiveTab('history')}
            >
              <History className="w-4 h-4 mr-1" />
              全部记录 ({trackingHistory.length})
            </Button>
            <Button
                  size="sm"
              variant={activeTab === 'favorites' ? 'default' : 'outline'}
              onClick={() => setActiveTab('favorites')}
                >
              <Star className="w-4 h-4 mr-1" />
              收藏 ({trackingHistory.filter(r => r.isFavorite).length})
                </Button>
            </div>
            
          {/* 负责人筛选 */}
          {getAllResponsible().length > 0 && (
                <div className="flex items-center space-x-2">
              <span className="text-gray-500">👨‍💼</span>
              <select
                value={selectedTagFilter}
                onChange={(e) => setSelectedTagFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 h-8"
              >
                <option value="all">全部负责人</option>
                {getAllResponsible().map(responsible => (
                  <option key={responsible} value={responsible}>{responsible}</option>
                ))}
              </select>
            </div>
          )}
            
          {/* 签收状态筛选 */}
                <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-gray-500" />
            <select
              value={deliveryStatusFilter}
              onChange={(e) => setDeliveryStatusFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 h-8"
            >
              <option value="all">全部状态</option>
              <option value="pending">🚚 运输中</option>
              <option value="delivered">✅ 已签收</option>
            </select>
          </div>
          
          {/* 搜索类型 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">搜索:</span>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 h-8"
            >
              <option value="all">全部</option>
              <option value="number">单号</option>
              <option value="carrier">快递公司</option>
              <option value="recipient">收件人</option>
            </select>
          </div>
          
          {/* 搜索框 */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchType === 'number' ? '搜索单号...' :
                searchType === 'carrier' ? '搜索快递公司...' :
                searchType === 'recipient' ? '搜索收件人...' :
                '搜索单号、快递公司、收件人、负责人...'
              }
              className="pl-10 h-8"
            />
          </div>
          
          {/* 清除筛选 */}
          {(searchQuery || selectedTagFilter !== 'all' || deliveryStatusFilter !== 'all') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedTagFilter('all')
                setSearchType('all')
                setDeliveryStatusFilter('all')
              }}
              className="h-8 px-3"
            >
              清除筛选
            </Button>
          )}
        </div>

        {/* 记录列表 */}
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无记录</p>
              {activeTab === 'favorites' && (
                <p className="text-sm mt-2">点击⭐收藏常用的快递单号</p>
              )}
            </div>
          ) : (
            filteredHistory.map((record) => (
              <Card key={record.id} className="p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  {/* 载体图标 */}
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{getCarrierIcon(record.carrier)}</span>
                  </div>

                  {/* 主要信息区域 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {/* 单号 */}
                      <h4 className="font-semibold text-gray-800 truncate max-w-xs">
                        {record.trackingNumber}
                      </h4>
                      
                      {/* 复制按钮 */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 flex-shrink-0"
                        onClick={() => copyTrackingNumber(record.trackingNumber)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      {/* 载体名称 */}
                      <span className="text-sm text-gray-600 truncate">
                        {record.carrierName}
                      </span>
                      
                      {/* API状态 */}
                      <div className="flex items-center text-sm">
                        {record.isApiAvailable ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 次要信息区域 */}
                  <div className="flex items-center space-x-3 text-sm text-gray-500 flex-shrink-0">
                    {/* 收件人信息 - 显示在最前面 */}
                    {editingRecipient === record.id ? (
                      <div className="flex items-center space-x-1 relative">
                        <span className="text-gray-700">👤</span>
                        <div className="relative">
                          <input
                            type="text"
                            value={tempRecipientName}
                            onChange={(e) => setTempRecipientName(e.target.value)}
                            onFocus={() => setShowEditRecipientSuggestions(true)}
                            onBlur={() => {
                              setTimeout(() => setShowEditRecipientSuggestions(false), 200)
                              // 点击空白处自动保存
                              saveRecipientEdit(record.id, tempRecipientName)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                saveRecipientEdit(record.id, tempRecipientName)
                              } else if (e.key === 'Escape') {
                                e.preventDefault()
                                cancelRecipientEdit()
                              }
                            }}
                            className="text-sm border border-blue-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none"
                            style={{
                              width: `${Math.max(8, Math.min(20, tempRecipientName.length + 2))}ch`,
                              minWidth: '8ch',
                              maxWidth: '20ch'
                            }}
                            placeholder="收件人"
                            autoFocus
                          />
                          {showEditRecipientSuggestions && getAllRecipients().length > 0 && (
                            <div className="absolute z-30 w-full min-w-48 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
                              {getAllRecipients().filter(recipient =>
                                recipient.toLowerCase().includes(tempRecipientName.toLowerCase())
                              ).map(recipient => (
                                <div
                                  key={recipient}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm whitespace-nowrap"
                                  onClick={() => {
                                    setTempRecipientName(recipient)
                                    setShowEditRecipientSuggestions(false)
                                  }}
                                >
                                  👤 {recipient}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => saveRecipientEdit(record.id, tempRecipientName)}
                        >
                          <Check className="w-3 h-3 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={cancelRecipientEdit}
                        >
                          <XCircle className="w-3 h-3 text-gray-400" />
                        </Button>
                      </div>
                    ) : (
                                            <span 
                        className={`font-medium cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors ${
                          record.note ? 'text-gray-700' : 'text-gray-400 italic border border-dashed border-gray-300 hover:border-blue-400 hover:text-blue-600'
                        }`}
                        title={record.note ? `单击编辑收件人: ${record.note}` : '单击添加收件人'}
                        onClick={() => startEditingRecipient(record.id, record.note || '')}
                      >
                         👤 {record.note || '添加收件人'}
                      </span>
                    )}

                    {/* 预计到达时间 - 收件人后面，更显眼 */}
                    {editingRecord === record.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="date"
                          value={tempEstimatedDate}
                          onChange={(e) => {
                            setTempEstimatedDate(e.target.value)
                            // 选择日期后自动保存
                            setEstimatedDelivery(record.id, e.target.value)
                          }}
                          onBlur={() => {
                            // 点击空白处也自动保存
                            if (tempEstimatedDate) {
                              setEstimatedDelivery(record.id, tempEstimatedDate)
                            } else {
                              setEditingRecord(null)
                            }
                          }}
                          className="text-sm border rounded px-2 py-1 w-32"
                          autoFocus
                          onClick={(e) => {
                            // 立即打开日期选择器
                            e.currentTarget.showPicker?.()
                          }}
                        />
                      </div>
                    ) : (
                      <span 
                        className="whitespace-nowrap cursor-pointer hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 font-medium"
                        onClick={() => startEditingEstimate(record.id, record.estimatedDelivery)}
                        title="点击设置预计到达时间"
                      >
                        {record.estimatedDelivery 
                          ? `预计到达: ${new Date(record.estimatedDelivery).toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: 'numeric',
                              day: 'numeric'
                            })}`
                          : '📅 设置预计到达时间'
                        }
                      </span>
                    )}

                    {/* 状态标识 */}
                    {record.isDelivered ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded font-medium text-sm">
                        ✅ 已签收
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm">
                        🚚 运输中
                      </span>
                    )}
                    
                    {/* 负责人 - 可编辑 */}
                    {editingResponsible === record.id ? (
                      <div className="flex items-center space-x-1 relative">
                        <span className="text-gray-700">👨‍💼</span>
                        <div className="relative">
                          <input
                            type="text"
                            value={tempResponsibleName}
                            onChange={(e) => setTempResponsibleName(e.target.value)}
                            onFocus={() => setShowEditResponsibleSuggestions(true)}
                            onBlur={() => {
                              setTimeout(() => setShowEditResponsibleSuggestions(false), 200)
                              // 点击空白处自动保存
                              saveResponsibleEdit(record.id, tempResponsibleName)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                saveResponsibleEdit(record.id, tempResponsibleName)
                              } else if (e.key === 'Escape') {
                                e.preventDefault()
                                cancelResponsibleEdit()
                              }
                            }}
                            className="text-sm border border-purple-300 rounded px-2 py-1 focus:border-purple-500 focus:outline-none"
                            style={{
                              width: `${Math.max(8, Math.min(20, tempResponsibleName.length + 2))}ch`,
                              minWidth: '8ch',
                              maxWidth: '20ch'
                            }}
                            placeholder="负责人"
                            autoFocus
                          />
                          {showEditResponsibleSuggestions && getAllResponsible().length > 0 && (
                            <div className="absolute z-30 w-full min-w-48 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
                              {getAllResponsible().filter(responsible =>
                                responsible.toLowerCase().includes(tempResponsibleName.toLowerCase())
                              ).map(responsible => (
                                <div
                                  key={responsible}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm whitespace-nowrap"
                                  onClick={() => {
                                    setTempResponsibleName(responsible)
                                    setShowEditResponsibleSuggestions(false)
                                  }}
                                >
                                  👨‍💼 {responsible}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => saveResponsibleEdit(record.id, tempResponsibleName)}
                        >
                          <Check className="w-3 h-3 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={cancelResponsibleEdit}
                        >
                          <XCircle className="w-3 h-3 text-gray-400" />
                        </Button>
                      </div>
                    ) : (
                      <span 
                        className={`px-2 py-1 text-sm rounded whitespace-nowrap cursor-pointer hover:bg-purple-50 transition-colors ${
                          record.tags && record.tags.length > 0 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'text-gray-400 italic border border-dashed border-gray-300 hover:border-purple-400 hover:text-purple-600'
                        }`}
                        title={record.tags && record.tags.length > 0 ? `单击编辑负责人: ${record.tags[0]}` : '单击添加负责人'}
                        onClick={() => startEditingResponsible(record.id, record.tags && record.tags.length > 0 ? record.tags[0] : '')}
                      >
                        👨‍💼 {record.tags && record.tags.length > 0 ? record.tags[0] : '添加负责人'}
                        {record.tags && record.tags.length > 1 && (
                          <span className="text-gray-400 ml-1">+{record.tags.length - 1}</span>
                        )}
                      </span>
                    )}
                    
                    {/* 查询次数 */}
                    <span className="whitespace-nowrap">
                      {record.queryCount}次
                    </span>
                  </div>

                  {/* 操作按钮区域 */}
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleQuickQuery(record)}
                      className="h-9 px-3 text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">官网</span>
                    </Button>
                    
                    {/* 签收切换按钮 */}
                    {record.isDelivered ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => unmarkDelivered(record.id)}
                        className="h-9 w-9 p-0 text-green-600 hover:text-green-700"
                        title="取消签收"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsDelivered(record.id)}
                        className="h-9 w-9 p-0 text-gray-400 hover:text-green-600"
                        title="标记为已签收"
                      >
                        <Package className="w-5 h-5" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFavorite(record.id)}
                      className={`h-9 w-9 p-0 ${record.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
                    >
                      <Star className={`w-5 h-5 ${record.isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(record.id)}
                      className="h-9 w-9 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* 使用说明 */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-4">💡 使用说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">智能功能</h4>
            <ul className="space-y-1 text-xs">
              <li>• 🤖 自动识别快递公司（DHL、FedEx、UPS等）</li>
              <li>• 📱 一键跳转官网查询，省时省力</li>
              <li>• 💾 永久保存历史记录，告别重复查找</li>
              <li>• ⭐ 收藏常用单号，快速访问</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">时间节省</h4>
            <ul className="space-y-1 text-xs">
              <li>• 📋 统一管理所有快递单号</li>
              <li>• 🔍 快速搜索历史记录</li>
              <li>• 📝 添加收件人和负责人分类</li>
              <li>• 📊 查询次数统计，了解使用频率</li>
            </ul>
          </div>
        </div>
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
        </Card>
    </div>
  )
}

<<<<<<< HEAD


=======
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
 