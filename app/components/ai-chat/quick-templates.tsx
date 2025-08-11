'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { 
  MessageSquare, 
  Calculator, 
  FileText, 
  Truck, 
  Users, 
  Globe,
  CreditCard,
  Shield
} from 'lucide-react'

interface QuickTemplatesProps {
  onSelect: (template: string) => void
}

const TEMPLATES = [
  {
    icon: MessageSquare,
    title: '询盘回复',
    description: '专业回复客户询盘',
    template: '请帮我回复一个客户的询盘邮件，客户询问的是[产品名称]的价格和交期。我需要一个专业且友好的回复模板。',
    category: '邮件沟通'
  },
  {
    icon: Calculator,
    title: '报价计算',
    description: '协助计算产品报价',
    template: '我需要为我的产品制定报价单。产品成本是[金额]，我想要[利润率]%的利润率，请帮我计算合适的FOB价格，并提供报价单格式建议。',
    category: '价格计算'
  },
  {
    icon: FileText,
    title: '合同条款',
    description: '外贸合同条款咨询',
    template: '请解释外贸合同中的主要条款，包括付款方式、交货期、质量标准等。我是外贸新手，需要详细的说明。',
    category: '合同法律'
  },
  {
    icon: Truck,
    title: '物流咨询',
    description: '国际物流和运输',
    template: '我需要从中国发货到[目的国家]，货物重量约[重量]，体积约[体积]。请推荐合适的运输方式和大概的运费。',
    category: '物流运输'
  },
  {
    icon: CreditCard,
    title: '付款方式',
    description: '外贸付款方式建议',
    template: '请介绍外贸中常用的付款方式，包括T/T、L/C、D/P等的优缺点和适用场景。我该如何选择？',
    category: '金融支付'
  },
  {
    icon: Shield,
    title: '风险控制',
    description: '外贸风险防范',
    template: '在外贸业务中，我应该如何防范收款风险？有哪些实用的风险控制措施？',
    category: '风险管理'
  },
  {
    icon: Users,
    title: '客户开发',
    description: '海外客户开发技巧',
    template: '我想开发[目标市场]的客户，请给我一些实用的客户开发方法和技巧。',
    category: '市场开发'
  },
  {
    icon: Globe,
    title: '市场分析',
    description: '目标市场调研',
    template: '请帮我分析[目标国家/地区]的市场特点，包括消费习惯、主要竞争对手、市场准入要求等。',
    category: '市场研究'
  }
]

export function QuickTemplates({ onSelect }: QuickTemplatesProps) {
  const categories = Array.from(new Set(TEMPLATES.map(t => t.category)))

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">快速开始</h3>
        <p className="text-muted-foreground">
          选择以下模板快速开始外贸咨询，或直接输入您的问题
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-3">
          <h4 className="text-lg font-medium text-primary">{category}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {TEMPLATES.filter(t => t.category === category).map((template, index) => (
              <Card key={index} className="card-hover cursor-pointer group">
                <CardContent className="p-4" onClick={() => onSelect(template.template)}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <template.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-sm">{template.title}</h5>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 