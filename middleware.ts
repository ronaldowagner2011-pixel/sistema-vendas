import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' },
})

export const config = {
  matcher: ['/((?!login|setup|api/setup|_next|favicon.ico).*)'],
}
