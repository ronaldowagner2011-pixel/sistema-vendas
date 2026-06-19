import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok } from '@/lib/api-helper'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const body = await req.json()
  const valor = parseFloat(body.valor) || 0
  const frete = parseFloat(body.frete) || 0
  const imposto = parseFloat(body.imposto) || 0
  const item = await prisma.uSCLOSER.update({
    where: { id: params.id },
    data: {
      produto: body.produto, size: body.size,
      valor, frete, imposto, custoTotal: valor + frete + imposto,
      dataCompra: body.dataCompra ? new Date(body.dataCompra) : null,
      dataChegada: body.dataChegada ? new Date(body.dataChegada) : null,
      status: body.status, tracking: body.tracking, obs: body.obs,
    },
  })
  return ok(item)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  await prisma.uSCLOSER.delete({ where: { id: params.id } })
  return ok({ ok: true })
}
