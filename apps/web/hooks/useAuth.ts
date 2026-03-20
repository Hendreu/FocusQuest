import { useAuthStore } from '../lib/auth/auth-store'
import type { AuthUser } from '../lib/auth/auth-store'

interface UseAuthReturn {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, accessToken: string) => void
  clearAuth: () => void
}

export function useAuth(): UseAuthReturn {
  const { user, accessToken, setAuth, clearAuth } = useAuthStore()

  return {
    user,
    accessToken,
    isAuthenticated: user !== null,
    setAuth,
    clearAuth,
  }
}
