export interface TrainingItem {
  id: string
  category: string
  title: string
  content: string
  keywords: string[]
  tags: string[]
}

export interface SearchResult {
  item: TrainingItem
  score: number
  matchedKeywords: string[]
}

// 示例培训数据（您可以替换为实际的培训内容）
export const TRAINING_DATA: TrainingItem[] = [
  {
    id: 'onboarding-001',
    category: '入职流程',
    title: '新员工入职第一天流程',
    content: `新员工入职第一天需要完成以下事项：
1. 上午9:00到前台报到，领取工牌和办公用品
2. HR部门完成入职手续，签署劳动合同
3. IT部门配置电脑账号和系统权限
4. 直属主管介绍团队成员和工作职责
5. 完成安全培训和保密协议签署
6. 参加新员工欢迎午餐
请确保所有流程在当天下午5点前完成。`,
    keywords: ['入职', '第一天', '流程', '报到', '手续', '培训'],
    tags: ['入职', '流程', '新员工']
  },
  {
    id: 'leave-001',
    category: '请假制度',
    title: '年假申请流程',
    content: `年假申请流程如下：
1. 提前2周在系统中提交年假申请
2. 直属主管审批（3个工作日内）
3. HR部门确认年假余额
4. 获得批准后可按计划休假
注意事项：
- 年假必须在当年12月31日前使用完毕
- 连续休假超过5天需要提前1个月申请
- 忙季（6-8月，11-12月）原则上不批准超过3天的年假`,
    keywords: ['年假', '请假', '申请', '审批', '流程', '休假'],
    tags: ['请假', '年假', '流程']
  },
  {
    id: 'expense-001',
    category: '财务制度',
    title: '差旅费报销标准',
    content: `差旅费报销标准：
住宿费：
- 一线城市：500元/晚
- 二线城市：300元/晚
- 三线城市：200元/晚

餐费：
- 早餐：50元
- 午餐：100元
- 晚餐：150元

交通费：
- 飞机：经济舱全价票
- 高铁：二等座
- 出租车：凭发票实报实销

报销流程：
1. 费用发生后30天内提交申请
2. 附上所有原始发票
3. 填写详细的差旅报告`,
    keywords: ['差旅费', '报销', '住宿', '餐费', '交通费', '标准'],
    tags: ['财务', '报销', '差旅']
  },
  {
    id: 'work-001',
    category: '工作规范',
    title: '远程办公政策',
    content: `远程办公政策：
申请条件：
- 入职满6个月
- 近3个月绩效评级B+以上
- 工作性质适合远程办公

申请流程：
1. 提前3天向直属主管申请
2. 填写远程办公申请表
3. 主管审批后生效

工作要求：
- 保持在线状态9:00-18:00
- 参加所有必要会议
- 每日汇报工作进度
- 确保网络和设备稳定

注意：远程办公天数每月不超过8天`,
    keywords: ['远程办公', '在家办公', '申请', '条件', '要求'],
    tags: ['工作规范', '远程办公', '政策']
  }
]

// 简单的文本相似度计算
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)
  
  const commonWords = words1.filter(word => words2.includes(word))
  const totalWords = new Set([...words1, ...words2]).size
  
  return commonWords.length / totalWords
}

// 关键词匹配得分
function getKeywordScore(query: string, item: TrainingItem): { score: number, matched: string[] } {
  const queryLower = query.toLowerCase()
  const matchedKeywords: string[] = []
  let score = 0
  
  // 检查关键词匹配
  for (const keyword of item.keywords) {
    if (queryLower.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword)
      score += 2
    }
  }
  
  // 检查标题匹配
  if (queryLower.includes(item.title.toLowerCase()) || item.title.toLowerCase().includes(queryLower)) {
    score += 3
  }
  
  // 检查内容相似度
  const similarity = calculateSimilarity(queryLower, item.content.toLowerCase())
  score += similarity * 1
  
  return { score, matched: matchedKeywords }
}

// 获取用户自定义的培训数据
function getCustomTrainingData(): TrainingItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const customData = localStorage.getItem('training-contents')
    if (customData) {
      const parsed = JSON.parse(customData)
      return parsed.map((item: any, index: number) => ({
        id: `custom-${index + 1}`,
        category: item.category,
        title: item.title,
        content: item.content,
        keywords: item.keywords || [],
        tags: item.tags || []
      }))
    }
  } catch (error) {
    console.error('加载自定义培训数据失败:', error)
  }
  
  return []
}

// 搜索培训资料
export function searchTrainingData(query: string, limit: number = 3): SearchResult[] {
  if (!query.trim()) {
    return []
  }
  
  // 合并默认数据和用户自定义数据
  const customData = getCustomTrainingData()
  const allData = [...TRAINING_DATA, ...customData]
  
  const results: SearchResult[] = []
  
  for (const item of allData) {
    const { score, matched } = getKeywordScore(query, item)
    
    if (score > 0) {
      results.push({
        item,
        score,
        matchedKeywords: matched
      })
    }
  }
  
  // 按得分排序
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// 获取所有分类
export function getCategories(): string[] {
  const customData = getCustomTrainingData()
  const allData = [...TRAINING_DATA, ...customData]
  return Array.from(new Set(allData.map(item => item.category)))
}

// 根据分类获取资料
export function getTrainingByCategory(category: string): TrainingItem[] {
  const customData = getCustomTrainingData()
  const allData = [...TRAINING_DATA, ...customData]
  return allData.filter(item => item.category === category)
} 