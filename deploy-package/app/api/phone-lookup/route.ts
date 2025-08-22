import { NextRequest, NextResponse } from 'next/server'

// 手机号码前缀归属地数据（部分示例）
const phoneData = {
  // 中国移动
  '134': { province: '北京', city: '北京', isp: '中国移动' },
  '135': { province: '上海', city: '上海', isp: '中国移动' },
  '136': { province: '广东', city: '广州', isp: '中国移动' },
  '137': { province: '江苏', city: '南京', isp: '中国移动' },
  '138': { province: '浙江', city: '杭州', isp: '中国移动' },
  '139': { province: '山东', city: '济南', isp: '中国移动' },
  '150': { province: '天津', city: '天津', isp: '中国移动' },
  '151': { province: '重庆', city: '重庆', isp: '中国移动' },
  '152': { province: '河北', city: '石家庄', isp: '中国移动' },
  '157': { province: '辽宁', city: '沈阳', isp: '中国移动' },
  '158': { province: '四川', city: '成都', isp: '中国移动' },
  '159': { province: '湖北', city: '武汉', isp: '中国移动' },
  '182': { province: '福建', city: '福州', isp: '中国移动' },
  '183': { province: '湖南', city: '长沙', isp: '中国移动' },
  '184': { province: '河南', city: '郑州', isp: '中国移动' },
  '187': { province: '陕西', city: '西安', isp: '中国移动' },
  '188': { province: '安徽', city: '合肥', isp: '中国移动' },
  
  // 中国联通
  '130': { province: '北京', city: '北京', isp: '中国联通' },
  '131': { province: '上海', city: '上海', isp: '中国联通' },
  '132': { province: '广东', city: '深圳', isp: '中国联通' },
  '155': { province: '江苏', city: '苏州', isp: '中国联通' },
  '156': { province: '浙江', city: '宁波', isp: '中国联通' },
  '185': { province: '山东', city: '青岛', isp: '中国联通' },
  '186': { province: '天津', city: '天津', isp: '中国联通' },
  
  // 中国电信
  '133': { province: '北京', city: '北京', isp: '中国电信' },
  '153': { province: '上海', city: '上海', isp: '中国电信' },
  '177': { province: '广东', city: '广州', isp: '中国电信' },
  '180': { province: '江苏', city: '南京', isp: '中国电信' },
  '181': { province: '浙江', city: '杭州', isp: '中国电信' },
  '189': { province: '山东', city: '济南', isp: '中国电信' },
}

// 区号数据
const areaCodes = {
  '北京': '010',
  '上海': '021',
  '天津': '022',
  '重庆': '023',
  '广州': '020',
  '深圳': '0755',
  '南京': '025',
  '杭州': '0571',
  '济南': '0531',
  '成都': '028',
  '武汉': '027',
  '西安': '029',
  '沈阳': '024',
  '福州': '0591',
  '长沙': '0731',
  '郑州': '0371',
  '合肥': '0551',
  '石家庄': '0311',
  '苏州': '0512',
  '宁波': '0574',
  '青岛': '0532'
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: '请输入电话号码' }, { status: 400 })
    }

    // 清理号码格式
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '')
    
    // 验证号码格式
    if (cleanNumber.length !== 11 || !cleanNumber.startsWith('1')) {
      return NextResponse.json({ error: '请输入正确的11位手机号码' }, { status: 400 })
    }

    // 获取前三位
    const prefix = cleanNumber.substring(0, 3)
    
    // 查找归属地信息
    const locationData = phoneData[prefix as keyof typeof phoneData]
    
    if (!locationData) {
      return NextResponse.json({ error: '暂不支持该号段查询' }, { status: 404 })
    }

    const result = {
      phoneNumber: cleanNumber,
      province: locationData.province,
      city: locationData.city,
      isp: locationData.isp,
      type: '手机号码',
      areaCode: areaCodes[locationData.city as keyof typeof areaCodes] || areaCodes[locationData.province as keyof typeof areaCodes] || '',
      prefix: prefix
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('电话查询错误:', error)
    return NextResponse.json(
      { error: '查询失败，请稍后重试' }, 
      { status: 500 }
    )
  }
} 