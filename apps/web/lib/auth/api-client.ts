import { useAuthStore } from './auth-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type RequestOptions = RequestInit & { _retry?: boolean }

/**
 * apiClient — typed fetch wrapper
 * - Injects Authorization: Bearer <accessToken> automatically
 * - On 401: attempts refresh → retries once → on second 401 clears auth and throws
 */
export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { accessToken, setAuth, clearAuth } = useAuthStore.getState()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const url = path.startsWith('http') ? path : `${API_URL}${path}`
  const res = await fetch(url, { ...options, headers, credentials: 'include' })

  if (res.status === 401 && !options._retry) {
    // Attempt refresh
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (refreshRes.ok) {
      const refreshData = (await refreshRes.json()) as { accessToken: string }

      // Fetch updated user
      const meRes = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${refreshData.accessToken}` },
        credentials: 'include',
      })

      if (meRes.ok) {
        const meData = (await meRes.json()) as { user: Parameters<typeof setAuth>[0] }
        setAuth(meData.user, refreshData.accessToken)
      }

      // Retry original request with new token
      return apiClient<T>(path, { ...options, _retry: true })
    } else {
      // Refresh failed — user must log in again
      clearAuth()
      if (typeof window !== 'undefined') {
        window.location.href = '/pt-BR/login'
      }
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const errorData = (await res.json().catch(() => ({}))) as { error?: string; code?: string }
    throw Object.assign(new Error(errorData.error ?? res.statusText), {
      status: res.status,
      code: errorData.code,
    })
  }

  return res.json() as Promise<T>
}
