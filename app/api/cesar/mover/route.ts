import { prisma } from '@/lib/prisma'
import { requireAuth, ok } from '@/lib/api-helper'

export async function POST() {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const itens = await prisma.cESAR.findMany({ where: { status: 'EM ESTOQUE' } })
  let movidos = 0
  for (const item of itens) {
    await prisma.estoque.create({
      data: {
        produto: item.produto, size: item.size,
        custo: item.custoTotal, status: 'EM ESTOQUE',
        dataEntrada: item.dataChegada,
      },
    })
    await prisma.cESAR.update({ where: { id: item.id }, data: { status: 'MOVIDO' } })
    movidos++
  }
  return ok({ movidos })
}
