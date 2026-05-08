// pages/api/vocab/index.js
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: '未登录' })
  const userId = session.user.id

  if (req.method === 'GET') {
    const vocabs = await prisma.vocab.findMany({
      where: { userId, mastered: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return res.json(vocabs)
  }

  if (req.method === 'POST') {
    const { word, definition, context } = req.body
    const exists = await prisma.vocab.findFirst({ where: { userId, word } })
    if (exists) return res.json(exists)
    const created = await prisma.vocab.create({
      data: { userId, word, definition: definition || '', context },
    })
    return res.status(201).json(created)
  }

  if (req.method === 'PATCH') {
    // mark word as mastered
    const { id } = req.query
    const updated = await prisma.vocab.update({
      where: { id },
      data: { mastered: true },
    })
    return res.json(updated)
  }

  res.status(405).end()
}