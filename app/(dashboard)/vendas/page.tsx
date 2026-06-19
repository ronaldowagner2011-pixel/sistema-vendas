'use client'
import { useEffect, useState } from 'react'

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const pct = (v: number) => `${(v || 0).toFixed(1)}%`

interface Venda {
  id: string; canal: string; produto: string; size: string | null
  custo: number; preco: number; lucro: number; margem: number
  mesAno: string | null; numPedido: string | null
}
interface EstoqueItem { id: string; sku: string | null; produto: string; size: string | null; custo: number }

const emptyForm = { canal: 'WhatsApp', produto: '', size: '', custo: 0, preco: 0, mesAno: '', numPedido: '', estoqueId: '' }

export default function VendasPage() {
  const [data, setData] = useState<Venda[]>([])
  const [estoque, setEstoque] = useState<EstoqueItem[]>([])
  const [busca, setBusca] = useState('')
  const [canal, setCanal] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [toast, setToast] = useState('')

  async function load() {
    const params = new URLSearchParams()
    if (busca) params.set('busca', busca)
    if (canal) params.set('canal', canal)
    const [v, e] = await Promise.all([
      fetch('/api/vendas?' + params).then(r => r.json()),
      fetch('/api/estoque?status=EM%20ESTOQUE').then(r => r.json()),
    ])
    setData(v); setEstoque(e)
  }

  useEffect(() => { load() }, [busca, canal])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function selectEstoque(id: string) {
    const item = estoque.find(e => e.id === id)
    if (item) setForm({ ...form, estoqueId: id, produto: item.produto, size: item.size || '', custo: item.custo })
  }

  const lucroCalc = form.preco - form.custo
  const margemCalc = form.preco > 0 ? (lucroCalc / form.preco) * 100 : 0

  async function save() {
    if (!form.produto) return alert('Selecione o produto!')
    if (!form.preco) return alert('Preencha o preço de venda!')
    await fetch('/api/vendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setModal(false); setForm(emptyForm)
    showToast('Venda cadastrada!'); load()
  }

  async function del(id: string) {
    if (!confirm('Excluir esta venda?')) return
    await fetch(`/api/vendas/${id}`, { method: 'DELETE' })
    showToast('Venda excluída!'); load()
  }

  const totalFat = data.reduce((s, v) => s + v.preco, 0)
  const totalLuc = data.reduce((s, v) => s + v.lucro, 0)
  const margMedia = totalFat > 0 ? (totalLuc / totalFat) * 100 : 0

  return (
    <div>
      {toast && <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vendas</h1>
          <p className="text-sm text-gray-500">{data.length} vendas · {brl(totalFat)} · Margem {pct(margMedia)}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setModal(true) }}>+ Nova venda</button>
      </div>

      <div className="flex gap-3 mb-4">
        <input className="form-input" style={{ width: 240 }} placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} />
        <select className="form-input" style={{ width: 160 }} value={canal} onChange={e => setCanal(e.target.value)}>
          <option value="">Todos canais</option>
          <option>WhatsApp</option><option>Droper</option><option>Pineapple</option>
        </select>
      </div>

      <div className="card">
        <table>
          <thead><tr>
            <th>Produto</th><th>Size</th><th>Canal</th><th>Custo</th>
            <th>Preço</th><th>Lucro</th><th>Margem</th><th>Mês</th><th>Nº Pedido</th><th></th>
          </tr></thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={10} className="text-center text-gray-400 py-8">Nenhuma venda ainda</td></tr>
            ) : data.map(v => (
              <tr key={v.id}>
                <td className="font-medium">{v.produto}</td>
                <td>{v.size || '—'}</td>
                <td>{v.canal}</td>
                <td className="text-gray-500">{brl(v.custo)}</td>
                <td className="font-semibold">{brl(v.preco)}</td>
                <td className="font-semibold text-green-700">{brl(v.lucro)}</td>
                <td>{pct(v.margem)}</td>
                <td className="text-gray-400 text-xs">{v.mesAno || '—'}</td>
                <td className="text-gray-400 text-xs font-mono">{v.numPedido || '—'}</td>
                <td><button className="btn btn-sm btn-danger" onClick={() => del(v.id)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold">Nova venda</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Produto do estoque *</label>
                <select className="form-input" value={form.estoqueId} onChange={e => selectEstoque(e.target.value)}>
                  <option value="">— Selecione —</option>
                  {estoque.map(e => (
                    <option key={e.id} value={e.id}>{e.produto} {e.size ? `(${e.size})` : ''}</option>
                  ))}
                </select>
              </div>
              {form.estoqueId && (
                <div className="bg-green-50 rounded-lg p-3 text-sm">
                  <span className="text-green-600 font-medium">Custo: {brl(form.custo)}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Preço de venda (R$) *</label>
                  <input type="number" className="form-input" value={form.preco || ''} onChange={e => setForm({ ...form, preco: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Canal</label>
                  <select className="form-input" value={form.canal} onChange={e => setForm({ ...form, canal: e.target.value })}>
                    <option>WhatsApp</option><option>Droper</option><option>Pineapple</option>
                  </select>
                </div>
              </div>
              {form.preco > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 flex justify-between text-sm">
                  <span className="text-blue-600">Lucro previsto: <strong>{brl(lucroCalc)}</strong></span>
                  <span className="text-blue-600">Margem: <strong>{pct(margemCalc)}</strong></span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mês/Ano</label>
                  <input className="form-input" value={form.mesAno} onChange={e => setForm({ ...form, mesAno: e.target.value })} placeholder="05/2026" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nº Pedido</label>
                  <input className="form-input" value={form.numPedido} onChange={e => setForm({ ...form, numPedido: e.target.value })} placeholder="DRP-00000" />
                </div>
              </div>
              <button className="btn btn-primary w-full justify-center mt-2" onClick={save}>
                Cadastrar venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
