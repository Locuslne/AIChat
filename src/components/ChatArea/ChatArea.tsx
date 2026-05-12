import { useState, useRef, useEffect } from 'react'
import Message from '../Message/Message'
import styles from './ChatArea.module.css'
import type { Conversation } from '../../App'

interface ChatAreaProps {
  conversation: Conversation | null
  onSendMessage: (content: string) => void
  isLoading: boolean
  error: string | null
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function ChatArea({ conversation, onSendMessage, isLoading, error, sidebarOpen, onToggleSidebar }: ChatAreaProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages, isLoading])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    onSendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const lastMessage = conversation?.messages[conversation.messages.length - 1]
  const showLoadingDots = isLoading && (!lastMessage || lastMessage.role === 'assistant' && lastMessage.content === '')

  const renderContent = () => (
    <>
      <div className={styles.messages}>
        <div className={styles.messageContainer}>
          {conversation && conversation.messages.length === 0 ? (
            <div className={styles.welcome}>
              <h2>{conversation.title}</h2>
              <p>开始对话吧</p>
            </div>
          ) : (
            conversation?.messages.map((msg) => (
              <Message key={msg.id} role={msg.role} content={msg.content} />
            ))
          )}
          {showLoadingDots && (
            <div className={styles.loadingMessage}>
              <div className={styles.loadingDot} />
              <div className={styles.loadingDot} />
              <div className={styles.loadingDot} />
            </div>
          )}
          {error && <div className={styles.error}>{error}</div>}
          <div ref={messagesEndRef} />
        </div>
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
          <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim() || isLoading}>
            {isLoading ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.loading}>
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="50" strokeDashoffset="20" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3l7 7-7 7M3 10h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  )

  if (!conversation) {
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
