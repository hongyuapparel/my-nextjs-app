'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { CheckCircle, Clock, MapPin, Truck, Plane, Ship, Package, ExternalLink } from 'lucide-react'

interface LogisticsResultProps {
  result: {
    trackingNumber: string
    company: {
      id: string
      name: string
      nameEn: string
      icon: string
      color: string
      trackingUrl: string
    }
    status: string
    statusEn: string
    lastUpdate: string
    estimatedDelivery: string
    isDelivered?: boolean // 添加这个字段
    recipient: {
      name: string
      nameEn: string
      address: string
    }
    timeline: Array<{
      status: string
      statusEn: string
      time: string
      location: string
      locationEn: string
      description: string
      descriptionEn: string
    }>
  }
}

export function LogisticsResult({ result }: LogisticsResultProps) {
  // 格式化双语文本，避免重复显示
  const formatBilingualText = (chinese: string, english: string) => {
    if (chinese === english) {
      return chinese // 如果中英文相同，只显示一次
    }
    return `${chinese} / ${english}`
  }

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('delivered') || statusLower.includes('已送达')) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    if (statusLower.includes('transit') || statusLower.includes('运输中')) {
      return <Truck className="w-4 h-4 text-blue-600" />
    }
    if (statusLower.includes('delivery') || statusLower.includes('派送')) {
      return <Package className="w-4 h-4 text-orange-600" />
    }
    return <Clock className="w-4 h-4 text-muted-foreground" />
  }

  const getLocationIcon = (location: string) => {
    const locationLower = location.toLowerCase()
    if (locationLower.includes('airport') || locationLower.includes('机场')) {
      return <Plane className="w-4 h-4 text-blue-500" />
    }
    if (locationLower.includes('port') || locationLower.includes('港')) {
      return <Ship className="w-4 h-4 text-blue-600" />
    }
    return <MapPin className="w-4 h-4 text-muted-foreground" />
  }

  return (
    <Card className="card-hover">
      <CardHeader className="pb-4">
        {/* 头部信息 - 单行紧凑显示 */}
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">{result.company.icon}</span>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">{formatBilingualText(result.company.name, result.company.nameEn)}</span>
              <span className="text-sm text-muted-foreground font-normal">#{result.trackingNumber}</span>
            </div>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(result.company.trackingUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
{formatBilingualText('官方查询', 'Official Track')}
          </Button>
        </div>
        
        {/* 状态和时间 - 紧凑单行布局 */}
        <div className="bg-muted/50 rounded-lg px-4 py-3 mt-3">
          <div className="flex items-center justify-between gap-4">
            {/* 左侧：状态信息 */}
            <div className="flex items-center gap-3">
              {getStatusIcon(result.status)}
              <span className="font-medium">{formatBilingualText(result.status, result.statusEn)}</span>
            </div>
            
            {/* 中间：预计送达或实际送达 */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              result.isDelivered 
                ? 'bg-green-100' 
                : 'bg-orange-100'
            }`}>
              {result.isDelivered ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Clock className="w-4 h-4 text-orange-600" />
              )}
              <span className={`text-sm font-medium ${
                result.isDelivered 
                  ? 'text-green-800' 
                  : 'text-orange-800'
              }`}>
{result.isDelivered ? formatBilingualText('实际送达:', 'Delivered:') : formatBilingualText('预计送达:', 'ETA:')}
              </span>
              <span className={`font-bold ${
                result.isDelivered 
                  ? 'text-green-900' 
                  : 'text-orange-900'
              }`}>
                {result.estimatedDelivery}
              </span>

            </div>
            
            {/* 右侧：更新时间 */}
            <div className="text-sm text-muted-foreground whitespace-nowrap">
{formatBilingualText('更新', 'Updated')}: {result.lastUpdate}
            </div>
          </div>
        </div>

        {/* 收件人信息 - 紧凑布局 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mt-3">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-blue-600" />
            <div>
              <span className="text-sm font-medium text-blue-800">{formatBilingualText('路线', 'Route')}:</span>
              <span className="ml-2 font-semibold text-blue-900">{result.recipient.address}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 物流轨迹 - 紧凑时间线 */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">{formatBilingualText('物流轨迹', 'Tracking Timeline')}</h4>
          <div className="space-y-3">
            {result.timeline.map((event, index) => (
              <div key={index} className="relative">
                {/* 时间线连接线 */}
                {index < result.timeline.length - 1 && (
                  <div className="absolute left-[11px] top-8 w-0.5 h-8 bg-border"></div>
                )}
                
                {/* 事件内容 - 单行紧凑布局 */}
                <div className="flex items-start gap-4">
                  {/* 状态图标 */}
                  <div className="flex-shrink-0 mt-1">
                    {index === 0 ? (
                      // 最新事件 - 当前状态
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center ring-4 ring-primary/20">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    ) : (
                      // 历史事件
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* 事件信息 - 水平布局 */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      {/* 状态和位置 */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium whitespace-nowrap ${index === 0 ? 'text-primary' : ''}`}>
                            {formatBilingualText(event.status, event.statusEn)}
                          </span>
                          {index === 0 && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                              {formatBilingualText('最新', 'Latest')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                          {getLocationIcon(event.location)}
                          <span className="truncate">{formatBilingualText(event.location, event.locationEn)}</span>
                        </div>
                      </div>
                      
                      {/* 时间 */}
                      <span className={`whitespace-nowrap text-sm ${index === 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {event.time}
                      </span>
                    </div>
                    
                    {/* 描述 */}
                    <div className={`text-sm leading-relaxed ${index === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {formatBilingualText(event.description, event.descriptionEn)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 