export interface PhoneData {
  code: string
  name: string
  nameEn: string
  countryCode: string
  dialCode: string
  format: string
  example: string
  flag: string
  region: string
  digitCount: number
  mobilePrefix: string[]
  landlinePrefix?: string[]
  notes?: string
  timeZone?: string
  currency?: string
  language?: string
  regions?: RegionData[]
  carriers?: CarrierData[]
  validationRules?: ValidationRule[]
}

export interface RegionData {
  code: string
  name: string
  nameEn: string
  prefix: string[]
  majorCities: string[]
}

export interface CarrierData {
  name: string
  prefixes: string[]
  type: 'mobile' | 'landline' | 'voip'
}

export interface ValidationRule {
  pattern: RegExp
  message: string
}

// 智能电话分析器数据
export const PHONE_ANALYSIS_DATA: PhoneData[] = [
  // 中国 - 详细区域信息
  {
    code: 'CN',
    name: '中国',
    nameEn: 'China',
    countryCode: 'CHN',
    dialCode: '+86',
    format: '+86 1XX XXXX XXXX',
    example: '+86 138 0013 8000',
    flag: '🇨🇳',
    region: '亚洲',
    digitCount: 11,
    mobilePrefix: ['13', '14', '15', '16', '17', '18', '19'],
    landlinePrefix: ['010', '020', '021', '022', '023', '024', '025', '027', '028', '029'],
    timeZone: 'UTC+8',
    currency: 'CNY (人民币)',
    language: '中文',
    notes: '全国统一使用11位手机号码，固话区号2-4位',
    regions: [
      {
        code: 'BJ',
        name: '北京',
        nameEn: 'Beijing',
        prefix: ['010'],
        majorCities: ['北京市']
      },
      {
        code: 'SH',
        name: '上海',
        nameEn: 'Shanghai',
        prefix: ['021'],
        majorCities: ['上海市']
      },
      {
        code: 'GD',
        name: '广东',
        nameEn: 'Guangdong',
        prefix: ['020', '0751', '0752', '0753', '0754', '0755', '0756', '0757', '0758', '0759'],
        majorCities: ['广州', '深圳', '珠海', '佛山', '东莞', '中山']
      },
      {
        code: 'JS',
        name: '江苏',
        nameEn: 'Jiangsu',
        prefix: ['025', '0510', '0511', '0512', '0513', '0514', '0515', '0516', '0517', '0518'],
        majorCities: ['南京', '苏州', '无锡', '常州', '徐州']
      },
      {
        code: 'ZJ',
        name: '浙江',
        nameEn: 'Zhejiang',
        prefix: ['0571', '0572', '0573', '0574', '0575', '0576', '0577', '0578', '0579'],
        majorCities: ['杭州', '宁波', '温州', '嘉兴', '湖州']
      }
    ],
    carriers: [
      { name: '中国移动', prefixes: ['134', '135', '136', '137', '138', '139', '147', '150', '151', '152', '157', '158', '159', '178', '182', '183', '184', '187', '188', '198'], type: 'mobile' },
      { name: '中国联通', prefixes: ['130', '131', '132', '145', '155', '156', '166', '175', '176', '185', '186'], type: 'mobile' },
      { name: '中国电信', prefixes: ['133', '149', '153', '173', '177', '180', '181', '189', '199'], type: 'mobile' }
    ],
    validationRules: [
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '手机号码必须是11位，以1开头'
      }
    ]
  },

  // 美国 - 详细州信息
  {
    code: 'US',
    name: '美国',
    nameEn: 'United States',
    countryCode: 'USA',
    dialCode: '+1',
    format: '+1 (XXX) XXX-XXXX',
    example: '+1 (555) 123-4567',
    flag: '🇺🇸',
    region: '北美洲',
    digitCount: 10,
    mobilePrefix: ['2', '3', '4', '5', '6', '7', '8', '9'],
    timeZone: 'UTC-5到UTC-10',
    currency: 'USD (美元)',
    language: 'English',
    notes: '10位号码，区号3位，不能以0或1开头',
    regions: [
      {
        code: 'NY',
        name: '纽约州',
        nameEn: 'New York',
        prefix: ['212', '315', '347', '516', '518', '585', '607', '631', '646', '716', '718', '845', '914', '917', '929', '934'],
        majorCities: ['纽约市', '奥尔巴尼', '布法罗', '罗切斯特', '雪城']
      },
      {
        code: 'CA',
        name: '加利福尼亚州',
        nameEn: 'California',
        prefix: ['209', '213', '310', '323', '408', '415', '424', '442', '510', '530', '559', '562', '619', '626', '628', '650', '657', '661', '669', '707', '714', '747', '760', '805', '818', '831', '858', '909', '916', '925', '949', '951'],
        majorCities: ['洛杉矶', '旧金山', '圣地亚哥', '萨克拉门托', '圣何塞']
      },
      {
        code: 'TX',
        name: '德克萨斯州',
        nameEn: 'Texas',
        prefix: ['214', '254', '281', '325', '361', '409', '430', '432', '469', '512', '713', '737', '806', '817', '830', '832', '903', '915', '936', '940', '956', '972', '979'],
        majorCities: ['休斯顿', '达拉斯', '圣安东尼奥', '奥斯汀', '沃思堡']
      }
    ],
    carriers: [
      { name: 'Verizon', prefixes: [], type: 'mobile' },
      { name: 'AT&T', prefixes: [], type: 'mobile' },
      { name: 'T-Mobile', prefixes: [], type: 'mobile' },
      { name: 'Sprint', prefixes: [], type: 'mobile' }
    ]
  },

  // 英国
  {
    code: 'GB',
    name: '英国',
    nameEn: 'United Kingdom',
    countryCode: 'GBR',
    dialCode: '+44',
    format: '+44 XXXX XXX XXX',
    example: '+44 7700 900123',
    flag: '🇬🇧',
    region: '欧洲',
    digitCount: 11,
    mobilePrefix: ['07'],
    landlinePrefix: ['01', '02'],
    timeZone: 'UTC+0/+1',
    currency: 'GBP (英镑)',
    language: 'English',
    notes: '手机号码以07开头，固话以01或02开头',
    regions: [
      {
        code: 'LONDON',
        name: '伦敦',
        nameEn: 'London',
        prefix: ['020'],
        majorCities: ['伦敦']
      },
      {
        code: 'MANCHESTER',
        name: '曼彻斯特',
        nameEn: 'Manchester',
        prefix: ['0161'],
        majorCities: ['曼彻斯特']
      },
      {
        code: 'BIRMINGHAM',
        name: '伯明翰',
        nameEn: 'Birmingham',
        prefix: ['0121'],
        majorCities: ['伯明翰']
      }
    ]
  },

  // 德国
  {
    code: 'DE',
    name: '德国',
    nameEn: 'Germany',
    countryCode: 'DEU',
    dialCode: '+49',
    format: '+49 XXX XXXXXXX',
    example: '+49 151 12345678',
    flag: '🇩🇪',
    region: '欧洲',
    digitCount: 11,
    mobilePrefix: ['15', '16', '17'],
    landlinePrefix: ['030', '040', '089'],
    timeZone: 'UTC+1/+2',
    currency: 'EUR (欧元)',
    language: 'Deutsch',
    notes: '手机号码以15、16、17开头',
    regions: [
      {
        code: 'BERLIN',
        name: '柏林',
        nameEn: 'Berlin',
        prefix: ['030'],
        majorCities: ['柏林']
      },
      {
        code: 'MUNICH',
        name: '慕尼黑',
        nameEn: 'Munich',
        prefix: ['089'],
        majorCities: ['慕尼黑']
      },
      {
        code: 'HAMBURG',
        name: '汉堡',
        nameEn: 'Hamburg',
        prefix: ['040'],
        majorCities: ['汉堡']
      }
    ]
  },

  // 日本
  {
    code: 'JP',
    name: '日本',
    nameEn: 'Japan',
    countryCode: 'JPN',
    dialCode: '+81',
    format: '+81 XX XXXX XXXX',
    example: '+81 90 1234 5678',
    flag: '🇯🇵',
    region: '亚洲',
    digitCount: 11,
    mobilePrefix: ['070', '080', '090'],
    landlinePrefix: ['03', '04', '06'],
    timeZone: 'UTC+9',
    currency: 'JPY (日元)',
    language: '日本語',
    notes: '手机号码以070、080、090开头',
    regions: [
      {
        code: 'TOKYO',
        name: '东京',
        nameEn: 'Tokyo',
        prefix: ['03'],
        majorCities: ['东京', '品川', '新宿', '涩谷']
      },
      {
        code: 'OSAKA',
        name: '大阪',
        nameEn: 'Osaka',
        prefix: ['06'],
        majorCities: ['大阪', '神户', '京都']
      },
      {
        code: 'NAGOYA',
        name: '名古屋',
        nameEn: 'Nagoya',
        prefix: ['052'],
        majorCities: ['名古屋']
      }
    ]
  },

  // 新加坡
  {
    code: 'SG',
    name: '新加坡',
    nameEn: 'Singapore',
    countryCode: 'SGP',
    dialCode: '+65',
    format: '+65 XXXX XXXX',
    example: '+65 9123 4567',
    flag: '🇸🇬',
    region: '亚洲',
    digitCount: 8,
    mobilePrefix: ['8', '9'],
    landlinePrefix: ['6'],
    timeZone: 'UTC+8',
    currency: 'SGD (新元)',
    language: 'English, 中文, Bahasa, தமிழ்',
    notes: '手机号码8位，以8或9开头，固话以6开头',
    regions: [
      {
        code: 'SG',
        name: '新加坡',
        nameEn: 'Singapore',
        prefix: ['6'],
        majorCities: ['新加坡市']
      }
    ]
  },

  // 印度
  {
    code: 'IN',
    name: '印度',
    nameEn: 'India',
    countryCode: 'IND',
    dialCode: '+91',
    format: '+91 XXXXX XXXXX',
    example: '+91 98765 43210',
    flag: '🇮🇳',
    region: '亚洲',
    digitCount: 10,
    mobilePrefix: ['6', '7', '8', '9'],
    landlinePrefix: ['011', '022', '033', '040', '080'],
    timeZone: 'UTC+5:30',
    currency: 'INR (印度卢比)',
    language: 'Hindi, English, Others',
    notes: '手机号码10位，以6-9开头',
    regions: [
      {
        code: 'DELHI',
        name: '德里',
        nameEn: 'Delhi',
        prefix: ['011'],
        majorCities: ['新德里', '德里']
      },
      {
        code: 'MUMBAI',
        name: '孟买',
        nameEn: 'Mumbai',
        prefix: ['022'],
        majorCities: ['孟买', '浦那']
      },
      {
        code: 'BANGALORE',
        name: '班加罗尔',
        nameEn: 'Bangalore',
        prefix: ['080'],
        majorCities: ['班加罗尔']
      }
    ]
  },

  // 比利时
  {
    code: 'BE',
    name: '比利时',
    nameEn: 'Belgium',
    countryCode: 'BEL',
    dialCode: '+32',
    format: '+32 XXX XX XX XX',
    example: '+32 476 12 34 56',
    flag: '🇧🇪',
    region: '欧洲',
    digitCount: 9,
    mobilePrefix: ['4'],
    landlinePrefix: ['2', '3', '4', '9'],
    timeZone: 'UTC+1/+2',
    currency: 'EUR (欧元)',
    language: 'Nederlands, Français, Deutsch',
    notes: '手机号码以4开头，固话有区域前缀',
    regions: [
      {
        code: 'BRUSSELS',
        name: '布鲁塞尔',
        nameEn: 'Brussels',
        prefix: ['2'],
        majorCities: ['布鲁塞尔']
      },
      {
        code: 'ANTWERP',
        name: '安特卫普',
        nameEn: 'Antwerp',
        prefix: ['3'],
        majorCities: ['安特卫普']
      }
    ]
  },

  // 法国
  {
    code: 'FR',
    name: '法国',
    nameEn: 'France',
    countryCode: 'FRA',
    dialCode: '+33',
    format: '+33 X XX XX XX XX',
    example: '+33 6 12 34 56 78',
    flag: '🇫🇷',
    region: '欧洲',
    digitCount: 9,
    mobilePrefix: ['6', '7'],
    landlinePrefix: ['1', '2', '3', '4', '5'],
    timeZone: 'UTC+1/+2',
    currency: 'EUR (欧元)',
    language: 'Français',
    notes: '手机号码以6或7开头，巴黎固话以1开头',
    regions: [
      {
        code: 'PARIS',
        name: '巴黎',
        nameEn: 'Paris',
        prefix: ['1'],
        majorCities: ['巴黎']
      },
      {
        code: 'MARSEILLE',
        name: '马赛',
        nameEn: 'Marseille',
        prefix: ['4'],
        majorCities: ['马赛', '尼斯', '土伦']
      }
    ]
  },

  // 意大利
  {
    code: 'IT',
    name: '意大利',
    nameEn: 'Italy',
    countryCode: 'ITA',
    dialCode: '+39',
    format: '+39 XXX XXX XXXX',
    example: '+39 335 123 4567',
    flag: '🇮🇹',
    region: '欧洲',
    digitCount: 10,
    mobilePrefix: ['3'],
    landlinePrefix: ['02', '06', '011', '051', '055'],
    timeZone: 'UTC+1/+2',
    currency: 'EUR (欧元)',
    language: 'Italiano',
    notes: '手机号码以3开头，固话有区域代码',
    regions: [
      {
        code: 'ROME',
        name: '罗马',
        nameEn: 'Rome',
        prefix: ['06'],
        majorCities: ['罗马']
      },
      {
        code: 'MILAN',
        name: '米兰',
        nameEn: 'Milan',
        prefix: ['02'],
        majorCities: ['米兰']
      }
    ]
  },

  // 荷兰
  {
    code: 'NL',
    name: '荷兰',
    nameEn: 'Netherlands',
    countryCode: 'NLD',
    dialCode: '+31',
    format: '+31 X XXXX XXXX',
    example: '+31 6 1234 5678',
    flag: '🇳🇱',
    region: '欧洲',
    digitCount: 9,
    mobilePrefix: ['6'],
    landlinePrefix: ['10', '13', '15', '20', '23', '24', '26', '30', '33', '35', '36', '38', '40', '43', '45', '46', '50', '53', '55', '58', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79'],
    timeZone: 'UTC+1/+2',
    currency: 'EUR (欧元)',
    language: 'Nederlands',
    notes: '手机号码以6开头',
    regions: [
      {
        code: 'AMSTERDAM',
        name: '阿姆斯特丹',
        nameEn: 'Amsterdam',
        prefix: ['20'],
        majorCities: ['阿姆斯特丹']
      },
      {
        code: 'ROTTERDAM',
        name: '鹿特丹',
        nameEn: 'Rotterdam',
        prefix: ['10'],
        majorCities: ['鹿特丹']
      }
    ]
  },

  // 西班牙
  {
    code: 'ES',
    name: '西班牙',
    nameEn: 'Spain',
    countryCode: 'ESP',
    dialCode: '+34',
    format: '+34 XXX XX XX XX',
    example: '+34 612 34 56 78',
    flag: '🇪🇸',
    region: '欧洲',
    digitCount: 9,
    mobilePrefix: ['6', '7'],
    landlinePrefix: ['8', '9'],
    timeZone: 'UTC+1/+2',
    currency: 'EUR (欧元)',
    language: 'Español',
    notes: '手机号码以6或7开头',
    regions: [
      {
        code: 'MADRID',
        name: '马德里',
        nameEn: 'Madrid',
        prefix: ['91'],
        majorCities: ['马德里']
      },
      {
        code: 'BARCELONA',
        name: '巴塞罗那',
        nameEn: 'Barcelona',
        prefix: ['93'],
        majorCities: ['巴塞罗那']
      }
    ]
  },

  // 瑞士
  {
    code: 'CH',
    name: '瑞士',
    nameEn: 'Switzerland',
    countryCode: 'CHE',
    dialCode: '+41',
    format: '+41 XX XXX XX XX',
    example: '+41 79 123 45 67',
    flag: '🇨🇭',
    region: '欧洲',
    digitCount: 9,
    mobilePrefix: ['7'],
    landlinePrefix: ['1', '2', '3', '4', '5', '6', '8', '9'],
    timeZone: 'UTC+1/+2',
    currency: 'CHF (瑞士法郎)',
    language: 'Deutsch, Français, Italiano, Romansh',
    notes: '手机号码以7开头',
    regions: [
      {
        code: 'ZURICH',
        name: '苏黎世',
        nameEn: 'Zurich',
        prefix: ['44'],
        majorCities: ['苏黎世']
      },
      {
        code: 'GENEVA',
        name: '日内瓦',
        nameEn: 'Geneva',
        prefix: ['22'],
        majorCities: ['日内瓦']
      }
    ]
  },

  // 奥地利
  {
    code: 'AT',
    name: '奥地利',
    nameEn: 'Austria',
    countryCode: 'AUT',
    dialCode: '+43',
    format: '+43 XXX XXXXXX',
    example: '+43 664 123456',
    flag: '🇦🇹',
    region: '欧洲',
    digitCount: 10,
    mobilePrefix: ['6'],
    landlinePrefix: ['1', '2', '3', '4', '5', '7'],
    timeZone: 'UTC+1/+2',
    currency: 'EUR (欧元)',
    language: 'Deutsch',
    notes: '手机号码以6开头',
    regions: [
      {
        code: 'VIENNA',
        name: '维也纳',
        nameEn: 'Vienna',
        prefix: ['1'],
        majorCities: ['维也纳']
      }
    ]
  },

  // 澳大利亚
  {
    code: 'AU',
    name: '澳大利亚',
    nameEn: 'Australia',
    countryCode: 'AUS',
    dialCode: '+61',
    format: '+61 XXX XXX XXX',
    example: '+61 412 345 678',
    flag: '🇦🇺',
    region: '大洋洲',
    digitCount: 9,
    mobilePrefix: ['4'],
    landlinePrefix: ['2', '3', '7', '8'],
    timeZone: 'UTC+8到UTC+11',
    currency: 'AUD (澳元)',
    language: 'English',
    notes: '手机号码以4开头',
    regions: [
      {
        code: 'SYDNEY',
        name: '悉尼',
        nameEn: 'Sydney',
        prefix: ['2'],
        majorCities: ['悉尼', '纽卡斯尔']
      },
      {
        code: 'MELBOURNE',
        name: '墨尔本',
        nameEn: 'Melbourne',
        prefix: ['3'],
        majorCities: ['墨尔本']
      }
    ]
  },

  // 加拿大
  {
    code: 'CA',
    name: '加拿大',
    nameEn: 'Canada',
    countryCode: 'CAN',
    dialCode: '+1',
    format: '+1 (XXX) XXX-XXXX',
    example: '+1 (416) 123-4567',
    flag: '🇨🇦',
    region: '北美洲',
    digitCount: 10,
    mobilePrefix: ['2', '3', '4', '5', '6', '7', '8', '9'],
    timeZone: 'UTC-3.5到UTC-8',
    currency: 'CAD (加元)',
    language: 'English, Français',
    notes: '与美国共享国家代码+1',
    regions: [
      {
        code: 'TORONTO',
        name: '多伦多',
        nameEn: 'Toronto',
        prefix: ['416', '647', '437'],
        majorCities: ['多伦多']
      },
      {
        code: 'VANCOUVER',
        name: '温哥华',
        nameEn: 'Vancouver',
        prefix: ['604', '778', '236'],
        majorCities: ['温哥华']
      }
    ]
  },

  // 巴西
  {
    code: 'BR',
    name: '巴西',
    nameEn: 'Brazil',
    countryCode: 'BRA',
    dialCode: '+55',
    format: '+55 XX XXXXX-XXXX',
    example: '+55 11 91234-5678',
    flag: '🇧🇷',
    region: '南美洲',
    digitCount: 11,
    mobilePrefix: ['9'],
    landlinePrefix: ['1', '2', '3', '4', '5', '6', '7', '8'],
    timeZone: 'UTC-2到UTC-5',
    currency: 'BRL (雷亚尔)',
    language: 'Português',
    notes: '手机号码11位，以9开头',
    regions: [
      {
        code: 'SAO_PAULO',
        name: '圣保罗',
        nameEn: 'São Paulo',
        prefix: ['11'],
        majorCities: ['圣保罗']
      },
      {
        code: 'RIO',
        name: '里约热内卢',
        nameEn: 'Rio de Janeiro',
        prefix: ['21'],
        majorCities: ['里约热内卢']
      }
    ]
  },

  // 俄罗斯
  {
    code: 'RU',
    name: '俄罗斯',
    nameEn: 'Russia',
    countryCode: 'RUS',
    dialCode: '+7',
    format: '+7 XXX XXX-XX-XX',
    example: '+7 912 345-67-89',
    flag: '🇷🇺',
    region: '欧洲/亚洲',
    digitCount: 10,
    mobilePrefix: ['9'],
    landlinePrefix: ['3', '4', '8'],
    timeZone: 'UTC+2到UTC+12',
    currency: 'RUB (卢布)',
    language: 'Русский',
    notes: '手机号码以9开头',
    regions: [
      {
        code: 'MOSCOW',
        name: '莫斯科',
        nameEn: 'Moscow',
        prefix: ['495', '499'],
        majorCities: ['莫斯科']
      },
      {
        code: 'SPB',
        name: '圣彼得堡',
        nameEn: 'Saint Petersburg',
        prefix: ['812'],
        majorCities: ['圣彼得堡']
      }
    ]
  },

  // 阿联酋
  {
    code: 'AE',
    name: '阿联酋',
    nameEn: 'United Arab Emirates',
    countryCode: 'ARE',
    dialCode: '+971',
    format: '+971 X XXXX XXXX',
    example: '+971 50 123 4567',
    flag: '🇦🇪',
    region: '中东',
    digitCount: 9,
    mobilePrefix: ['50', '52', '54', '55', '56', '58'],
    landlinePrefix: ['2', '3', '4', '6', '7', '9'],
    timeZone: 'UTC+4',
    currency: 'AED (迪拉姆)',
    language: 'العربية (Arabic), English',
    notes: '手机号码9位，以5开头',
    regions: [
      {
        code: 'DUBAI',
        name: '迪拜',
        nameEn: 'Dubai',
        prefix: ['4'],
        majorCities: ['迪拜', 'Dubai']
      },
      {
        code: 'ABU_DHABI',
        name: '阿布扎比',
        nameEn: 'Abu Dhabi',
        prefix: ['2'],
        majorCities: ['阿布扎比', 'Abu Dhabi']
      },
      {
        code: 'SHARJAH',
        name: '沙迦',
        nameEn: 'Sharjah',
        prefix: ['6'],
        majorCities: ['沙迦', 'Sharjah']
      },
      {
        code: 'AJMAN',
        name: '阿治曼',
        nameEn: 'Ajman',
        prefix: ['7'],
        majorCities: ['阿治曼', 'Ajman']
      }
    ],
    carriers: [
      { name: 'Etisalat', prefixes: ['50', '52', '54', '56'], type: 'mobile' },
      { name: 'du', prefixes: ['55', '58'], type: 'mobile' }
    ]
  }
]

