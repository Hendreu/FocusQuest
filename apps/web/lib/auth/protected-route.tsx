'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from './auth-store'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * ProtectedRoute — wraps a page/component that requires authentication.
 * Redirects to /[locale]/login if the user has no auth state.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'pt-BR'

  useEffect(() => {
    if (!user) {
      router.replace(`/${locale}/login`)
    }
  }, [user, locale, router])

  if (!user) return null

  return <>{children}</>
}
