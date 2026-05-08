// pages/api/mistakes/index.js
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: '未登录' })
  const userId = session.user.id

  if (req.method === 'GET') {
    const mistakes = await prisma.mistake.findMany({
      where: { userId },
      orderBy: { count: 'desc' },
    })
    return res.json(mistakes)
  }

  if (req.method === 'POST') {
    const { module, questionId, content, errorType } = req.body
    // Upsert: increment count if same question already wrong before
    const existing = await prisma.mistake.findFirst({
      where: { userId, questionId },
    })
    if (existing) {
      const updated = await prisma.mistake.update({
        where: { id: existing.id },
        data: { count: existing.count + 1 },
      })
      return res.json(updated)
    }
    const created = await prisma.mistake.create({
      data: { userId, module, questionId, content, errorType },
    })
    return res.status(201).json(created)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    await prisma.mistake.delete({ where: { id } })
    return res.json({ ok: true })
  }

  res.status(405).end()
}