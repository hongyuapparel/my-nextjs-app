<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server'

interface RequestBody {
  prompt: string
  referenceImages?: string[]
  config: {
    apiKey: string
    baseUrl: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { prompt, referenceImages, config } = body

    // 改为仅使用前端提供的密钥与地址，不再读取服务端环境变量
    const finalApiKey = (config?.apiKey || '').trim()
    const finalBaseUrl = config?.baseUrl || 'https://api.aihubmix.com/v1'

    console.log('🎨 图片生成API调用:', {
      hasPrompt: !!prompt,
      referenceImageCount: referenceImages?.length || 0,
      hasApiKey: !!finalApiKey,
      baseUrl: finalBaseUrl
    })

    if (!prompt) {
      console.error('❌ 未提供生成提示')
      return NextResponse.json(
        { error: '未提供生成提示' },
        { status: 400 }
      )
    }

    // 当没有密钥时，直接返回可操作的中文指导文案，确保前端仍可用
    if (!finalApiKey) {
      const detailedGuidance = `
## 🎨 设计效果图制作指导（无需API密钥的离线方案）

根据您提供的需求，以下是专业的制作建议：

### 📝 设计要求概述
${prompt}

### 🛠️ 制作步骤

**方法1：使用 Photoshop**
1. 准备：打开服装图片作为背景层
2. 导入：将logo/图案图片拖入文档，置于新图层
3. 对齐：移动到指定位置（如后幅、前胸等）
4. 调整：使用“自由变换”(Ctrl/Cmd+T) 调整大小与透视
5. 融合：尝试“正片叠底/线性加深/叠加”等混合模式，让logo贴合面料纹理
6. 细化：通过“蒙版”擦除不需要的边缘；适当添加“投影/内阴影”

**方法2：使用 Canva（零基础友好）**
1. 新建画布并上传服装背景图
2. 上传logo素材，拖到画布中
3. 位置与比例调整，设置透明度增强贴合感
4. 导出PNG即可分享

### 🎯 关键技巧
- 保持logo原始比例与颜色准确
- 深色服装上可提高logo对比度
- 注意光影方向，避免违和
- 需要多版本方案时，建议导出2-3个位置与尺寸组合

如需一键AI生成，请在界面“配置”中填写AI密钥后再试。
      `

      return NextResponse.json({
        success: true,
        message: detailedGuidance,
        analysis: detailedGuidance,
        isTextResponse: true
      })
    }

    // 先分析参考图片以获得详细描述（仅在有密钥时）
    let detailedPrompt = prompt
    
    if (referenceImages && referenceImages.length > 0) {
      console.log('🔍 开始分析参考图片以优化生成提示')
      
      // 使用视觉模型分析参考图片
      const analysisMessages = [
        {
          role: 'system',
          content: `你是一个专业的图像分析师。请详细分析提供的图片，特别关注：
1. 第一张图片：logo或图案的设计特征、颜色、风格
2. 第二张图片：服装的款式、颜色、材质、结构
请提供详细的视觉描述，用于指导AI图片生成。`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `请分析这些图片：${prompt}\n\n请详细描述每张图片的特征，然后给出一个适合AI图片生成的详细英文prompt。`
            },
            ...referenceImages.map(imageUrl => ({
              type: 'image_url',
              image_url: { url: imageUrl }
            }))
          ]
        }
      ]
      
