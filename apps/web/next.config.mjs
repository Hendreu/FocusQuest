import createNextIntlPlugin from 'next-intl/plugin'
import withSerwistInit from '@serwist/next'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const withSerwist = withSerwistInit({
  swSrc: 'sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

export default withSerwist(withNextIntl(nextConfig))
