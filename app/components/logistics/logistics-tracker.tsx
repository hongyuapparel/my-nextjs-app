'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Truck, Package, Star, StarOff, Trash2, Plus, Cloud, CloudOff, Wifi, WifiOff, Copy, ExternalLink, Calendar, User, Search } from 'lucide-react'
import { toast } from 'sonner'
import { getLogisticsService, LogisticsRecord } from '../../../lib/supabase'

// 快递公司配置
const CARRIERS = {
  auto: '自动识别',
  shunfeng: '顺丰速运',
  zhongtong: '中通快递',
  yuantong: '圆通速递',
  yunda: '韵达速递',
  shentong: '申通快递',
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
  const [recipient, setRecipient] = useState('')
  const [responsible, setResponsible] = useState('')
  
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
      const result = await service.getAllRecords()
      if (result.error) {
        console.error('❌ 加载云端记录失败:', result.error)
        return false
      }
      
      setRecords(result.data || [])
      console.log(`✅ 从云端加载了 ${result.data?.length || 0} 条记录`)
      return true
    } catch (error: any) {
      console.error('❌ 加载云端记录异常:', error)
      return false
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

    setLoading(true)
    try {
      // 自动识别快递公司
      let carrier = selectedCarrier
      if (selectedCarrier === 'auto') {
        if (trackingNumber.startsWith('1Z')) carrier = 'ups'
        else if (trackingNumber.startsWith('96') || trackingNumber.length === 12) carrier = 'fedex'
        else if (trackingNumber.length === 10) carrier = 'dhl'
        else carrier = 'ems'
      }

      const newRecord: Partial<LogisticsRecord> = {
        tracking_number: trackingNumber.trim(),
        carrier: carrier,
        carrier_name: CARRIERS[carrier as keyof typeof CARRIERS],
        status: '已揽收',
        recipient: recipient.trim() || undefined,
        is_favorite: false
      }

      // 先保存到云端
      if (logisticsService && syncStatus.isConnected) {
        const result = await logisticsService.addRecord(newRecord)
        if (result.error) {
          console.error('❌ 云端保存失败:', result.error)
          toast.error('云端保存失败，已保存到本地')
        } else {
          console.log('✅ 记录已保存到云端')
          toast.success('记录已保存到云端')
          
          // 重新加载云端记录
          await loadCloudRecords(logisticsService)
          
          // 清空输入
          setTrackingNumber('')
          setRecipient('')
          setResponsible('')
          return
        }
      }

      // 如果云端失败，保存到本地
      const localRecord: LogisticsRecord = {
        id: crypto.randomUUID(),
        tracking_number: newRecord.tracking_number!,
        carrier: newRecord.carrier!,
        carrier_name: newRecord.carrier_name!,
        status: newRecord.status!,
        recipient: newRecord.recipient,
        is_favorite: newRecord.is_favorite!,
        last_update: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      const updatedRecords = [localRecord, ...records]
      setRecords(updatedRecords)
      saveToLocal(updatedRecords)
      
      toast.success('记录已保存到本地')
      
      // 清空输入
      setTrackingNumber('')
      setRecipient('')
      setResponsible('')
      
    } catch (error: any) {
      console.error('❌ 添加记录失败:', error)
      toast.error('添加记录失败')
    } finally {
      setLoading(false)
    }
  }

  // 删除记录
  const deleteRecord = async (id: string) => {
    try {
      // 先尝试从云端删除
      if (logisticsService && syncStatus.isConnected) {
        const result = await logisticsService.deleteRecord(id)
        if (result.error) {
          console.error('❌ 云端删除失败:', result.error)
          toast.error('云端删除失败，已从本地删除')
        } else {
          console.log('✅ 记录已从云端删除')
          toast.success('记录已从云端删除')
          
          // 重新加载云端记录
          await loadCloudRecords(logisticsService)
          return
        }
      }

      // 如果云端失败，从本地删除
      const updatedRecords = records.filter(record => record.id !== id)
      setRecords(updatedRecords)
      saveToLocal(updatedRecords)
      
      toast.success('记录已从本地删除')
      
    } catch (error: any) {
      console.error('❌ 删除记录失败:', error)
      toast.error('删除记录失败')
    }
  }

  // 切换收藏状态
  const toggleFavorite = async (id: string) => {
    try {
      const record = records.find(r => r.id === id)
      if (!record) return

      const updatedRecord = { ...record, is_favorite: !record.is_favorite }
      
      // 先尝试更新云端
      if (logisticsService && syncStatus.isConnected) {
        const result = await logisticsService.updateRecord(id, { is_favorite: updatedRecord.is_favorite })
        if (result.error) {
          console.error('❌ 云端更新失败:', result.error)
          toast.error('云端更新失败，已更新本地')
        } else {
          console.log('✅ 收藏状态已更新到云端')
          
          // 重新加载云端记录
          await loadCloudRecords(logisticsService)
          return
        }
      }

      // 如果云端失败，更新本地
      const updatedRecords = records.map(r => 
        r.id === id ? updatedRecord : r
      )
      setRecords(updatedRecords)
      saveToLocal(updatedRecords)
      
      toast.success(updatedRecord.is_favorite ? '已添加到收藏' : '已取消收藏')
      
    } catch (error: any) {
      console.error('❌ 更新收藏状态失败:', error)
      toast.error('更新收藏状态失败')
    }
  }

  // 复制单号
  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber)
    toast.success('单号已复制到剪贴板')
  }

  // 跳转官网
  const openOfficialWebsite = (carrier: string) => {
    const urls: { [key: string]: string } = {
      'dhl': 'https://www.dhl.com',
      'fedex': 'https://www.fedex.com',
      'ups': 'https://www.ups.com',
      'ems': 'https://www.ems.com.cn'
    }
    
    const url = urls[carrier.toLowerCase()] || 'https://www.google.com'
    window.open(url, '_blank')
  }

  // 初始化
  useEffect(() => {
    const init = async () => {
      // 尝试初始化云端服务
      const service = await initializeCloudService()
      
      if (service) {
        // 加载云端记录
        await loadCloudRecords(service)
        
        // 启动实时订阅
        const subscription = service.subscribeToChanges((payload: any) => {
          console.log('🔄 收到实时更新:', payload)
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            loadCloudRecords(service)
          }
        })
        
        if (subscription) {
          setRealtimeSubscription(subscription)
        }
      } else {
        // 如果云端失败，加载本地记录
        try {
          const localRecords = localStorage.getItem('logistics-records')
          if (localRecords) {
            setRecords(JSON.parse(localRecords))
          }
        } catch (error) {
          console.error('❌ 加载本地记录失败:', error)
        }
      }
    }

    init()

    // 清理函数
    return () => {
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe()
      }
    }
  }, [initializeCloudService, loadCloudRecords])

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }))
      if (logisticsService) {
        loadCloudRecords(logisticsService)
      }
    }

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [logisticsService, loadCloudRecords])

  // 过滤记录
  const filteredRecords = records.filter(record => {
    if (searchTerm) {
      return record.tracking_number.includes(searchTerm) ||
             record.carrier_name?.includes(searchTerm) ||
             record.recipient?.includes(searchTerm)
    }
    return true
  })

  const favoriteRecords = records.filter(record => record.is_favorite)

  return (
    <div className="space-y-6">
      {/* 同步状态指示器 */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`flex items-center gap-1 ${syncStatus.isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {syncStatus.isConnected ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
          {syncStatus.isConnected ? '云端同步' : '本地模式'}
        </div>
        <div className={`flex items-center gap-1 ${syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {syncStatus.isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {syncStatus.isOnline ? '在线' : '离线'}
        </div>
        {syncStatus.lastSync && (
          <span className="text-gray-500">
            最后同步: {new Date(syncStatus.lastSync).toLocaleString()}
          </span>
        )}
      </div>

      {/* 添加记录表单 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            添加快递单号
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">快递单号</label>
              <Input
                placeholder="输入快递单号 (支持DHL、FedEx、UPS等)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRecord()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">快递公司</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value)}
              >
                {Object.entries(CARRIERS).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">收件人</label>
              <Input
                placeholder="收件人姓名"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">负责人</label>
              <Input
                placeholder="负责人姓名"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={addRecord} 
            disabled={loading || !trackingNumber.trim()}
            className="w-full"
          >
            {loading ? '添加中...' : '+ 添加到我的物流列表'}
          </Button>
        </CardContent>
      </Card>

      {/* 记录列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            我的物流管理
          </CardTitle>
          <div className="text-sm text-gray-500">
            共 {records.length} 个单号 显示 {filteredRecords.length} 条记录
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索单号、快递公司、收件人..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>

          {/* 记录列表 */}
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-mono text-sm">{record.tracking_number}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyTrackingNumber(record.tracking_number)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Badge variant={STATUS_COLORS[record.status as keyof typeof STATUS_COLORS] || 'default'}>
                    {record.status}
                  </Badge>
                  
                  <span className="text-sm text-gray-600">{record.carrier_name}</span>
                  
                  {record.recipient && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      {record.recipient}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openOfficialWebsite(record.carrier)}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(record.id)}
                  >
                    {record.is_favorite ? (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRecord(record.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                暂无物流记录
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 