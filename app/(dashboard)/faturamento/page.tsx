'use client'
import { useEffect, useState } from 'react'

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const pct = (v: number) => `${(v || 0).toFixed(1)}%`

interface MesData { mes: string; faturamento: number; lucro: number; vendas: number; margem: number }
interface AnoData { ano: string; faturamento: number; lucro: number; vendas: number }

export default function FaturamentoPage() {
  const [porMes, setPorMes] = useState<MesData[]>([])
  const [porAno, setPorAno] = useState<AnoData[]>([])
  const [view, setView] = useState<'mensal' | 'anual'>('mensal')

  useEffect(() => {
    fetch('/api/faturamento').then(r => r.json()).then(d => {
      setPorMes(d.porMes || [])
      setPorAno(d.porAno || [])
    })
  }, [])

  const totalFat = porMes.reduce((s, m) => s + m.faturamento, 0)
  const totalLuc = porMes.reduce((s, m) => s + m.lucro, 0)
  const margMedia = totalFat > 0 ? (totalLuc / totalFat) * 100 : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Faturamento</h1>
        <p className="text-sm text-gray-500">Resultados por período</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="metric-card">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Faturamento Total</div>
          <div className="text-xl font-bold text-gray-900">{brl(totalFat)}</div>
        </div>
        <div className="metric-card">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lucro Total</div>
          <div className="text-xl font-bold text-green-700">{brl(totalLuc)}</div>
        </div>
        <div className="metric-card">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Margem Média</div>
          <div className="text-xl font-bold text-gray-900">{pct(margMedia)}</div>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          className={`btn ${view === 'mensal' ? 'btn-primary' : ''}`}
          onClick={() => setView('mensal')}
        >
          Por mês
        </button>
        <button
          className={`btn ${view === 'anual' ? 'btn-primary' : ''}`}
          onClick={() => setView('anual')}
        >
          Por ano
        </button>
      </div>

      {/* Tabela mensal */}
      {view === 'mensal' && (
        <div className="card">
          <table>
            <thead><tr>
              <th>Mês/Ano</th><th>Faturamento</th><th>Lucro</th><th>Margem</th><th>Vendas</th>
            </tr></thead>
            <tbody>
              {porMes.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-400 py-8">Nenhum dado ainda — cadastre vendas com Mês/Ano preenchido</td></tr>
              ) : [...porMes].reverse().map(m => (
                <tr key={m.mes}>
                  <td className="font-medium">{m.mes}</td>
                  <td className="font-semibold">{brl(m.faturamento)}</td>
                  <td className="font-semibold text-green-700">{brl(m.lucro)}</td>
                  <td>{pct(m.margem)}</td>
                  <td>{m.vendas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tabela anual */}
      {view === 'anual' && (
        <div className="card">
          <table>
            <thead><tr>
              <th>Ano</th><th>Faturamento</th><th>Lucro</th><th>Margem</th><th>Vendas</th>
            </tr></thead>
            <tbody>
              {porAno.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-400 py-8">Nenhum dado ainda</td></tr>
              ) : [...porAno].reverse().map(a => {
                const marg = a.faturamento > 0 ? (a.lucro / a.faturamento) * 100 : 0
                return (
                  <tr key={a.ano}>
                    <td className="font-bold text-base">{a.ano}</td>
                    <td className="font-semibold text-base">{brl(a.faturamento)}</td>
                    <td className="font-semibold text-green-700 text-base">{brl(a.lucro)}</td>
                    <td>{pct(marg)}</td>
                    <td>{a.vendas}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
