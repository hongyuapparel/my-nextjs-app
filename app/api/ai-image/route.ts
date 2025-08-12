import { NextRequest, NextResponse } from 'next/server'

interface RequestBody {
  message: string
  imageData?: string | string[]
  config: {
    apiKey: string
    baseUrl: string
    model: string
    mode: 'image'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { message, imageData, config } = body

    // 处理图片数据，支持单张或多张
    const images = Array.isArray(imageData) ? imageData : imageData ? [imageData] : []
    
    console.log('🔍 图片分析API调用:', {
      hasMessage: !!message,
      hasImageData: images.length > 0,
      imageCount: images.length,
      hasApiKey: !!config?.apiKey,
      baseUrl: config?.baseUrl
    })

    // 从环境变量获取API密钥作为备用
    const envApiKey = process.env.AIHUBMIX_API_KEY
    const finalApiKey = config?.apiKey || envApiKey
    
    if (!finalApiKey) {
      console.error('❌ 未配置API密钥')
      return NextResponse.json(
        { error: '未配置API密钥，请在设置中添加或联系管理员' },
        { status: 400 }
      )
    }

    if (images.length === 0) {
      console.error('❌ 未提供图片数据')
      return NextResponse.json(
        { error: '未提供图片数据' },
        { status: 400 }
      )
    }

    // 专业面料识别系统提示词
    const fabricAnalysisPrompt = `你是一名专业的纺织面料专家和服装技术顾问，具有20年的面料识别和分析经验。

**专业面料识别指南：**

**网眼面料识别要点：**
- **鸟眼网布（Bird's Eye Mesh）**：有规律的小圆孔，像鸟眼一样
- **蜂窝网布（Honeycomb Mesh）**：六角形网孔结构
- **菱形网布（Diamond Mesh）**：菱形网孔排列
- **功能性网眼布**：CoolMax、DriFit、网眼聚酯纤维

**关键识别特征：**
1. **网孔形状**：圆形、方形、六角形、菱形
2. **网孔大小**：微孔(<1mm)、小孔(1-3mm)、中孔(3-5mm)、大孔(>5mm)
3. **网孔密度**：稀疏、中等、密集
4. **面料光泽**：哑光(棉质)、半光(混纺)、亮光(化纤)
5. **表面纹理**：平整、凹凸、立体

**常见面料类型库：**
- **Pure Cotton Pique**：纯棉网眼布，哑光，透气好
- **Polyester Mesh**：涤纶网眼，有光泽，快干
- **Cotton-Poly Blend**：棉涤混纺，兼具舒适和功能
- **Coolmax Mesh**：功能性网眼，快速排汗
- **Bamboo Mesh**：竹纤维网眼，抗菌透气

**分析要求：**
1. **立即识别**：第一句话明确说出"这是XX网眼面料"
2. **识别依据**：详细描述看到的网孔特征
3. **材质判断**：根据光泽、质感判断纤维成分
4. **功能特性**：透气性、吸湿性、弹性等
5. **应用推荐**：具体的服装类型和使用场景

**特别注意：**
- 仔细观察图片中的网孔结构，不要错过网眼特征
- 如果看到规律性的小孔洞，立即识别为网眼面料
- 根据孔洞大小和排列判断具体的网眼类型

请用专业准确的语言进行分析，确保识别结果的专业性。`

    // 构建请求消息
    const messages: any[] = [
      {
        role: 'system',
        content: fabricAnalysisPrompt
      }
    ]
    
    if (images.length > 0) {
      // 有图片时，使用视觉分析
      const content: any[] = [
        {
          type: 'text',
          text: images.length > 1 
            ? `${message || '请专业分析这些图片'} （共${images.length}张图片）`
            : message || '请专业分析这张图片中的面料类型、特征和应用建议'
        }
      ]
      
      // 添加所有图片
      images.forEach((imageUrl, index) => {
        content.push({
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        })
      })
      
      messages.push({
        role: 'user',
        content: content
      })
    } else {
      // 没有图片时，纯文字处理
      messages.push({
        role: 'user',
        content: message
      })
    }

    // 调用AiHubMix视觉分析API
    const tryModels = [
      (config.model || '').toLowerCase().includes('vision') ? 'gpt-4o' : (config.model || 'gpt-4o'),
      'gpt-4.1',
      'gpt-4'
    ]

    const baseUrl = (config.baseUrl || process.env.AIHUBMIX_BASE_URL || 'https://api.aihubmix.com/v1')

    let lastErrorText = ''
    for (const model of tryModels) {
      const visionResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${finalApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messages,
          max_tokens: 2000,
          temperature: 0.3,
          top_p: 0.9
        })
      })

      if (visionResponse.ok) {
        const visionData = await visionResponse.json()
        if (visionData.choices && visionData.choices[0] && visionData.choices[0].message) {
          return NextResponse.json({
            response: visionData.choices[0].message.content,
            success: true,
            model
          })
        }
        lastErrorText = JSON.stringify(visionData)
        break
      }

      const errorText = await visionResponse.text()
      lastErrorText = errorText
      console.warn('AiHubMix视觉分析API错误:', errorText)

      if (!/incorrect model id|model not found|no permission|不存在的模型|无权限/i.test(errorText)) {
        // 非模型权限类错误，直接返回
        return NextResponse.json(
          { error: '图片分析失败', details: errorText },
          { status: 500 }
        )
      }
      // 权限问题则降级继续尝试下一模型
    }

    return NextResponse.json(
      { error: '图片分析失败：所有模型均不可用', details: lastErrorText },
      { status: 502 }
    )

  } catch (error: any) {
    console.error('图片分析API错误:', error)
    return NextResponse.json(
      { error: '图片分析服务异常', details: error.message },
      { status: 500 }
    )
  }
} 