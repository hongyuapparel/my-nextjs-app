'use client'

import { useState, useEffect } from 'react'
import { Zap, Settings, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'

interface Agent {
  id: string
  name: string
  model: string
  description: string
  category: string
  icon: string
}

interface AgentSelectorProps {
  selectedAgentId: string
  onAgentChange: (agentId: string) => void
}

export function AgentSelector({ selectedAgentId, onAgentChange }: AgentSelectorProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-chat')
      if (response.ok) {
        const data = await response.json()
        setAgents(data.agents || [])
        setConfigured(data.configured || false)
        
        // 如果没有选择的智能体，使用默认的
        if (!selectedAgentId && data.defaultAgent) {
          onAgentChange(data.defaultAgent)
        }
      }
    } catch (error) {
      console.error('获取智能体列表失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '通用助手': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case '技术助手': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case '图片助手': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case '技术专家': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case '图片处理': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  if (!configured) {
    return (
      <div className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            智能体选择
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAgents}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
        
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Settings className="w-5 h-5" />
              <div>
                <div className="font-medium">需要配置API</div>
                <div className="text-sm mt-1">
                  请在项目根目录创建 .env.local 文件，并添加以下配置：
                </div>
                <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border text-xs font-mono">
                  <div>AIHUBMIX_API_URL=https://aihubmix.com/v1/chat/completions</div>
                  <div>AIHUBMIX_API_KEY=your_api_key_here</div>
                  <div>AIHUBMIX_AGENTS=[...智能体配置...]</div>
                  <div>DEFAULT_AGENT=claude-sonnet-4</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          智能体选择
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAgents}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {agents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">
              <div className="text-sm">暂无可用智能体</div>
              <div className="text-xs mt-1">请检查配置文件</div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
                selectedAgentId === agent.id 
                  ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onAgentChange(agent.id)}
            >
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  {/* 智能体图标 */}
                  <div className="text-3xl">{agent.icon}</div>
                  
                  {/* 智能体名称 */}
                  <div>
                    <h4 className="font-medium text-sm">{agent.name}</h4>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getCategoryColor(agent.category)}`}>
                      {agent.category}
                    </span>
                  </div>
                  
                  {/* 智能体描述 */}
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {agent.description}
                  </p>
                  
                  {/* 模型信息 */}
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    <span className="truncate">{agent.model}</span>
                  </div>
                  
                  {/* 选中状态 */}
                  {selectedAgentId === agent.id && (
                    <div className="w-full h-1 bg-primary rounded-full"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 