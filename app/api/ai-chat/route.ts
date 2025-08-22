import { NextRequest, NextResponse } from 'next/server'

interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
  agentId?: string // Cherry Studio智能体ID
  agentType?: 'cherry-studio' | 'chatgpt' | 'custom'
  gptId?: string // ChatGPT GPT ID
  openaiApiKey?: string // OpenAI API Key
}

interface RequestBody {
  message: string
  config: AIConfig
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { message, config } = body

    // 验证必要参数
    if (!message) {
      return NextResponse.json(
        { error: '缺少必要参数：message' },
        { status: 400 }
      )
    }

<<<<<<< HEAD
    // 仅使用前端提供的密钥，不再读取服务端环境变量
    const hasOpenai = !!(config.openaiApiKey && config.openaiApiKey.trim())
    const hasCherry = !!(config.apiKey && config.apiKey.trim() && config.agentId)

    // 无密钥时提供离线降级文本回复，避免 400
    if (config.agentType === 'chatgpt' && !hasOpenai) {
      const offline = `
【离线演示模式】未配置 OpenAI API Key。

你提问的是：\n${message}\n\n下面是基于企业培训助手规范给出的通用建议（示例）：\n- 明确你的问题场景与期望产出（文档/表格/步骤）\n- 若涉及公司内部流程，请附上当前 SOP 摘要或截图\n- 如需英文回复模板，请说明目标国家与语气偏好\n\n在界面“配置”中填写 OpenAI Key 后，可获得更准确的回答。`
      return NextResponse.json({
        response: offline,
        type: 'offline',
        model: 'offline',
        timestamp: new Date().toISOString(),
        success: true
      })
    }

    if (config.agentType === 'cherry-studio' && !hasCherry) {
      const offline = `
【离线演示模式】未配置 AiHubMix/Cherry Studio API Key 或 Agent ID。

你提问的是：\n${message}\n\n通用业务建议（示例）：\n1) 先澄清客户核心需求（数量、尺码、面料、交期、预算）\n2) 提供可落地的 1-2 套解决方案（含面料与工艺）\n3) 给出英文回复范例，并说明下一步要客户确认的点\n\n在界面“配置”中填写密钥与 Agent ID 后，可获得更精准的智能体回复。`
      return NextResponse.json({
        response: offline,
        type: 'offline',
        model: 'offline',
        timestamp: new Date().toISOString(),
        success: true
      })
    }

    // 根据智能体类型选择调用方式（此处仅使用前端密钥）
    if (config.agentType === 'chatgpt' && config.gptId && hasOpenai) {
      const finalConfig = { ...config, openaiApiKey: (config.openaiApiKey || '').trim() }
      return await callChatGPTGPT(message, finalConfig)
    } else if (config.agentType === 'cherry-studio' && config.agentId && hasCherry) {
      const finalConfig = { ...config, apiKey: (config.apiKey || '').trim() }
      return await callCherryStudioAgent(message, finalConfig)
    } else {
      // 兜底：无效配置时返回友好提示
      return NextResponse.json(
        { response: '请在界面“配置”中正确选择智能体并填写所需密钥。', type: 'invalid-config' },
        { status: 200 }
=======
    // 从环境变量获取API密钥作为备用
    const envApiKey = process.env.AIHUBMIX_API_KEY
    const envOpenaiKey = process.env.OPENAI_API_KEY
    
    // 根据智能体类型选择调用方式
    if (config.agentType === 'chatgpt' && config.gptId && (config.openaiApiKey || envOpenaiKey)) {
      const finalConfig = { ...config, openaiApiKey: config.openaiApiKey || envOpenaiKey || '' }
      return await callChatGPTGPT(message, finalConfig)
    } else if (config.agentType === 'cherry-studio' && config.agentId && (config.apiKey || envApiKey)) {
      const finalConfig = { ...config, apiKey: config.apiKey || envApiKey || '' }
      return await callCherryStudioAgent(message, finalConfig)
    } else {
      return NextResponse.json(
        { error: '请配置API密钥或确保智能体设置正确' },
        { status: 400 }
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
      )
    }

  } catch (error: any) {
    console.error('API调用错误:', error)
    
    return NextResponse.json(
      { 
        error: '服务器内部错误',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// 调用ChatGPT GPTs
async function callChatGPTGPT(message: string, config: AIConfig) {
  try {
    // 首先尝试使用Assistant API（推荐方式）
    if (config.gptId?.startsWith('asst_')) {
      return await callChatGPTAssistant(message, config)
    }
    
    // 如果是GPT ID格式，尝试直接调用
    if (config.gptId?.startsWith('g-')) {
      return await callChatGPTGPTDirect(message, config)
    }

    // 兜底：使用普通的GPT-4调用，但加上GPT的指令
    return await callChatGPTWithInstructions(message, config)

  } catch (error: any) {
    console.error('ChatGPT调用错误:', error)
    return NextResponse.json(
      { error: 'ChatGPT服务调用失败', details: error.message },
      { status: 500 }
    )
  }
}

// 使用Assistant API调用（推荐）
async function callChatGPTAssistant(message: string, config: AIConfig) {
  try {
    // 创建线程
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({})
    })

    if (!threadResponse.ok) {
      throw new Error(`创建线程失败: ${threadResponse.status}`)
    }

    const thread = await threadResponse.json()

    // 添加消息到线程
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: message
      })
    })

