import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import ChatArea from './components/ChatArea/ChatArea'
import styles from './App.module.css'
import { sendToLLMStream } from './lib/api'

const STORAGE_KEY = 'ai-chat-conversations'

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

function saveConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch (e) {
    console.warn('Failed to save conversations to localStorage:', e)
  }
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    saveConversations(conversations)
  }, [conversations])

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

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

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

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    const assistantMessageId = crypto.randomUUID()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }

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

    const currentConv = conversations.find(c => c.id === targetConvId) || {
      id: targetConvId,
      title: 'New Chat',
      starred: false,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Conversation

    const llmMessages = [...currentConv.messages, userMessage].map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    try {
      let fullContent = ''
      await sendToLLMStream(llmMessages, (chunk) => {
        fullContent += chunk
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
