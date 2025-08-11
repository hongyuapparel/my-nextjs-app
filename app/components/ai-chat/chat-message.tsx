'use client'

import { User, Bot, Copy } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  metadata?: {
    agent?: {
      id: string
      name: string
      icon: string
    }
    source?: string
  }
}

interface ChatMessageProps {
  message: ChatMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      toast.success('消息已复制到剪贴板')
    }).catch(() => {
      toast.error('复制失败')
    })
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 头像 */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            message.metadata?.agent?.icon || <Bot className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* 消息内容 */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`group relative inline-block max-w-full ${
          isUser ? 'ml-auto' : ''
        }`}>
          <div className={`p-3 rounded-lg break-words ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-foreground'
          }`}>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
          
          {/* 时间戳和复制按钮 */}
          <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
            isUser ? 'justify-end' : ''
          }`}>
            <span>{formatTimestamp(message.timestamp)}</span>
            {!isUser && message.metadata?.agent && (
              <span className="flex items-center gap-1">
                <span>·</span>
                <span>{message.metadata.agent.name}</span>
                {message.metadata.source === 'simulated' && (
                  <span className="text-amber-600">(模拟)</span>
                )}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 