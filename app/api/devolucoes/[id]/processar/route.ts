import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err } from '@/lib/api-helper'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const { id } = await params
  const dev = await prisma.devolucao.findUnique({ where: { id } })
  if (!dev) return err('Devolução não encontrada', 404)
  if (dev.estoqueId) {
    await prisma.estoque.update({
      where: { id: dev.estoqueId },
      data: { status: 'EM ESTOQUE' },
    })
  } else {
    const item = await prisma.estoque.findFirst({
      where: { produto: dev.produto, size: dev.size ?? undefined, status: 'VENDIDO' },
    })
    if (item) await prisma.estoque.update({ where: { id: item.id }, data: { status: 'EM ESTOQUE' } })
  }
  await prisma.devolucao.update({
    where: { id },
    data: { status: 'DEVOLVIDO AO ESTOQUE' },
  })
  return ok({ ok: true })
}