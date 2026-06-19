import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err } from '@/lib/api-helper'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  const item = await prisma.estoque.update({
    where: { id: params.id },
    data: {
      sku: body.sku,
      produto: body.produto,
      size: body.size,
      custo: parseFloat(body.custo) || 0,
      localizacao: body.localizacao,
      status: body.status,
      dataEntrada: body.dataEntrada ? new Date(body.dataEntrada) : null,
      obs: body.obs,
    },
  })
  return ok(item)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  await prisma.estoque.delete({ where: { id: params.id } })
  return ok({ ok: true })
}
