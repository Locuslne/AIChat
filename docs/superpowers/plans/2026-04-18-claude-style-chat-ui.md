# Claude-Style Chat UI Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan.

**Goal:** 构建一个仿 Claude 网页端风格的前端聊天界面，包含侧边栏和对话区域

**Architecture:** 使用 React + Vite + TypeScript 构建单页应用，采用组件化设计，状态管理使用 React Context，样式使用 CSS Modules 模拟 Claude 风格

**Tech Stack:** React 18, Vite, TypeScript, CSS Modules

---

## Chunk 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "ai-chat",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.1.0"
  }
}
```

- [ ] **Step 2: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Chat</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: 创建 src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 7: 创建 src/index.css (Claude 风格基础样式)**

```css
:root {
  --font-family: 'Söhne', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --sidebar-width: 280px;
  --header-height: 48px;
  --border-color: #e5e5e5;
  --bg-primary: #ffffff;
  --bg-secondary: #f7f7f8;
  --bg-tertiary: #ececf1;
  --text-primary: #1a1a1b;
  --text-secondary: #6e6e80;
  --accent-color: #d97706;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

input, textarea {
  font-family: inherit;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}
```

- [ ] **Step 8: 创建 src/App.tsx (主布局)**

```tsx
import { useState } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import ChatArea from './components/ChatArea/ChatArea'
import styles from './App.module.css'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Conversation {
  id: string
  title: string
  starred: boolean
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  const currentConversation = conversations.find(c => c.id === currentConversationId) || null

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const createNewChat = () => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      starred: false,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setConversations(prev => [newConv, ...prev])
    setCurrentConversationId(newConv.id)
  }

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c))
    )
  }

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (currentConversationId === id) {
      setCurrentConversationId(null)
    }
  }

  return (
    <div className={styles.app}>
      <Sidebar
        open={sidebarOpen}
        onToggle={toggleSidebar}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewChat={createNewChat}
        onUpdateConversation={updateConversation}
        onDeleteConversation={deleteConversation}
      />
      <ChatArea
        conversation={currentConversation}
        onUpdateConversation={updateConversation}
      />
    </div>
  )
}

export default App
```

- [ ] **Step 9: 创建 src/App.module.css**

```css
.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
```

- [ ] **Step 10: 安装依赖并验证项目运行**

Run: `npm install && npm run dev`
Expected: Vite dev server starts on port 5173

---

## Chunk 2: Sidebar 组件实现

**Files:**
- Create: `src/components/Sidebar/Sidebar.tsx`
- Create: `src/components/Sidebar/Sidebar.module.css`

- [ ] **Step 1: 创建 Sidebar 组件**

```tsx
import styles from './Sidebar.module.css'

interface Conversation {
  id: string
  title: string
  starred: boolean
  createdAt: Date
  updatedAt: Date
}

interface SidebarProps {
  open: boolean
  onToggle: () => void
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  onUpdateConversation: (id: string, updates: Partial<Conversation>) => void
  onDeleteConversation: (id: string) => void
}

