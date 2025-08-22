'use client'

import { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAppStore } from '../../../lib/store'
import { Search, Globe, Star, MapPin, Calendar, Sunrise, Sunset } from 'lucide-react'
import { toast } from 'sonner'
import Fuse from 'fuse.js'

interface TimeZoneInfo {
  id: string
  country: string
  countryEn: string
  city: string
  cityEn: string
  timezone: string
  utcOffset: number
  flag: string
  abbreviations: string[]
}

interface TimeDisplayInfo {
  time: string
  date: string
  period: string
  isDaylight: boolean
  timezone: TimeZoneInfo
}

export function WorldClock() {
  const [sourceTimezone, setSourceTimezone] = useState<TimeZoneInfo | null>(null)
  const [targetTimezone, setTargetTimezone] = useState<TimeZoneInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TimeZoneInfo[]>([])
  const [favoriteTimezones, setFavoriteTimezones] = useState<TimeZoneInfo[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedHour, setSelectedHour] = useState(16) // 默认下午4点
  const [selectedMinute, setSelectedMinute] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())

  // 时区数据
  const timezoneData: TimeZoneInfo[] = [
    // 亚洲
    { id: 'asia-shanghai', country: '中国', countryEn: 'China', city: '上海', cityEn: 'Shanghai', timezone: 'Asia/Shanghai', utcOffset: 8, flag: '🇨🇳', abbreviations: ['CN', 'CHN', '中', '华', '中国', '上海'] },
    { id: 'asia-beijing', country: '中国', countryEn: 'China', city: '北京', cityEn: 'Beijing', timezone: 'Asia/Shanghai', utcOffset: 8, flag: '🇨🇳', abbreviations: ['CN', 'CHN', '中', '华', '中国', '北京'] },
    { id: 'asia-hong-kong', country: '香港', countryEn: 'Hong Kong', city: '香港', cityEn: 'Hong Kong', timezone: 'Asia/Hong_Kong', utcOffset: 8, flag: '🇭🇰', abbreviations: ['HK', 'HKG', '港', '香港'] },
    { id: 'asia-tokyo', country: '日本', countryEn: 'Japan', city: '东京', cityEn: 'Tokyo', timezone: 'Asia/Tokyo', utcOffset: 9, flag: '🇯🇵', abbreviations: ['JP', 'JPN', '日', '东京', '日本'] },
    { id: 'asia-seoul', country: '韩国', countryEn: 'South Korea', city: '首尔', cityEn: 'Seoul', timezone: 'Asia/Seoul', utcOffset: 9, flag: '🇰🇷', abbreviations: ['KR', 'KOR', '韩', '韩国', '首尔'] },
    { id: 'asia-singapore', country: '新加坡', countryEn: 'Singapore', city: '新加坡', cityEn: 'Singapore', timezone: 'Asia/Singapore', utcOffset: 8, flag: '🇸🇬', abbreviations: ['SG', 'SGP', '新', '狮城', '新加坡'] },
    { id: 'asia-bangkok', country: '泰国', countryEn: 'Thailand', city: '曼谷', cityEn: 'Bangkok', timezone: 'Asia/Bangkok', utcOffset: 7, flag: '🇹🇭', abbreviations: ['TH', 'THA', '泰', '泰国', '曼谷'] },
    { id: 'asia-mumbai', country: '印度', countryEn: 'India', city: '孟买', cityEn: 'Mumbai', timezone: 'Asia/Kolkata', utcOffset: 5.5, flag: '🇮🇳', abbreviations: ['IN', 'IND', '印', '印度', '孟买'] },
    { id: 'asia-dubai', country: '阿联酋', countryEn: 'UAE', city: '迪拜', cityEn: 'Dubai', timezone: 'Asia/Dubai', utcOffset: 4, flag: '🇦🇪', abbreviations: ['AE', 'UAE', '阿联酋', 'Dubai', '迪拜'] },
    
    // 欧洲
    { id: 'europe-london', country: '英国', countryEn: 'United Kingdom', city: '伦敦', cityEn: 'London', timezone: 'Europe/London', utcOffset: 0, flag: '🇬🇧', abbreviations: ['GB', 'UK', 'GBR', '英', 'London', '英国', '伦敦'] },
    { id: 'europe-paris', country: '法国', countryEn: 'France', city: '巴黎', cityEn: 'Paris', timezone: 'Europe/Paris', utcOffset: 1, flag: '🇫🇷', abbreviations: ['FR', 'FRA', '法', 'Paris', '法国', '巴黎'] },
    { id: 'europe-berlin', country: '德国', countryEn: 'Germany', city: '柏林', cityEn: 'Berlin', timezone: 'Europe/Berlin', utcOffset: 1, flag: '🇩🇪', abbreviations: ['DE', 'DEU', '德', 'Berlin', '德国', '柏林'] },
    { id: 'europe-amsterdam', country: '荷兰', countryEn: 'Netherlands', city: '阿姆斯特丹', cityEn: 'Amsterdam', timezone: 'Europe/Amsterdam', utcOffset: 1, flag: '🇳🇱', abbreviations: ['NL', 'NLD', '荷', '荷兰', '阿姆斯特丹'] },
    { id: 'europe-zurich', country: '瑞士', countryEn: 'Switzerland', city: '苏黎世', cityEn: 'Zurich', timezone: 'Europe/Zurich', utcOffset: 1, flag: '🇨🇭', abbreviations: ['CH', 'CHE', '瑞士', '苏黎世'] },
    { id: 'europe-rome', country: '意大利', countryEn: 'Italy', city: '罗马', cityEn: 'Rome', timezone: 'Europe/Rome', utcOffset: 1, flag: '🇮🇹', abbreviations: ['IT', 'ITA', '意', '意大利', '罗马'] },
    { id: 'europe-madrid', country: '西班牙', countryEn: 'Spain', city: '马德里', cityEn: 'Madrid', timezone: 'Europe/Madrid', utcOffset: 1, flag: '🇪🇸', abbreviations: ['ES', 'ESP', '西', '西班牙', '马德里'] },
    { id: 'europe-moscow', country: '俄罗斯', countryEn: 'Russia', city: '莫斯科', cityEn: 'Moscow', timezone: 'Europe/Moscow', utcOffset: 3, flag: '🇷🇺', abbreviations: ['RU', 'RUS', '俄', 'Moscow', '俄罗斯', '莫斯科'] },
    
    // 北美
    { id: 'america-new-york', country: '美国', countryEn: 'United States', city: '纽约', cityEn: 'New York', timezone: 'America/New_York', utcOffset: -5, flag: '🇺🇸', abbreviations: ['US', 'USA', '美', 'NY', 'NYC', '美国', '纽约'] },
    { id: 'america-los-angeles', country: '美国', countryEn: 'United States', city: '洛杉矶', cityEn: 'Los Angeles', timezone: 'America/Los_Angeles', utcOffset: -8, flag: '🇺🇸', abbreviations: ['US', 'USA', '美', 'LA', 'California', '美国', '洛杉矶'] },
    { id: 'america-chicago', country: '美国', countryEn: 'United States', city: '芝加哥', cityEn: 'Chicago', timezone: 'America/Chicago', utcOffset: -6, flag: '🇺🇸', abbreviations: ['US', 'USA', '美', 'Chicago', '美国', '芝加哥'] },
    { id: 'america-denver', country: '美国', countryEn: 'United States', city: '丹佛', cityEn: 'Denver', timezone: 'America/Denver', utcOffset: -7, flag: '🇺🇸', abbreviations: ['US', 'USA', '美', 'Denver', '美国', '丹佛'] },
    { id: 'america-miami', country: '美国', countryEn: 'United States', city: '迈阿密', cityEn: 'Miami', timezone: 'America/New_York', utcOffset: -5, flag: '🇺🇸', abbreviations: ['US', 'USA', '美', 'Miami', '美国', '迈阿密'] },
    { id: 'america-toronto', country: '加拿大', countryEn: 'Canada', city: '多伦多', cityEn: 'Toronto', timezone: 'America/Toronto', utcOffset: -5, flag: '🇨🇦', abbreviations: ['CA', 'CAN', '加', 'Toronto', '加拿大', '多伦多'] },
    { id: 'america-vancouver', country: '加拿大', countryEn: 'Canada', city: '温哥华', cityEn: 'Vancouver', timezone: 'America/Vancouver', utcOffset: -8, flag: '🇨🇦', abbreviations: ['CA', 'CAN', '加', 'Vancouver', '加拿大', '温哥华'] },
    
    // 大洋洲
    { id: 'australia-sydney', country: '澳大利亚', countryEn: 'Australia', city: '悉尼', cityEn: 'Sydney', timezone: 'Australia/Sydney', utcOffset: 10, flag: '🇦🇺', abbreviations: ['AU', 'AUS', '澳', 'Sydney', '澳大利亚', '悉尼'] },
    { id: 'australia-melbourne', country: '澳大利亚', countryEn: 'Australia', city: '墨尔本', cityEn: 'Melbourne', timezone: 'Australia/Melbourne', utcOffset: 10, flag: '🇦🇺', abbreviations: ['AU', 'AUS', '澳', 'Melbourne', '澳大利亚', '墨尔本'] },
    { id: 'pacific-auckland', country: '新西兰', countryEn: 'New Zealand', city: '奥克兰', cityEn: 'Auckland', timezone: 'Pacific/Auckland', utcOffset: 12, flag: '🇳🇿', abbreviations: ['NZ', 'NZL', '新西兰', '奥克兰'] },
    
    // 南美
    { id: 'america-sao-paulo', country: '巴西', countryEn: 'Brazil', city: '圣保罗', cityEn: 'São Paulo', timezone: 'America/Sao_Paulo', utcOffset: -3, flag: '🇧🇷', abbreviations: ['BR', 'BRA', '巴西', '圣保罗'] },
    { id: 'america-buenos-aires', country: '阿根廷', countryEn: 'Argentina', city: '布宜诺斯艾利斯', cityEn: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', utcOffset: -3, flag: '🇦🇷', abbreviations: ['AR', 'ARG', '阿根廷', '布宜诺斯艾利斯'] },
    
    // 非洲
    { id: 'africa-cairo', country: '埃及', countryEn: 'Egypt', city: '开罗', cityEn: 'Cairo', timezone: 'Africa/Cairo', utcOffset: 2, flag: '🇪🇬', abbreviations: ['EG', 'EGY', '埃及', '开罗'] },
    { id: 'africa-lagos', country: '尼日利亚', countryEn: 'Nigeria', city: '拉各斯', cityEn: 'Lagos', timezone: 'Africa/Lagos', utcOffset: 1, flag: '🇳🇬', abbreviations: ['NG', 'NGA', '尼日利亚', '拉各斯'] },
    { id: 'africa-johannesburg', country: '南非', countryEn: 'South Africa', city: '约翰内斯堡', cityEn: 'Johannesburg', timezone: 'Africa/Johannesburg', utcOffset: 2, flag: '🇿🇦', abbreviations: ['ZA', 'ZAF', '南非', '约翰内斯堡'] },
  ]

  // 初始化 Fuse.js 搜索引擎
  const fuse = new Fuse(timezoneData, {
    keys: [
      { name: 'country', weight: 0.3 },
      { name: 'countryEn', weight: 0.3 },
      { name: 'city', weight: 0.25 },
      { name: 'cityEn', weight: 0.25 },
      { name: 'abbreviations', weight: 0.3 }
    ],
<<<<<<< HEAD
    threshold: 0.4, // 降低阈值，让搜索更宽松
=======
    threshold: 0.6,
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
    includeScore: true,
    findAllMatches: true,
    ignoreLocation: true
  })

  // 从 localStorage 加载收藏的时区和上次选择
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorite-timezones')
    if (savedFavorites) {
      const favoriteIds = JSON.parse(savedFavorites)
      const favorites = timezoneData.filter(tz => favoriteIds.includes(tz.id))
      setFavoriteTimezones(favorites)
    }

    // 设置默认源时区为美国纽约
    const defaultSource = timezoneData.find(tz => tz.id === 'america-new-york')
    if (defaultSource) {
      setSourceTimezone(defaultSource)
      setSearchQuery(`${defaultSource.flag} ${defaultSource.city} (UTC${defaultSource.utcOffset >= 0 ? '+' : ''}${defaultSource.utcOffset})`)
    }

    // 设置默认目标时区为中国上海
    const defaultTarget = timezoneData.find(tz => tz.id === 'asia-shanghai')
    setTargetTimezone(defaultTarget || timezoneData[0])
  }, [])

  // 实时更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 搜索时区
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    // 如果是清空或者点击已选择的搜索框，重置源时区
    if (!query.trim() || query.includes('(UTC')) {
<<<<<<< HEAD
      setSourceTimezone(null)
=======
    if (!query.trim()) {
        setSourceTimezone(null)
      }
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

<<<<<<< HEAD
    // 立即显示搜索结果
    setShowSearchResults(true)
    const results = fuse.search(query).map(result => result.item)
    console.log('🔍 搜索查询:', query, '结果数量:', results.length) // 调试信息
=======
    setShowSearchResults(true)
    const results = fuse.search(query).map(result => result.item)
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
    setSearchResults(results.slice(0, 6))
  }

  // 选择时区
  const selectTimezone = (timezone: TimeZoneInfo) => {
<<<<<<< HEAD
    console.log('🎯 选择时区:', timezone) // 调试信息
=======
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
      setSourceTimezone(timezone)
    setSearchQuery(`${timezone.flag} ${timezone.city} (UTC${timezone.utcOffset >= 0 ? '+' : ''}${timezone.utcOffset})`)
    setSearchResults([])
    setShowSearchResults(false)
    toast.success(`已选择 ${timezone.city}`)
  }

  // 切换收藏状态
  const toggleFavorite = (timezone: TimeZoneInfo) => {
    const isFavorite = favoriteTimezones.some(fav => fav.id === timezone.id)
    let updatedFavorites: TimeZoneInfo[]

    if (isFavorite) {
      updatedFavorites = favoriteTimezones.filter(fav => fav.id !== timezone.id)
      toast.success(`已取消收藏 ${timezone.city}`)
    } else {
      updatedFavorites = [...favoriteTimezones, timezone]
      toast.success(`已收藏 ${timezone.city}`)
    }

    setFavoriteTimezones(updatedFavorites)
    localStorage.setItem('favorite-timezones', JSON.stringify(updatedFavorites.map(tz => tz.id)))
  }

  // 根据选定时间计算时区转换
  const calculateTimeConversion = (sourceTimezone: TimeZoneInfo, targetTimezone: TimeZoneInfo, hour: number, minute: number) => {
    // 创建一个基准日期
    const baseDate = new Date()
    baseDate.setHours(hour, minute, 0, 0)
    
    // 计算时差
    const timeDiff = targetTimezone.utcOffset - sourceTimezone.utcOffset
    
    // 计算目标时间
    const targetTime = new Date(baseDate.getTime() + (timeDiff * 60 * 60 * 1000))

    return {
      sourceTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      targetTime: `${targetTime.getHours().toString().padStart(2, '0')}:${targetTime.getMinutes().toString().padStart(2, '0')}`,
      targetDate: targetTime.getDate() !== baseDate.getDate() ? 
        (targetTime.getDate() > baseDate.getDate() ? '次日' : '前日') : '同日'
    }
  }

  // 生成小时选项
  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  // 生成分钟选项
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i)

  const conversion = sourceTimezone && targetTimezone ? 
    calculateTimeConversion(sourceTimezone, targetTimezone, selectedHour, selectedMinute) : null

  return (
<<<<<<< HEAD
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
=======
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
      {/* 左侧：源时区 */}
      <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg">
        <div className="space-y-4">
          {/* 选择国家 */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">选择国家</h3>
          <div className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
<<<<<<< HEAD
              placeholder="搜索国家、城市或缩写..."
              className="w-full h-10 text-base border-2 border-gray-300 focus:border-blue-500"
              onFocus={() => {
                if (sourceTimezone && searchQuery.includes('(UTC')) {
                  setSearchQuery('')
                  setSourceTimezone(null)
                }
                // 如果有搜索内容，立即显示结果
                if (searchQuery.trim() && !searchQuery.includes('(UTC')) {
                  setShowSearchResults(true)
                }
              }}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 300)}
            />

          {/* 搜索结果 */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {searchResults.map((timezone) => (
                  <div
                    key={timezone.id}
                  className="flex items-center justify-between p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                    console.log('🖱️ 点击搜索建议:', timezone) // 调试信息
                          selectTimezone(timezone)
                        }}
                  onMouseDown={(e) => e.preventDefault()} // 防止onBlur触发
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{timezone.flag}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{timezone.city}</p>
                      <p className="text-xs text-gray-600">{timezone.country}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    UTC{timezone.utcOffset >= 0 ? '+' : ''}{timezone.utcOffset}
                  </span>
=======
                placeholder="搜索国家、城市或缩写..."
                className="w-full h-10 text-base border-2 border-gray-300 focus:border-blue-500"
                onFocus={() => {
                  if (sourceTimezone && searchQuery.includes('(UTC')) {
                    setSearchQuery('')
                    setSourceTimezone(null)
                  }
                  setShowSearchResults(true)
                }}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            />

          {/* 搜索结果 */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {searchResults.map((timezone) => (
                  <div
                    key={timezone.id}
                      className="flex items-center justify-between p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => selectTimezone(timezone)}
                  >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{timezone.flag}</span>
                      <div>
                          <p className="font-semibold text-gray-900 text-sm">{timezone.city}</p>
                          <p className="text-xs text-gray-600">{timezone.country}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        UTC{timezone.utcOffset >= 0 ? '+' : ''}{timezone.utcOffset}
                      </span>
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
                  </div>
                ))}
              </div>
          )}
        </div>

              </div>
              
          {/* 当前选中的源时区 */}
          {sourceTimezone && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">当前选中</h4>
              <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{sourceTimezone.flag}</span>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{sourceTimezone.city}</p>
                    <p className="text-xs font-medium text-blue-600">UTC{sourceTimezone.utcOffset >= 0 ? '+' : ''}{sourceTimezone.utcOffset}</p>
                  </div>
                </div>
              </div>
            </div>
        )}

          {/* 设置时间 */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">设置时间</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center space-x-3">
                <select 
                  value={selectedHour} 
                  onChange={(e) => setSelectedHour(Number(e.target.value))}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg text-lg font-mono font-bold bg-white focus:border-blue-500"
                >
                  {hourOptions.map(hour => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="text-2xl font-bold text-gray-600">:</span>
                <select 
                  value={selectedMinute} 
                  onChange={(e) => setSelectedMinute(Number(e.target.value))}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg text-lg font-mono font-bold bg-white focus:border-blue-500"
                >
                  {[0, 15, 30, 45].map(minute => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-center mt-2 text-xs text-gray-600">
                选择要转换的时间
              </div>
            </div>
              </div>
              
          {/* 当前实时时间 */}
          {sourceTimezone && (
                  <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">当前实时时间</h4>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-base font-medium text-gray-700">
                  {sourceTimezone.city}
                  </div>
                <div className="text-xl font-mono font-bold text-gray-800">
                  {(() => {
                    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000)
                    const localTime = new Date(utc + (sourceTimezone.utcOffset * 3600000))
                    return localTime.toLocaleTimeString('zh-CN', {
                      hour12: false,
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })
                  })()}
                </div>
              </div>
            </div>
                    )}
                  </div>
      </Card>

      {/* 右侧：目标时区 */}
      <Card className="p-6 bg-white border-2 border-gray-200 shadow-lg">
        <div className="space-y-4">
          {/* 目标国家 */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">目标国家</h3>
            <select 
              value={targetTimezone?.id || ''} 
              onChange={(e) => {
                const selected = timezoneData.find(tz => tz.id === e.target.value)
                if (selected) setTargetTimezone(selected)
              }}
              className="w-full h-10 px-3 py-2 border-2 border-gray-300 rounded-lg text-base bg-white focus:border-green-500"
            >
              {timezoneData.map((timezone) => (
                <option key={timezone.id} value={timezone.id}>
                  {timezone.flag} {timezone.city} (UTC{timezone.utcOffset >= 0 ? '+' : ''}{timezone.utcOffset})
                </option>
              ))}
            </select>
                  </div>

          {/* 当前选中的目标时区 */}
          {targetTimezone && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">当前选中</h4>
              <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{targetTimezone.flag}</span>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{targetTimezone.city}</p>
                    <p className="text-xs font-medium text-green-600">UTC{targetTimezone.utcOffset >= 0 ? '+' : ''}{targetTimezone.utcOffset}</p>
                  </div>
                </div>
              </div>
        </div>
      )}

          {/* 对应时间 */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">对应时间</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center">
                {conversion && sourceTimezone && targetTimezone ? (
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold text-green-600">
                      {conversion.targetTime}
                    </div>
                    {conversion.targetDate !== '同日' && (
                      <div className="text-xs text-orange-600 font-bold mt-1">
                        {conversion.targetDate}
                      </div>
                    )}
                  </div>
                ) : targetTimezone ? (
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold text-gray-800">
                      {(() => {
                        const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000)
                        const localTime = new Date(utc + (targetTimezone.utcOffset * 3600000))
                        return localTime.toLocaleTimeString('zh-CN', {
                          hour12: false,
                          hour: '2-digit', 
                          minute: '2-digit'
                        })
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="text-base font-medium text-gray-500">
                    请选择目标国家
                  </div>
                )}
              </div>
              <div className="text-center mt-2 text-xs text-gray-600">
                转换后的时间
              </div>
            </div>
          </div>

          {/* 当前实时时间 */}
          {targetTimezone && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">当前实时时间</h4>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-base font-medium text-gray-700">
                  {targetTimezone.city}
                </div>
                <div className="text-xl font-mono font-bold text-gray-800">
                  {(() => {
                    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000)
                    const localTime = new Date(utc + (targetTimezone.utcOffset * 3600000))
                    return localTime.toLocaleTimeString('zh-CN', {
                      hour12: false,
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })
                  })()}
                </div>
              </div>
            </div>
          )}
          </div>
        </Card>
    </div>
  )
} 