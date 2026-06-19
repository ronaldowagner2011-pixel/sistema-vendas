'use client'
import { useEffect, useState } from 'react'

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const statusClass = (s: string) => 's-' + (s || '').toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

interface Item {
  id: string; sku: string | null; produto: string; size: string | null
  custo: number; localizacao: string; status: string
  dataEntrada: string | null; obs: string | null
}

const empty: Partial<Item> = { sku: '', produto: '', size: '', custo: 0, localizacao: 'Casa', status: 'EM ESTOQUE', obs: '' }

export default function EstoquePage() {
  const [data, setData] = useState<Item[]>([])
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Partial<Item>>(empty)
  const [toast, setToast] = useState('')

  async function load() {
    const params = new URLSearchParams()
    if (busca) params.set('busca', busca)
    if (status) params.set('status', status)
    const r = await fetch('/api/estoque?' + params)
    setData(await r.json())
  }

  useEffect(() => { load() }, [busca, status])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function save() {
    const url = form.id ? `/api/estoque/${form.id}` : '/api/estoque'
    const method = form.id ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setModal(false)
    setForm(empty)
    showToast(form.id ? 'Item atualizado!' : 'Item adicionado!')
    load()
  }

  async function del(id: string) {
    if (!confirm('Excluir este item?')) return
    await fetch(`/api/estoque/${id}`, { method: 'DELETE' })
    showToast('Item excluído!')
    load()
  }

  function edit(item: Item) {
    setForm(item)
    setModal(true)
  }

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Estoque</h1>
          <p className="text-sm text-gray-500">{data.length} itens encontrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(empty); setModal(true) }}>
          + Adicionar
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <input className="form-input" style={{ width: 240 }} placeholder="Buscar produto ou SKU..." value={busca} onChange={e => setBusca(e.target.value)} />
        <select className="form-input" style={{ width: 160 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Todos status</option>
          <option>EM ESTOQUE</option>
          <option>VENDIDO</option>
          <option>RESERVADO</option>
        </select>
      </div>

      <div className="card">
        <table>
          <thead><tr>
            <th>SKU</th><th>Produto</th><th>Size</th><th>Custo</th>
            <th>Localização</th><th>Status</th><th>Data Entrada</th><th></th>
          </tr></thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-gray-400 py-8">Nenhum item encontrado</td></tr>
            ) : data.map(item => (
              <tr key={item.id}>
                <td className="text-gray-400 text-xs font-mono">{item.sku || '—'}</td>
                <td className="font-medium">{item.produto}</td>
                <td>{item.size || '—'}</td>
                <td>{brl(item.custo)}</td>
                <td><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">{item.localizacao}</span></td>
                <td><span className={`status-pill ${statusClass(item.status)}`}>{item.status}</span></td>
                <td className="text-gray-400 text-xs">{item.dataEntrada ? new Date(item.dataEntrada).toLocaleDateString('pt-BR') : '—'}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-sm" onClick={() => edit(item)}>✏️</button>
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
              <h2 className="text-base font-bold">{form.id ? 'Editar item' : 'Adicionar ao estoque'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                  <input className="form-input" value={form.sku || ''} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="Ex: NK-VM-41" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
                  <input className="form-input" value={form.size || ''} onChange={e => setForm({ ...form, size: e.target.value })} placeholder="41, G, U..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Produto *</label>
                <input className="form-input" value={form.produto || ''} onChange={e => setForm({ ...form, produto: e.target.value })} placeholder="Nome do produto" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Custo (R$)</label>
                  <input type="number" className="form-input" value={form.custo || ''} onChange={e => setForm({ ...form, custo: parseFloat(e.target.value) })} placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Localização</label>
                  <select className="form-input" value={form.localizacao || 'Casa'} onChange={e => setForm({ ...form, localizacao: e.target.value })}>
                    <option>Casa</option><option>Pineapple</option><option>Alê</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select className="form-input" value={form.status || 'EM ESTOQUE'} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>EM ESTOQUE</option><option>VENDIDO</option><option>RESERVADO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Data entrada</label>
                  <input type="date" className="form-input" value={form.dataEntrada?.split('T')[0] || ''} onChange={e => setForm({ ...form, dataEntrada: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Obs</label>
                <input className="form-input" value={form.obs || ''} onChange={e => setForm({ ...form, obs: e.target.value })} placeholder="Opcional" />
              </div>
              <button className="btn btn-primary w-full justify-center mt-2" onClick={save}>
                {form.id ? 'Salvar alterações' : 'Adicionar ao estoque'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
