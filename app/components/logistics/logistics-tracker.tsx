'use client'

import { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAppStore } from '../../../lib/store'
import { Search, Package, Clock, MapPin, Truck, CheckCircle, XCircle, History, Star, Trash2, ExternalLink, Copy, Plus, Tag, Calendar, Check } from 'lucide-react'
import { toast } from 'sonner'
import { getClient, getClientAsync, setSupabaseConfig, getSupabaseConfig } from '../../../lib/supabase'

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
  const [syncEnabled, setSyncEnabled] = useState(false)
  const [supabaseConfigured, setSupabaseConfigured] = useState(false)

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

  // 检查是否已配置 Supabase
  useEffect(() => {
    const init = async () => {
      if (!getSupabaseConfig()) {
        // 尝试从服务器环境变量自动初始化
        await getClientAsync()
      }
      setSupabaseConfigured(!!getSupabaseConfig())
    }
    init()
  }, [])

  // 从 Supabase 拉取数据
  const loadFromSupabase = async () => {
    const sb = getClient()
    if (!sb) return
    const { data, error } = await sb.from('logistics_records').select('*').order('last_queried', { ascending: false })
    if (!error && data) {
      const mapped = data.map((row: any) => ({
        id: row.id,
        trackingNumber: row.tracking_number,
        carrier: row.carrier,
        carrierName: row.carrier_name,
        status: row.status,
        destination: row.destination || undefined,
        origin: row.origin || undefined,
        lastUpdate: row.last_update,
        estimatedDelivery: row.estimated_delivery || undefined,
        officialUrl: row.official_url,
        note: row.recipient || '',
        tags: row.tags || [],
        isFavorite: row.is_favorite,
        queryCount: row.query_count,
        lastQueried: row.last_queried,
        isApiAvailable: row.is_api_available,
        apiStatus: row.api_status,
        events: row.events || [],
        isDelivered: row.is_delivered,
        deliveryDate: row.delivery_date || undefined,
      }))
      saveHistory(mapped)
    }
  }

  // 保存或更新一条记录到 Supabase
  const upsertToSupabase = async (record: TrackingRecord) => {
    const sb = getClient()
    if (!sb) return
    const payload = {
      id: record.id,
      tracking_number: record.trackingNumber,
      carrier: record.carrier,
      carrier_name: record.carrierName,
      status: record.status,
      destination: record.destination || null,
      origin: record.origin || null,
      last_update: record.lastUpdate,
      estimated_delivery: record.estimatedDelivery || null,
      official_url: record.officialUrl,
      recipient: record.note || null,
      tags: record.tags || [],
      is_favorite: record.isFavorite,
      query_count: record.queryCount,
      last_queried: record.lastQueried,
      is_api_available: record.isApiAvailable ?? null,
      api_status: record.apiStatus || null,
      events: record.events || [],
      is_delivered: record.isDelivered || false,
      delivery_date: record.deliveryDate || null,
    }
    await sb.from('logistics_records').upsert(payload)
  }

  // 订阅实时变更
  useEffect(() => {
    if (!syncEnabled) return
    const sb = getClient()
    if (!sb) return
    loadFromSupabase()
    const channel = sb
      .channel('logistics_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logistics_records' }, () => {
        loadFromSupabase()
      })
      .subscribe()
    return () => {
      sb.removeChannel(channel)
    }
  }, [syncEnabled])

  // 保存历史记录到localStorage +（可选）同步到 Supabase
  const saveHistory = (history: TrackingRecord[]) => {
    localStorage.setItem('tracking-history', JSON.stringify(history))
    setTrackingHistory(history)
  }

  // 在现有保存动作后追加：如果开启同步，则 upsert 最近一条（简化处理）
  const saveAndSyncOne = async (record: TrackingRecord) => {
    const updated = [record, ...trackingHistory.filter(r => r.id !== record.id)]
    saveHistory(updated)
    if (syncEnabled) await upsertToSupabase(record)
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
    if (!trackingNumber.trim()) {
      toast.error('请输入快递单号')
      return
    }

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
      if (syncEnabled) await upsertToSupabase(newRecord)
      
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

  // 顶部渲染：加入 Supabase 配置区
  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-gray-600">
            云同步（Supabase）：{supabaseConfigured ? '已配置' : '未配置'}
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 rounded border text-sm ${syncEnabled ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-700'}`}
              onClick={() => setSyncEnabled(v => !v)}
              title="开启后自动与云端表同步（实时订阅）"
            >
              {syncEnabled ? '已开启同步' : '开启同步'}
            </button>
            <button
              className="px-3 py-1 rounded border text-sm bg-white border-gray-300 text-gray-700"
              onClick={() => {
                const url = prompt('请输入 Supabase Project URL') || ''
                const anon = prompt('请输入 Supabase anon/public key') || ''
                if (url && anon) {
                  setSupabaseConfig({ url, anonKey: anon })
                  setSupabaseConfigured(true)
                  alert('已保存，点击“开启同步”即可开始使用')
                }
              }}
            >
              配置
            </button>
            <button
              className="px-3 py-1 rounded border text-sm bg-white border-gray-300 text-gray-700"
              onClick={loadFromSupabase}
            >
              手动拉取
            </button>
          </div>
        </div>
      </Card>

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

            {/* 备用：云同步入口（右侧） */}
            <div className="ml-auto flex items-center gap-2 text-xs">
              <span className="text-gray-500">云同步</span>
              <button
                className={`px-2 py-1 rounded border ${syncEnabled ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-700'}`}
                onClick={() => setSyncEnabled(v => !v)}
                title="开启后与云端表实时同步"
              >
                {syncEnabled ? '已开启' : '开启'}
              </button>
              <button
                className="px-2 py-1 rounded border bg-white border-gray-300 text-gray-700"
                onClick={() => {
                  const url = prompt('请输入 Supabase Project URL') || ''
                  const anon = prompt('请输入 Supabase anon/public key') || ''
                  if (url && anon) {
                    setSupabaseConfig({ url, anonKey: anon })
                    setSupabaseConfigured(true)
                    alert('已保存，点击“开启”即可使用同步')
                  }
                }}
              >
                配置
              </button>
              <button
                className="px-2 py-1 rounded border bg-white border-gray-300 text-gray-700"
                onClick={loadFromSupabase}
              >
                拉取
              </button>
            </div>
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
          
          {/* 小屏：云同步入口 */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">云同步</span>
            <button
              className={`px-2 py-1 rounded border ${syncEnabled ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-700'}`}
              onClick={() => setSyncEnabled(v => !v)}
            >
              {syncEnabled ? '已开启' : '开启'}
            </button>
            <button
              className="px-2 py-1 rounded border bg-white border-gray-300 text-gray-700"
              onClick={() => {
                const url = prompt('请输入 Supabase Project URL') || ''
                const anon = prompt('请输入 Supabase anon/public key') || ''
                if (url && anon) {
                  setSupabaseConfig({ url, anonKey: anon })
                  setSupabaseConfigured(true)
                  alert('已保存，点击“开启”即可使用同步')
                }
              }}
            >
              配置
            </button>
            <button
              className="px-2 py-1 rounded border bg-white border-gray-300 text-gray-700"
              onClick={loadFromSupabase}
            >
              拉取
            </button>
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
        </Card>
    </div>
  )
}

 