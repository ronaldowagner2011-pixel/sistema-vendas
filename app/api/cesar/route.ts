import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err } from '@/lib/api-helper'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const data = await prisma.cESAR.findMany({ orderBy: { createdAt: 'desc' } })
  return ok(data)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const body = await req.json()
  if (!body.produto) return err('Produto obrigatório')
  const valor = parseFloat(body.valor) || 0
  const frete = parseFloat(body.frete) || 0
  const imposto = parseFloat(body.imposto) || 0
  const item = await prisma.cESAR.create({
    data: {
      produto: body.produto, size: body.size,
      valor, frete, imposto, custoTotal: valor + frete + imposto,
      dataCompra: body.dataCompra ? new Date(body.dataCompra) : null,
      status: body.status || 'COMPRADO',
      tracking: body.tracking, obs: body.obs,
    },
  })
  return ok(item)
}
