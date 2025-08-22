'use client'

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
    if (!trackingNumber.trim()) {
      toast.error('请输入快递单号')
      return
    }

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
        </Card>
    </div>
  )
}



 