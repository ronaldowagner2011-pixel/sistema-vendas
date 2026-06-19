import { requireAuth, ok } from '@/lib/api-helper'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const vendas = await prisma.venda.findMany()

  // Group by mesAno
  const porMes: Record<string, { faturamento: number; lucro: number; vendas: number; margem: number }> = {}
  vendas.forEach(v => {
    const mes = v.mesAno || 'Sem data'
    if (!porMes[mes]) porMes[mes] = { faturamento: 0, lucro: 0, vendas: 0, margem: 0 }
    porMes[mes].faturamento += v.preco
    porMes[mes].lucro += v.lucro
    porMes[mes].vendas += 1
  })

  // Calculate margem
  Object.keys(porMes).forEach(mes => {
    const d = porMes[mes]
    d.margem = d.faturamento > 0 ? (d.lucro / d.faturamento) * 100 : 0
  })

  // Group by year
  const porAno: Record<string, { faturamento: number; lucro: number; vendas: number }> = {}
  Object.entries(porMes).forEach(([mes, d]) => {
    const ano = mes.split('/')[1] || mes.split('-')[0] || 'Sem ano'
    if (!porAno[ano]) porAno[ano] = { faturamento: 0, lucro: 0, vendas: 0 }
    porAno[ano].faturamento += d.faturamento
    porAno[ano].lucro += d.lucro
    porAno[ano].vendas += d.vendas
  })

  return ok({
    porMes: Object.entries(porMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, d]) => ({ mes, ...d })),
    porAno: Object.entries(porAno)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ano, d]) => ({ ano, ...d })),
  })
}