// 电话号码智能分析函数
export function analyzePhoneNumber(phoneNumber: string): {
  isValid: boolean
  country?: PhoneData
  region?: RegionData
  carrier?: CarrierData
  type: 'mobile' | 'landline' | 'unknown'
  normalizedNumber: string
  insights: string[]
} {
  // 清理电话号码
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '')
  
  const insights: string[] = []
  let country: PhoneData | undefined
  let region: RegionData | undefined
  let carrier: CarrierData | undefined
  let type: 'mobile' | 'landline' | 'unknown' = 'unknown'
  
  // 匹配国家
  for (const countryData of PHONE_ANALYSIS_DATA) {
    const dialCode = countryData.dialCode.replace('+', '')
    if (cleaned.startsWith(dialCode)) {
      country = countryData
      const localNumber = cleaned.substring(dialCode.length)
      
      // 检查号码长度
      if (localNumber.length === countryData.digitCount) {
        insights.push(`✅ 号码长度正确 (${countryData.digitCount}位)`)
      } else {
        insights.push(`❌ 号码长度错误，应为${countryData.digitCount}位`)
      }
      
      // 判断手机或固话
      const isMobile = countryData.mobilePrefix.some(prefix => localNumber.startsWith(prefix))
      const isLandline = countryData.landlinePrefix?.some(prefix => localNumber.startsWith(prefix))
      
      if (isMobile) {
        type = 'mobile'
        insights.push('📱 这是一个手机号码')
        
        // 匹配运营商
        if (countryData.carriers) {
          for (const carrierData of countryData.carriers) {
            if (carrierData.type === 'mobile' && carrierData.prefixes.some(prefix => localNumber.startsWith(prefix))) {
              carrier = carrierData
              insights.push(`📡 运营商: ${carrierData.name}`)
              break
            }
          }
        }
      } else if (isLandline) {
        type = 'landline'
        insights.push('☎️ 这是一个固定电话')
        
        // 匹配地区
        if (countryData.regions) {
          for (const regionData of countryData.regions) {
            if (regionData.prefix.some(prefix => localNumber.startsWith(prefix))) {
              region = regionData
              insights.push(`🏙️ 地区: ${regionData.name} (${regionData.nameEn})`)
              if (regionData.majorCities.length > 0) {
                insights.push(`🌆 主要城市: ${regionData.majorCities.join('、')}`)
              }
              break
            }
          }
        }
      }
      
      // 添加国家信息
      insights.push(`🌍 国家: ${country.name} (${country.nameEn})`)
      insights.push(`🕐 时区: ${country.timeZone || '未知'}`)
      insights.push(`💰 货币: ${country.currency || '未知'}`)
      insights.push(`🗣️ 语言: ${country.language || '未知'}`)
      
      if (country.notes) {
        insights.push(`ℹ️ 注意: ${country.notes}`)
      }
      
      break
    }
  }
  
  return {
    isValid: !!country && type !== 'unknown',
    country,
    region,
    carrier,
    type,
    normalizedNumber: country ? `${country.dialCode} ${cleaned.substring(country.dialCode.replace('+', '').length)}` : phoneNumber,
    insights
  }
}

// 为了向后兼容
export const PHONE_CODES = PHONE_ANALYSIS_DATA 