    // 运行助手
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: config.gptId
      })
    })

    if (!runResponse.ok) {
      throw new Error(`运行助手失败: ${runResponse.status}`)
    }

    const run = await runResponse.json()

    // 轮询运行状态
    let runStatus = run
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${config.openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      })
      
      runStatus = await statusResponse.json()
    }

    if (runStatus.status !== 'completed') {
      throw new Error(`运行失败: ${runStatus.status}`)
    }

    // 获取回复
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    })

    const messages = await messagesResponse.json()
    const aiMessage = messages.data[0]?.content[0]?.text?.value || '抱歉，我暂时无法回答这个问题。'

    return NextResponse.json({
      response: aiMessage,
      model: config.gptId,
      type: 'chatgpt-assistant',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Assistant API调用错误:', error)
    throw error
  }
}

// 直接调用GPT（可能不支持私有GPT）
async function callChatGPTGPTDirect(message: string, config: AIConfig) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4', // 使用标准模型
        messages: [
          {
            role: 'system',
            content: `你现在要模拟我的GPT助手的行为。这个GPT的ID是: ${config.gptId}。请按照企业培训助手的角色来回答问题。`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`GPT直接调用失败: ${response.status}`)
    }

    const data = await response.json()
    const aiMessage = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。'

    return NextResponse.json({
      response: aiMessage,
      model: 'gpt-4',
      type: 'chatgpt-gpt',
      gptId: config.gptId,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('GPT直接调用错误:', error)
    throw error
  }
    }

// 使用指令模拟GPT行为（兜底方案）
async function callChatGPTWithInstructions(message: string, config: AIConfig) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的企业培训助手，专门为员工提供关于公司政策、流程、培训等方面的帮助。请用专业、友好的语调回答问题，提供具体、可操作的建议。如果需要具体的公司内部信息，请建议用户查阅相关文档或联系HR部门。`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`指令模拟调用失败: ${response.status}`)
    }

    const data = await response.json()
    const aiMessage = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。'

    return NextResponse.json({
      response: aiMessage,
      model: 'gpt-4',
      type: 'chatgpt-instructions',
      gptId: config.gptId,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('指令模拟调用错误:', error)
    throw error
  }
}

// 调用Cherry Studio智能体
async function callCherryStudioAgent(message: string, config: AIConfig) {
  try {
    console.log('🔍 调用Cherry Studio智能体:', config.agentId)
<<<<<<< HEAD

    // 统一模型映射 + 降级序列
    const requestedModel = (config.model || '').toLowerCase()
    const normalize = (m: string) => m.replace(/\s+/g, '').toLowerCase()
    const isVisionPreview = normalize(requestedModel).includes('vision')

    // Cherry/AiHubMix 常见可用模型：gpt-4o、gpt-4.1、gpt-4
    const fallbackModels = [
      isVisionPreview ? 'gpt-4o' : (requestedModel || 'gpt-4o'),
      'gpt-4.1',
      'gpt-4'
    ]

    const baseUrl = config.baseUrl || 'https://api.aihubmix.com/v1'
    const apiKey = (config.apiKey || '').trim()

    if (!apiKey) {
      const offline = `请在“配置”中填写 AiHubMix API Key 与 Agent ID 后再试。`
      return NextResponse.json({ response: offline, type: 'offline', model: 'offline' }, { status: 200 })
    }

=======
    
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280
    // 使用用户在Cherry Studio中设置的完整提示词
    const businessPrompt = `## 您的角色：鸿宇服饰的产品和业务顾问