export default function Sidebar({
  open,
  onToggle,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onUpdateConversation,
  onDeleteConversation,
}: SidebarProps) {
  const starredConversations = conversations.filter(c => c.starred)
  const recentConversations = conversations.filter(c => !c.starred)

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : styles.closed}`}>
      <div className={styles.header}>
        <button className={styles.toggleBtn} onClick={onToggle} title={open ? 'Close sidebar' : 'Open sidebar'}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="3" width="16" height="2" rx="1" />
            <rect x="2" y="9" width="16" height="2" rx="1" />
            <rect x="2" y="15" width="16" height="2" rx="1" />
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        <button className={styles.newChatBtn} onClick={onNewChat}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          New chat
        </button>

        {starredConversations.length > 0 && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Starred</h3>
            <ul className={styles.conversationList}>
              {starredConversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === currentConversationId}
                  onSelect={() => onSelectConversation(conv.id)}
                  onStar={() => onUpdateConversation(conv.id, { starred: false })}
                  onRename={(title) => onUpdateConversation(conv.id, { title })}
                  onDelete={() => onDeleteConversation(conv.id)}
                />
              ))}
            </ul>
          </section>
        )}

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent</h3>
          <ul className={styles.conversationList}>
            {recentConversations.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === currentConversationId}
                onSelect={() => onSelectConversation(conv.id)}
                onStar={() => onUpdateConversation(conv.id, { starred: true })}
                onRename={(title) => onUpdateConversation(conv.id, { title })}
                onDelete={() => onDeleteConversation(conv.id)}
              />
            ))}
          </ul>
        </section>
      </div>

      <div className={styles.footer}>
        <button className={styles.loginBtn}>
          <div className={styles.avatar}>U</div>
          <span>User</span>
        </button>
      </div>
    </aside>
  )
}

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onSelect: () => void
  onStar: () => void
  onRename: (title: string) => void
  onDelete: () => void
}

function ConversationItem({ conversation, isActive, onSelect, onStar, onRename, onDelete }: ConversationItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(conversation.title)

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename(editTitle.trim())
    }
    setIsEditing(false)
  }

  return (
    <li className={`${styles.conversationItem} ${isActive ? styles.active : ''}`}>
      {isEditing ? (
        <input
          className={styles.editInput}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          autoFocus
        />
      ) : (
        <button className={styles.conversationBtn} onClick={onSelect}>
          <span className={styles.conversationTitle}>{conversation.title}</span>
        </button>
      )}
      <div className={styles.conversationActions}>
        <button className={styles.actionBtn} onClick={onStar} title={conversation.starred ? 'Unstar' : 'Star'}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill={conversation.starred ? 'currentColor' : 'none'} stroke="currentColor">
            <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885 3.91 10.51l.59-3.44L2 4.635l3.455-.505L7 1z" />
          </svg>
        </button>
        <div className={styles.menuWrapper}>
          <button className={styles.actionBtn} onClick={() => setShowMenu(!showMenu)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <circle cx="7" cy="3" r="1.5" />
              <circle cx="7" cy="7" r="1.5" />
              <circle cx="7" cy="11" r="1.5" />
            </svg>
          </button>
          {showMenu && (
            <div className={styles.menu}>
              <button onClick={() => { setIsEditing(true); setShowMenu(false); }}>Rename</button>
              <button onClick={() => { onDelete(); setShowMenu(false); }}>Delete</button>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
```

- [ ] **Step 2: 创建 Sidebar.module.css**

```css
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease, transform 0.2s ease;
  overflow: hidden;
}

.sidebar.closed {
  width: 0;
  border-right: none;
}

.header {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  height: var(--header-height);
}

.toggleBtn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: background 0.15s;
}

.toggleBtn:hover {
  background: var(--bg-tertiary);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.newChatBtn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  transition: background 0.15s;
}

.newChatBtn:hover {
  background: var(--bg-tertiary);
}

.section {
  margin-top: 24px;
}

.sectionTitle {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 12px;
  margin-bottom: 8px;
}

.conversationList {
  list-style: none;
}

.conversationItem {
  display: flex;
  align-items: center;
  border-radius: 6px;
  margin-bottom: 2px;
  position: relative;
}

.conversationItem:hover {
  background: var(--bg-tertiary);
}

.conversationItem.active {
  background: var(--bg-tertiary);
}

.conversationBtn {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  text-align: left;
  min-width: 0;
}

.conversationTitle {
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.editInput {
  flex: 1;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid var(--accent-color);
  border-radius: 6px;
  background: var(--bg-primary);
  outline: none;
}

.conversationActions {
  display: none;
  align-items: center;
  gap: 2px;
  padding-right: 8px;
}

.conversationItem:hover .conversationActions {
  display: flex;
}

.actionBtn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--text-secondary);
  transition: color 0.15s, background 0.15s;
}

.actionBtn:hover {
  color: var(--text-primary);
  background: var(--bg-primary);
}

.menuWrapper {
  position: relative;
}

.menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 100;
  min-width: 120px;
}

.menu button {
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  font-size: 14px;
  color: var(--text-primary);
  transition: background 0.15s;
}

.menu button:hover {
  background: var(--bg-secondary);
}

.footer {
  padding: 12px;
  border-top: 1px solid var(--border-color);
}

.loginBtn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-primary);
  transition: background 0.15s;
}

.loginBtn:hover {
  background: var(--bg-tertiary);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}
```

---

## Chunk 3: ChatArea 组件实现

**Files:**
- Create: `src/components/ChatArea/ChatArea.tsx`
- Create: `src/components/ChatArea/ChatArea.module.css`
- Create: `src/components/Message/Message.tsx`
- Create: `src/components/Message/Message.module.css`

- [ ] **Step 1: 创建 Message 组件**

```tsx
import styles from './Message.module.css'

interface MessageProps {
  role: 'user' | 'assistant'
  content: string
}

export default function Message({ role, content }: MessageProps) {
  return (
    <div className={`${styles.message} ${role === 'user' ? styles.user : styles.assistant}`}>
      <div className={styles.avatar}>
        {role === 'assistant' ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12 6 6 0 010-12zm-1.5 3v4h3l-3.5 3.5L6 11V7h3.5z" />
          </svg>
        ) : (
          <span>U</span>
        )}
      </div>
      <div className={styles.content}>
        <p>{content}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 Message.module.css**

```css
.message {
  display: flex;
  gap: 16px;
  padding: 16px 24px;
  max-width: 800px;
  margin: 0 auto;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
}

