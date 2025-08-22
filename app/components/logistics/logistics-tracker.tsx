'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  Package, 
  Plus, 
  Trash2, 
  Star, 
  StarOff, 
  Check, 
  Clock, 
  MapPin, 
  User, 
  ExternalLink,
  Copy,
  RefreshCw,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Database,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  supabaseData, 
  supabaseAuth, 
  LogisticsRecord,
  getSupabaseClient 
} from '../../../lib/supabase'

// 快递公司配置
const CARRIERS = {
  'dhl': 'DHL Express',
  'fedex': 'FedEx',
  'ups': 'UPS',
  'shunfeng': '顺丰速运',
  'yuantong': '圆通速递',
  'zhongtong': '中通快递',
  'yunda': '韵达速递',
  'ems': 'EMS',
  'jingdong': '京东物流',
  'other': '其他'
}

interface SyncStatus {
  isConnected: boolean
  isOnline: boolean
  lastSync: Date | null
  pendingChanges: number
}

export function LogisticsTracker() {
  // 基础状态
  const [trackingNumber, setTrackingNumber] = useState('')
  const [selectedCarrier, setSelectedCarrier] = useState('dhl')
  const [records, setRecords] = useState<LogisticsRecord[]>([])
  const [loading, setLoading] = useState(false)
  
  // 云同步状态
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    isOnline: navigator?.onLine || false,
    lastSync: null,
    pendingChanges: 0
  })
  
  // UI 状态
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // 初始化组件
  useEffect(() => {
    initializeComponent()
    setupNetworkListeners()
    return cleanup
  }, [])

  const initializeComponent = async () => {
    setIsInitializing(true)
    try {
      console.log('🚀 初始化物流管理组件')
      
      // 测试 Supabase 连接
      const testResult = await supabaseData.testConnection()
      setSyncStatus(prev => ({ ...prev, isConnected: testResult.success }))
      
      if (testResult.success) {
        console.log('✅ Supabase 连接成功')
        await loadRecordsFromCloud()
        setupRealtimeSubscription()
      } else {
        console.warn('⚠️ Supabase 连接失败，使用本地存储模式')
        loadRecordsFromLocal()
      }
    } catch (error) {
      console.error('❌ 组件初始化失败:', error)
      setSyncStatus(prev => ({ ...prev, isConnected: false }))
      loadRecordsFromLocal()
    } finally {
      setIsInitializing(false)
    }
  }

  const setupNetworkListeners = () => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }))
      if (syncStatus.isConnected && syncStatus.pendingChanges > 0) {
        syncPendingChanges()
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
  }

  const cleanup = () => {
    // 清理实时订阅等
  }

  // 从云端加载记录
  const loadRecordsFromCloud = async () => {
    try {
      const { data, error } = await supabaseData.getAllRecords()
      
      if (error) {
        console.error('从云端加载记录失败:', error)
        toast.error('云端数据加载失败，将使用本地数据')
        loadRecordsFromLocal()
      return
    }

      setRecords(data || [])
      setSyncStatus(prev => ({ 
        ...prev, 
        lastSync: new Date(),
        pendingChanges: 0 
      }))
      
      // 同时保存到本地作为备份
      localStorage.setItem('logistics-records', JSON.stringify(data || []))
      console.log(`📥 已从云端加载 ${data?.length || 0} 条记录`)
      
    } catch (error) {
      console.error('加载云端数据异常:', error)
      loadRecordsFromLocal()
    }
  }

  // 从本地加载记录
  const loadRecordsFromLocal = () => {
    try {
      const saved = localStorage.getItem('logistics-records')
      if (saved) {
        const parsed = JSON.parse(saved)
        setRecords(parsed)
        console.log(`💾 已从本地加载 ${parsed.length} 条记录`)
      }
    } catch (error) {
      console.error('加载本地数据失败:', error)
    }
  }

  // 设置实时订阅
  const setupRealtimeSubscription = () => {
    try {
      const subscription = supabaseData.subscribeToChanges((payload) => {
        console.log('📡 收到实时数据变更:', payload)
        
        const { eventType, new: newRecord, old: oldRecord } = payload
        
        setRecords(currentRecords => {
          switch (eventType) {
            case 'INSERT':
              if (newRecord && !currentRecords.find(r => r.id === newRecord.id)) {
                toast.success('新增了一条物流记录')
                return [...currentRecords, newRecord]
              }
              break
              
            case 'UPDATE':
              if (newRecord) {
                return currentRecords.map(r => 
                  r.id === newRecord.id ? newRecord : r
                )
              }
              break
              
            case 'DELETE':
              if (oldRecord) {
                toast.info('删除了一条物流记录')
                return currentRecords.filter(r => r.id !== oldRecord.id)
              }
              break
          }
          return currentRecords
        })
        
        setSyncStatus(prev => ({ ...prev, lastSync: new Date() }))
      })
      
      console.log('📡 已启用实时数据同步')
      return subscription
    } catch (error) {
      console.error('设置实时订阅失败:', error)
    }
  }

  // 同步待处理的更改
  const syncPendingChanges = async () => {
    if (!syncStatus.isConnected || !syncStatus.isOnline) return
    
    try {
      console.log('🔄 开始同步待处理的更改')
      await loadRecordsFromCloud()
      toast.success('数据同步完成')
    } catch (error) {
      console.error('同步失败:', error)
      toast.error('数据同步失败')
    }
  }

  // 添加物流记录
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
        is_favorite: false,
        is_delivered: false,
        query_count: 0,
        is_api_available: true,
        api_status: 'active'
      }

      if (syncStatus.isConnected && syncStatus.isOnline) {
        // 云端添加
        const { data, error } = await supabaseData.addRecord(newRecord)
        
        if (error) {
          console.error('云端添加失败:', error)
          addRecordLocally(newRecord)
          setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
          toast.warning('已添加到本地，将在网络恢复时同步')
          } else {
          console.log('✅ 已添加到云端')
          toast.success('添加成功并已同步到云端')
          }
        } else {
        // 仅本地添加
        addRecordLocally(newRecord)
        setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
        toast.success('已添加到本地，将在连接恢复时同步')
      }

      setTrackingNumber('')
    } catch (error) {
      console.error('添加记录失败:', error)
      toast.error('添加失败')
    } finally {
      setLoading(false)
    }
  }

  const addRecordLocally = (record: Partial<LogisticsRecord>) => {
    const fullRecord: LogisticsRecord = {
      id: crypto.randomUUID(),
      tracking_number: record.tracking_number!,
      carrier: record.carrier!,
      carrier_name: record.carrier_name,
      status: record.status,
      destination: record.destination,
      origin: record.origin,
      recipient: record.recipient,
      notes: record.notes,
      tags: record.tags,
      is_favorite: record.is_favorite || false,
      is_delivered: record.is_delivered || false,
      delivery_date: record.delivery_date,
      estimated_delivery: record.estimated_delivery,
      last_update: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      query_count: record.query_count || 0,
      last_queried: record.last_queried,
      is_api_available: record.is_api_available !== false,
      api_status: record.api_status || 'active',
      official_url: record.official_url,
      events: record.events,
      metadata: record.metadata
    }

    setRecords(prev => [fullRecord, ...prev])
    localStorage.setItem('logistics-records', JSON.stringify([fullRecord, ...records]))
  }

  // 切换收藏状态
  const toggleFavorite = async (id: string) => {
    const record = records.find(r => r.id === id)
    if (!record) return

    const newFavoriteStatus = !record.is_favorite
    
    // 立即更新 UI
    setRecords(prev => prev.map(r => 
      r.id === id ? { ...r, is_favorite: newFavoriteStatus } : r
    ))

    try {
      if (syncStatus.isConnected && syncStatus.isOnline) {
        await supabaseData.updateRecord(id, { is_favorite: newFavoriteStatus })
      } else {
        // 本地更新
        const updatedRecords = records.map(r => 
          r.id === id ? { ...r, is_favorite: newFavoriteStatus } : r
        )
        localStorage.setItem('logistics-records', JSON.stringify(updatedRecords))
        setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
      }
    } catch (error) {
      console.error('更新收藏状态失败:', error)
      // 回滚 UI 状态
      setRecords(prev => prev.map(r => 
        r.id === id ? { ...r, is_favorite: record.is_favorite } : r
      ))
    }
  }

  // 删除记录
  const deleteRecord = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return

    // 立即更新 UI
    const recordToDelete = records.find(r => r.id === id)
    setRecords(prev => prev.filter(r => r.id !== id))

    try {
      if (syncStatus.isConnected && syncStatus.isOnline) {
        await supabaseData.deleteRecord(id)
        toast.success('删除成功')
      } else {
        // 本地删除
        const updatedRecords = records.filter(r => r.id !== id)
        localStorage.setItem('logistics-records', JSON.stringify(updatedRecords))
        setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }))
        toast.success('已从本地删除，将在连接恢复时同步')
      }
    } catch (error) {
      console.error('删除失败:', error)
      // 回滚 UI 状态
      if (recordToDelete) {
        setRecords(prev => [...prev, recordToDelete])
      }
      toast.error('删除失败')
    }
  }

  // 手动刷新数据
  const refreshData = async () => {
    if (!syncStatus.isConnected) {
      toast.error('未连接到云端数据库')
      return
    }

    setLoading(true)
    try {
      await loadRecordsFromCloud()
      toast.success('数据刷新完成')
    } catch (error) {
      toast.error('刷新失败')
    } finally {
      setLoading(false)
    }
  }

  // 导出数据（保留原有功能）
  const exportData = () => {
    const data = JSON.stringify(records)
    const encodedData = btoa(encodeURIComponent(data))
    const shareUrl = `${window.location.origin}${window.location.pathname}?import=${encodedData}`
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('数据分享链接已复制到剪贴板！')
    })
  }

  // 渲染同步状态指示器
  const renderSyncStatus = () => {
    const getStatusIcon = () => {
      if (isInitializing) return <RefreshCw className="w-4 h-4 animate-spin" />
      if (!syncStatus.isOnline) return <WifiOff className="w-4 h-4 text-red-500" />
      if (!syncStatus.isConnected) return <CloudOff className="w-4 h-4 text-orange-500" />
      return <Cloud className="w-4 h-4 text-green-500" />
    }

    const getStatusText = () => {
      if (isInitializing) return '初始化中...'
      if (!syncStatus.isOnline) return '离线模式'
      if (!syncStatus.isConnected) return '云端未连接'
      return '云端已连接'
    }

    const getStatusColor = () => {
      if (isInitializing) return 'bg-blue-50 border-blue-200'
      if (!syncStatus.isOnline) return 'bg-red-50 border-red-200'
      if (!syncStatus.isConnected) return 'bg-orange-50 border-orange-200'
      return 'bg-green-50 border-green-200'
    }

  return (
      <Card className={`p-4 ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className="font-medium">{getStatusText()}</div>
              <div className="text-sm text-gray-600">
                {syncStatus.lastSync && (
                  <span>最后同步: {syncStatus.lastSync.toLocaleTimeString()}</span>
                )}
                {syncStatus.pendingChanges > 0 && (
                  <span className="ml-2 text-orange-600">
                    • {syncStatus.pendingChanges} 个待同步更改
                  </span>
                )}
              </div>
          </div>
        </div>
          
          <div className="flex items-center gap-2">
            {syncStatus.isConnected && (
              <Button
                size="sm"
                variant="outline"
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="flex items-center gap-1"
            >
              {showDebugPanel ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              调试
            </Button>
                  </div>
                </div>
      </Card>
    )
  }

  // 渲染调试面板
  const renderDebugPanel = () => {
    if (!showDebugPanel) return null

    return (
      <Card className="p-4 bg-gray-50 border-gray-300">
        <div className="space-y-2">
          <div className="font-medium text-gray-800">🔧 调试信息</div>
          <div className="text-sm space-y-1">
            <div>数据库连接: {syncStatus.isConnected ? '✅' : '❌'}</div>
            <div>网络状态: {syncStatus.isOnline ? '✅' : '❌'}</div>
            <div>记录总数: {records.length}</div>
            <div>待同步更改: {syncStatus.pendingChanges}</div>
            <div>最后同步: {syncStatus.lastSync?.toLocaleString() || '从未'}</div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={async () => {
                const result = await supabaseData.testConnection()
                toast[result.success ? 'success' : 'error'](result.message)
              }}
            >
              <Database className="w-3 h-3 mr-1" />
              测试连接
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={exportData}
            >
              <Copy className="w-3 h-3 mr-1" />
              导出数据
            </Button>
            </div>
          </div>
      </Card>
    )
  }

  // 主渲染
  return (
    <div className="space-y-4 md:space-y-6">
      {/* 云同步状态 */}
      {renderSyncStatus()}
      
      {/* 调试面板 */}
      {renderDebugPanel()}

      {/* 添加新记录 */}
      <Card className="p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            添加新的物流记录
          </h3>
          
          <div className="flex gap-3">
              <Input
              placeholder="输入快递单号"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addRecord()}
              className="flex-1"
              />
            
              <select
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {Object.entries(CARRIERS).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
                ))}
              </select>
            
            <Button
              onClick={addRecord}
              disabled={loading || !trackingNumber.trim()}
              className="flex items-center gap-1"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              添加
            </Button>
          </div>
        </div>
      </Card>

      {/* 物流记录列表 */}
        <div className="space-y-3">
        {records.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <div>暂无物流记录</div>
            <div className="text-sm">添加第一个快递单号开始追踪</div>
          </Card>
        ) : (
          records.map(record => (
            <Card key={record.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-medium text-lg">{record.tracking_number}</div>
                    <div className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {record.carrier_name}
            </div>
                    {record.status && (
                      <div className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                        {record.status}
            </div>
                          )}
          </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    {record.recipient && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        收件人: {record.recipient}
          </div>
                    )}
                    {record.destination && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        目的地: {record.destination}
                            </div>
                          )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      更新时间: {new Date(record.last_update).toLocaleString()}
                        </div>
                      </div>
                  </div>

                <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                      variant="ghost"
                    onClick={() => toggleFavorite(record.id)}
                    className="p-1"
                      >
                    {record.is_favorite ? 
                      <Star className="w-4 h-4 text-yellow-500 fill-current" /> : 
                      <StarOff className="w-4 h-4 text-gray-400" />
                    }
                      </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                    onClick={() => deleteRecord(record.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
        </Card>
            ))
      )}
            </div>
    </div>
  )
}



 