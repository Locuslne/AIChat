import { useState, useRef, useEffect } from 'react'
import Message from '../Message/Message'
import styles from './ChatArea.module.css'
import type { Conversation } from '../../App'

// 聊天区域组件的属性接口
interface ChatAreaProps {
  conversation: Conversation | null
  onSendMessage: (content: string) => void
  isLoading: boolean
  error: string | null
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

/**
 * 聊天区域组件
 * 负责显示消息列表、输入框和处理消息发送
 */
export default function ChatArea({ conversation, onSendMessage, isLoading, error, sidebarOpen, onToggleSidebar }: ChatAreaProps) {
  // 输入框的内容
  const [input, setInput] = useState('')
  // 用于滚动到底部的引用
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 当消息列表或加载状态变化时，自动滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages, isLoading])

  // 处理发送消息
  const handleSend = () => {
    if (!input.trim() || isLoading) return
    onSendMessage(input.trim())
    setInput('')
  }

  // 处理键盘按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 按 Enter 键发送消息（Shift+Enter 换行）
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 获取最后一条消息
  const lastMessage = conversation?.messages[conversation.messages.length - 1]
  // 是否显示加载动画（正在加载且没有消息或最后一条是空的助手消息）
  const showLoadingDots = isLoading && (!lastMessage || lastMessage.role === 'assistant' && lastMessage.content === '')

  // 渲染聊天内容（消息列表和输入框）
  const renderContent = () => (
    <>
      {/* 消息列表区域 */}
      <div className={styles.messages}>
        <div className={styles.messageContainer}>
          {/* 空对话时显示欢迎信息 */}
          {conversation && conversation.messages.length === 0 ? (
            <div className={styles.welcome}>
              <h2>{conversation.title}</h2>
              <p>开始对话吧</p>
            </div>
          ) : (
            // 渲染消息列表
            conversation?.messages.map((msg) => (
              <Message key={msg.id} role={msg.role} content={msg.content} />
            ))
          )}
          {/* 加载动画 */}
          {showLoadingDots && (
            <div className={styles.loadingMessage}>
              <div className={styles.loadingDot} />
              <div className={styles.loadingDot} />
              <div className={styles.loadingDot} />
            </div>
          )}
          {/* 错误提示 */}
          {error && <div className={styles.error}>{error}</div>}
          {/* 滚动定位元素 */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入框区域 */}
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
          {/* 发送按钮 */}
          <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim() || isLoading}>
            {isLoading ? (
              // 加载中的旋转图标
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.loading}>
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="50" strokeDashoffset="20" />
              </svg>
            ) : (
              // 发送图标
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3l7 7-7 7M3 10h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  )

  // 如果没有选中的对话，显示空状态页面
  if (!conversation) {
    return (
      <main className={styles.chatArea}>
        {/* 侧边栏收起时显示打开按钮 */}
        {!sidebarOpen && (
          <button className={styles.toggleSidebarBtn} onClick={onToggleSidebar} title="Open sidebar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="2" y="3" width="16" height="2" rx="1" />
              <rect x="2" y="9" width="16" height="2" rx="1" />
              <rect x="2" y="15" width="16" height="2" rx="1" />
            </svg>
          </button>
        )}
        {/* 空状态内容：Logo 和欢迎信息 */}
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
        {renderContent()}
      </main>
    )
  }

  // 正常显示聊天界面
  return (
    <main className={styles.chatArea}>
      {!sidebarOpen && (
        <button className={styles.toggleSidebarBtn} onClick={onToggleSidebar} title="Open sidebar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="3" width="16" height="2" rx="1" />
            <rect x="2" y="9" width="16" height="2" rx="1" />
            <rect x="2" y="15" width="16" height="2" rx="1" />
          </svg>
        </button>
      )}
      {renderContent()}
    </main>
  )
}
