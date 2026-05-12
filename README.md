# AI Chat

一个简洁美观的 AI 对话应用，支持与多种 LLM API 进行流式对话。

## 功能特性

- 💬 **智能对话** - 支持流式响应，实时展示 AI 回复
- 📁 **会话管理** - 创建、收藏、重命名、删除对话
- 🔄 **侧边栏** - 可折叠的会话列表导航
- 💾 **本地存储** - 会话数据自动保存至浏览器
- ✨ **简洁界面** - 现代化设计，流畅用户体验
- 📱 **响应式布局** - 适配不同屏幕尺寸

## 技术栈

- **前端框架**: React 18
- **开发语言**: TypeScript
- **构建工具**: Vite 5
- **样式**: CSS Modules

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置 API

在项目根目录创建 `.env` 文件，配置以下环境变量：

```env
VITE_LLM_API_KEY=your-api-key-here
VITE_LLM_BASE_URL=https://api.example.com
VITE_LLM_MODEL=your-model-name
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── App.tsx              # 应用主组件
├── App.module.css       # 应用样式
├── main.tsx             # 入口文件
├── index.css            # 全局样式
├── components/
│   ├── ChatArea/        # 聊天区域组件
│   ├── Message/         # 消息气泡组件
│   └── Sidebar/         # 侧边栏组件
└── lib/
    └── api.ts           # LLM API 调用封装
```

## API 配置说明

应用支持 OpenAI 兼容的 ChatGPT API 接口格式。

| 环境变量 | 说明 | 示例 |
|---------|------|------|
| `VITE_LLM_API_KEY` | API 密钥 | `sk-xxxxx` |
| `VITE_LLM_BASE_URL` | API 地址 | `https://api.openai.com/v1` |
| `VITE_LLM_MODEL` | 模型名称 | `gpt-3.5-turbo` |

## 使用指南

1. **新建对话** - 点击侧边栏顶部的 "New chat" 按钮
2. **发送消息** - 在输入框输入内容，按 Enter 或点击发送按钮
3. **收藏对话** - 点击会话项上的星标按钮
4. **重命名对话** - 双击会话标题进行编辑
5. **删除对话** - 点击会话项上的删除按钮
6. **切换侧边栏** - 点击左上角菜单按钮

## License

MIT
