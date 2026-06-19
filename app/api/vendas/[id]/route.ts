import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok } from '@/lib/api-helper'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error
  await prisma.venda.delete({ where: { id: params.id } })
  return ok({ ok: true })
}
