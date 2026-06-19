import { prisma } from '@/lib/prisma'
import { requireAuth, ok } from '@/lib/api-helper'

export async function POST() {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const itens = await prisma.comprasBR.findMany({ where: { status: 'EM ESTOQUE' } })
  let movidos = 0
  for (const item of itens) {
    await prisma.estoque.create({
      data: {
        produto: item.produto, size: item.size,
        custo: item.valor, status: 'EM ESTOQUE',
        dataEntrada: item.dataChegada,
      },
    })
    await prisma.comprasBR.update({ where: { id: item.id }, data: { status: 'MOVIDO' } })
    movidos++
  }
  return ok({ movidos })
}
