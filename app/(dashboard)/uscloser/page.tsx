'use client'
import { useEffect, useState } from 'react'

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const statusClass = (s: string) => 's-' + (s || '').toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

interface Item {
  id: string; produto: string; size: string | null; valor: number
  frete: number; imposto: number; custoTotal: number; dataCompra: string | null
  status: string; dataChegada: string | null; tracking: string | null; obs: string | null
}

const empty: Partial<Item> = { produto: '', size: '', valor: 0, frete: 0, imposto: 0, status: 'COMPRADO', tracking: '', obs: '' }

export default function USCLOSERPage() {
  const [data, setData] = useState<Item[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Partial<Item>>(empty)
  const [toast, setToast] = useState('')

  async function load() { setData(await fetch('/api/uscloser').then(r => r.json())) }
  useEffect(() => { load() }, [])
  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function save() {
    if (!form.produto) return alert('Produto obrigatório!')
    const url = form.id ? `/api/uscloser/${form.id}` : '/api/uscloser'
    await fetch(url, { method: form.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setModal(false); setForm(empty); showToast(form.id ? 'Atualizado!' : 'Import cadastrado!'); load()
  }

  async function del(id: string) {
    if (!confirm('Excluir?')) return
    await fetch(`/api/uscloser/${id}`, { method: 'DELETE' })
    showToast('Excluído!'); load()
  }

  async function mover() {
    const d = await fetch('/api/uscloser/mover', { method: 'POST' }).then(r => r.json())
    showToast(d.movidos > 0 ? `${d.movidos} produto(s) movido(s) para o Estoque!` : 'Nenhum produto com status EM ESTOQUE.')
    load()
  }

  const pendentes = data.filter(i => !['EM ESTOQUE', 'MOVIDO'].includes(i.status)).length

  return (
    <div>
      {toast && <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50">{toast}</div>}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">USCLOSER</h1>
          <p className="text-sm text-gray-500">{data.length} imports · {pendentes} aguardando</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-success" onClick={mover}>↓ Mover EM ESTOQUE para Estoque</button>
          <button className="btn btn-primary" onClick={() => { setForm(empty); setModal(true) }}>+ Novo import</button>
        </div>
      </div>
      <div className="card">
        <table>
          <thead><tr>
            <th>Produto</th><th>Size</th><th>Valor</th><th>Frete</th><th>Imposto</th>
            <th>Custo Total</th><th>Data</th><th>Status</th><th>Tracking</th><th></th>
          </tr></thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={10} className="text-center text-gray-400 py-8">Nenhum import ainda</td></tr>
            ) : data.map(item => (
              <tr key={item.id}>
                <td className="font-medium">{item.produto}</td>
                <td>{item.size || '—'}</td>
                <td>{brl(item.valor)}</td>
                <td>{item.frete ? brl(item.frete) : '—'}</td>
                <td>{item.imposto ? brl(item.imposto) : '—'}</td>
                <td className="font-semibold">{brl(item.custoTotal)}</td>
                <td className="text-gray-400 text-xs">{item.dataCompra ? new Date(item.dataCompra).toLocaleDateString('pt-BR') : '—'}</td>
                <td><span className={`status-pill ${statusClass(item.status)}`}>{item.status}</span></td>
                <td className="text-gray-400 text-xs font-mono">{item.tracking || '—'}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-sm" onClick={() => { setForm(item); setModal(true) }}>✏️</button>
                    <button className="btn btn-sm btn-danger" onClick={() => del(item.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold">{form.id ? 'Editar import' : 'Novo import USCLOSER'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Produto *</label><input className="form-input" value={form.produto || ''} onChange={e => setForm({ ...form, produto: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Size</label><input className="form-input" value={form.size || ''} onChange={e => setForm({ ...form, size: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$) *</label><input type="number" className="form-input" value={form.valor || ''} onChange={e => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Frete (R$)</label><input type="number" className="form-input" value={form.frete || ''} onChange={e => setForm({ ...form, frete: parseFloat(e.target.value) || 0 })} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Imposto (R$)</label><input type="number" className="form-input" value={form.imposto || ''} onChange={e => setForm({ ...form, imposto: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Data compra</label><input type="date" className="form-input" value={form.dataCompra?.split('T')[0] || ''} onChange={e => setForm({ ...form, dataCompra: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select className="form-input" value={form.status || 'COMPRADO'} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>COMPRADO</option><option>TRÂNSITO EUA</option><option>ENVIADO BR</option><option>TRÂNSITO BR</option><option>EM ESTOQUE</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Data chegada</label><input type="date" className="form-input" value={form.dataChegada?.split('T')[0] || ''} onChange={e => setForm({ ...form, dataChegada: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Tracking</label><input className="form-input" value={form.tracking || ''} onChange={e => setForm({ ...form, tracking: e.target.value })} /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Obs</label><input className="form-input" value={form.obs || ''} onChange={e => setForm({ ...form, obs: e.target.value })} /></div>
              <button className="btn btn-primary w-full justify-center mt-2" onClick={save}>{form.id ? 'Salvar' : 'Cadastrar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
