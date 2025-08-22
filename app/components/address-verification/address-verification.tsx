<<<<<<< HEAD
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Search, MapPin, CheckCircle, AlertTriangle, Info, Globe, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface AddressValidationResult {
  formattedAddress: string
  addressComponents: {
    longName: string
    shortName: string
    types: string[]
  }[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  placeId?: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  validationStatus: 'VALID' | 'PARTIAL' | 'INVALID'
  suggestions?: string[]
  source: 'ONLINE' | 'OFFLINE'
}

export function AddressVerification() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AddressValidationResult | null>(null)

  const validateAddress = async () => {
    if (!query.trim()) {
      toast.error('请输入地址')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/address-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: query
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data.result)
        toast.success('地址验证完成')
      } else {
        toast.error(data.error || '地址验证失败')
        setResult(null)
      }
    } catch (error) {
      console.error('地址验证错误:', error)
      toast.error('服务暂时不可用，请稍后重试')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      validateAddress()
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'text-green-600 bg-green-50'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50'
      case 'LOW': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'VALID': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'PARTIAL': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'INVALID': return <AlertTriangle className="w-5 h-5 text-red-500" />
      default: return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const extractPostalCode = (addressComponents: any[]) => {
    const postalComponent = addressComponents.find(component => 
      component.types.includes('postal_code') || component.types.includes('postcode')
    )
    return postalComponent?.longName || '未找到邮编'
  }

  const extractCountry = (addressComponents: any[]) => {
    const countryComponent = addressComponents.find(component => 
      component.types.includes('country')
    )
    return countryComponent?.longName || '未知国家'
  }

  const extractCity = (addressComponents: any[]) => {
    const cityComponent = addressComponents.find(component => 
      component.types.includes('city') || 
      component.types.includes('locality') || 
      component.types.includes('administrative_area_level_1')
    )
    return cityComponent?.longName || '未知城市'
  }

  return (
    <div className="space-y-6">
      {/* 主搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            智能地址验证与查询
          </CardTitle>
          <p className="text-sm text-gray-600">
            输入任意地址、城市名或邮编，一键验证并获取完整地址信息
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="输入地址、城市名或邮编 (如: 北京市朝阳区, New York, 10001, London)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-base"
              />
            </div>
            <Button 
              onClick={validateAddress} 
              disabled={loading || !query.trim()}
              className="min-w-[100px]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? '验证中...' : '验证'}
            </Button>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            💡 支持多种输入格式：完整地址、城市+国家、邮编、地标名称等
          </div>
        </CardContent>
      </Card>

      {/* 验证结果 */}
      {result && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getValidationIcon(result.validationStatus)}
              地址验证结果
              <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(result.confidence)}`}>
                {result.confidence === 'HIGH' ? '高置信度' : 
                 result.confidence === 'MEDIUM' ? '中等置信度' : '低置信度'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 标准化地址 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                标准化地址
              </h4>
              <p className="text-green-700 font-medium text-lg">{result.formattedAddress}</p>
            </div>

            {/* 关键信息卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">邮编</span>
                </div>
                <p className="text-blue-700 font-mono text-lg">
                  {extractPostalCode(result.addressComponents)}
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-800">城市</span>
                </div>
                <p className="text-purple-700 font-medium">
                  {extractCity(result.addressComponents)}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">国家</span>
                </div>
                <p className="text-green-700 font-medium">
                  {extractCountry(result.addressComponents)}
                </p>
              </div>
            </div>

            {/* 坐标信息 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">地理坐标</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">纬度:</span>
                  <span className="ml-2 font-mono">{result.geometry.location.lat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-gray-500">经度:</span>
                  <span className="ml-2 font-mono">{result.geometry.location.lng.toFixed(6)}</span>
                </div>
              </div>
            </div>

            {/* 地址组件详情 */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">地址组件详情</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.addressComponents.map((component, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{component.longName}</p>
                        <p className="text-sm text-gray-600">{component.shortName}</p>
                      </div>
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {component.types[0]?.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 改进建议 */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  建议修正
                </h4>
                <ul className="text-yellow-700 space-y-1">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-600" />
              服务说明
            </h3>
            <div className="text-sm text-gray-700">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">📍 地址验证服务</h4>
                <ul className="space-y-1">
                  <li>• 支持全球主要城市地址查询</li>
                  <li>• 快速响应，数据可靠</li>
                  <li>• 支持邮编和城市名查询</li>
                  <li>• 支持中英文输入</li>
                  <li>• 提供地址标准化和坐标信息</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
=======
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Search, MapPin, CheckCircle, AlertTriangle, Info, Globe, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface AddressValidationResult {
  formattedAddress: string
  addressComponents: {
    longName: string
    shortName: string
    types: string[]
  }[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  placeId?: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  validationStatus: 'VALID' | 'PARTIAL' | 'INVALID'
  suggestions?: string[]
  source: 'ONLINE' | 'OFFLINE'
}

export function AddressVerification() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AddressValidationResult | null>(null)

  const validateAddress = async () => {
    if (!query.trim()) {
      toast.error('请输入地址')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/address-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: query
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data.result)
        toast.success('地址验证完成')
      } else {
        toast.error(data.error || '地址验证失败')
        setResult(null)
      }
    } catch (error) {
      console.error('地址验证错误:', error)
      toast.error('服务暂时不可用，请稍后重试')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      validateAddress()
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'text-green-600 bg-green-50'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50'
      case 'LOW': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'VALID': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'PARTIAL': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'INVALID': return <AlertTriangle className="w-5 h-5 text-red-500" />
      default: return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const extractPostalCode = (addressComponents: any[]) => {
    const postalComponent = addressComponents.find(component => 
      component.types.includes('postal_code') || component.types.includes('postcode')
    )
    return postalComponent?.longName || '未找到邮编'
  }

  const extractCountry = (addressComponents: any[]) => {
    const countryComponent = addressComponents.find(component => 
      component.types.includes('country')
    )
    return countryComponent?.longName || '未知国家'
  }

  const extractCity = (addressComponents: any[]) => {
    const cityComponent = addressComponents.find(component => 
      component.types.includes('city') || 
      component.types.includes('locality') || 
      component.types.includes('administrative_area_level_1')
    )
    return cityComponent?.longName || '未知城市'
  }

  return (
    <div className="space-y-6">
      {/* 主搜索区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            智能地址验证与查询
          </CardTitle>
          <p className="text-sm text-gray-600">
            输入任意地址、城市名或邮编，一键验证并获取完整地址信息
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="输入地址、城市名或邮编 (如: 北京市朝阳区, New York, 10001, London)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-base"
              />
            </div>
            <Button 
              onClick={validateAddress} 
              disabled={loading || !query.trim()}
              className="min-w-[100px]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? '验证中...' : '验证'}
            </Button>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            💡 支持多种输入格式：完整地址、城市+国家、邮编、地标名称等
          </div>
        </CardContent>
      </Card>

      {/* 验证结果 */}
      {result && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getValidationIcon(result.validationStatus)}
              地址验证结果
              <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(result.confidence)}`}>
                {result.confidence === 'HIGH' ? '高置信度' : 
                 result.confidence === 'MEDIUM' ? '中等置信度' : '低置信度'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 标准化地址 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                标准化地址
              </h4>
              <p className="text-green-700 font-medium text-lg">{result.formattedAddress}</p>
            </div>

            {/* 关键信息卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">邮编</span>
                </div>
                <p className="text-blue-700 font-mono text-lg">
                  {extractPostalCode(result.addressComponents)}
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-800">城市</span>
                </div>
                <p className="text-purple-700 font-medium">
                  {extractCity(result.addressComponents)}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">国家</span>
                </div>
                <p className="text-green-700 font-medium">
                  {extractCountry(result.addressComponents)}
                </p>
              </div>
            </div>

            {/* 坐标信息 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">地理坐标</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">纬度:</span>
                  <span className="ml-2 font-mono">{result.geometry.location.lat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-gray-500">经度:</span>
                  <span className="ml-2 font-mono">{result.geometry.location.lng.toFixed(6)}</span>
                </div>
              </div>
            </div>

            {/* 地址组件详情 */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">地址组件详情</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.addressComponents.map((component, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{component.longName}</p>
                        <p className="text-sm text-gray-600">{component.shortName}</p>
                      </div>
                      <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {component.types[0]?.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 改进建议 */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  建议修正
                </h4>
                <ul className="text-yellow-700 space-y-1">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-600" />
              服务说明
            </h3>
            <div className="text-sm text-gray-700">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">📍 地址验证服务</h4>
                <ul className="space-y-1">
                  <li>• 支持全球主要城市地址查询</li>
                  <li>• 快速响应，数据可靠</li>
                  <li>• 支持邮编和城市名查询</li>
                  <li>• 支持中英文输入</li>
                  <li>• 提供地址标准化和坐标信息</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
} 