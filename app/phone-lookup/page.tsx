'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PhoneResult {
  phoneNumber: string
  province: string
  city: string
  isp: string
  type: string
  areaCode: string
  prefix: string
}

export default function PhoneLookup() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [result, setResult] = useState<PhoneResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!phoneNumber.trim()) return

    setIsLoading(true)
    setError('')
    setResult(null)
    
    try {
      const response = await fetch('/api/phone-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() })
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

  const formatPhoneNumber = (number: string) => {
    if (number.length === 11) {
      return `${number.slice(0, 3)} ${number.slice(3, 7)} ${number.slice(7)}`
    }
    return number
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">电话查询</h1>
          <p className="text-gray-600">输入手机号码，查询归属地信息</p>
        </div>

        {/* 查询界面 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* 输入框 */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入11位手机号码..."
              maxLength={11}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={!phoneNumber.trim() || isLoading}
              className="px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800">查询结果</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">手机号码</p>
                      <p className="font-mono text-xl font-semibold">{formatPhoneNumber(result.phoneNumber)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">号段前缀</p>
                      <p className="text-lg font-semibold">{result.prefix}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">号码类型</p>
                      <p className="text-lg font-semibold">{result.type}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">归属省份</p>
                      <p className="text-lg font-semibold">{result.province}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">归属城市</p>
                      <p className="text-lg font-semibold">{result.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">运营商</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        result.isp === '中国移动' ? 'bg-green-100 text-green-800' :
                        result.isp === '中国联通' ? 'bg-blue-100 text-blue-800' :
                        result.isp === '中国电信' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {result.isp}
                      </span>
                    </div>
                    {result.areaCode && (
                      <div>
                        <p className="text-sm text-gray-600">区号</p>
                        <p className="text-lg font-semibold">{result.areaCode}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">使用说明：</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 请输入11位中国大陆手机号码</li>
              <li>• 支持中国移动、中国联通、中国电信号段</li>
              <li>• 查询结果包括归属地省市、运营商和区号信息</li>
              <li>• 数据仅供参考，可能存在误差</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 