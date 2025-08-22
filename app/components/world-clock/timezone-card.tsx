<<<<<<< HEAD
'use client'

import { Star, Clock } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { TimezoneData } from '../../../lib/data/timezones'
import { cn } from '../../../lib/utils'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

interface TimeZoneCardProps {
  timezone: TimezoneData
  currentTime: Date
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function TimeZoneCard({ 
  timezone, 
  currentTime, 
  isFavorite, 
  onToggleFavorite 
}: TimeZoneCardProps) {
  // 计算时区时间
  const zoneTime = dayjs(currentTime).tz(timezone.timezone)
  const localTime = dayjs(currentTime)
  const diffHours = zoneTime.utcOffset() - localTime.utcOffset()
  const diffMinutes = Math.abs(diffHours % 60)
  const diffHoursDisplay = Math.floor(Math.abs(diffHours) / 60)

  // 时差显示
  const getTimeDifference = () => {
    if (diffHours === 0) return '本地时间'
    const sign = diffHours > 0 ? '+' : '-'
    if (diffMinutes === 0) {
      return `${sign}${diffHoursDisplay}小时`
    }
    return `${sign}${diffHoursDisplay}:${diffMinutes.toString().padStart(2, '0')}`
  }

  // 判断是否是工作时间 (9:00 - 18:00)
  const isBusinessHours = () => {
    const hour = zoneTime.hour()
    return hour >= 9 && hour < 18
  }

  // 判断是否是今天、昨天或明天
  const getDateStatus = () => {
    const today = localTime.format('YYYY-MM-DD')
    const zoneDate = zoneTime.format('YYYY-MM-DD')
    
    if (zoneDate === today) return '今天'
    if (zoneTime.isAfter(localTime, 'day')) return '明天'
    if (zoneTime.isBefore(localTime, 'day')) return '昨天'
    return ''
  }

  return (
    <Card className={cn(
      "card-hover cursor-pointer transition-all duration-300",
      isFavorite && "ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/10"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* 国家信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{timezone.flag}</span>
              <div>
                <p className="font-semibold text-sm">{timezone.name}</p>
                <p className="text-xs text-muted-foreground">{timezone.nameEn}</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className="h-8 w-8"
            >
              <Star className={cn(
                "h-4 w-4 transition-colors",
                isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              )} />
            </Button>
          </div>

          {/* 时间显示 */}
          <div className="space-y-1">
            <div className="text-2xl font-mono font-bold">
              {zoneTime.format('HH:mm')}
            </div>
            <div className="text-xs text-muted-foreground">
              {zoneTime.format('YYYY-MM-DD dddd')}
            </div>
          </div>

          {/* 时差和状态 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-muted-foreground">
                {getTimeDifference()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {getDateStatus() && (
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  getDateStatus() === '今天' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                  getDateStatus() === '明天' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                  getDateStatus() === '昨天' && "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                )}>
                  {getDateStatus()}
                </span>
              )}
              
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                isBusinessHours() 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
              )}>
                {isBusinessHours() ? '工作时间' : '非工作时间'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
=======
'use client'

import { Star, Clock } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { TimezoneData } from '../../../lib/data/timezones'
import { cn } from '../../../lib/utils'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

interface TimeZoneCardProps {
  timezone: TimezoneData
  currentTime: Date
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function TimeZoneCard({ 
  timezone, 
  currentTime, 
  isFavorite, 
  onToggleFavorite 
}: TimeZoneCardProps) {
  // 计算时区时间
  const zoneTime = dayjs(currentTime).tz(timezone.timezone)
  const localTime = dayjs(currentTime)
  const diffHours = zoneTime.utcOffset() - localTime.utcOffset()
  const diffMinutes = Math.abs(diffHours % 60)
  const diffHoursDisplay = Math.floor(Math.abs(diffHours) / 60)

  // 时差显示
  const getTimeDifference = () => {
    if (diffHours === 0) return '本地时间'
    const sign = diffHours > 0 ? '+' : '-'
    if (diffMinutes === 0) {
      return `${sign}${diffHoursDisplay}小时`
    }
    return `${sign}${diffHoursDisplay}:${diffMinutes.toString().padStart(2, '0')}`
  }

  // 判断是否是工作时间 (9:00 - 18:00)
  const isBusinessHours = () => {
    const hour = zoneTime.hour()
    return hour >= 9 && hour < 18
  }

  // 判断是否是今天、昨天或明天
  const getDateStatus = () => {
    const today = localTime.format('YYYY-MM-DD')
    const zoneDate = zoneTime.format('YYYY-MM-DD')
    
    if (zoneDate === today) return '今天'
    if (zoneTime.isAfter(localTime, 'day')) return '明天'
    if (zoneTime.isBefore(localTime, 'day')) return '昨天'
    return ''
  }

  return (
    <Card className={cn(
      "card-hover cursor-pointer transition-all duration-300",
      isFavorite && "ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/10"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* 国家信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{timezone.flag}</span>
              <div>
                <p className="font-semibold text-sm">{timezone.name}</p>
                <p className="text-xs text-muted-foreground">{timezone.nameEn}</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className="h-8 w-8"
            >
              <Star className={cn(
                "h-4 w-4 transition-colors",
                isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              )} />
            </Button>
          </div>

          {/* 时间显示 */}
          <div className="space-y-1">
            <div className="text-2xl font-mono font-bold">
              {zoneTime.format('HH:mm')}
            </div>
            <div className="text-xs text-muted-foreground">
              {zoneTime.format('YYYY-MM-DD dddd')}
            </div>
          </div>

          {/* 时差和状态 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-muted-foreground">
                {getTimeDifference()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {getDateStatus() && (
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  getDateStatus() === '今天' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                  getDateStatus() === '明天' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                  getDateStatus() === '昨天' && "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                )}>
                  {getDateStatus()}
                </span>
              )}
              
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                isBusinessHours() 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
              )}>
                {isBusinessHours() ? '工作时间' : '非工作时间'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
} 