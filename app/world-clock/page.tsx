<<<<<<< HEAD
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function WorldClock() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedCity, setSelectedCity] = useState('beijing')

  const cities = [
    { id: 'beijing', name: '北京', timezone: 8, flag: '🇨🇳' },
    { id: 'newyork', name: '纽约', timezone: -5, flag: '🇺🇸' },
    { id: 'london', name: '伦敦', timezone: 0, flag: '🇬🇧' },
    { id: 'tokyo', name: '东京', timezone: 9, flag: '🇯🇵' },
    { id: 'paris', name: '巴黎', timezone: 1, flag: '🇫🇷' },
    { id: 'sydney', name: '悉尼', timezone: 10, flag: '🇦🇺' }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getCityTime = (timezone: number) => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000)
    const cityTime = new Date(utc + (timezone * 3600000))
    return cityTime.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getCityDate = (timezone: number) => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000)
    const cityTime = new Date(utc + (timezone * 3600000))
    return cityTime.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">世界时钟</h1>
          <p className="text-gray-600">查看全球主要城市的时间</p>
        </div>

        {/* 时钟界面 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div key={city.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="text-4xl mb-2">{city.flag}</div>
                <h3 className="text-xl font-semibold mb-2">{city.name}</h3>
                <div className="text-3xl font-mono font-bold text-blue-600 mb-2">
                  {getCityTime(city.timezone)}
                </div>
                <div className="text-sm text-gray-600">
                  {getCityDate(city.timezone)}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  UTC{city.timezone >= 0 ? '+' : ''}{city.timezone}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 当前选择城市详细信息 */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">详细信息</h3>
            {(() => {
              const city = cities.find(c => c.id === selectedCity)
              if (!city) {
                return <p className="text-gray-500">请选择一个城市查看详细信息</p>
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">城市</p>
                    <p className="text-lg font-semibold">{city.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">当前时间</p>
                    <p className="text-lg font-semibold">{getCityTime(city.timezone)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">时区</p>
                    <p className="text-lg font-semibold">UTC{city.timezone >= 0 ? '+' : ''}{city.timezone}</p>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
=======
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function WorldClock() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedCity, setSelectedCity] = useState('beijing')

  const cities = [
    { id: 'beijing', name: '北京', timezone: 8, flag: '🇨🇳' },
    { id: 'newyork', name: '纽约', timezone: -5, flag: '🇺🇸' },
    { id: 'london', name: '伦敦', timezone: 0, flag: '🇬🇧' },
    { id: 'tokyo', name: '东京', timezone: 9, flag: '🇯🇵' },
    { id: 'paris', name: '巴黎', timezone: 1, flag: '🇫🇷' },
    { id: 'sydney', name: '悉尼', timezone: 10, flag: '🇦🇺' }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getCityTime = (timezone: number) => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000)
    const cityTime = new Date(utc + (timezone * 3600000))
    return cityTime.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getCityDate = (timezone: number) => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000)
    const cityTime = new Date(utc + (timezone * 3600000))
    return cityTime.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">世界时钟</h1>
          <p className="text-gray-600">查看全球主要城市的时间</p>
        </div>

        {/* 时钟界面 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div key={city.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <div className="text-4xl mb-2">{city.flag}</div>
                <h3 className="text-xl font-semibold mb-2">{city.name}</h3>
                <div className="text-3xl font-mono font-bold text-blue-600 mb-2">
                  {getCityTime(city.timezone)}
                </div>
                <div className="text-sm text-gray-600">
                  {getCityDate(city.timezone)}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  UTC{city.timezone >= 0 ? '+' : ''}{city.timezone}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 当前选择城市详细信息 */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">详细信息</h3>
            {(() => {
              const city = cities.find(c => c.id === selectedCity)
              if (!city) {
                return <p className="text-gray-500">请选择一个城市查看详细信息</p>
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">城市</p>
                    <p className="text-lg font-semibold">{city.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">当前时间</p>
                    <p className="text-lg font-semibold">{getCityTime(city.timezone)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">时区</p>
                    <p className="text-lg font-semibold">UTC{city.timezone >= 0 ? '+' : ''}{city.timezone}</p>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
} 