import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err } from '@/lib/api-helper'

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const busca = searchParams.get('busca')
  const status = searchParams.get('status')
  const size = searchParams.get('size')

  const where: Record<string, unknown> = {}
  if (busca) where.produto = { contains: busca, mode: 'insensitive' }
  if (status) where.status = status
  if (size) where.size = size

  const data = await prisma.estoque.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return ok(data)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  if (!body.produto) return err('Produto obrigatório')

  const item = await prisma.estoque.create({
    data: {
      sku: body.sku,
      produto: body.produto,
      size: body.size,
      custo: parseFloat(body.custo) || 0,
      localizacao: body.localizacao || 'Casa',
      status: body.status || 'EM ESTOQUE',
      dataEntrada: body.dataEntrada ? new Date(body.dataEntrada) : null,
      obs: body.obs,
    },
  })
  return ok(item)
}
