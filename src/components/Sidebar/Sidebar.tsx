import { useState } from 'react'
import styles from './Sidebar.module.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  starred: boolean
  messages: Message[]
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
