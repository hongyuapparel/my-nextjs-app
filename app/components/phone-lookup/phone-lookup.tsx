'use client'

import { useState, useEffect } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Search, Phone, Star, MapPin, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import Fuse from 'fuse.js'

interface PhoneData {
  id: string
  country: string
  countryEn: string
  code: string
  flag: string
  format: string
  example: string
  notes: string
  mobileFormat?: string
  mobileExample?: string
  idd: string
  emergency: string
  cities?: string[]  // 中文城市名
  citiesEn?: string[] // 英文城市名
  abbreviations?: string[] // 国家缩写
}

export function PhoneLookup() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PhoneData[]>([])
  const [favoriteCountries, setFavoriteCountries] = useState<PhoneData[]>([])
  const [copiedText, setCopiedText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set()) // 新增：选中的国家ID集合
  const [inlineMatch, setInlineMatch] = useState<PhoneData | null>(null) // 新增：输入框下方即时匹配

  // 电话数据 - 增加城市信息
  const phoneData: PhoneData[] = [
    {
      id: 'cn',
      country: '中国',
      countryEn: 'China',
      code: '+86',
      flag: '🇨🇳',
      format: '11位数字',
      example: '138 0013 8000',
      mobileFormat: '1XX XXXX XXXX',
      mobileExample: '138 0013 8000',
      notes: '手机号以1开头，固话区号2-4位',
      idd: '00',
      emergency: '110 (警察), 119 (消防), 120 (急救)',
      cities: ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '重庆', '武汉', '西安', '天津', '苏州', '东莞', '佛山'],
      citiesEn: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Hangzhou', 'Nanjing', 'Chengdu', 'Chongqing', 'Wuhan', 'Xian', 'Tianjin', 'Suzhou', 'Dongguan', 'Foshan'],
      abbreviations: ['CN', 'CHN', '中国', 'China']
    },
    {
      id: 'us',
      country: '美国',
      countryEn: 'United States',
      code: '+1',
      flag: '🇺🇸',
      format: '10位数字',
      example: '(555) 123-4567',
      mobileFormat: '(XXX) XXX-XXXX',
      mobileExample: '(555) 123-4567',
      notes: '区号+7位号码，无区别手机固话',
      idd: '011',
      emergency: '911',
      cities: ['纽约', '洛杉矶', '芝加哥', '休斯顿', '费城', '凤凰城', '圣安东尼奥', '圣地亚哥', '达拉斯', '圣何塞', '奥斯汀', '杰克逊维尔', '旧金山', '印第安纳波利斯', '哥伦布', '沃思堡', '夏洛特', '西雅图', '丹佛', '华盛顿'],
      citiesEn: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Philadelphia', 'Phoenix', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'San Francisco', 'Indianapolis', 'Columbus', 'Fort Worth', 'Charlotte', 'Seattle', 'Denver', 'Washington'],
      abbreviations: ['US', 'USA', '美国', 'America', 'United States']
    },
    {
      id: 'uk',
      country: '英国',
      countryEn: 'United Kingdom',
      code: '+44',
      flag: '🇬🇧',
      format: '10-11位数字',
      example: '020 7946 0958',
      mobileFormat: '07XXX XXXXXX',
      mobileExample: '07700 900123',
      notes: '固话以0开头，手机以07开头',
      idd: '00',
      emergency: '999',
      cities: ['伦敦', '曼彻斯特', '伯明翰', '利兹', '格拉斯哥', '利物浦', '纽卡斯尔', '谢菲尔德', '布里斯托', '贝尔法斯特', '爱丁堡', '莱斯特', '考文垂'],
      citiesEn: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Belfast', 'Edinburgh', 'Leicester', 'Coventry'],
      abbreviations: ['UK', 'GB', 'GBR', '英国', 'Britain', 'England']
    },
    {
      id: 'de',
      country: '德国',
      countryEn: 'Germany',
      code: '+49',
      flag: '🇩🇪',
      format: '11-12位数字',
      example: '030 12345678',
      mobileFormat: '01XX XXXXXXXX',
      mobileExample: '0151 12345678',
      notes: '区号可变长度，手机以015x/016x/017x开头',
      idd: '00',
      emergency: '112',
      cities: ['柏林', '汉堡', '慕尼黑', '科隆', '法兰克福', '斯图加特', '杜塞尔多夫', '多特蒙德', '埃森', '莱比锡', '不来梅', '德累斯顿', '汉诺威'],
      citiesEn: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hannover'],
      abbreviations: ['DE', 'DEU', '德国', 'Germany']
    },
    {
      id: 'jp',
      country: '日本',
      countryEn: 'Japan',
      code: '+81',
      flag: '🇯🇵',
      format: '10-11位数字',
      example: '03-1234-5678',
      mobileFormat: '090-XXXX-XXXX',
      mobileExample: '090-1234-5678',
      notes: '手机以090/080/070开头',
      idd: '010',
      emergency: '110 (警察), 119 (消防/急救)',
      cities: ['东京', '横滨', '大阪', '名古屋', '札幌', '神户', '京都', '福冈', '川崎', '埼玉', '广岛', '仙台', '北九州', '千叶'],
      citiesEn: ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Kobe', 'Kyoto', 'Fukuoka', 'Kawasaki', 'Saitama', 'Hiroshima', 'Sendai', 'Kitakyushu', 'Chiba'],
      abbreviations: ['JP', 'JPN', '日本', 'Japan']
    },
    {
      id: 'kr',
      country: '韩国',
      countryEn: 'South Korea',
      code: '+82',
      flag: '🇰🇷',
      format: '10-11位数字',
      example: '02-1234-5678',
      mobileFormat: '010-XXXX-XXXX',
      mobileExample: '010-1234-5678',
      notes: '手机以010开头，首尔区号02',
      idd: '001/002',
      emergency: '112/119',
      cities: ['首尔', '釜山', '仁川', '大邱', '大田', '光州', '蔚山', '水原', '城南', '高阳', '富川', '安山', '安阳', '昌原'],
      citiesEn: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Suwon', 'Seongnam', 'Goyang', 'Bucheon', 'Ansan', 'Anyang', 'Changwon'],
      abbreviations: ['KR', 'KOR', '韩国', 'Korea', 'South Korea']
    },
    {
      id: 'fr',
      country: '法国',
      countryEn: 'France',
      code: '+33',
      flag: '🇫🇷',
      format: '10位数字',
      example: '01 42 68 53 00',
      mobileFormat: '06 XX XX XX XX',
      mobileExample: '06 12 34 56 78',
      notes: '固话以01-05开头，手机以06/07开头',
      idd: '00',
      emergency: '112',
      cities: ['巴黎', '马赛', '里昂', '图卢兹', '尼斯', '南特', '蒙彼利埃', '斯特拉斯堡', '波尔多', '里尔', '雷恩', '兰斯', '勒阿弗尔', '圣艾蒂安'],
      citiesEn: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne'],
      abbreviations: ['FR', 'FRA', '法国', 'France']
    },
    {
      id: 'au',
      country: '澳大利亚',
      countryEn: 'Australia',
      code: '+61',
      flag: '🇦🇺',
      format: '9位数字',
      example: '02 9374 4000',
      mobileFormat: '04XX XXX XXX',
      mobileExample: '0412 345 678',
      notes: '手机以04开头，固话区号1位',
      idd: '0011',
      emergency: '000',
      cities: ['悉尼', '墨尔本', '布里斯班', '珀斯', '阿德莱德', '黄金海岸', '纽卡斯尔', '堪培拉', '阳光海岸', '卧龙岗', '霍巴特', '吉朗', '汤斯维尔', '凯恩斯'],
      citiesEn: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong', 'Hobart', 'Geelong', 'Townsville', 'Cairns'],
      abbreviations: ['AU', 'AUS', '澳大利亚', 'Australia']
    },
    {
      id: 'ca',
      country: '加拿大',
      countryEn: 'Canada',
      code: '+1',
      flag: '🇨🇦',
      format: '10位数字',
      example: '(416) 555-0123',
      mobileFormat: '(XXX) XXX-XXXX',
      mobileExample: '(416) 555-0123',
      notes: '与美国共享+1区号，格式相同',
      idd: '011',
      emergency: '911',
      cities: ['多伦多', '蒙特利尔', '温哥华', '卡尔加里', '埃德蒙顿', '渥太华', '温尼伯', '魁北克市', '哈密尔顿', '基奇纳', '伦敦', '维多利亚', '哈利法克斯', '奥沙瓦'],
      citiesEn: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa'],
      abbreviations: ['CA', 'CAN', '加拿大', 'Canada']
    },
    {
      id: 'in',
      country: '印度',
      countryEn: 'India',
      code: '+91',
      flag: '🇮🇳',
      format: '10位数字',
      example: '011 2345 6789',
      mobileFormat: 'XXXXX XXXXX',
      mobileExample: '99999 12345',
      notes: '手机以6-9开头，各邦区号不同',
      idd: '00',
      emergency: '112',
      cities: ['孟买', '德里', '班加罗尔', '海德拉巴', '艾哈迈达巴德', '金奈', '加尔各答', '苏拉特', '浦那', '斋浦尔', '勒克瑙', '坎普尔', '那格浦尔', '印多尔'],
      citiesEn: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore'],
      abbreviations: ['IN', 'IND', '印度', 'India']
    },
    {
      id: 'za',
      country: '南非',
      countryEn: 'South Africa',
      code: '+27',
      flag: '🇿🇦',
      format: '9位数字',
      example: '011 123 4567',
      mobileFormat: '0XX XXX XXXX',
      mobileExample: '082 123 4567',
      notes: '手机以06-08开头',
      idd: '00',
      emergency: '10111',
      cities: ['约翰内斯堡', '开普敦', '德班', '比勒陀利亚', '伊丽莎白港', '布隆方丹', '东伦敦', '内尔斯普雷特', '威特班克', '韦尔科姆', '鲁斯滕堡', '波洛克瓦尼', '金伯利'],
      citiesEn: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Nelspruit', 'Witbank', 'Welkom', 'Rustenburg', 'Polokwane', 'Kimberley'],
      abbreviations: ['ZA', 'RSA', '南非', 'South Africa']
    },
    {
      id: 'br',
      country: '巴西',
      countryEn: 'Brazil',
      code: '+55',
      flag: '🇧🇷',
      format: '10-11位数字',
      example: '11 1234-5678',
      mobileFormat: '11 9XXXX-XXXX',
      mobileExample: '11 91234-5678',
      notes: '手机号码11位，以9开头',
      idd: '00',
      emergency: '190',
      cities: ['圣保罗', '里约热内卢', '巴西利亚', '萨尔瓦多', '福塔莱萨', '贝洛奥里藏特', '马瑙斯', '库里提巴', '累西腓', '阿雷格里港', '戈亚尼亚', '贝伦', '瓜鲁柳斯', '坎皮纳斯'],
      citiesEn: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre', 'Goiânia', 'Belém', 'Guarulhos', 'Campinas'],
      abbreviations: ['BR', 'BRA', '巴西', 'Brazil']
    },
    {
      id: 'ru',
      country: '俄罗斯',
      countryEn: 'Russia',
      code: '+7',
      flag: '🇷🇺',
      format: '10位数字',
      example: '495 123-45-67',
      mobileFormat: '9XX XXX-XX-XX',
      mobileExample: '916 123-45-67',
      notes: '莫斯科区号495/499，手机以9开头',
      idd: '810',
      emergency: '112',
      cities: ['莫斯科', '圣彼得堡', '新西伯利亚', '叶卡捷琳堡', '下诺夫哥罗德', '喀山', '车里雅宾斯克', '鄂木斯克', '萨马拉', '罗斯托夫', '乌法', '克拉斯诺亚尔斯克', '沃罗涅日'],
      citiesEn: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod', 'Kazan', 'Chelyabinsk', 'Omsk', 'Samara', 'Rostov-on-Don', 'Ufa', 'Krasnoyarsk', 'Voronezh'],
      abbreviations: ['RU', 'RUS', '俄罗斯', 'Russia']
    },
    {
      id: 'mx',
      country: '墨西哥',
      countryEn: 'Mexico',
      code: '+52',
      flag: '🇲🇽',
      format: '10位数字',
      example: '55 1234 5678',
      mobileFormat: '1 XX XXXX XXXX',
      mobileExample: '1 55 1234 5678',
      notes: '手机加1前缀，固话直拨',
      idd: '00',
      emergency: '911',
      cities: ['墨西哥城', '瓜达拉哈拉', '蒙特雷', '普埃布拉', '提华纳', '莱昂', '华雷斯城', '托雷翁', '克雷塔罗', '奇瓦瓦', '梅里达', '阿瓜斯卡连特斯', '库利亚坎'],
      citiesEn: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Ciudad Juárez', 'Torreón', 'Querétaro', 'Chihuahua', 'Mérida', 'Aguascalientes', 'Culiacán'],
      abbreviations: ['MX', 'MEX', '墨西哥', 'Mexico']
    },
    {
      id: 'it',
      country: '意大利',
      countryEn: 'Italy',
      code: '+39',
      flag: '🇮🇹',
      format: '6-11位数字',
      example: '06 1234 5678',
      mobileFormat: '3XX XXX XXXX',
      mobileExample: '320 123 4567',
      notes: '手机以3开头，罗马区号06',
      idd: '00',
      emergency: '112',
      cities: ['罗马', '米兰', '那不勒斯', '都灵', '巴勒莫', '热那亚', '博洛尼亚', '佛罗伦萨', '巴里', '卡塔尼亚', '威尼斯', '维罗纳', '墨西拿', '帕多瓦'],
      citiesEn: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania', 'Venice', 'Verona', 'Messina', 'Padua'],
      abbreviations: ['IT', 'ITA', '意大利', 'Italy']
    },
    {
      id: 'es',
      country: '西班牙',
      countryEn: 'Spain',
      code: '+34',
      flag: '🇪🇸',
      format: '9位数字',
      example: '91 123 45 67',
      mobileFormat: '6XX XX XX XX',
      mobileExample: '612 34 56 78',
      notes: '手机以6开头，马德里区号91',
      idd: '00',
      emergency: '112',
      cities: ['马德里', '巴塞罗那', '瓦伦西亚', '塞维利亚', '萨拉戈萨', '马拉加', '穆尔西亚', '帕尔马', '拉斯帕尔马斯', '毕尔巴鄂', '阿利坎特', '科尔多瓦', '瓦利亚多利德'],
      citiesEn: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid'],
      abbreviations: ['ES', 'ESP', '西班牙', 'Spain']
    },
    {
      id: 'nl',
      country: '荷兰',
      countryEn: 'Netherlands',
      code: '+31',
      flag: '🇳🇱',
      format: '9位数字',
      example: '020 123 4567',
      mobileFormat: '06 XXXX XXXX',
      mobileExample: '06 1234 5678',
      notes: '手机以06开头，阿姆斯特丹区号020',
      idd: '00',
      emergency: '112',
      cities: ['阿姆斯特丹', '鹿特丹', '海牙', '乌得勒支', '埃因霍温', '蒂尔堡', '格罗宁根', '阿尔梅勒', '布雷达', '奈梅亨', '恩斯赫德', '哈勒姆', '阿纳姆'],
      citiesEn: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen', 'Enschede', 'Haarlem', 'Arnhem'],
      abbreviations: ['NL', 'NLD', '荷兰', 'Netherlands']
    },
    {
      id: 'sg',
      country: '新加坡',
      countryEn: 'Singapore',
      code: '+65',
      flag: '🇸🇬',
      format: '8位数字',
      example: '6123 4567',
      mobileFormat: '9XXX XXXX',
      mobileExample: '9123 4567',
      notes: '手机以8/9开头，固话以6开头',
      idd: '001/002',
      emergency: '999',
      cities: ['新加坡'],
      citiesEn: ['Singapore'],
      abbreviations: ['SG', 'SGP', '新加坡', 'Singapore']
    },
    {
      id: 'th',
      country: '泰国',
      countryEn: 'Thailand',
      code: '+66',
      flag: '🇹🇭',
      format: '8-9位数字',
      example: '02 123 4567',
      mobileFormat: '08X XXX XXXX',
      mobileExample: '081 234 5678',
      notes: '手机以08开头，曼谷区号02',
      idd: '001/009',
      emergency: '191',
      cities: ['曼谷', '清迈', '帕塔亚', '普吉', '合艾', '孔敬', '乌隆他尼', '那空叻差是玛', '春武里', '清莱', '呵叻', '素林', '乌汶'],
      citiesEn: ['Bangkok', 'Chiang Mai', 'Pattaya', 'Phuket', 'Hat Yai', 'Khon Kaen', 'Udon Thani', 'Nakhon Ratchasima', 'Chonburi', 'Chiang Rai', 'Korat', 'Surin', 'Ubon'],
      abbreviations: ['TH', 'THA', '泰国', 'Thailand']
    },
    {
      id: 'my',
      country: '马来西亚',
      countryEn: 'Malaysia',
      code: '+60',
      flag: '🇲🇾',
      format: '7-8位数字',
      example: '03-1234 5678',
      mobileFormat: '01X-XXX XXXX',
      mobileExample: '012-345 6789',
      notes: '手机以01开头，吉隆坡区号03',
      idd: '00',
      emergency: '999',
      cities: ['吉隆坡', '乔治敦', '怡保', '新山', '古晋', '亚庇', '马六甲', '太平', '芙蓉', '关丹', '皇城', '淡马锡', '美里'],
      citiesEn: ['Kuala Lumpur', 'George Town', 'Ipoh', 'Johor Bahru', 'Kuching', 'Kota Kinabalu', 'Malacca', 'Taiping', 'Seremban', 'Kuantan', 'Shah Alam', 'Petaling Jaya', 'Miri'],
      abbreviations: ['MY', 'MYS', '马来西亚', 'Malaysia']
    },
    {
      id: 'ae',
      country: '阿联酋',
      countryEn: 'United Arab Emirates',
      code: '+971',
      flag: '🇦🇪',
      format: '9位数字',
      example: '50 123 4567',
      mobileFormat: '5X XXX XXXX',
      mobileExample: '50 123 4567',
      notes: '手机以5开头，固话有区域代码',
      idd: '00',
      emergency: '999',
      cities: ['迪拜', '阿布扎比', '沙迦', '阿治曼', '乌姆盖万', '富查伊拉', '哈伊马角'],
      citiesEn: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Fujairah', 'Ras Al Khaimah'],
      abbreviations: ['AE', 'UAE', '阿联酋', 'Emirates', 'United Arab Emirates']
    },
    {
      id: 'hu',
      country: '匈牙利',
      countryEn: 'Hungary',
      code: '+36',
      flag: '🇭🇺',
      format: '9位数字',
      example: '1 234 5678',
      mobileFormat: 'XX XXX XXXX',
      mobileExample: '70 424 0227',
      notes: '手机以06/20/30/50/70开头，布达佩斯区号1',
      idd: '00',
      emergency: '112',
      cities: ['布达佩斯', '德布勒森', '塞格德', '米什科尔茨', '佩奇', '久尔', '尼赖吉哈佐', '凯奇凯梅特', '松博特海伊', '埃格尔', '绍尔戈陶尔扬', '塔塔班亚', '维斯普雷姆'],
      citiesEn: ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét', 'Szombathely', 'Eger', 'Salgótarján', 'Tatabánya', 'Veszprém'],
      abbreviations: ['HU', 'HUN', '匈牙利', 'Hungary']
    }
  ]

  // 增强的 Fuse.js 搜索引擎配置
  const fuse = new Fuse(phoneData, {
    keys: [
      { name: 'country', weight: 0.3 },
      { name: 'countryEn', weight: 0.3 },
      { name: 'code', weight: 0.2 },
      { name: 'cities', weight: 0.25 },
      { name: 'citiesEn', weight: 0.25 },
      { name: 'abbreviations', weight: 0.15 }
    ],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
    findAllMatches: true
  })

  // 从 localStorage 加载收藏
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorite-countries')
    if (savedFavorites) {
      const favoriteIds = JSON.parse(savedFavorites)
      const favorites = phoneData.filter(country => favoriteIds.includes(country.id))
      setFavoriteCountries(favorites)
    }
  }, [])

  // 增强的搜索功能
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      setInlineMatch(null)
      return
    }

    setIsSearching(true)
    
    // 检查是否输入的是电话号码（允许空格、短横线、括号等）
    const cleaned = query.replace(/[^0-9+]/g, '')
    let digits = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned
    if (digits.startsWith('00')) digits = digits.slice(2)

    // 依据号码前缀匹配国家码（取最长匹配）
    const sortedCodes = [...phoneData.map(c => c.code.replace('+', ''))].sort((a, b) => b.length - a.length)
    const matchedCode = sortedCodes.find(cc => digits.startsWith(cc))

    if (matchedCode) {
      const matchingCountries = phoneData.filter(c => c.code.replace('+', '') === matchedCode)
      if (matchingCountries.length > 0) {
        setSearchResults(matchingCountries)
        setInlineMatch(matchingCountries[0])
        setIsSearching(false)
        return
      }
    } else {
      setInlineMatch(null)
    }
    
    // 常规搜索
    const results = fuse.search(query).map((result: any) => result.item)
    setSearchResults(results.slice(0, 10))
    setInlineMatch(null)
    setIsSearching(false)
  }

  // 切换收藏状态
  const toggleFavorite = (country: PhoneData) => {
    const isFavorite = favoriteCountries.some(fav => fav.id === country.id)
    let updatedFavorites: PhoneData[]

    if (isFavorite) {
      updatedFavorites = favoriteCountries.filter(fav => fav.id !== country.id)
      toast.success(`已取消收藏 ${country.country}`)
    } else {
      updatedFavorites = [...favoriteCountries, country]
      toast.success(`已收藏 ${country.country}`)
    }

    setFavoriteCountries(updatedFavorites)
    localStorage.setItem('favorite-countries', JSON.stringify(updatedFavorites.map(c => c.id)))
  }

  // 复制功能
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text)
      toast.success(`已复制 ${label}`)
      setTimeout(() => setCopiedText(''), 2000)
    }).catch(() => {
      toast.error('复制失败')
    })
  }

  // 切换国家选中状态（新增）
  const toggleCountrySelection = (countryId: string) => {
    const newSelected = new Set(selectedCountries)
    if (newSelected.has(countryId)) {
      newSelected.delete(countryId)
    } else {
      newSelected.add(countryId)
    }
    setSelectedCountries(newSelected)
  }

  // 国家卡片组件
  const CountryCard = ({ 
    country, 
    showDetails = false, 
    isClickable = false, 
    isSelected = false, 
    onCardClick 
  }: { 
    country: PhoneData
    showDetails?: boolean
    isClickable?: boolean
    isSelected?: boolean
    onCardClick?: (countryId: string) => void
  }) => {
    const isFavorite = favoriteCountries.some(fav => fav.id === country.id)
    const shouldShowDetails = showDetails || isSelected
    
    return (
      <Card 
        className={`p-4 transition-all duration-200 ${
          isClickable 
            ? 'hover:shadow-lg cursor-pointer border-2 hover:border-blue-200' 
            : 'hover:shadow-md'
        } ${
          isSelected ? 'border-blue-500 shadow-lg bg-blue-50' : 'border-gray-200'
        }`}
        onClick={isClickable && onCardClick ? () => onCardClick(country.id) : undefined}
      >
        <div className="space-y-4">
          {/* 头部信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{country.flag}</span>
              <div>
                <h3 className="font-bold text-lg">{country.country}</h3>
                <p className="text-sm text-gray-500">{country.countryEn}</p>
                {/* 显示主要城市 */}
                {country.cities && country.cities.length > 0 && (
                  <p className="text-xs text-gray-400 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {country.cities.slice(0, 3).join('、')}
                    {country.cities.length > 3 && '...'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isClickable && (
                <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {isSelected ? '点击收起' : '点击查看'}
                </div>
              )}
            <Button
              size="sm"
              variant="ghost"
                onClick={(e) => {
                  e.stopPropagation() // 防止触发卡片点击
                  toggleFavorite(country)
                }}
              className={isFavorite ? 'text-yellow-500' : 'text-gray-400'}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            </div>
          </div>

          {/* 国际区号 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">国际区号</p>
                <p className="text-3xl font-bold text-blue-600">{country.code}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation() // 防止触发卡片点击
                  copyToClipboard(country.code, '国际区号')
                }}
                className="flex items-center space-x-2"
              >
                {copiedText === country.code ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>复制</span>
              </Button>
            </div>
          </div>

          {/* 详细信息 */}
          {shouldShowDetails && (
            <div className="space-y-4">
              {/* 主要城市 */}
              {country.cities && country.cities.length > 0 && (
                <div className="bg-green-50 rounded-lg p-3">
                  <h4 className="font-medium text-sm text-green-700 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    主要城市
                  </h4>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    {country.cities.slice(0, 8).map((city, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-700">{city}</span>
                        <span className="text-gray-500 text-xs">{country.citiesEn?.[index]}</span>
                      </div>
                    ))}
                  </div>
                  {country.cities.length > 8 && (
                    <p className="text-xs text-gray-500 mt-2">+ {country.cities.length - 8} 个更多城市</p>
                  )}
                </div>
              )}

              {/* 电话格式 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    固定电话格式
                  </h4>
                  <p className="text-sm font-mono bg-white p-2 rounded border">
                    {country.format}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    示例: {country.example}
                  </p>
                </div>

                {country.mobileFormat && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      手机格式
                    </h4>
                    <p className="text-sm font-mono bg-white p-2 rounded border">
                      {country.mobileFormat}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      示例: {country.mobileExample}
                    </p>
                  </div>
                )}
              </div>

              {/* 拨号信息 */}
              <div className="bg-orange-50 rounded-lg p-3">
                <h4 className="font-medium text-sm text-orange-700 mb-2">拨号说明</h4>
                <p className="text-sm text-gray-700">{country.notes}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">国际拨号前缀: </span>
                    <span className="font-mono">{country.idd}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">紧急电话: </span>
                    <span className="font-mono text-red-600">{country.emergency}</span>
                  </div>
                </div>
              </div>

              {/* 拨号示例 */}
              <div className="bg-green-50 rounded-lg p-3">
                <h4 className="font-medium text-sm text-green-700 mb-2">拨号示例</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">从中国拨打:</span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-white px-2 py-1 rounded text-xs">
                        00{country.code.replace('+', '')}-{country.example.replace(/\s/g, '')}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(
                          `00${country.code.replace('+', '')}-${country.example.replace(/\s/g, '')}`,
                          '拨号号码'
                          )
                        }}
                        className="h-6 w-6 p-0"
                      >
                        {copiedText === `00${country.code.replace('+', '')}-${country.example.replace(/\s/g, '')}` ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">国际标准格式:</span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-white px-2 py-1 rounded text-xs">
                        {country.code} {country.example}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(
                          `${country.code} ${country.example}`,
                          '国际格式'
                          )
                        }}
                        className="h-6 w-6 p-0"
                      >
                        {copiedText === `${country.code} ${country.example}` ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 搜索区域 */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索国家、城市、国家代码或区号..."
              className="pl-10 h-12"
            />
          </div>
          {inlineMatch && (
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 border rounded px-3 py-2">
              <span className="mr-2">{inlineMatch.flag}</span>
              <span>
                识别为：<span className="font-medium">{inlineMatch.country} {inlineMatch.countryEn}</span>
                <span className="ml-2 text-gray-500">区号 {inlineMatch.code}</span>
              </span>
            </div>
          )}
          <div className="text-sm text-gray-500">
            <p>支持搜索国家名称（中英文）、城市名称（中英文）、国家缩写（如+86、CN、CHN）</p>
            <p className="mt-1">💡 也可以直接输入电话号码（如 +36 70 424 0227）来查找对应的国家信息</p>
          </div>
        </div>
      </Card>

      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">搜索结果 ({searchResults.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((country) => (
              <CountryCard 
                key={country.id} 
                country={country} 
                showDetails={true} 
              />
            ))}
          </div>
        </div>
      )}

      {/* 收藏的国家 */}
      {favoriteCountries.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">收藏的国家</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteCountries.map((country) => (
              <CountryCard 
                key={country.id} 
                country={country} 
                showDetails={true} 
              />
            ))}
          </div>
        </div>
      )}

      {/* 常用国家 */}
      {searchQuery === '' && searchResults.length === 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">常用国家/地区</h3>
          <div className="text-sm text-blue-600 mb-3 flex items-center">
            <Phone className="w-4 h-4 mr-1" />
            点击国家卡片查看详细电话信息
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phoneData.slice(0, 9).map((country) => (
              <CountryCard 
                key={country.id} 
                country={country} 
                isClickable={true}
                isSelected={selectedCountries.has(country.id)}
                onCardClick={toggleCountrySelection}
              />
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              使用搜索功能查看更多国家的电话信息
            </p>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-4">📞 使用说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">国际拨号格式</h4>
            <ul className="space-y-1 text-xs">
              <li>• 从中国拨打：00 + 国家代码 + 电话号码</li>
              <li>• 国际标准：+ 国家代码 + 电话号码</li>
              <li>• 手机自动识别：直接输入 +86138XXXXXXXX</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">功能说明</h4>
            <ul className="space-y-1 text-xs">
              <li>• 点击⭐收藏常用国家</li>
              <li>• 点击📋复制区号或拨号格式</li>
              <li>• 搜索支持中英文国家名、城市名和区号</li>
              <li>• 显示手机和固话的不同格式</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
} 