'use client'

import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushSubscription(token?: string) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setIsSubscribed(sub !== null)
        })
      })
    }
  }, [])

  const subscribe = async () => {
    if (!token || !isSupported) return

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const keyRes = await fetch(`${API_URL}/notifications/push/vapid-key`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const { publicKey } = await keyRes.json()

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })

      await fetch(`${API_URL}/notifications/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subscription: sub })
      })

      setIsSubscribed(true)
    } catch (err) {
      console.error('Failed to subscribe to push', err)
    }
  }

  const unsubscribe = async () => {
    if (!token || !isSupported) return

    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      
      if (sub) {
        await sub.unsubscribe()
        await fetch(`${API_URL}/notifications/push/unsubscribe`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      
      setIsSubscribed(false)
    } catch (err) {
      console.error('Failed to unsubscribe from push', err)
    }
  }

  return { isSupported, isSubscribed, subscribe, unsubscribe }
}
