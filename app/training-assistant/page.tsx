'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Send, Loader2, Settings, Upload, X } from 'lucide-react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  images?: string[] // 支持多张图片
}

interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
  agentId: string
  agentName: string
  agentType: 'cherry-studio' | 'chatgpt' | 'custom'
  gptId?: string // ChatGPT GPTs ID
  openaiApiKey?: string // OpenAI API Key for GPTs
}

export default function TrainingAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadedImageFiles, setUploadedImageFiles] = useState<File[]>([])
  const [isCompressing, setIsCompressing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  // 处理ESC键关闭预览
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewImage) {
        setPreviewImage(null)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [previewImage])
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    apiKey: '', // 留空将使用服务器端配置的API密钥
    baseUrl: 'https://api.aihubmix.com/v1',
    model: 'gpt-4-vision-preview', // 使用视觉增强模型
    agentId: 'agent-1754295056697', // 您的鸿宇服装助手ID
    agentName: '鸿宇服装助手',
    agentType: 'cherry-studio',
    gptId: '',
    openaiApiKey: ''
  })
  const [showConfig, setShowConfig] = useState(false)
  const [isDeviceVerified] = useState(true) // 简化：直接设为已验证
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 滚动到底部（仅在用户发送消息后滚动）
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false)
  
  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setShouldAutoScroll(false)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, shouldAutoScroll])

  // 调用图片生成API
  const callImageGenerationAPI = async (prompt: string, referenceImages?: string[]): Promise<{imageUrl?: string, analysis?: string, isTextResponse: boolean}> => {
    try {
      console.log('🎨 开始生成图片:', {
        prompt: prompt.slice(0, 100) + '...',
        referenceCount: referenceImages?.length || 0
      })

      const response = await fetch('/api/ai-generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          referenceImages,
          config: {
            apiKey: aiConfig.apiKey,
            baseUrl: aiConfig.baseUrl
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ 图片生成API调用失败:', response.status, errorText)
        throw new Error(`图片生成失败: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('🎨 图片生成响应:', data)
      
      return {
        imageUrl: data.imageUrl,
        analysis: data.analysis || data.message,
        isTextResponse: data.isTextResponse || false
      }
        
    } catch (error) {
      console.error('图片生成API错误:', error)
      throw error
    }
  }

  // 调用AI API
  const callAIAPI = async (message: string, mode: 'text' | 'image', imageData?: string | string[]): Promise<string> => {
    try {
      // 检查是否是专业面料分析请求
      const isExpertAnalysis = mode === 'image' && imageData && 
        (message.includes('专业分析') || message.includes('专业识别') || message.includes('详细分析'))

      let endpoint = '/api/ai-chat'
      let body: any = { message, config: aiConfig }

      if (mode === 'image' && imageData) {
        // 确保有有效的API密钥
        if (!aiConfig.apiKey) {
          throw new Error('未配置API密钥，无法进行图片分析')
        }

        if (isExpertAnalysis) {
          // 使用专业面料分析API
          endpoint = '/api/fabric-analysis'
          body = { 
            imageData: Array.isArray(imageData) ? imageData : [imageData], 
            specificQuestion: message,
            config: {
              apiKey: aiConfig.apiKey,
              baseUrl: aiConfig.baseUrl
            }
          }
        } else {
          // 使用普通图片分析API
          endpoint = '/api/ai-image'
          body = { 
            message, 
            imageData: Array.isArray(imageData) ? imageData : [imageData], 
            config: {
              apiKey: aiConfig.apiKey,
              baseUrl: aiConfig.baseUrl,
              model: aiConfig.model
            }
          }
        }
      }

      console.log('🔗 API调用详情:', {
        endpoint,
        mode,
        hasImageData: !!imageData,
        imageDataType: Array.isArray(imageData) ? 'array' : typeof imageData,
        imageDataLength: Array.isArray(imageData) ? imageData.length : imageData ? 1 : 0,
        isExpertAnalysis,
        messageLength: message.length,
        apiKey: aiConfig.apiKey ? '已配置' : '未配置',
        baseUrl: aiConfig.baseUrl
      })

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API调用失败:', response.status, errorText)
        throw new Error(`API调用失败: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📊 API响应数据:', data)
      
      // 如果是专业分析，添加标识
      const result = data.response || data.analysis || data.choices?.[0]?.message?.content
      console.log('📊 解析结果:', result)
      
      if (!result) {
        console.error('❌ 无法从API响应中提取结果:', data)
        throw new Error('API返回了空结果')
      }
      
      return isExpertAnalysis 
        ? `🎯 **专业面料分析报告**\n\n${result}\n\n---\n*本分析由专业面料识别系统提供*`
        : result
        
    } catch (error) {
      console.error('AI API 错误:', error)
      console.error('错误详情:', {
        errorMessage: error instanceof Error ? error.message : '未知错误',
        mode,
        hasImageData: !!imageData,
        imageDataType: Array.isArray(imageData) ? 'array' : typeof imageData
      })
      return mode === 'image' 
        ? '抱歉，图片分析服务暂时无法使用。请检查您的网络连接和API配置。'
        : '抱歉，AI助手暂时无法使用。请检查您的网络连接和API配置。'
    }
  }

  // 发送消息
  const sendMessage = async () => {
    // 需要有文字输入或图片
    if (!inputMessage.trim() && uploadedImages.length === 0) return

    let messageContent = inputMessage || '请分析这些图片'
    let imageData: string[] = []

    // 如果有上传的图片，直接使用已压缩的图片数据
    if (uploadedImages.length > 0) {
      imageData = [...uploadedImages]
      console.log('📸 使用已压缩的图片数据，数量:', imageData.length)
      console.log('📸 图片数据示例:', imageData.map(img => `${img.slice(0, 50)}... (长度: ${img.length})`))
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      isUser: true,
      timestamp: new Date(),
      images: uploadedImages.length > 0 ? uploadedImages : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setShouldAutoScroll(true) // 用户发送消息后才自动滚动
    
    // 立即清除输入框和图片预览，提升用户体验
    setInputMessage('')
    setUploadedImages([])
    setUploadedImageFiles([])

    try {
      // 检查是否是图片生成请求
      const isImageGeneration = messageContent.includes('生成') && (
        messageContent.includes('效果图') || 
        messageContent.includes('图片') || 
        messageContent.includes('设计图') ||
        messageContent.includes('替换')
      )
      
      if (isImageGeneration && imageData.length > 0) {
        // 图片生成模式
        console.log('🎨 图片生成模式')
        
        const generationResult = await callImageGenerationAPI(messageContent, imageData)
        
        let aiMessage: Message
        
        if (generationResult.isTextResponse) {
          // 文字回复模式（备选方案）
          aiMessage = {
            id: (Date.now() + 1).toString(),
            content: generationResult.analysis || '图片生成功能暂不可用，已为您提供详细的设计建议。',
            isUser: false,
            timestamp: new Date()
          }
        } else {
          // 图片生成成功
          aiMessage = {
            id: (Date.now() + 1).toString(),
            content: '🎨 AI为您生成了设计效果图：',
            isUser: false,
            timestamp: new Date(),
            images: generationResult.imageUrl ? [generationResult.imageUrl] : undefined
          }
        }
        
        setMessages(prev => [...prev, aiMessage])
      } else {
        // 正常分析模式
        const hasImages = imageData.length > 0
        console.log('📸 发送消息 - 是否有图片:', hasImages, '图片数量:', imageData.length)
        
        const aiResponse = await callAIAPI(
          messageContent, 
          hasImages ? 'image' : 'text', 
          hasImages ? imageData : undefined
        )
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          isUser: false,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，发生了错误。请稍后重试。',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // 快速问题 - 基于鸿宇服饰业务顾问角色
  const quickQuestions: Array<{question: string, icon: string, isExpert?: boolean, isImageGen?: boolean}> = [
    { question: '客户询问棉质T恤的设计方案和价格计算', icon: '👕' },
    { question: '如何用英文回复客户的面料选择咨询？', icon: '🌐' },
    { question: '评估这个服装需求的合理性和成本', icon: '📊' },
    { question: '客户地区工厂的加工成本应该如何考虑？', icon: '🏭' },
    { question: '专业分析这张面料图片的所有特征', icon: '🔍', isExpert: true },
    { question: '生成把第一张图的logo替换到第二张图T恤后幅的效果图', icon: '🎨', isImageGen: true },
    { question: '根据SOP文件，这个订单的流程是什么？', icon: '📋' },
    { question: '如何提升业务员的专业技能？', icon: '📈' },
    { question: '客户满意度提升的关键要素有哪些？', icon: '⭐' }
  ]

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 压缩图片函数
  const compressImage = (file: File, maxWidth: number = 600, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // 计算压缩后的尺寸 - 更激进的尺寸压缩
        let { width, height } = img
        
        // 根据文件大小动态调整最大宽度
        const fileSizeMB = file.size / (1024 * 1024)
        let targetMaxWidth = maxWidth
        
        if (fileSizeMB > 2) {
          targetMaxWidth = 400 // 大文件更小尺寸
        } else if (fileSizeMB > 1) {
          targetMaxWidth = 500
        }
        
        if (width > targetMaxWidth || height > targetMaxWidth) {
          const ratio = Math.min(targetMaxWidth / width, targetMaxWidth / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }
        
        canvas.width = width
        canvas.height = height
        
        // 检查原始文件是否是PNG（可能有透明背景）
        const isPNG = file.type === 'image/png'
        const hasTransparency = isPNG // 简化判断
        
        // 智能格式选择：有透明度的保持PNG，否则转JPEG
        let outputFormat: string
        let outputQuality: number
        
        if (hasTransparency && fileSizeMB < 1) {
          // 小的PNG文件保持PNG格式
          outputFormat = 'image/png'
          outputQuality = 0.8 // PNG也可以有质量参数
        } else {
          // 大文件或无透明度的转为JPEG以获得更好压缩
          outputFormat = 'image/jpeg'
          outputQuality = fileSizeMB > 2 ? 0.4 : (fileSizeMB > 1 ? 0.5 : 0.6)
          
          // JPEG需要白色背景
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, width, height)
        }
        
        // 绘制压缩后的图片
        ctx.drawImage(img, 0, 0, width, height)
        
        const compressedDataUrl = canvas.toDataURL(outputFormat, outputQuality)
        const compressionRatio = ((file.size - compressedDataUrl.length) / file.size * 100).toFixed(1)
        const compressedSizeKB = compressedDataUrl.length / 1024
        
        console.log(`📐 图片压缩: ${file.name}`)
        console.log(`   原始: ${file.type} ${(file.size/1024).toFixed(1)}KB`)
        console.log(`   压缩后: ${outputFormat} ${compressedSizeKB.toFixed(1)}KB`)
        console.log(`   尺寸: ${img.width}x${img.height} → ${width}x${height}`)
        console.log(`   压缩率: ${compressionRatio}%`)
        
        // 检查压缩后大小是否仍然太大
        if (compressedSizeKB > 1000) { // 1MB
          console.warn('⚠️ 压缩后图片仍然较大，可能影响传输')
        }
        
        resolve(compressedDataUrl)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    // 清空输入框，允许重复选择同一文件
    e.target.value = ''
    
    if (imageFiles.length === 0) return
    
    console.log(`📎 开始处理 ${imageFiles.length} 张选择的图片`)
    setIsCompressing(true)
    
    try {
      for (const file of imageFiles) {
        try {
          // 检查文件大小
          const fileSizeMB = file.size / (1024 * 1024)
          console.log(`📎 上传图片: ${file.name}, 大小: ${fileSizeMB.toFixed(2)}MB`)
          
          if (fileSizeMB > 10) {
            alert(`图片 "${file.name}" 太大 (${fileSizeMB.toFixed(2)}MB)，请选择小于10MB的图片`)
            continue
          }
          
          // 压缩图片
          const compressedImage = await compressImage(file, 800, 0.8)
          
          setUploadedImageFiles(prev => [...prev, file])
          setUploadedImages(prev => [...prev, compressedImage])
          
        } catch (error) {
          console.error('图片处理失败:', error)
          alert(`图片 "${file.name}" 处理失败，请重试`)
        }
      }
      console.log(`✅ 完成处理 ${imageFiles.length} 张选择的图片`)
    } finally {
      setIsCompressing(false)
    }
  }

  // 处理拖拽上传图片
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) return
    
    console.log(`🖱️ 开始处理 ${imageFiles.length} 张拖拽的图片`)
    setIsCompressing(true)
    
    try {
      for (const file of imageFiles) {
        try {
          const fileSizeMB = file.size / (1024 * 1024)
          console.log(`🖱️ 拖拽图片: ${file.name}, 大小: ${fileSizeMB.toFixed(2)}MB`)
          
          if (fileSizeMB > 10) {
            alert(`拖拽的图片 "${file.name}" 太大 (${fileSizeMB.toFixed(2)}MB)，请选择小于10MB的图片`)
            continue
          }
          
          const compressedImage = await compressImage(file, 800, 0.8)
          setUploadedImageFiles(prev => [...prev, file])
          setUploadedImages(prev => [...prev, compressedImage])
          
        } catch (error) {
          console.error('拖拽图片处理失败:', error)
          alert(`拖拽的图片 "${file.name}" 处理失败，请重试`)
        }
      }
      console.log(`✅ 完成处理 ${imageFiles.length} 张拖拽的图片`)
    } finally {
      setIsCompressing(false)
    }
  }

  // 处理粘贴图片
  const handlePaste = async (e: React.ClipboardEvent) => {
    console.log('🔍 粘贴事件触发')
    console.log('🔍 剪贴板项目数量:', e.clipboardData.items.length)
    
    const items = Array.from(e.clipboardData.items)
    console.log('🔍 所有剪贴板项目类型:', items.map(item => item.type))
    
    const imageItems = items.filter(item => item.type.startsWith('image/'))
    console.log('🔍 图片项目数量:', imageItems.length)
    console.log('🔍 图片项目类型:', imageItems.map(item => item.type))
    
    if (imageItems.length === 0) {
      console.log('❌ 没有发现图片内容')
      return
    }
    
    console.log(`📋 开始处理 ${imageItems.length} 张粘贴的图片`)
    setIsCompressing(true)
    
    try {
      // 并行处理所有图片
      const results = await Promise.allSettled(
        imageItems.map(async (item, index) => {
          console.log(`🔍 处理第 ${index + 1} 张图片，类型: ${item.type}`)
          
          const file = item.getAsFile()
          console.log(`🔍 获取到的文件:`, file ? `${file.name || 'clipboard'} (${file.size} bytes)` : 'null')
          
          if (!file) {
            throw new Error('无法获取文件')
          }
          
          const fileSizeMB = file.size / (1024 * 1024)
          console.log(`📋 粘贴图片 ${index + 1}: ${file.name || 'clipboard'}, 大小: ${fileSizeMB.toFixed(2)}MB`)
          
          if (fileSizeMB > 10) {
            throw new Error(`图片太大 (${fileSizeMB.toFixed(2)}MB)`)
          }
          
          const compressedImage = await compressImage(file, 800, 0.8)
          return { file, compressedImage }
        })
      )
      
      // 处理成功的结果
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<{file: File, compressedImage: string}> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value)
      
      console.log(`✅ 成功处理 ${successfulResults.length} 张图片`)
      
      if (successfulResults.length > 0) {
        setUploadedImageFiles(prev => {
          const newFiles = [...prev, ...successfulResults.map(r => r.file)]
          console.log(`🔍 更新图片文件数组，新长度: ${newFiles.length}`)
          return newFiles
        })
        setUploadedImages(prev => {
          const newImages = [...prev, ...successfulResults.map(r => r.compressedImage)]
          console.log(`🔍 更新图片预览数组，新长度: ${newImages.length}`)
          return newImages
        })
      }
      
      // 处理失败的结果
      const failedResults = results.filter(result => result.status === 'rejected')
      if (failedResults.length > 0) {
        console.error('部分图片处理失败:', failedResults.map(r => r.reason))
        alert(`${failedResults.length} 张图片处理失败，请重试`)
      }
      
    } catch (error) {
      console.error('粘贴图片处理失败:', error)
      alert('粘贴图片处理失败，请重试')
    } finally {
      setIsCompressing(false)
    }
    
    console.log(`✅ 完成处理粘贴的图片`)
  }

  // 移除图片
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    setUploadedImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
          {/* 配置面板 */}
          {showConfig && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI助手配置</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">AiHubMix API Key *</label>
                  <Input
                    type="password"
                    value={aiConfig.apiKey}
                    onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                    placeholder="sk-xxx"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">留空将使用默认配置，也可填入您自己的密钥</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
                  <Input
                    type="password"
                    value={aiConfig.openaiApiKey || ''}
                    onChange={(e) => setAiConfig({ ...aiConfig, openaiApiKey: e.target.value })}
                    placeholder="sk-xxx"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">用于ChatGPT GPTs（可选）</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">智能体类型</label>
                  <select
                    value={aiConfig.agentType}
                    onChange={(e) => setAiConfig({ ...aiConfig, agentType: e.target.value as any })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="cherry-studio">Cherry Studio 智能体</option>
                    <option value="chatgpt">ChatGPT GPTs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">视觉分析模型</label>
                  <select
                    value={aiConfig.model}
                    onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="gpt-4-vision-preview">GPT-4 Vision (推荐)</option>
                    <option value="claude-3-vision">Claude-3 Vision</option>
                    <option value="gpt-4">GPT-4 标准版</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">专业面料识别推荐使用 GPT-4 Vision</p>
                </div>
                {aiConfig.agentType === 'cherry-studio' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">智能体ID</label>
                    <Input
                      value={aiConfig.agentId}
                      onChange={(e) => setAiConfig({ ...aiConfig, agentId: e.target.value })}
                      placeholder="agent-xxx"
                      className="w-full"
                    />
                  </div>
                )}
                {aiConfig.agentType === 'chatgpt' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">GPT ID</label>
                    <Input
                      value={aiConfig.gptId || ''}
                      onChange={(e) => setAiConfig({ ...aiConfig, gptId: e.target.value })}
                      placeholder="g-xxx 或 asst_xxx"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConfig(false)}
                >
                  取消
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    // 测试连接到Cherry Studio智能体
                    try {
                      const response = await fetch('/api/ai-chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          message: '你好，请介绍一下你的功能',
                          config: aiConfig
                        })
                      })
                      const data = await response.json()
                      if (response.ok) {
                        alert('✅ 文字聊天连接成功！\n\n' + data.response.substring(0, 200) + '...')
                      } else {
                        alert('❌ 文字聊天连接失败：\n' + data.error)
                      }
                    } catch (error) {
                      alert('❌ 测试连接时出错：\n' + error)
                    }
                  }}
                >
                  测试文字
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    // 测试图片分析功能
                    try {
                      // 创建一个简单的测试图片 (1x1像素的base64图片)
                      const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
                      
                      console.log('🧪 开始测试图片分析API')
                      console.log('🧪 测试图片数据:', testImageData.slice(0, 100) + '...')
                      
                      const response = await fetch('/api/ai-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          message: '测试图片分析功能',
                          imageData: [testImageData], // 修正：使用数组格式
                          config: {
                            apiKey: aiConfig.apiKey,
                            baseUrl: aiConfig.baseUrl,
                            model: aiConfig.model
                          }
                        })
                      })
                      
                      console.log('🧪 API响应状态:', response.status)
                      const data = await response.json()
                      console.log('🧪 API响应数据:', data)
                      
                      if (response.ok) {
                        alert('✅ 图片分析连接成功！\n\n' + (data.response || data.analysis || '分析成功'))
                      } else {
                        console.error('🧪 API错误详情:', data)
                        alert('❌ 图片分析连接失败：\n' + (data.error || '未知错误'))
                      }
                    } catch (error) {
                      alert('❌ 测试图片分析时出错：\n' + error)
                    }
                  }}
                >
                  测试图片
                </Button>
                <Button
                  onClick={() => setShowConfig(false)}
                >
                  保存配置
                </Button>
              </div>
            </Card>
          )}

          {/* 聊天区域 */}
          {!showConfig && (
          <Card className="h-[calc(100vh-16rem)] flex flex-col">
            {/* 头部 */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">👔 鸿宇服饰产品和业务顾问</h2>
                <p className="text-sm text-gray-600">
                  处理客户服装需求，提供设计方案、价格计算和英文回复，提升业务员技能和客户满意度
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* 设置按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfig(!showConfig)}
                  className="flex items-center space-x-1"
                >
                  <Settings className="w-4 h-4" />
                  <span>设置</span>
                </Button>
                <div className="text-xs text-gray-600">
                  {isDeviceVerified ? (
                    <span className="text-green-600">🔐 设备已验证</span>
                  ) : (
                    <span className="text-amber-600">🔐 等待验证</span>
                  )}
                </div>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">👔</div>
                  <p className="text-lg font-medium">
                    鸿宇服饰产品和业务顾问
                  </p>
                  <p className="text-sm">
                    处理客户服装需求，提供设计方案和价格计算，或上传设计草图/面料图片进行专业分析
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.images && message.images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.images.map((imageUrl, index) => (
                          <img 
                            key={index}
                            src={imageUrl} 
                            alt={`图片 ${index + 1}`} 
                            className="w-32 h-32 rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover border shadow-sm"
                            onClick={() => setPreviewImage(imageUrl)}
                          />
                        ))}
                      </div>
                    )}
                    <div
                      className={`text-xs mt-2 ${
                        message.isUser ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-gray-600">AI正在思考...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 快速问题 */}
            {messages.length === 0 && (
              <div className="p-4 border-t bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">💡 常见问题：</h4>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.slice(0, 4).map((q, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(q.question)}
                      className={`p-2 text-xs border rounded-lg transition-colors text-left ${
                        q.isImageGen
                          ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-300 hover:from-cyan-100 hover:to-blue-100 text-cyan-800'
                          : q.isExpert 
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 hover:from-blue-100 hover:to-purple-100 text-blue-800' 
                            : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{q.icon}</span>
                        <span className={`truncate ${q.isExpert || q.isImageGen ? 'font-medium' : ''}`}>
                          {q.question}
                          {q.isExpert && <span className="text-blue-600 text-xs ml-1">[专业]</span>}
                          {q.isImageGen && <span className="text-cyan-600 text-xs ml-1">[生成]</span>}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 输入区域 */}
            <div className="p-4 border-t">
              {/* 图片预览 */}
              {(uploadedImages.length > 0 || isCompressing) && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`预览 ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewImage(image)}
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 shadow-sm z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {isCompressing && (
                    <div className="w-20 h-20 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center bg-blue-50">
                      <div className="text-center text-xs text-blue-600">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                        处理中
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onPaste={handlePaste}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    placeholder="输入消息，或粘贴/拖拽图片（智能压缩优化）..."
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="p-2"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </label>
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || (!inputMessage.trim() && uploadedImages.length === 0)}
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
          )}
        </div>

      {/* 智能体信息 */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <div className="flex items-center justify-center space-x-2">
          <span>✅ 鸿宇服饰产品和业务顾问已就绪</span>
          <span>•</span>
          <span>提供设计方案、价格计算和英文回复</span>
          <span>•</span>
          <a 
            href="https://cherrystudio.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Cherry Studio
          </a>
        </div>
        <div>智能体: {aiConfig.agentName} (ID: {aiConfig.agentId})</div>
      </div>

      {/* 使用说明 */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="text-sm">
          <h4 className="font-semibold text-green-800 mb-2">📋 业务顾问功能说明</h4>
          <div className="text-green-700 space-y-2">
            <div>
              <p><strong>🎯 核心功能：</strong></p>
              <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                <li><strong>需求分析</strong>：评估客户服装需求的合理性和成本</li>
                <li><strong>设计方案</strong>：基于面料特性提供最优设计建议</li>
                <li><strong>价格计算</strong>：根据SOP文件进行准确的成本估算</li>
                <li><strong>英文回复</strong>：提供专业的口语化英文客户回复</li>
                <li><strong>图片分析</strong>：分析设计草图和面料图片</li>
              </ul>
            </div>
            <div>
              <p><strong>💼 工作流程：</strong></p>
              <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                <li>输入客户需求（面料、款式、工艺要求等）</li>
                <li>上传设计草图或面料图片供分析（自动压缩优化）</li>
                <li>获得专业的设计方案和价格建议</li>
                <li>🆕 生成设计效果图（如logo替换到服装）</li>
                <li>接收标准的英文回复模板</li>
                <li>必要时获得与负责人磋商的建议</li>
              </ul>
            </div>
            <div>
              <p><strong>📸 图片处理：</strong></p>
              <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                <li>支持拖拽、粘贴、点击上传图片</li>
                <li>智能压缩：大文件自动优化尺寸和质量</li>
                <li>格式优化：大PNG自动转JPEG节省空间</li>
                <li>支持多张图片同时分析，最大10MB</li>
              </ul>
            </div>
            <div className="text-xs text-green-600 bg-green-100 p-2 rounded">
              <strong>💡 提示：</strong>基于鸿宇公司SOP文件，专注提升业务员技能和客户满意度
            </div>
          </div>
        </div>
      </Card>
      
      {/* 图片预览模态框 */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-4xl p-4">
            <img
              src={previewImage}
              alt="图片预览"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-75 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
              点击空白区域或按ESC键关闭
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 