      try {
        const analysisResponse = await fetch(`${finalBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${finalApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4', // 使用标准GPT-4模型，避免权限问题
            messages: analysisMessages,
            max_tokens: 1000,
            temperature: 0.3
          })
        })
        
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json()
          const analysis = analysisData.choices?.[0]?.message?.content
          if (analysis) {
            console.log('🔍 图片分析结果:', (analysis as string).slice(0, 200) + '...')
            detailedPrompt = analysis
          }
        }
      } catch (error) {
        console.warn('图片分析失败，使用原始prompt:', error)
      }
    }

    // 构建图片生成请求
    const messages: any[] = [
      {
        role: 'system',
        content: `你是一个专业的服装设计AI助手。请根据用户的要求和参考图片生成服装设计效果图。

**重要要求：**
- 必须严格按照用户提供的参考图片内容
- 如果有logo图片，请保持logo的原始设计特征
- 如果有服装图片，请保持服装的基本款式和颜色
- 生成高质量、真实的服装效果图
- 确保logo放置位置准确（如后幅、前胸等）

**输出格式：**
生成一张专业的服装设计效果图，展示最终的设计效果。`
      }
    ]

    // 调用AiHubMix图片生成API（使用优化后的prompt）
    console.log('🎨 使用优化后的prompt生成图片:', detailedPrompt.slice(0, 200) + '...')
    
    const response = await fetch(`${finalBaseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${finalApiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: detailedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'url'
      })
    })

    if (!response.ok) {
      // 如果DALL-E不可用，提供详细的设计指导
      console.log('🔄 DALL-E不可用，提供详细的设计指导')
      
      const detailedGuidance = `
## 🎨 设计效果图制作指导

根据您提供的图片和要求，以下是专业的制作建议：

### 📝 **设计要求分析：**
${prompt}

### 🛠️ **制作步骤：**

**方法1：使用Photoshop**
1. 打开第二张图片（服装图片）作为背景
2. 使用"魔棒工具"或"套索工具"选中logo区域
3. 将logo复制并粘贴到服装图片的指定位置
4. 调整logo的大小、透明度和混合模式
5. 使用"自由变换"调整logo以适应服装轮廓

**方法2：使用Canva**
1. 上传服装图片作为背景
2. 添加logo图片作为新图层
3. 调整logo位置到T恤后幅或指定区域
4. 调整大小和透明度以获得最佳效果

### 🎯 **关键技巧：**
- 保持logo的原始比例和颜色
- 考虑服装材质的质感效果
- 确保logo在服装上的可读性
- 注意光线和阴影的自然效果

### 💡 **专业建议：**
- 如果服装是深色，考虑调整logo颜色对比度
- 对于复杂图案，可能需要矢量化处理
- 建议制作多个版本以供选择
      `
      
      return NextResponse.json({
        success: true,
        message: detailedGuidance,
        analysis: detailedGuidance,
        isTextResponse: true
      })
    }

    const data = await response.json()
    
