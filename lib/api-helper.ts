import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { error: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }) }
  }
  return { session }
}

export const ok = (data: unknown) => NextResponse.json(data)
export const err = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status })
