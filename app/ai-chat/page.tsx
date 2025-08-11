'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '您好！我是AI助手，有什么可以帮助您的吗？' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse = { 
        role: 'assistant', 
        content: `我理解您的问题："${input}"。这是一个很好的问题，让我为您详细解答...` 
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI聊天助手</h1>
          <p className="text-gray-600">智能对话，解答您的问题</p>
        </div>

        {/* 聊天界面 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* 消息列表 */}
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                  AI正在思考中...
                </div>
              </div>
            )}
          </div>

          {/* 输入框 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入您的问题..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 