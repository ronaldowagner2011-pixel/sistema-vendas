import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-helper'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const [vendas, estoque, uscloser, cesar] = await Promise.all([
    prisma.venda.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.estoque.findMany(),
    prisma.uSCLOSER.findMany({ where: { status: { notIn: ['EM ESTOQUE', 'MOVIDO'] } } }),
    prisma.cESAR.findMany({ where: { status: { notIn: ['EM ESTOQUE', 'MOVIDO'] } } }),
  ])

  const faturamento = vendas.reduce((s, v) => s + v.preco, 0)
  const lucro = vendas.reduce((s, v) => s + v.lucro, 0)
  const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0
  const emEstoque = estoque.filter(e => e.status === 'EM ESTOQUE')
  const valorEstoque = emEstoque.reduce((s, e) => s + e.custo, 0)
  const ticketMedio = vendas.length > 0 ? faturamento / vendas.length : 0

  const porMes: Record<string, { faturamento: number; lucro: number; vendas: number }> = {}
  vendas.forEach(v => {
    if (!v.mesAno) return
    if (!porMes[v.mesAno]) porMes[v.mesAno] = { faturamento: 0, lucro: 0, vendas: 0 }
    porMes[v.mesAno].faturamento += v.preco
    porMes[v.mesAno].lucro += v.lucro
    porMes[v.mesAno].vendas += 1
  })

  return NextResponse.json({
    faturamento, lucro, margem, ticketMedio,
    totalVendas: vendas.length,
    itensEstoque: emEstoque.length,
    valorEstoque,
    uscloserPendente: uscloser.length,
    cesarPendente: cesar.length,
    porMes: Object.entries(porMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([mes, d]) => ({ mes, ...d })),
    ultimasVendas: vendas.slice(0, 5),
  })
}
