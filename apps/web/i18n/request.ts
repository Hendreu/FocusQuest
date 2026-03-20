import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Validate locale, fallback to default
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    // messages live in packages/i18n/messages/ (monorepo root relative to apps/web is ../..)
    messages: (await import(`../../../packages/i18n/messages/${locale}.json`)).default,
  }
})
