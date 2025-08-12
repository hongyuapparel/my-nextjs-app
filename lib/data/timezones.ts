export interface TimezoneData {
  code: string
  name: string
  nameEn: string
  timezone: string
  flag: string
  region: string
  city?: string // 具体城市名称（中文）
  cityEn?: string // 具体城市名称（英文）
  aliases?: string[] // 城市别名（支持更多搜索方式）
  utcOffset: string // UTC偏移量
  isDST?: boolean // 是否使用夏令时
  multipleZones?: boolean // 是否有多个时区
  notes?: string // 特殊说明
}

// 主要贸易国家和地区的时区数据
export const TIMEZONE_DATA: TimezoneData[] = [
  // 中国
  {
    code: 'CN',
    name: '中国',
    nameEn: 'China',
    timezone: 'Asia/Shanghai',
    flag: '🇨🇳',
    region: '亚洲',
    city: '北京',
    cityEn: 'Beijing',
    aliases: ['beijing', 'peking', '北京'],
    utcOffset: '+8',
    multipleZones: false,
    notes: '全国统一使用北京时间'
  },
  
  // 美国 - 多时区
  {
    code: 'US-EST',
    name: '美国东部',
    nameEn: 'US Eastern',
    timezone: 'America/New_York',
    flag: '🇺🇸',
    region: '北美洲',
    city: '纽约',
    cityEn: 'New York',
    aliases: ['new york', 'ny', 'nyc', 'new york city', '纽约', '纽约市'],
    utcOffset: '-5/-4',
    isDST: true,
    multipleZones: true,
    notes: '包括纽约、华盛顿、迈阿密等'
  },
  {
    code: 'US-CST',
    name: '美国中部',
    nameEn: 'US Central',
    timezone: 'America/Chicago',
    flag: '🇺🇸',
    region: '北美洲',
    city: '芝加哥',
    cityEn: 'Chicago',
    aliases: ['chicago', 'chi', '芝加哥'],
    utcOffset: '-6/-5',
    isDST: true,
    multipleZones: true,
    notes: '包括芝加哥、达拉斯、休斯顿等'
  },
  {
    code: 'US-MST',
    name: '美国山地',
    nameEn: 'US Mountain',
    timezone: 'America/Denver',
    flag: '🇺🇸',
    region: '北美洲',
    city: '丹佛',
    cityEn: 'Denver',
    aliases: ['denver', '丹佛'],
    utcOffset: '-7/-6',
    isDST: true,
    multipleZones: true,
    notes: '包括丹佛、盐湖城、凤凰城等'
  },
  {
    code: 'US-PST',
    name: '美国西部',
    nameEn: 'US Pacific',
    timezone: 'America/Los_Angeles',
    flag: '🇺🇸',
    region: '北美洲',
    city: '洛杉矶',
    cityEn: 'Los Angeles',
    aliases: ['los angeles', 'la', 'los', 'angeles', '洛杉矶', '洛城'],
    utcOffset: '-8/-7',
    isDST: true,
    multipleZones: true,
    notes: '包括洛杉矶、旧金山、西雅图等'
  },
  
  // 英国
  {
    code: 'GB',
    name: '英国',
    nameEn: 'United Kingdom',
    timezone: 'Europe/London',
    flag: '🇬🇧',
    region: '欧洲',
    city: '伦敦',
    cityEn: 'London',
    aliases: ['london', '伦敦'],
    utcOffset: '+0/+1',
    isDST: true,
    notes: '格林威治标准时间 (GMT)'
  },
  
  // 德国
  {
    code: 'DE',
    name: '德国',
    nameEn: 'Germany',
    timezone: 'Europe/Berlin',
    flag: '🇩🇪',
    region: '欧洲',
    city: '柏林',
    cityEn: 'Berlin',
    aliases: ['berlin', '柏林'],
    utcOffset: '+1/+2',
    isDST: true,
    notes: '中欧时间 (CET)'
  },
  
  // 日本
  {
    code: 'JP',
    name: '日本',
    nameEn: 'Japan',
    timezone: 'Asia/Tokyo',
    flag: '🇯🇵',
    region: '亚洲',
    city: '东京',
    cityEn: 'Tokyo',
    aliases: ['tokyo', '东京'],
    utcOffset: '+9',
    notes: '日本标准时间 (JST)'
  },
  
  // 韩国
  {
    code: 'KR',
    name: '韩国',
    nameEn: 'South Korea',
    timezone: 'Asia/Seoul',
    flag: '🇰🇷',
    region: '亚洲',
    city: '首尔',
    cityEn: 'Seoul',
    aliases: ['seoul', '首尔', '汉城'],
    utcOffset: '+9',
    notes: '韩国标准时间 (KST)'
  },
  
  // 新加坡
  {
    code: 'SG',
    name: '新加坡',
    nameEn: 'Singapore',
    timezone: 'Asia/Singapore',
    flag: '🇸🇬',
    region: '亚洲',
    city: '新加坡',
    cityEn: 'Singapore',
    aliases: ['singapore', 'sg', '新加坡'],
    utcOffset: '+8',
    notes: '新加坡标准时间 (SGT)'
  },
  
  // 印度
  {
    code: 'IN',
    name: '印度',
    nameEn: 'India',
    timezone: 'Asia/Kolkata',
    flag: '🇮🇳',
    region: '亚洲',
    city: '加尔各答',
    cityEn: 'Kolkata',
    aliases: ['kolkata', 'calcutta', '加尔各答', '孟买', 'mumbai', '新德里', 'delhi'],
    utcOffset: '+5:30',
    notes: '印度标准时间 (IST)'
  },
  
  // 法国
  {
    code: 'FR',
    name: '法国',
    nameEn: 'France',
    timezone: 'Europe/Paris',
    flag: '🇫🇷',
    region: '欧洲',
    city: '巴黎',
    cityEn: 'Paris',
    aliases: ['paris', '巴黎'],
    utcOffset: '+1/+2',
    isDST: true,
    notes: '中欧时间 (CET)'
  },
  
  // 意大利
  {
    code: 'IT',
    name: '意大利',
    nameEn: 'Italy',
    timezone: 'Europe/Rome',
    flag: '🇮🇹',
    region: '欧洲',
    city: '罗马',
    cityEn: 'Rome',
    aliases: ['rome', 'roma', '罗马', '米兰', 'milan'],
    utcOffset: '+1/+2',
    isDST: true,
    notes: '中欧时间 (CET)'
  },
  
  // 荷兰
  {
    code: 'NL',
    name: '荷兰',
    nameEn: 'Netherlands',
    timezone: 'Europe/Amsterdam',
    flag: '🇳🇱',
    region: '欧洲',
    city: '阿姆斯特丹',
    cityEn: 'Amsterdam',
    aliases: ['amsterdam', '阿姆斯特丹'],
    utcOffset: '+1/+2',
    isDST: true,
    notes: '中欧时间 (CET)'
  },
  
  // 加拿大 - 多时区
  {
    code: 'CA-EST',
    name: '加拿大东部',
    nameEn: 'Canada Eastern',
    timezone: 'America/Toronto',
    flag: '🇨🇦',
    region: '北美洲',
    city: '多伦多',
    cityEn: 'Toronto',
    aliases: ['toronto', '多伦多', '蒙特利尔', 'montreal', '渥太华', 'ottawa'],
    utcOffset: '-5/-4',
    isDST: true,
    multipleZones: true,
    notes: '包括多伦多、蒙特利尔、渥太华等'
  },
  {
    code: 'CA-PST',
    name: '加拿大西部',
    nameEn: 'Canada Pacific',
    timezone: 'America/Vancouver',
    flag: '🇨🇦',
    region: '北美洲',
    city: '温哥华',
    cityEn: 'Vancouver',
    aliases: ['vancouver', '温哥华', '维多利亚', 'victoria'],
    utcOffset: '-8/-7',
    isDST: true,
    multipleZones: true,
    notes: '包括温哥华、维多利亚等'
  },
  
  // 澳大利亚 - 多时区
  {
    code: 'AU-EAST',
    name: '澳大利亚东部',
    nameEn: 'Australia Eastern',
    timezone: 'Australia/Sydney',
    flag: '🇦🇺',
    region: '大洋洲',
    city: '悉尼',
    cityEn: 'Sydney',
    aliases: ['sydney', '悉尼', '墨尔本', 'melbourne', '布里斯班', 'brisbane'],
    utcOffset: '+10/+11',
    isDST: true,
    multipleZones: true,
    notes: '包括悉尼、墨尔本、布里斯班等'
  },
  {
    code: 'AU-CENTRAL',
    name: '澳大利亚中部',
    nameEn: 'Australia Central',
    timezone: 'Australia/Adelaide',
    flag: '🇦🇺',
    region: '大洋洲',
    city: '阿德莱德',
    cityEn: 'Adelaide',
    aliases: ['adelaide', '阿德莱德', '达尔文', 'darwin'],
    utcOffset: '+9:30/+10:30',
    isDST: true,
    multipleZones: true,
    notes: '包括阿德莱德、达尔文等'
  },
  {
    code: 'AU-WEST',
    name: '澳大利亚西部',
    nameEn: 'Australia Western',
    timezone: 'Australia/Perth',
    flag: '🇦🇺',
    region: '大洋洲',
    city: '珀斯',
    cityEn: 'Perth',
    aliases: ['perth', '珀斯'],
    utcOffset: '+8',
    multipleZones: true,
    notes: '包括珀斯及西澳大利亚州'
  },
  
  // 新西兰
  {
    code: 'NZ',
    name: '新西兰',
    nameEn: 'New Zealand',
    timezone: 'Pacific/Auckland',
    flag: '🇳🇿',
    region: '大洋洲',
    city: '奥克兰',
    cityEn: 'Auckland',
    aliases: ['auckland', '奥克兰', '惠灵顿', 'wellington'],
    utcOffset: '+12/+13',
    isDST: true,
    notes: '新西兰标准时间 (NZST)'
  },
  
  // 巴西 - 多时区
  {
    code: 'BR',
    name: '巴西',
    nameEn: 'Brazil',
    timezone: 'America/Sao_Paulo',
    flag: '🇧🇷',
    region: '南美洲',
    city: '圣保罗',
    cityEn: 'São Paulo',
    aliases: ['sao paulo', 'são paulo', 'saopaulo', '圣保罗', '里约热内卢', 'rio', 'rio de janeiro'],
    utcOffset: '-3',
    notes: '巴西时间 (BRT)'
  },
  
  // 阿根廷
  {
    code: 'AR',
    name: '阿根廷',
    nameEn: 'Argentina',
    timezone: 'America/Buenos_Aires',
    flag: '🇦🇷',
    region: '南美洲',
    city: '布宜诺斯艾利斯',
    cityEn: 'Buenos Aires',
    aliases: ['buenos aires', 'buenosaires', '布宜诺斯艾利斯'],
    utcOffset: '-3',
    notes: '阿根廷时间 (ART)'
  },
  
  // 阿联酋
  {
    code: 'AE',
    name: '阿联酋',
    nameEn: 'UAE',
    timezone: 'Asia/Dubai',
    flag: '🇦🇪',
    region: '中东',
    city: '迪拜',
    cityEn: 'Dubai',
    aliases: ['dubai', '迪拜', '阿布扎比', 'abu dhabi'],
    utcOffset: '+4',
    notes: '海湾标准时间 (GST)'
  },
  
  // 南非
  {
    code: 'ZA',
    name: '南非',
    nameEn: 'South Africa',
    timezone: 'Africa/Johannesburg',
    flag: '🇿🇦',
    region: '非洲',
    city: '约翰内斯堡',
    cityEn: 'Johannesburg',
    aliases: ['johannesburg', '约翰内斯堡', '开普敦', 'cape town'],
    utcOffset: '+2',
    notes: '南非标准时间 (SAST)'
  },
  
  // 墨西哥
  {
    code: 'MX',
    name: '墨西哥',
    nameEn: 'Mexico',
    timezone: 'America/Mexico_City',
    flag: '🇲🇽',
    region: '北美洲',
    city: '墨西哥城',
    cityEn: 'Mexico City',
    aliases: ['mexico city', 'mexicocity', '墨西哥城'],
    utcOffset: '-6/-5',
    isDST: true,
    notes: '墨西哥中部时间'
  },
  
  // 俄罗斯 - 多时区
  {
    code: 'RU-MSK',
    name: '俄罗斯莫斯科',
    nameEn: 'Russia Moscow',
    timezone: 'Europe/Moscow',
    flag: '🇷🇺',
    region: '欧洲',
    city: '莫斯科',
    cityEn: 'Moscow',
    aliases: ['moscow', '莫斯科', '圣彼得堡', 'st petersburg'],
    utcOffset: '+3',
    multipleZones: true,
    notes: '莫斯科时间 (MSK)'
  },
  
  // 土耳其
  {
    code: 'TR',
    name: '土耳其',
    nameEn: 'Turkey',
    timezone: 'Europe/Istanbul',
    flag: '🇹🇷',
    region: '欧洲',
    city: '伊斯坦布尔',
    cityEn: 'Istanbul',
    aliases: ['istanbul', '伊斯坦布尔', '安卡拉', 'ankara'],
    utcOffset: '+3',
    notes: '土耳其时间 (TRT)'
  },
  
  // 更多亚洲国家
  {
    code: 'TH',
    name: '泰国',
    nameEn: 'Thailand',
    timezone: 'Asia/Bangkok',
    flag: '🇹🇭',
    region: '亚洲',
    city: '曼谷',
    cityEn: 'Bangkok',
    aliases: ['bangkok', '曼谷'],
    utcOffset: '+7',
    notes: '印度支那时间 (ICT)'
  },
  {
    code: 'MY',
    name: '马来西亚',
    nameEn: 'Malaysia',
    timezone: 'Asia/Kuala_Lumpur',
    flag: '🇲🇾',
    region: '亚洲',
    city: '吉隆坡',
    cityEn: 'Kuala Lumpur',
    aliases: ['kuala lumpur', 'kualalumpur', 'kl', '吉隆坡'],
    utcOffset: '+8',
    notes: '马来西亚标准时间 (MYT)'
  },
  {
    code: 'ID',
    name: '印度尼西亚',
    nameEn: 'Indonesia',
    timezone: 'Asia/Jakarta',
    flag: '🇮🇩',
    region: '亚洲',
    city: '雅加达',
    cityEn: 'Jakarta',
    aliases: ['jakarta', '雅加达', '巴厘岛', 'bali'],
    utcOffset: '+7',
    multipleZones: true,
    notes: '西印尼时间 (WIB)'
  },
  {
    code: 'VN',
    name: '越南',
    nameEn: 'Vietnam',
    timezone: 'Asia/Ho_Chi_Minh',
    flag: '🇻🇳',
    region: '亚洲',
    city: '胡志明市',
    cityEn: 'Ho Chi Minh City',
    aliases: ['ho chi minh city', 'hcmc', 'saigon', '胡志明市', '西贡', '河内', 'hanoi'],
    utcOffset: '+7',
    notes: '印度支那时间 (ICT)'
  },
  {
    code: 'PH',
    name: '菲律宾',
    nameEn: 'Philippines',
    timezone: 'Asia/Manila',
    flag: '🇵🇭',
    region: '亚洲',
    city: '马尼拉',
    cityEn: 'Manila',
    aliases: ['manila', '马尼拉', '宿务', 'cebu'],
    utcOffset: '+8',
    notes: '菲律宾标准时间 (PST)'
  },
  {
    code: 'BD',
    name: '孟加拉国',
    nameEn: 'Bangladesh',
    timezone: 'Asia/Dhaka',
    flag: '🇧🇩',
    region: '亚洲',
    city: '达卡',
    cityEn: 'Dhaka',
    aliases: ['dhaka', '达卡'],
    utcOffset: '+6',
    notes: '孟加拉标准时间 (BST)'
  },
  {
    code: 'PK',
    name: '巴基斯坦',
    nameEn: 'Pakistan',
    timezone: 'Asia/Karachi',
    flag: '🇵🇰',
    region: '亚洲',
    city: '卡拉奇',
    cityEn: 'Karachi',
    aliases: ['karachi', '卡拉奇', '拉合尔', 'lahore', '伊斯兰堡', 'islamabad'],
    utcOffset: '+5',
    notes: '巴基斯坦标准时间 (PKT)'
  },
  {
    code: 'IR',
    name: '伊朗',
    nameEn: 'Iran',
    timezone: 'Asia/Tehran',
    flag: '🇮🇷',
    region: '中东',
    city: '德黑兰',
    cityEn: 'Tehran',
    aliases: ['tehran', '德黑兰'],
    utcOffset: '+3:30',
    notes: '伊朗标准时间 (IRST)'
  },
  {
    code: 'SA',
    name: '沙特阿拉伯',
    nameEn: 'Saudi Arabia',
    timezone: 'Asia/Riyadh',
    flag: '🇸🇦',
    region: '中东',
    city: '利雅得',
    cityEn: 'Riyadh',
    aliases: ['riyadh', '利雅得', '吉达', 'jeddah'],
    utcOffset: '+3',
    notes: '阿拉伯标准时间 (AST)'
  },
  {
    code: 'IL',
    name: '以色列',
    nameEn: 'Israel',
    timezone: 'Asia/Jerusalem',
    flag: '🇮🇱',
    region: '中东',
    city: '耶路撒冷',
    cityEn: 'Jerusalem',
    aliases: ['jerusalem', '耶路撒冷', '特拉维夫', 'tel aviv'],
    utcOffset: '+2/+3',
    isDST: true,
    notes: '以色列标准时间 (IST)'
  },
  
  // 更多欧洲国家
  {
    code: 'ES',
    name: '西班牙',
    nameEn: 'Spain',
    timezone: 'Europe/Madrid',
    flag: '🇪🇸',
    region: '欧洲',
    city: '马德里',
    cityEn: 'Madrid',
    aliases: ['madrid', '马德里', '巴塞罗那', 'barcelona'],
    utcOffset: '+1/+2',
    isDST: true,
    notes: '中欧时间 (CET)'
  },
  {
    code: 'PT',
    name: '葡萄牙',
    nameEn: 'Portugal',
    timezone: 'Europe/Lisbon',
    flag: '🇵🇹',
    region: '欧洲',
    city: '里斯本',
    cityEn: 'Lisbon',
    aliases: ['lisbon', '里斯本', '波尔图', 'porto'],
    utcOffset: '+0/+1',
    isDST: true,
    notes: '西欧时间 (WET)'
  },
  {
    code: 'SE',
    name: '瑞典',
    nameEn: 'Sweden',
    timezone: 'Europe/Stockholm',
    flag: '🇸🇪',
    region: '欧洲',
    city: '斯德哥尔摩',
    cityEn: 'Stockholm',
    aliases: ['stockholm', '斯德哥尔摩'],
    utcOffset: '+1/+2',
    isDST: true,
    notes: '中欧时间 (CET)'
  },
  {
    code: 'NO',
    name: '挪威',
    nameEn: 'Norway',
    timezone: 'Europe/Oslo',
    flag: '🇳🇴',
    region: '欧洲',
    city: '奥斯陆',
    cityEn: 'Oslo',
    aliases: ['oslo', '奥斯陆'],
    utcOffset: '+1/+2',
    isDST: true,
    notes: '中欧时间 (CET)'
  },
  {
    code: 'DK',
    name: '丹麦',
    nameEn: 'Denmark',
    timezone: 'Europe/Copenhagen',
    flag: '🇩🇰',
    region: '欧洲',
    city: '哥本哈根',
    cityEn: 'Copenhagen',
    aliases: ['copenhagen', '哥本哈根'],
    utcOffset: '+1/+2',
    isDST: true,
    notes: '中欧时间 (CET)'
  },
  {
    code: 'FI',
    name: '芬兰',
    nameEn: 'Finland',
    timezone: 'Europe/Helsinki',
    flag: '🇫🇮',
    region: '欧洲',
    city: '赫尔辛基',
    cityEn: 'Helsinki',
    aliases: ['helsinki', '赫尔辛基'],
    utcOffset: '+2/+3',
    isDST: true,
    notes: '东欧时间 (EET)'
  },
  {
    code: 'PL',
    name: '波兰',
    nameEn: 'Poland',
    timezone: 'Europe/Warsaw',
    flag: '🇵🇱',
    region: '欧洲',
    city: '华沙',
    cityEn: 'Warsaw',
    aliases: ['warsaw', '华沙'],
    utcOffset: '+1/+2',
    isDST: true,
    notes: '中欧时间 (CET)'
  },
  {
    code: 'CZ',
    name: '捷克',
    nameEn: 'Czech Republic',
    timezone: 'Europe/Prague',
    flag: '🇨🇿',
    region: '欧洲',
    city: '布拉格',
    cityEn: 'Prague',
    aliases: ['prague', '布拉格'],
    utcOffset: '+1/+2',
    isDST: true,
    notes: '中欧时间 (CET)'
  },
  {
    code: 'AT',
    name: '奥地利',
    nameEn: 'Austria',
    timezone: 'Europe/Vienna',
    flag: '🇦🇹',
    region: '欧洲',
    city: '维也纳',
    cityEn: 'Vienna',
    aliases: ['vienna', '维也纳'],
    utcOffset: '+1/+2',
    isDST: true,
    notes: '中欧时间 (CET)'
  },
  {
    code: 'CH',
    name: '瑞士',
    nameEn: 'Switzerland',
    timezone: 'Europe/Zurich',
    flag: '🇨🇭',
    region: '欧洲',
    city: '苏黎世',
    cityEn: 'Zurich',
    aliases: ['zurich', '苏黎世', '伯尔尼', 'bern'],
    utcOffset: '+1/+2',
    isDST: true,
    notes: '中欧时间 (CET)'
  },
  {
    code: 'BE',
    name: '比利时',
    nameEn: 'Belgium',
    timezone: 'Europe/Brussels',
    flag: '🇧🇪',
    region: '欧洲',
    city: '布鲁塞尔',
    cityEn: 'Brussels',
    aliases: ['brussels', '布鲁塞尔'],
    utcOffset: '+1/+2',
    isDST: true,
    notes: '中欧时间 (CET)'
  },
  {
    code: 'GR',
    name: '希腊',
    nameEn: 'Greece',
    timezone: 'Europe/Athens',
    flag: '🇬🇷',
    region: '欧洲',
    city: '雅典',
    cityEn: 'Athens',
    aliases: ['athens', '雅典'],
    utcOffset: '+2/+3',
    isDST: true,
    notes: '东欧时间 (EET)'
  },
  
  // 更多非洲国家
  {
    code: 'EG',
    name: '埃及',
    nameEn: 'Egypt',
    timezone: 'Africa/Cairo',
    flag: '🇪🇬',
    region: '非洲',
    city: '开罗',
    cityEn: 'Cairo',
    aliases: ['cairo', '开罗'],
    utcOffset: '+2',
    notes: '东欧时间 (EET)'
  },
  {
    code: 'NG',
    name: '尼日利亚',
    nameEn: 'Nigeria',
    timezone: 'Africa/Lagos',
    flag: '🇳🇬',
    region: '非洲',
    city: '拉各斯',
    cityEn: 'Lagos',
    aliases: ['lagos', '拉各斯'],
    utcOffset: '+1',
    notes: '西非时间 (WAT)'
  },
  {
    code: 'KE',
    name: '肯尼亚',
    nameEn: 'Kenya',
    timezone: 'Africa/Nairobi',
    flag: '🇰🇪',
    region: '非洲',
    city: '内罗毕',
    cityEn: 'Nairobi',
    aliases: ['nairobi', '内罗毕'],
    utcOffset: '+3',
    notes: '东非时间 (EAT)'
  },
  {
    code: 'MA',
    name: '摩洛哥',
    nameEn: 'Morocco',
    timezone: 'Africa/Casablanca',
    flag: '🇲🇦',
    region: '非洲',
    city: '卡萨布兰卡',
    cityEn: 'Casablanca',
    aliases: ['casablanca', '卡萨布兰卡'],
    utcOffset: '+1',
    notes: '西欧时间 (WET)'
  },
  
  // 更多美洲国家
  {
    code: 'CL',
    name: '智利',
    nameEn: 'Chile',
    timezone: 'America/Santiago',
    flag: '🇨🇱',
    region: '南美洲',
    city: '圣地亚哥',
    cityEn: 'Santiago',
    aliases: ['santiago', '圣地亚哥'],
    utcOffset: '-4/-3',
    isDST: true,
    notes: '智利标准时间 (CLT)'
  },
  {
    code: 'CO',
    name: '哥伦比亚',
    nameEn: 'Colombia',
    timezone: 'America/Bogota',
    flag: '🇨🇴',
    region: '南美洲',
    city: '波哥大',
    cityEn: 'Bogotá',
    aliases: ['bogota', 'bogotá', '波哥大'],
    utcOffset: '-5',
    notes: '哥伦比亚时间 (COT)'
  },
  {
    code: 'PE',
    name: '秘鲁',
    nameEn: 'Peru',
    timezone: 'America/Lima',
    flag: '🇵🇪',
    region: '南美洲',
    city: '利马',
    cityEn: 'Lima',
    aliases: ['lima', '利马'],
    utcOffset: '-5',
    notes: '秘鲁时间 (PET)'
  },
  {
    code: 'VE',
    name: '委内瑞拉',
    nameEn: 'Venezuela',
    timezone: 'America/Caracas',
    flag: '🇻🇪',
    region: '南美洲',
    city: '加拉加斯',
    cityEn: 'Caracas',
    aliases: ['caracas', '加拉加斯'],
    utcOffset: '-4',
    notes: '委内瑞拉时间 (VET)'
  }
]

export const TIMEZONE_REGIONS = [
  '亚洲',
  '欧洲', 
  '北美洲',
  '南美洲',
  '大洋洲',
  '中东',
  '非洲'
]

// 为了向后兼容，保留原来的数组名
export const POPULAR_TIMEZONES = TIMEZONE_DATA 