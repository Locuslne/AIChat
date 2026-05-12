import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import ChatArea from './components/ChatArea/ChatArea'
import styles from './App.module.css'
import { sendToLLMStream } from './lib/api'

// localStorage 中存储对话数据的键名
const STORAGE_KEY = 'ai-chat-conversations'

// 消息接口，定义消息的结构
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// 对话接口，定义对话的结构
export interface Conversation {
  id: string
  title: string
  starred: boolean
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

/**
 * 从 localStorage 加载保存的对话列表
 * @returns 对话数组，如果加载失败则返回空数组
 */
function loadConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((c: Conversation) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
        messages: c.messages.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }))
    }
  } catch (e) {
    console.warn('Failed to load conversations from localStorage:', e)
  }
  return []
}

/**
 * 将对话列表保存到 localStorage
 * @param conversations 要保存的对话数组
 */
function saveConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch (e) {
    console.warn('Failed to save conversations to localStorage:', e)
  }
}

/**
 * 主应用组件
 */
function App() {
  // 侧边栏是否展开
  const [sidebarOpen, setSidebarOpen] = useState(true)
  // 所有对话列表
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations)
  // 当前选中的对话 ID
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  // 是否正在等待 AI 响应
  const [isLoading, setIsLoading] = useState(false)
  // 错误信息
  const [error, setError] = useState<string | null>(null)

  // 当对话列表变化时，自动保存到 localStorage
  useEffect(() => {
    saveConversations(conversations)
  }, [conversations])

  // 获取当前选中的对话对象
  const currentConversation = conversations.find(c => c.id === currentConversationId) || null

  // 切换侧边栏展开/收起状态
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  // 创建新的对话
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

  // 更新指定对话的信息
  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c))
    )
  }

  // 删除指定对话
  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    // 如果删除的是当前选中的对话，则清空选中状态
    if (currentConversationId === id) {
      setCurrentConversationId(null)
    }
  }

  // 发送消息给 AI 并处理流式响应
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    // 如果没有选中的对话，创建一个新的
    let targetConvId = currentConversationId
    if (!targetConvId) {
      const newConv: Conversation = {
        id: crypto.randomUUID(),
        title: 'New Chat',
        starred: false,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setConversations(prev => [newConv, ...prev])
      targetConvId = newConv.id
      setCurrentConversationId(targetConvId)
    }

    // 创建用户消息对象
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    // 创建 AI 助手消息对象（初始内容为空，用于后续流式更新）
    const assistantMessageId = crypto.randomUUID()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }

    // 将用户消息和助手消息添加到对话中
    setConversations(prev => prev.map(c => {
      if (c.id === targetConvId) {
        return {
          ...c,
          messages: [...c.messages, userMessage, assistantMessage],
          updatedAt: new Date(),
        }
      }
      return c
    }))

    // 获取当前对话的完整消息历史（用于发送给 API）
    const currentConv = conversations.find(c => c.id === targetConvId) || {
      id: targetConvId,
      title: 'New Chat',
      starred: false,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Conversation

    // 转换消息格式以适配 API
    const llmMessages = [...currentConv.messages, userMessage].map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    try {
      // 使用流式方式发送消息并接收响应
      let fullContent = ''
      await sendToLLMStream(llmMessages, (chunk) => {
        fullContent += chunk
        // 实时更新 AI 消息内容
        setConversations(prev => prev.map(c => {
          if (c.id === targetConvId) {
            return {
              ...c,
              messages: c.messages.map(m =>
                m.id === assistantMessageId ? { ...m, content: fullContent } : m
              ),
            }
          }
          return c
        }))
      })
    } catch (err) {
      // 处理错误：显示错误信息并移除失败的 AI 消息
      setError(err instanceof Error ? err.message : '发送失败')
      setConversations(prev => prev.map(c => {
        if (c.id === targetConvId) {
          return {
            ...c,
            messages: c.messages.filter(m => m.id !== assistantMessageId),
          }
        }
        return c
      }))
    } finally {
      setIsLoading(false)
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
        onSendMessage={sendMessage}
        isLoading={isLoading}
        error={error}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />
    </div>
  )
}

export default App
