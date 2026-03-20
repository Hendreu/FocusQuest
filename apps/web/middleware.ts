import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except:
  // - _next/static, _next/image, favicon.ico
  // - Files with extensions (e.g. .png, .svg, .ico)
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
