import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['pt-BR', 'en'] as const,
  defaultLocale: 'pt-BR',
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]
