'use client'

import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import { useAuth } from '../../hooks/useAuth'
import { NotificationItem } from './NotificationItem'

export function NotificationCenter() {
  const { accessToken } = useAuth()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(accessToken ?? undefined)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary, #111)'
        }}
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: 'red',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            borderRadius: '10px',
            padding: '2px 6px',
            minWidth: '16px',
            textAlign: 'center'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          width: '320px',
          maxHeight: '400px',
          background: 'var(--bg-primary, #fff)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color, #eaeaea)'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary, #111)' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllRead()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary, #0070f3)',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted, #666)', margin: 0, fontSize: '14px' }}>
                No notifications yet.
              </p>
            ) : (
              notifications.map(notif => (
                <NotificationItem 
                  key={notif.id} 
                  notification={notif} 
                  onRead={() => markRead(notif.id)} 
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
