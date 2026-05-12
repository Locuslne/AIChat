import { useState } from 'react'
import styles from './Sidebar.module.css'

// 消息接口
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// 对话接口
interface Conversation {
  id: string
  title: string
  starred: boolean
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

// 侧边栏组件的属性接口
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

/**
 * 侧边栏组件
 * 显示对话列表，包括收藏的对话和最近的对话
 */
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
  // 筛选出收藏的对话
  const starredConversations = conversations.filter(c => c.starred)
  // 筛选出未收藏的对话（最近的对话）
  const recentConversations = conversations.filter(c => !c.starred)

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : styles.closed}`}>
      {/* 头部区域：包含切换侧边栏的按钮 */}
      <div className={styles.header}>
        <button className={styles.toggleBtn} onClick={onToggle} title={open ? 'Close sidebar' : 'Open sidebar'}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="3" width="16" height="2" rx="1" />
            <rect x="2" y="9" width="16" height="2" rx="1" />
            <rect x="2" y="15" width="16" height="2" rx="1" />
          </svg>
        </button>
      </div>

      {/* 内容区域：包含新建对话按钮和对话列表 */}
      <div className={styles.content}>
        {/* 新建对话按钮 */}
        <button className={styles.newChatBtn} onClick={onNewChat}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          New chat
        </button>

        {/* 收藏的对话列表 */}
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

        {/* 最近的对话列表 */}
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

      {/* 底部区域：用户信息 */}
      <div className={styles.footer}>
        <button className={styles.loginBtn}>
          <div className={styles.avatar}>U</div>
          <span>User</span>
        </button>
      </div>
    </aside>
  )
}

// 对话列表项组件的属性接口
interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onSelect: () => void
  onStar: () => void
  onRename: (title: string) => void
  onDelete: () => void
}

/**
 * 对话列表项组件
 * 显示单个对话的信息，支持收藏、重命名和删除操作
 */
function ConversationItem({ conversation, isActive, onSelect, onStar, onRename, onDelete }: ConversationItemProps) {
  // 是否显示操作菜单
  const [showMenu, setShowMenu] = useState(false)
  // 是否处于编辑标题模式
  const [isEditing, setIsEditing] = useState(false)
  // 编辑时的标题内容
  const [editTitle, setEditTitle] = useState(conversation.title)

  // 处理重命名确认
  const handleRename = () => {
    // 如果新标题有效且与原标题不同，则执行重命名
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename(editTitle.trim())
    }
    setIsEditing(false)
  }

  return (
    <li className={`${styles.conversationItem} ${isActive ? styles.active : ''}`}>
      {/* 如果处于编辑模式，显示输入框；否则显示标题按钮 */}
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

      {/* 操作按钮区域：收藏和更多菜单 */}
      <div className={styles.conversationActions}>
        {/* 收藏/取消收藏按钮 */}
        <button className={styles.actionBtn} onClick={onStar} title={conversation.starred ? 'Unstar' : 'Star'}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill={conversation.starred ? 'currentColor' : 'none'} stroke="currentColor">
            <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885 3.91 10.51l.59-3.44L2 4.635l3.455-.505L7 1z" />
          </svg>
        </button>

        {/* 更多操作菜单 */}
        <div className={styles.menuWrapper}>
          <button className={styles.actionBtn} onClick={() => setShowMenu(!showMenu)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <circle cx="7" cy="3" r="1.5" />
              <circle cx="7" cy="7" r="1.5" />
              <circle cx="7" cy="11" r="1.5" />
            </svg>
          </button>

          {/* 下拉菜单 */}
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