### 您的职责：
- **输入数据：** 客户提供的服装需求，包括面料选择、款式设计、加工工艺要求等细节。入门数据形态通常是文字描述或设计草图。
- **输出数据：** 业务建议、最优设计方案、英文回复以及生成的设计图片/图片整合步骤。输出数据形态是文本文件和图像文件。
- **工作过程：** 
  1. 阅读客户需求和提供的图片/草图。
  2. 评估输入的合理性，考虑面料特性、客户地区工厂加工成本等因素。
  3. 根据鸿宇公司的SOP文件，提出合理的设计方案和价格计算。
  4. 如若需要，与公司负责人磋商完善信息或解决具体问题。
  5. 创建合格的业务回复以及可能需要的设计图片/图片整合。

### 您的背景和受众信息：
- **背景：** 具备服装加工、面料知识、最优设计理念和公司实际操作规则背景。
- **受众：** 公司的业务员和客户，需求解答及作为服装产品设计与讲解的对象。

### 您的要求：
- 阅读并理解客户收到的服装需求。
- 分析需求根据鸿宇公司SOP和财务合理性，给出解决方案。
- 用口语化的语气书写英文详细的回复，并根据需要提供设计和图片整合。
- 在不确定情况下，提出化解建议并提醒负责人提供额外辅助。
- 确保任何回复和建议都能提升业务员的技能和对客户满意度的提升。

## Initialization
作为鸿宇服饰的产品和业务顾问，您将按照以上部分规范开始处理和回复客户的服装需求。确立流程和清晰的工作要求，并以友好且专业的语气进行交流，促进公司业务和客户满意度的提升。`

<<<<<<< HEAD
    // 构建公共体
    const buildBody = (model: string) => {
      const body: any = {
        model,
        messages: [
          { role: 'system', content: businessPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        stream: false
      }
      if (config.agentId) {
        body.agent_id = config.agentId
        body.assistant_id = config.agentId
        body.knowledge_base = config.agentId
      }
      return body
    }

    let lastErrorText = ''
    for (const model of fallbackModels) {
      try {
        const reqBody = buildBody(model)
        console.log('📤 发送请求到:', `${baseUrl}/chat/completions`, 'model=', model)
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'X-Agent-ID': config.agentId || ''
          },
          body: JSON.stringify(reqBody)
        })

        if (response.ok) {
          const data = await response.json()
          const aiMessage = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。'
          return NextResponse.json({ response: aiMessage, model, type: 'cherry-studio', agentId: config.agentId, timestamp: new Date().toISOString() })
        }

        const errorText = await response.text()
        lastErrorText = errorText
        console.warn('Cherry Studio API错误:', response.status, errorText)

        // 如果是模型不可用/无权限，继续尝试下一个模型
        if (/incorrect model id|model not found|no permission|不存在的模型|无权限/i.test(errorText)) {
          continue
        }

        // 其他错误直接返回
        return NextResponse.json(
          { error: `Cherry Studio API调用失败 (${response.status}): ${errorText}` },
          { status: response.status }
        )
      } catch (err: any) {
        lastErrorText = err?.message || String(err)
        console.warn('调用失败，尝试下一个模型:', model, lastErrorText)
        continue
      }
    }

    return NextResponse.json(
      { error: '所有模型均不可用，请稍后再试或检查账户权限', details: lastErrorText },
      { status: 502 }
    )
=======
    // 构建请求体，确保调用您的专属智能体
    const requestBody: any = {
      model: config.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: businessPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.3, // 降低随机性，保持专业性
      max_tokens: 2000, // 增加输出长度
      stream: false
    }

    // 添加Cherry Studio智能体的特定参数
    if (config.agentId) {
      // 使用正确的参数名调用您的智能体
      requestBody.agent_id = config.agentId
      // 也可能需要这些参数
      requestBody.assistant_id = config.agentId
      requestBody.knowledge_base = config.agentId
    }

    console.log('📤 发送请求到:', `${config.baseUrl}/chat/completions`)
    console.log('📝 请求体:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Agent-ID': config.agentId || '', // 额外的header参数
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Cherry Studio API错误:', response.status, errorText)
      
      return NextResponse.json(
        { error: `Cherry Studio API调用失败 (${response.status}): ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiMessage = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。'

    return NextResponse.json({
      response: aiMessage,
      model: config.model,
      type: 'cherry-studio',
      agentId: config.agentId,
      timestamp: new Date().toISOString()
    })
>>>>>>> dd81c17ca42ee6716d780951d9d683820c388280

  } catch (error: any) {
    console.error('Cherry Studio调用错误:', error)
    return NextResponse.json(
      { error: 'Cherry Studio服务调用失败', details: error.message },
      { status: 500 }
    )
  }
} 