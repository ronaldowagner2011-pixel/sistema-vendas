import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, err } from '@/lib/api-helper'

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const canal = searchParams.get('canal')
  const busca = searchParams.get('busca')

  const where: Record<string, unknown> = {}
  if (canal) where.canal = canal
  if (busca) where.produto = { contains: busca, mode: 'insensitive' }

  const data = await prisma.venda.findMany({ where, orderBy: { createdAt: 'desc' } })
  return ok(data)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  if (!body.produto) return err('Produto obrigatório')
  if (!body.preco) return err('Preço obrigatório')

  const preco = parseFloat(body.preco)
  const custo = parseFloat(body.custo) || 0
  const lucro = preco - custo
  const margem = preco > 0 ? (lucro / preco) * 100 : 0

  const venda = await prisma.venda.create({
    data: {
      canal: body.canal,
      produto: body.produto,
      size: body.size,
      custo, preco, lucro, margem,
      mesAno: body.mesAno,
      numPedido: body.numPedido,
      estoqueId: body.estoqueId,
    },
  })

  // Marcar como VENDIDO no estoque
  if (body.estoqueId) {
    await prisma.estoque.update({
      where: { id: body.estoqueId },
      data: { status: 'VENDIDO' },
    })
  }

  return ok(venda)
}
