# 鸿宇工具箱 - Hongyu Toolbox

一个专业的外贸工具集合，提供多种实用功能。

## 🚀 主要功能

### 📱 全球电话查询
- 支持200+国家和地区
- 智能识别电话号码所属国家
- 显示国际拨号格式和区号信息
- 支持中英文搜索

### 🕐 国家时间转换
- 实时时区转换
- 智能搜索国家/城市
- 默认显示常用时区

### 📦 物流信息管理
- 多渠道实时查询
- 智能识别承运商
- 支持17Track API
- 收件人和负责人管理

### 🤖 AI培训助手
- 集成Cherry Studio智能体
- 支持ChatGPT GPTs
- 图片识别和分析
- 服装设计建议

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **组件库**: Shadcn UI
- **状态管理**: Zustand
- **AI服务**: AiHubMix, OpenAI
- **部署**: Vercel

## 🚀 快速部署

### 方法1：Vercel一键部署（推荐）

1. 点击下方按钮直接部署到Vercel：
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hongyuapparel/my-nextjs-app)

2. 在Vercel控制台添加环境变量：
   ```
   AIHUBMIX_API_KEY=your-aihubmix-api-key
   OPENAI_API_KEY=your-openai-api-key
   ```

### 方法2：手动部署

1. **克隆仓库**
   ```bash
   git clone https://github.com/hongyuapparel/my-nextjs-app.git
   cd my-nextjs-app
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   创建 `.env.local` 文件：
   ```
   AIHUBMIX_API_KEY=your-aihubmix-api-key
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **本地运行**
   ```bash
   npm run dev
   ```

5. **构建项目**
   ```bash
   npm run build
   ```

## 🔧 环境变量配置

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `AIHUBMIX_API_KEY` | AiHubMix API密钥 | ✅ |
| `OPENAI_API_KEY` | OpenAI API密钥 | 可选 |

## 📁 项目结构

```
├── app/                    # Next.js应用主目录
│   ├── api/               # API路由
│   ├── components/        # 组件
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── public/                 # 静态资源
├── lib/                    # 工具函数
└── package.json           # 项目配置
```

## 🌟 特色功能

- **响应式设计**: 支持各种设备尺寸
- **多语言支持**: 中英文界面
- **智能搜索**: 模糊匹配和智能提示
- **实时更新**: 支持热重载和实时数据
- **安全部署**: API密钥环境变量管理

## 📞 联系方式

如有问题或建议，请联系开发团队。

## 📄 许可证

本项目仅供内部使用。 