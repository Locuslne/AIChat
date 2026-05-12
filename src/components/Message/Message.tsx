import styles from './Message.module.css'

interface MessageProps {
  role: 'user' | 'assistant'
  content: string
}

export default function Message({ role, content }: MessageProps) {
  return (
    <div className={`${styles.message} ${role === 'user' ? styles.user : styles.assistant}`}>
      <div className={styles.bubble}>
        <p>{content}</p>
      </div>
    </div>
  )
}
