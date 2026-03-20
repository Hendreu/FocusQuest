'use client'

import { useState, useEffect, useCallback } from 'react'

export interface AppNotification {
  id: string
  type: string
  payload: any
  readAt: string | null
  createdAt: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export function useNotifications(token?: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const getToggles = () => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem('focusquest_notif_toggles')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  }

  const isTypeEnabled = (type: string) => {
    const toggles = getToggles()
    if (!toggles) return true
    if (toggles[type] === false) return false
    return true
  }

  const fetchNotifications = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const filtered = data.notifications.filter((n: AppNotification) => isTypeEnabled(n.type))
        setNotifications(filtered)
        setUnreadCount(filtered.filter((n: AppNotification) => !n.readAt).length)
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }, [token])

  useEffect(() => {
    fetchNotifications()

    if (!token) return

    const eventSource = new EventSource(`${API_URL}/notifications/stream?token=${token}`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'ping') return
        
        if (!isTypeEnabled(data.type)) return

        setNotifications(prev => [data, ...prev])
        setUnreadCount(prev => prev + 1)
      } catch (err) {
        console.error('Failed to parse SSE message', err)
      }
    }

    eventSource.onerror = () => {
      console.error('SSE connection error')
      eventSource.close()
    }

    // Fallback polling
    const fallbackPoll = setInterval(fetchNotifications, 30000)

    return () => {
      eventSource.close()
      clearInterval(fallbackPoll)
    }
  }, [token, fetchNotifications])

  const markRead = async (id: string) => {
    if (!token) return
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark read', err)
    }
  }

  const markAllRead = async () => {
    if (!token) return
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all read', err)
    }
  }

  const deleteNotification = async (id: string) => {
    if (!token) return
    try {
      await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => {
        const n = prev.find(x => x.id === id)
        if (n && !n.readAt) setUnreadCount(c => Math.max(0, c - 1))
        return prev.filter(x => x.id !== id)
      })
    } catch (err) {
      console.error('Failed to delete notification', err)
    }
  }

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotification
  }
}