    // 检查返回的数据结构
    if (data.data && data.data[0] && data.data[0].url) {
      return NextResponse.json({
        success: true,
        imageUrl: data.data[0].url,
        isTextResponse: false
      })
    } else {
      console.error('意外的图片生成API响应格式:', data)
      return NextResponse.json(
        { error: '图片生成失败：返回格式错误' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('图片生成API错误:', error)
    return NextResponse.json(
      { error: '图片生成服务异常', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
=======
import { NextRequest, NextResponse } from 'next/server'

interface RequestBody {
  prompt: string
  referenceImages?: string[]
  config: {
    apiKey: string
    baseUrl: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { prompt, referenceImages, config } = body

    // 新增：服务端密钥回退
    const envKey = process.env.AIHUBMIX_API_KEY
    const finalApiKey = config?.apiKey || envKey
    const finalBaseUrl = config?.baseUrl || process.env.AIHUBMIX_BASE_URL || 'https://api.aihubmix.com/v1'

    console.log('🎨 图片生成API调用:', {
      hasPrompt: !!prompt,
      referenceImageCount: referenceImages?.length || 0,
      hasApiKey: !!finalApiKey,
      baseUrl: finalBaseUrl
    })

    if (!finalApiKey) {
      console.error('❌ 未配置API密钥')
      return NextResponse.json(
        { error: '未配置API密钥' },
        { status: 400 }
      )
    }

    if (!prompt) {
      console.error('❌ 未提供生成提示')
      return NextResponse.json(
        { error: '未提供生成提示' },
        { status: 400 }
      )
    }

    // 先分析参考图片以获得详细描述
    let detailedPrompt = prompt
    
    if (referenceImages && referenceImages.length > 0) {
      console.log('🔍 开始分析参考图片以优化生成提示')
      
      // 使用视觉模型分析参考图片
      const analysisMessages = [
        {
          role: 'system',
          content: `你是一个专业的图像分析师。请详细分析提供的图片，特别关注：
1. 第一张图片：logo或图案的设计特征、颜色、风格
2. 第二张图片：服装的款式、颜色、材质、结构
请提供详细的视觉描述，用于指导AI图片生成。`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `请分析这些图片：${prompt}\n\n请详细描述每张图片的特征，然后给出一个适合AI图片生成的详细英文prompt。`
            },
            ...referenceImages.map(imageUrl => ({
              type: 'image_url',
              image_url: { url: imageUrl }
            }))
          ]
        }
      ]
      
      try {
        const analysisResponse = await fetch(`${finalBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${finalApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4-vision-preview',
            messages: analysisMessages,
            max_tokens: 1000,
            temperature: 0.3
          })
        })
        
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json()
          const analysis = analysisData.choices?.[0]?.message?.content
          if (analysis) {
            console.log('🔍 图片分析结果:', analysis.slice(0, 200) + '...')
            detailedPrompt = analysis
          }
        }
      } catch (error) {
        console.warn('图片分析失败，使用原始prompt:', error)
      }
    }

    // 构建图片生成请求
    const messages: any[] = [
      {
        role: 'system',
        content: `你是一个专业的服装设计AI助手。请根据用户的要求和参考图片生成服装设计效果图。

**重要要求：**
- 必须严格按照用户提供的参考图片内容
- 如果有logo图片，请保持logo的原始设计特征
- 如果有服装图片，请保持服装的基本款式和颜色
- 生成高质量、真实的服装效果图
- 确保logo放置位置准确（如后幅、前胸等）

**输出格式：**
生成一张专业的服装设计效果图，展示最终的设计效果。`
      }
    ]

    // 调用AiHubMix图片生成API（使用优化后的prompt）
    console.log('🎨 使用优化后的prompt生成图片:', detailedPrompt.slice(0, 200) + '...')
    
    const response = await fetch(`${finalBaseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${finalApiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: detailedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'url'
      })
    })

    if (!response.ok) {
      // 如果DALL-E不可用，提供详细的设计指导
      console.log('🔄 DALL-E不可用，提供详细的设计指导')
      
      const detailedGuidance = `
## 🎨 设计效果图制作指导

根据您提供的图片和要求，以下是专业的制作建议：

### 📝 **设计要求分析：**
${prompt}

### 🛠️ **制作步骤：**

**方法1：使用Photoshop**
1. 打开第二张图片（服装图片）作为背景
2. 使用"魔棒工具"或"套索工具"选中logo区域
3. 将logo复制并粘贴到服装图片的指定位置
4. 调整logo的大小、透明度和混合模式
5. 使用"自由变换"调整logo以适应服装轮廓

**方法2：使用Canva**
1. 上传服装图片作为背景
2. 添加logo图片作为新图层
3. 调整logo位置到T恤后幅或指定区域
4. 调整大小和透明度以获得最佳效果

### 🎯 **关键技巧：**
- 保持logo的原始比例和颜色
- 考虑服装材质的质感效果
- 确保logo在服装上的可读性
- 注意光线和阴影的自然效果

### 💡 **专业建议：**
- 如果服装是深色，考虑调整logo颜色对比度
- 对于复杂图案，可能需要矢量化处理
- 建议制作多个版本以供选择
      `
      
      return NextResponse.json({
        success: true,
        message: detailedGuidance,
        analysis: detailedGuidance,
        isTextResponse: true
      })
    }

    const data = await response.json()
    
    // 检查返回的数据结构
    if (data.data && data.data[0] && data.data[0].url) {
      return NextResponse.json({
        success: true,
        imageUrl: data.data[0].url,
        isTextResponse: false
      })
    } else {
      console.error('意外的图片生成API响应格式:', data)
      return NextResponse.json(
        { error: '图片生成失败：返回格式错误' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('图片生成API错误:', error)
    return NextResponse.json(
      { error: '图片生成服务异常', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
} 