import { NextRequest, NextResponse } from 'next/server'

interface RequestBody {
  imageData: string | string[]
  specificQuestion?: string
  config: {
    apiKey: string
    baseUrl: string
    model?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { imageData, specificQuestion, config } = body

    // 处理图片数据，支持单张或多张
    const images = Array.isArray(imageData) ? imageData : imageData ? [imageData] : []

    // 仅使用前端提供的密钥和地址
    const finalApiKey = (config?.apiKey || '').trim()
    const baseUrl = config?.baseUrl || 'https://api.aihubmix.com/v1'

    if (images.length === 0) {
      return NextResponse.json(
        { error: '未提供图片数据' },
        { status: 400 }
      )
    }

    // 无密钥时返回可操作的离线专业分析指导
    if (!finalApiKey) {
      const offlineGuide = `
## 🔬 面料专业分析指导（无需API密钥）

共 ${images.length} 张图片。建议从以下维度进行人工研判：

- 结构：针织/梭织；是否为网眼/多孔结构
- 网孔：形状（圆/六角/菱/方）、大小（微/小/中/大）、密度
- 光泽：哑光/半光/亮光 → 棉/混纺/化纤
- 纹理：平整/凹凸/立体；是否有功能后整理
- 功能：透气/吸湿/弹性/悬垂性
- 应用：运动装/休闲/工装/内衣；季节与加工建议

如需一键AI分析，请在界面“配置”中填写AI密钥后再试。`

      return NextResponse.json({
        success: true,
        analysis: offlineGuide,
        isTextResponse: true,
        model: 'offline'
      })
    }

    // 超专业面料识别系统提示词
    const expertFabricPrompt = `你是国际知名的纺织工程师和面料专家，拥有纺织学博士学位和25年的专业经验。

**面料分析专业流程：**

**第一步：基础识别**
- 立即确定这是什么类型的面料结构
- 如果看到规律性孔洞，立即识别为"网眼面料/多孔面料"
- 明确是针织还是梭织结构

**第二步：详细特征分析**
对于网眼面料，重点观察：
- 网孔形状：圆形(鸟眼)、方形、菱形、六角形(蜂窝)
- 网孔大小：微网眼(<1mm)、小网眼(1-3mm)、中网眼(3-5mm)、大网眼(>5mm)
- 排列方式：规律排列、交错排列、渐变排列
- 边缘特征：整齐、毛糙、热切、超声波切边

**第三步：材质判断**
根据视觉特征判断：
- 纤维光泽：棉(哑光)、涤纶(亮光)、尼龙(丝光)、竹纤维(天然光泽)
- 表面质感：平滑、粗糙、绒毛感
- 颜色深度：染料吸收程度反映纤维类型

**第四步：功能分析**
- 透气性：根据网孔密度和大小
- 弹性：观察面料的拉伸特性
- 悬垂性：估算面料重量和柔软度
- 吸湿性：根据纤维类型推断

**第五步：应用建议**
- 服装类型：运动装、休闲装、工装、内衣等
- 季节适用：春夏透气、秋冬保暖
- 加工工艺：染色、印花、后整理
- 成本评估：原料成本、生产难度

**输出要求：**
1. 开头必须明确："这是一款[具体面料类型]"
2. 详细列出识别依据和观察到的特征
3. 提供专业的技术参数估算
4. 给出具体的应用建议和注意事项

请确保分析的专业性和准确性。`

    const messages: any[] = [
      {
        role: 'system',
        content: expertFabricPrompt
      }
    ]
    
    // 构建用户消息内容
    const content: any[] = [
      {
        type: 'text',
        text: images.length > 1 
          ? `${specificQuestion || '请对这些面料图片进行最专业的分析，重点关注面料类型、结构特征和应用建议'} （共${images.length}张图片）`
          : specificQuestion || '请对这张面料图片进行最专业的分析，重点关注面料类型、结构特征和应用建议'
      }
    ]
    
    // 添加所有图片
    images.forEach((imageUrl) => {
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

    // 调用最强的视觉分析API（自动降级）
    const tryModels = [
      (config.model || '').toLowerCase().includes('vision') ? 'gpt-4o' : (config.model || 'gpt-4o'),
      'gpt-4.1',
      'gpt-4'
    ]

    let lastErrorText = ''

    for (const model of tryModels) {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${finalApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messages,
          max_tokens: 3000,
          temperature: 0.1,
          top_p: 0.95,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return NextResponse.json({
            analysis: data.choices[0].message.content,
            success: true,
            model,
            analysisType: 'expert-fabric-analysis'
          })
        }
        lastErrorText = JSON.stringify(data)
        break
      }

      const errorText = await response.text()
      lastErrorText = errorText
      console.warn('专业面料分析API错误:', errorText)

      if (!/incorrect model id|model not found|no permission|不存在的模型|无权限/i.test(errorText)) {
        return NextResponse.json(
          { error: '专业面料分析失败', details: errorText },
          { status: 500 }
        )
      }
      // 权限问题则降级继续尝试
    }

    return NextResponse.json(
      { error: '专业面料分析失败：所有模型均不可用', details: lastErrorText },
      { status: 502 }
    )

  } catch (error: any) {
    console.error('专业面料分析API错误:', error)
    return NextResponse.json(
      { error: '专业面料分析服务异常', details: error.message },
      { status: 500 }
    )
  }
} 