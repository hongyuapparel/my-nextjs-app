'use client'

import { useState } from 'react'
import { Card } from './components/ui/card'
import { LogisticsTracker } from './components/logistics/logistics-tracker'
import { WorldClock } from './components/world-clock/world-clock'
import { PhoneLookup } from './components/phone-lookup/phone-lookup'
import TrainingAssistant from './training-assistant/page'
import { ChevronUp, ChevronDown, Package, Clock, Phone, Bot, MapPin, FileText } from 'lucide-react'

interface Tool {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  textColor: string
  gradient: string
}

export default function Home() {
  const [activeModule, setActiveModule] = useState<string | null>(null)

  const tools: Tool[] = [
    {
      id: 'logistics',
      title: '物流信息管理',
      description: '多渠道实时查询，智能识别承运商',
      icon: Package,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      gradient: 'bg-gradient-to-r from-green-500 to-emerald-600'
    },
    {
      id: 'timezone',
      title: '国家时间转换',
      description: '智能搜索，实时时区转换',
      icon: Clock,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      gradient: 'bg-gradient-to-r from-orange-500 to-red-600'
    },
    {
      id: 'phone',
      title: '全球电话查询',
      description: '国际电话号码格式查询',
      icon: Phone,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      gradient: 'bg-gradient-to-r from-purple-500 to-pink-600'
    },
    {
      id: 'training-assistant',
      title: '公司培训助手',
      description: '基于培训资料的智能问答',
      icon: Bot,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      gradient: 'bg-gradient-to-r from-blue-500 to-purple-600'
    }
  ]

  const handleModuleToggle = (moduleId: string) => {
    setActiveModule(activeModule === moduleId ? null : moduleId)
  }

  // 计算每行显示的卡片数量（根据屏幕尺寸）
  const getColumnsPerRow = () => {
    // 这里使用最大列数，实际响应式由CSS控制
    return 3 // xl:grid-cols-3
  }

  // 将卡片按行分组
  const groupToolsByRows = () => {
    const columnsPerRow = getColumnsPerRow()
    const rows = []
    for (let i = 0; i < tools.length; i += columnsPerRow) {
      rows.push(tools.slice(i, i + columnsPerRow))
    }
    return rows
  }

  // 找到激活模块所在的行索引
  const getActiveRowIndex = () => {
    if (!activeModule) return -1
    const toolIndex = tools.findIndex(tool => tool.id === activeModule)
    if (toolIndex === -1) return -1
    return Math.floor(toolIndex / getColumnsPerRow())
  }

  const renderModuleContent = (moduleId: string) => {
    switch (moduleId) {
      case 'logistics':
        return <LogisticsTracker />
      case 'timezone':
        return <WorldClock />
      case 'phone':
        return <PhoneLookup />
      case 'training-assistant':
        return <TrainingAssistant />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-3 space-y-4">
        {/* Tools Grid - Organized by Rows */}
        <div className="space-y-6">
          {groupToolsByRows().map((rowTools, rowIndex) => (
            <div key={rowIndex} className="space-y-6">
              {/* Row of Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {rowTools.map((tool) => {
            const IconComponent = tool.icon
            const isActive = activeModule === tool.id
            
            return (
              <Card
                key={tool.id}
                      className={`group relative overflow-hidden cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                        isActive ? 'ring-2 ring-blue-500 ring-opacity-50 scale-[1.01]' : 'hover:scale-[1.01]'
                      }`}
                onClick={() => handleModuleToggle(tool.id)}
              >
                      <div className={`${tool.bgColor} p-4 sm:p-5 md:p-6 relative`}>
                  {/* Background Gradient Effect */}
                  <div className={`absolute inset-0 ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                        {/* Horizontal Layout: Icon + Content */}
                        <div className="relative z-10 flex items-start space-x-3 sm:space-x-4">
                          {/* Icon Container - Left Side */}
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl ${tool.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                              <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                      </div>
                    </div>
                    
                          {/* Content - Right Side */}
                          <div className="flex-1 space-y-2 sm:space-y-3">
                            <div className="space-y-1 sm:space-y-2">
                              <h3 className={`text-base sm:text-lg font-bold ${tool.textColor} group-hover:scale-105 transition-transform duration-300`}>
                        {tool.title}
                      </h3>
                              <p className="hidden sm:block text-gray-600 text-sm">
                        {tool.description}
                      </p>
                    </div>
                    
                    {/* Action Indicator */}
                            <div className="flex items-center">
                              <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                        isActive 
                          ? `${tool.gradient} text-white shadow-md` 
                          : `${tool.textColor} group-hover:bg-white group-hover:shadow-md`
                      }`}>
                        {isActive ? (
                                  <div className="flex items-center space-x-1">
                            <span>已展开</span>
                                    <ChevronUp className="w-3 h-3" />
                          </div>
                        ) : (
                                  <div className="flex items-center space-x-1">
                                    <span className="group-hover:underline">点击使用</span>
                                    <ChevronDown className="w-3 h-3" />
                                  </div>
                        )}
                              </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

              {/* Content Display Area for This Row */}
              {getActiveRowIndex() === rowIndex && activeModule && (
                <div className="animate-fade-in relative z-10">
                  <Card className="shadow-2xl border-0 overflow-hidden bg-white">
                    <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {tools.find(tool => tool.id === activeModule)?.title}
                  </h2>
                  <button
                    onClick={() => setActiveModule(null)}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronUp className="w-6 h-6" />
                  </button>
                </div>
              </div>
                    <div className="p-6 min-h-[60vh]">
                      {renderModuleContent(activeModule)}
              </div>
            </Card>
          </div>
        )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 