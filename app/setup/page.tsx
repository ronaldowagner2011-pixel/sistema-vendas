'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.ok) {
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } else {
      setMsg(data.error || 'Erro ao criar usuário')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="text-3xl mb-2">🔧</div>
            <h1 className="text-xl font-bold text-gray-900">Configuração inicial</h1>
            <p className="text-sm text-gray-500 mt-1">Crie sua conta de administrador</p>
          </div>
          {done ? (
            <div className="text-center text-green-600 font-medium">
              ✅ Conta criada! Redirecionando para o login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input type="password" className="form-input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" required />
              </div>
              {msg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{msg}</p>}
              <button type="submit" className="btn btn-primary w-full justify-center py-2.5">
                Criar conta e entrar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
