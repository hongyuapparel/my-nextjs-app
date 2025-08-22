'use client'

import { LogisticsTracker } from '../components/logistics/logistics-tracker'

export default function Logistics() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">物流信息管理</h1>
          <p className="text-gray-600">多渠道实时查询，智能识别承运商，云端同步所有设备</p>
        </div>

        {/* 物流管理组件 */}
        <LogisticsTracker />
      </div>
    </div>
  )
} 