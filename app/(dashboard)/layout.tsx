'use client'
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/estoque', label: 'Estoque', icon: '📦' },
  { href: '/vendas', label: 'Vendas', icon: '💰' },
  { href: '/uscloser', label: 'USCLOSER', icon: '✈️' },
  { href: '/cesar', label: 'CESAR', icon: '✈️' },
  { href: '/compras-br', label: 'Compras BR', icon: '🛒' },
  { href: '/devolucoes', label: 'Devoluções', icon: '🔄' },
  { href: '/faturamento', label: 'Faturamento', icon: '📈' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!session) return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="sidebar flex flex-col">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="text-white font-semibold text-sm flex items-center gap-2">
            <span className="text-lg">📊</span>
            Sistema de Vendas
          </div>
        </div>
        <nav className="flex-1 py-2">
          <div className="px-4 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider mt-2">
            Menu
          </div>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/40 mb-2">{session.user?.email}</div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            Sair →
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
