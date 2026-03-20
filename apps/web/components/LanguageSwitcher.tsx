'use client'

import { useLocale } from '../hooks/useLocale'
import type { Locale } from '../i18n/routing'

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en', label: 'English' },
]

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <div role="group" aria-label="Language switcher">
      {LOCALES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setLocale(value)}
          aria-pressed={locale === value}
          aria-current={locale === value ? 'true' : undefined}
          style={{
            fontWeight: locale === value ? 'bold' : 'normal',
            marginRight: '8px',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
