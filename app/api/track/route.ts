import { NextRequest, NextResponse } from 'next/server'

interface TrackingEvent {
  timestamp: string
  status: string
  location: string
  description: string
}

interface TrackingResult {
  id: string
  trackingNumber: string
  carrier: string
  status: string
  destination: string
  origin: string
  estimatedDelivery: string
  lastUpdate: string
  events: TrackingEvent[]
}

export async function POST(request: NextRequest) {
  try {
    const { trackingNumber, apiKey } = await request.json()

    if (!trackingNumber || !apiKey) {
      return NextResponse.json(
        { error: '追踪号码和API密钥是必需的' },
        { status: 400 }
      )
    }

    // 首先注册追踪号码
    const registerResponse = await fetch('https://api.17track.net/track/v1/register', {
        method: 'POST',
        headers: {
        '17token': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
        number: trackingNumber
        }])
      })

    if (!registerResponse.ok) {
      throw new Error(`注册失败: ${registerResponse.status}`)
    }

    const registerData = await registerResponse.json()
    
    // 检查注册是否成功
    if (registerData.code !== 0) {
      return NextResponse.json(
        { error: '注册追踪号码失败', details: registerData },
        { status: 400 }
      )
    }

    // 获取追踪信息
    const trackResponse = await fetch('https://api.17track.net/track/v1/gettrackinfo', {
          method: 'POST',
          headers: {
        '17token': apiKey,
            'Content-Type': 'application/json',
          },
      body: JSON.stringify([{
        number: trackingNumber
      }])
        })

    if (!trackResponse.ok) {
      throw new Error(`查询失败: ${trackResponse.status}`)
    }

    const trackData = await trackResponse.json()
    
    if (trackData.code !== 0) {
      return NextResponse.json(
        { error: '获取追踪信息失败', details: trackData },
        { status: 400 }
      )
    }
    
    // 转换17track数据格式为前端需要的格式
    const result = trackData.data.accepted[0]
    if (!result) {
      return NextResponse.json(
        { error: '未找到追踪信息' },
        { status: 404 }
      )
    }

    const track = result.track
    
    // 获取最新事件
    const latestEvent = track.z0 || (track.z1 && track.z1[0]) || (track.z2 && track.z2[0])
    
    // 状态映射
    const statusMap: { [key: number]: string } = {
      0: '暂无信息',
      10: '运输中',
      20: '已过期',
      30: '待取件',
      35: '投递失败',
      40: '已签收',
      50: '异常'
    }

    // 获取国家名称（简化版）
    const countryMap: { [key: number]: string } = {
      301: '中国',
      1001: '美国',
      1803: '法国',
      2105: '德国',
      // 可以根据需要添加更多国家
    }

    const transformedData: TrackingResult = {
      id: Date.now().toString(),
      trackingNumber: result.number,
      carrier: getCarrierName(track.w1),
      status: statusMap[track.e] || '未知状态',
      destination: countryMap[track.c] || '未知',
      origin: countryMap[track.b] || '未知',
      estimatedDelivery: track.f > 0 ? new Date(track.f * 1000).toLocaleDateString('zh-CN') : '暂无预计',
      lastUpdate: new Date().toLocaleString('zh-CN'),
      events: []
    }

    // 处理事件列表
    const allEvents = []
    if (track.z1) allEvents.push(...track.z1)
    if (track.z2) allEvents.push(...track.z2)
    if (track.z9) allEvents.push(...track.z9)

    transformedData.events = allEvents.map((event: any): TrackingEvent => ({
      timestamp: event.a,
      status: transformedData.status,
      location: event.c || event.d || '未知地点',
      description: event.z || '无描述信息'
    }))

    return NextResponse.json({ data: transformedData })

  } catch (error) {
    console.error('17track API 错误:', error)
    return NextResponse.json(
      { error: '查询失败，请稍后重试' },
      { status: 500 }
    )
  }
}

function getCarrierName(carrierCode: number): string {
  // 常见承运商代码映射（简化版）
  const carrierMap: { [key: number]: string } = {
    3011: 'China Post',
    21051: 'USPS',
    100003: 'FedEx',
    100005: 'UPS',
    7041: 'DHL',
    // 可以根据需要添加更多承运商
  }
  
  return carrierMap[carrierCode] || `承运商-${carrierCode}`
} 