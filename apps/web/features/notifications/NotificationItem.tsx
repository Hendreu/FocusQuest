'use client'

import { AppNotification } from '../../hooks/useNotifications'
import { useRouter } from 'next/navigation'

interface Props {
  notification: AppNotification
  onRead: () => void
}

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function NotificationItem({ notification, onRead }: Props) {
  const router = useRouter()

  const isUnread = !notification.readAt

  const handleClick = () => {
    if (isUnread) onRead()
    
    // Default navigation per type
    if (notification.type === 'badge_earned' || notification.type === 'level_up') {
      router.push('/profile')
    } else if (notification.type === 'institution_invite') {
      router.push('/settings')
    } else {
      router.push('/dashboard')
    }
  }

  let icon = '🔔'
  let message = 'You have a new notification'

  switch (notification.type) {
    case 'badge_earned':
      icon = '🏅'
      message = `You earned the ${notification.payload?.badge_name} badge!`
      break
    case 'level_up':
      icon = '⬆️'
      message = `You reached level ${notification.payload?.new_level}!`
      break
    case 'streak_reminder':
      icon = '🔥'
      message = `Don't lose your ${notification.payload?.current_streak}-day streak! Complete a lesson.`
      break
    case 'institution_invite':
      icon = '📧'
      message = `You were invited to join ${notification.payload?.institution_name}.`
      break
    case 'quest_completed':
      icon = '🎯'
      message = `You completed the quest: ${notification.payload?.quest_title}`
      break
  }

  return (
    <div 
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        padding: '12px 16px',
        gap: '12px',
        cursor: 'pointer',
        background: isUnread ? 'var(--bg-accent, #f0f7ff)' : 'transparent',
        borderBottom: '1px solid var(--border-color, #eaeaea)',
        transition: 'background 0.2s'
      }}
    >
      <div style={{ fontSize: '20px' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary, #111)' }}>
          {message}
        </p>
        <span style={{ fontSize: '12px', color: 'var(--text-muted, #666)' }}>
          {timeAgo(notification.createdAt)}
        </span>
      </div>
      {isUnread && (
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--color-primary, #0070f3)',
          marginTop: '6px'
        }} />
      )}
    </div>
  )
}
