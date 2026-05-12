import styles from './Message.module.css'

// 消息组件的属性接口
interface MessageProps {
  role: 'user' | 'assistant'
  content: string
}

/**
 * 消息气泡组件
 * 根据角色（用户/助手）显示不同的样式
 * @param role 消息发送者的角色
 * @param content 消息内容
 */
export default function Message({ role, content }: MessageProps) {
  return (
    <div className={`${styles.message} ${role === 'user' ? styles.user : styles.assistant}`}>
      <div className={styles.bubble}>
        <p>{content}</p>
      </div>
    </div>
  )
}
