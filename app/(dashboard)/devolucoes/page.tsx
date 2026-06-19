'use client'
import { useEffect, useState } from 'react'

const statusClass = (s: string) => 's-' + (s || '').toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

interface Dev {
  id: string; produto: string; size: string | null; canal: string | null
  numPedido: string | null; motivo: string | null; status: string; data: string | null
}

const empty = { produto: '', size: '', canal: 'WhatsApp', numPedido: '', motivo: '', data: '' }

export default function DevolucoesPage() {
  const [data, setData] = useState<Dev[]>([])
  const [form, setForm] = useState(empty)
  const [toast, setToast] = useState('')

  async function load() { setData(await fetch('/api/devolucoes').then(r => r.json())) }
  useEffect(() => { load() }, [])
  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function save() {
    if (!form.produto) return alert('Produto obrigatório!')
    if (!form.motivo) return alert('Motivo obrigatório!')
    await fetch('/api/devolucoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setForm(empty); showToast('Devolução registrada!'); load()
  }

  async function processar(id: string) {
    if (!confirm('Processar esta devolução? O produto voltará ao estoque.')) return
    await fetch(`/api/devolucoes/${id}/processar`, { method: 'POST' })
    showToast('Produto devolvido ao estoque!'); load()
  }

  return (
    <div>
      {toast && <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50">{toast}</div>}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Devoluções</h1>
        <p className="text-sm text-gray-500">Produto volta automaticamente ao estoque</p>
      </div>

      {/* Formulário */}
      <div className="card p-5 mb-6">
        <div className="font-semibold text-sm text-gray-700 mb-4">🔄 Nova devolução</div>
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Produto *</label><input className="form-input" value={form.produto} onChange={e => setForm({ ...form, produto: e.target.value })} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Size</label><input className="form-input" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Canal</label>
            <select className="form-input" value={form.canal} onChange={e => setForm({ ...form, canal: e.target.value })}>
              <option>WhatsApp</option><option>Droper</option><option>Pineapple</option>
            </select>
          </div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Nº Pedido</label><input className="form-input" value={form.numPedido} onChange={e => setForm({ ...form, numPedido: e.target.value })} placeholder="DRP-00000" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Motivo *</label><input className="form-input" value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} placeholder="Ex: Tamanho errado, defeito..." /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Data</label><input type="date" className="form-input" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></div>
        </div>
        <button className="btn btn-danger" onClick={save}>🔄 Registrar devolução</button>
      </div>

      {/* Lista */}
      <div className="card">
        <table>
          <thead><tr>
            <th>Produto</th><th>Size</th><th>Canal</th><th>Nº Pedido</th><th>Motivo</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-gray-400 py-8">Nenhuma devolução ainda</td></tr>
            ) : data.map(d => (
              <tr key={d.id}>
                <td className="font-medium">{d.produto}</td>
                <td>{d.size || '—'}</td>
                <td>{d.canal || '—'}</td>
                <td className="text-gray-400 text-xs font-mono">{d.numPedido || '—'}</td>
                <td>{d.motivo || '—'}</td>
                <td><span className={`status-pill ${statusClass(d.status)}`}>{d.status}</span></td>
                <td>
                  {d.status === 'PENDENTE' && (
                    <button className="btn btn-sm btn-success" onClick={() => processar(d.id)}>✅ Processar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
