import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok } from '@/lib/api-helper'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const body = await req.json()
  const item = await prisma.comprasBR.update({
    where: { id: params.id },
    data: {
      loja: body.loja, produto: body.produto, size: body.size,
      valor: parseFloat(body.valor) || 0,
      formaPgto: body.formaPgto,
      dataCompra: body.dataCompra ? new Date(body.dataCompra) : null,
      dataChegada: body.dataChegada ? new Date(body.dataChegada) : null,
      status: body.status, obs: body.obs,
    },
  })
  return ok(item)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  await prisma.comprasBR.delete({ where: { id: params.id } })
  return ok({ ok: true })
}
