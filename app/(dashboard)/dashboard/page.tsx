'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const pct = (v: number) => `${(v || 0).toFixed(1)}%`

interface DashData {
  faturamento: number; lucro: number; margem: number; ticketMedio: number
  totalVendas: number; itensEstoque: number; valorEstoque: number
  uscloserPendente: number; cesarPendente: number
  porMes: { mes: string; faturamento: number; lucro: number; vendas: number }[]
  ultimasVendas: { id: string; produto: string; size: string; canal: string; preco: number; lucro: number; margem: number }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setData)
  }, [])

  if (!data) return <div className="text-gray-400 text-sm">Carregando...</div>

  const maxFat = Math.max(...data.porMes.map(m => m.faturamento), 1)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Visão geral do negócio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Faturamento Total', value: brl(data.faturamento), sub: `${data.totalVendas} vendas` },
          { label: 'Lucro Total', value: brl(data.lucro), sub: `Margem ${pct(data.margem)}` },
          { label: 'Itens em Estoque', value: data.itensEstoque.toString(), sub: brl(data.valorEstoque) + ' em valor' },
          { label: 'Ticket Médio', value: brl(data.ticketMedio), sub: '' },
        ].map(k => (
          <div key={k.label} className="metric-card">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{k.label}</div>
            <div className="text-xl font-bold text-gray-900">{k.value}</div>
            {k.sub && <div className="text-xs text-gray-400 mt-1">{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Imports aguardando */}
        <div className="card p-5">
          <div className="font-semibold text-sm text-gray-700 mb-4">✈️ Imports Aguardando</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{data.uscloserPendente}</div>
              <div className="text-xs text-blue-500 mt-1">USCLOSER</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-700">{data.cesarPendente}</div>
              <div className="text-xs text-purple-500 mt-1">CESAR</div>
            </div>
          </div>
          <a href="/uscloser" className="btn btn-primary w-full justify-center text-sm mb-2 block text-center">
            Ver USCLOSER →
          </a>
          <a href="/cesar" className="btn w-full justify-center text-sm block text-center">
            Ver CESAR →
          </a>
        </div>

        {/* Mini gráfico faturamento */}
        <div className="card p-5">
          <div className="font-semibold text-sm text-gray-700 mb-4">📈 Faturamento por Mês</div>
          {data.porMes.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">Nenhuma venda registrada ainda</div>
          ) : (
            <>
              <div className="flex items-end gap-1.5 h-16">
                {data.porMes.map((m, i) => (
                  <div key={m.mes} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t transition-all ${i === data.porMes.length - 1 ? 'bg-blue-700' : 'bg-blue-200'}`}
                      style={{ height: `${Math.max(8, (m.faturamento / maxFat) * 100)}%` }}
                      title={`${m.mes}: ${brl(m.faturamento)}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {data.porMes.map(m => (
                  <div key={m.mes} className="flex-1 text-center text-xs text-gray-400 truncate">{m.mes}</div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Últimas vendas */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="font-semibold text-sm text-gray-700">💰 Últimas Vendas</div>
        </div>
        {data.ultimasVendas.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">Nenhuma venda ainda</div>
        ) : (
          <table>
            <thead><tr>
              <th>Produto</th><th>Size</th><th>Canal</th><th>Preço</th><th>Lucro</th><th>Margem</th>
            </tr></thead>
            <tbody>
              {data.ultimasVendas.map(v => (
                <tr key={v.id}>
                  <td className="font-medium">{v.produto}</td>
                  <td>{v.size || '—'}</td>
                  <td>{v.canal || '—'}</td>
                  <td>{brl(v.preco)}</td>
                  <td className="font-semibold text-green-700">{brl(v.lucro)}</td>
                  <td>{pct(v.margem)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
