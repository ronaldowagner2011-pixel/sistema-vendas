import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err } from '@/lib/api-helper'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const data = await prisma.devolucao.findMany({ orderBy: { createdAt: 'desc' } })
  return ok(data)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const body = await req.json()
  if (!body.produto) return err('Produto obrigatório')
  const item = await prisma.devolucao.create({
    data: {
      produto: body.produto, size: body.size,
      canal: body.canal, numPedido: body.numPedido,
      motivo: body.motivo, status: 'PENDENTE',
      data: body.data ? new Date(body.data) : new Date(),
      estoqueId: body.estoqueId, vendaId: body.vendaId,
    },
  })
  return ok(item)
}