.assistant .avatar {
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  color: white;
}

.user .avatar {
  background: var(--accent-color);
  color: white;
}

.content {
  flex: 1;
  min-width: 0;
}

.content p {
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.user .content p {
  text-align: right;
}
```

- [ ] **Step 3: 创建 ChatArea 组件**

```tsx
import { useState, useRef, useEffect } from 'react'
import Message from '../Message/Message'
import styles from './ChatArea.module.css'
import type { Conversation, Message as MessageType } from '../../App'

interface ChatAreaProps {
  conversation: Conversation | null
  onUpdateConversation: (id: string, updates: Partial<Conversation>) => void
}

export default function ChatArea({ conversation, onUpdateConversation }: ChatAreaProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const handleSend = () => {
    if (!input.trim() || !conversation) return

    const userMessage: MessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    const updatedMessages = [...conversation.messages, userMessage]
    onUpdateConversation(conversation.id, { messages: updatedMessages })
    setInput('')

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: MessageType = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `这是 AI 的回复：${input.trim()}`,
        timestamp: new Date(),
      }
      onUpdateConversation(conversation.id, {
        messages: [...updatedMessages, assistantMessage],
      })
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!conversation) {
    return (
      <main className={styles.chatArea}>
        <div className={styles.emptyState}>
          <div className={styles.logo}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="url(#gradient)" />
              <path d="M24 12v24M12 24h24" stroke="white" strokeWidth="4" strokeLinecap="round" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48">
                  <stop stopColor="#ff6b6b" />
                  <stop offset="1" stopColor="#feca57" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className={styles.emptyTitle}>AI Chat</h1>
          <p className={styles.emptySubtitle}>开始一段新的对话</p>
        </div>
        <div className={styles.inputWrapper}>
          <div className={styles.inputContainer}>
            <textarea
              className={styles.input}
              placeholder="输入消息..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim()}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3l7 7-7 7M3 10h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.chatArea}>
      <div className={styles.messages}>
        {conversation.messages.length === 0 ? (
          <div className={styles.welcome}>
            <h2>{conversation.title}</h2>
            <p>开始对话吧</p>
          </div>
        ) : (
          conversation.messages.map((msg) => (
            <Message key={msg.id} role={msg.role} content={msg.content} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputWrapper}>
        <div className={styles.inputContainer}>
          <textarea
            className={styles.input}
            placeholder="输入消息..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim()}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3l7 7-7 7M3 10h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: 创建 ChatArea.module.css**

```css
.chatArea {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0;
}

.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
}

.welcome h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.emptyState {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.logo {
  margin-bottom: 8px;
}

.emptyTitle {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.emptySubtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

.inputWrapper {
  padding: 16px 24px 24px;
}

.inputContainer {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition: border-color 0.15s;
}

.inputContainer:focus-within {
  border-color: var(--accent-color);
}

.input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  outline: none;
  min-height: 24px;
  max-height: 200px;
}

.input::placeholder {
  color: var(--text-secondary);
}

.sendBtn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  transition: background 0.15s, transform 0.15s;
  flex-shrink: 0;
}

.sendBtn:hover:not(:disabled) {
  background: #c5690a;
  transform: scale(1.05);
}

.sendBtn:disabled {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: not-allowed;
}
```

---

## Chunk 4: 测试验证

- [ ] **Step 1: 运行开发服务器**

Run: `npm run dev`
Expected: Vite dev server starts, no console errors

- [ ] **Step 2: 验证页面加载**

访问 http://localhost:5173，验证：
- 左侧边栏显示正确
- 包含 New chat 按钮
- 包含 Starred 和 Recent 区域
- 底部有登录按钮

- [ ] **Step 3: 验证新建对话**

点击 New chat，验证：
- 右侧出现欢迎信息
- 底部输入框可用
- 输入消息后按 Enter 或点击发送按钮

- [ ] **Step 4: 验证对话功能**

发送消息后，验证：
- 用户消息显示在右侧
- AI 回复显示在左侧
- 消息交替显示

- [ ] **Step 5: 验证边栏折叠**

点击边栏头部按钮，验证：
- 边栏可打开/关闭
- 动画平滑

- [ ] **Step 6: 验证对话操作**

在 Recent 区域-hover 对话，验证：
- star 按钮可见
- 菜单按钮可见
- 可以 star/unstar 对话
- 可以重命名对话
- 可以删除对话

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-18-claude-style-chat-ui.md`. Ready to execute?**
