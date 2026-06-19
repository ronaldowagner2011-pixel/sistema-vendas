'use client'
import { useEffect, useState } from 'react'

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const statusClass = (s: string) => 's-' + (s || '').toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

interface Item {
  id: string; loja: string | null; produto: string; size: string | null
  valor: number; formaPgto: string | null; dataCompra: string | null
  status: string; dataChegada: string | null; obs: string | null
}

const empty: Partial<Item> = { loja: '', produto: '', size: '', valor: 0, formaPgto: 'PIX', status: 'AGUARDANDO', obs: '' }

export default function ComprasBRPage() {
  const [data, setData] = useState<Item[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Partial<Item>>(empty)
  const [toast, setToast] = useState('')

  async function load() { setData(await fetch('/api/compras-br').then(r => r.json())) }
  useEffect(() => { load() }, [])
  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function save() {
    if (!form.produto) return alert('Produto obrigatório!')
    const url = form.id ? `/api/compras-br/${form.id}` : '/api/compras-br'
    await fetch(url, { method: form.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setModal(false); setForm(empty); showToast(form.id ? 'Atualizado!' : 'Compra cadastrada!'); load()
  }

  async function del(id: string) {
    if (!confirm('Excluir?')) return
    await fetch(`/api/compras-br/${id}`, { method: 'DELETE' })
    showToast('Excluído!'); load()
  }

  async function mover() {
    const d = await fetch('/api/compras-br/mover', { method: 'POST' }).then(r => r.json())
    showToast(d.movidos > 0 ? `${d.movidos} produto(s) movido(s) para o Estoque!` : 'Nenhum produto com status EM ESTOQUE.')
    load()
  }

  return (
    <div>
      {toast && <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50">{toast}</div>}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Compras BR</h1>
          <p className="text-sm text-gray-500">{data.length} compras registradas</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-success" onClick={mover}>↓ Mover EM ESTOQUE para Estoque</button>
          <button className="btn btn-primary" onClick={() => { setForm(empty); setModal(true) }}>+ Nova compra</button>
        </div>
      </div>
      <div className="card">
        <table>
          <thead><tr>
            <th>Loja</th><th>Produto</th><th>Size</th><th>Valor</th>
            <th>Forma Pgto</th><th>Data</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-gray-400 py-8">Nenhuma compra ainda</td></tr>
            ) : data.map(item => (
              <tr key={item.id}>
                <td>{item.loja || '—'}</td>
                <td className="font-medium">{item.produto}</td>
                <td>{item.size || '—'}</td>
                <td className="font-semibold">{brl(item.valor)}</td>
                <td>{item.formaPgto || '—'}</td>
                <td className="text-gray-400 text-xs">{item.dataCompra ? new Date(item.dataCompra).toLocaleDateString('pt-BR') : '—'}</td>
                <td><span className={`status-pill ${statusClass(item.status)}`}>{item.status}</span></td>
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
              <h2 className="text-base font-bold">{form.id ? 'Editar compra' : 'Nova compra BR'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Loja</label><input className="form-input" value={form.loja || ''} onChange={e => setForm({ ...form, loja: e.target.value })} placeholder="Ex: Nike, Pineapple..." /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Produto *</label><input className="form-input" value={form.produto || ''} onChange={e => setForm({ ...form, produto: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Size</label><input className="form-input" value={form.size || ''} onChange={e => setForm({ ...form, size: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$) *</label><input type="number" className="form-input" value={form.valor || ''} onChange={e => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Forma Pgto</label>
                  <select className="form-input" value={form.formaPgto || 'PIX'} onChange={e => setForm({ ...form, formaPgto: e.target.value })}>
                    <option>PIX</option><option>Cartão</option><option>Boleto</option><option>Débito</option>
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Data compra</label><input type="date" className="form-input" value={form.dataCompra?.split('T')[0] || ''} onChange={e => setForm({ ...form, dataCompra: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select className="form-input" value={form.status || 'AGUARDANDO'} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>AGUARDANDO</option><option>EM ESTOQUE</option><option>MOVIDO</option>
                  </select>
                </div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Data chegada</label><input type="date" className="form-input" value={form.dataChegada?.split('T')[0] || ''} onChange={e => setForm({ ...form, dataChegada: e.target.value })} /></div>
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
