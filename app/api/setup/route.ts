import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  // Only allow if no users exist
  const count = await prisma.user.count()
  if (count > 0) {
    return NextResponse.json({ error: 'Setup já realizado' }, { status: 400 })
  }

  const body = await req.json()
  if (!body.email || !body.password) {
    return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(body.password, 12)
  const user = await prisma.user.create({
    data: { email: body.email, password: hashed, name: body.name || 'Admin' },
  })

  return NextResponse.json({ ok: true, email: user.email })
}
