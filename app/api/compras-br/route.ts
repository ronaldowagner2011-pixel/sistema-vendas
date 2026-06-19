import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err } from '@/lib/api-helper'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const data = await prisma.comprasBR.findMany({ orderBy: { createdAt: 'desc' } })
  return ok(data)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  const body = await req.json()
  if (!body.produto) return err('Produto obrigatório')
  const item = await prisma.comprasBR.create({
    data: {
      loja: body.loja, produto: body.produto, size: body.size,
      valor: parseFloat(body.valor) || 0,
      formaPgto: body.formaPgto,
      dataCompra: body.dataCompra ? new Date(body.dataCompra) : null,
      status: body.status || 'AGUARDANDO',
      obs: body.obs,
    },
  })
  return ok(item)
}
