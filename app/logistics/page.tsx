'use client'

<<<<<<< HEAD
import LogisticsTracker from '../components/logistics/logistics-tracker'

export default function Logistics() {
=======
import { useState } from 'react'
import Link from 'next/link'

interface TrackingResult {
  trackingNumber: string
  carrier: string
  status: string
  destination: string
  estimatedDelivery: string
  lastUpdate: string
  timeline: Array<{
    time: string
    status: string
    location: string
  }>
}

export default function Logistics() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!trackingNumber.trim()) return

    setIsLoading(true)
    setError('')
    setResult(null)
    
    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '查询失败')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
<<<<<<< HEAD
          <h1 className="text-4xl font-bold text-gray-800 mb-2">物流信息管理</h1>
          <p className="text-gray-600">多渠道实时查询，智能识别承运商，云端同步所有设备</p>
        </div>

        {/* 物流管理组件 */}
        <LogisticsTracker />
=======
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">物流查询</h1>
          <p className="text-gray-600">输入快递单号，实时查询物流信息</p>
        </div>

        {/* 查询界面 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* 输入框 */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入快递单号..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={!trackingNumber.trim() || isLoading}
              className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? '查询中...' : '查询'}
            </button>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* 查询结果 */}
          {result && (
            <div className="border-t pt-6">
              {/* 基本信息 */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">查询结果</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">快递单号</p>
                    <p className="font-mono text-lg font-semibold">{result.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">快递公司</p>
                    <p className="text-lg font-semibold">{result.carrier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">当前状态</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      result.status === '已签收' ? 'bg-green-100 text-green-800' :
                      result.status === '运输中' ? 'bg-blue-100 text-blue-800' :
                      result.status === '派送中' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  {result.destination && (
                    <div>
                      <p className="text-sm text-gray-600">目的地</p>
                      <p className="text-lg font-semibold">{result.destination}</p>
                    </div>
                  )}
                  {result.estimatedDelivery && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">预计送达</p>
                      <p className="text-lg font-semibold text-green-600">{result.estimatedDelivery}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 物流轨迹 */}
              {result.timeline.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold mb-4 text-gray-800">物流轨迹</h4>
                  <div className="space-y-4">
                    {result.timeline.map((item, index) => (
                      <div key={index} className="flex items-start bg-gray-50 p-4 rounded-lg">
                        <div className={`flex-shrink-0 w-4 h-4 rounded-full mt-1 mr-4 ${
                          index === 0 ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.status}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 mt-1">
                            <span>{item.time}</span>
                            {item.location && (
                              <>
                                <span className="hidden sm:inline mx-2">|</span>
                                <span>{item.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
      </div>
    </div>
  )
} 