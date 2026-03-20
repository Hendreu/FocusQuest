'use client'

import { useLocale as useNextIntlLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '../i18n/navigation'
import type { Locale } from '../i18n/routing'

const LOCALE_STORAGE_KEY = 'focusquest:locale'

export function useLocale() {
  const locale = useNextIntlLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations()

  const setLocale = (newLocale: Locale) => {
    // Persist preference in localStorage for unauthenticated users
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    }

    // Navigate to the same path with the new locale
    router.replace(pathname, { locale: newLocale })
  }

  return { locale, setLocale, t }
}
