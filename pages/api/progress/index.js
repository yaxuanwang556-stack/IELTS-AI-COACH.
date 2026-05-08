// pages/api/progress/index.js
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: '未登录' })
  const userId = session.user.id

  if (req.method === 'GET') {
    const progress = await prisma.progress.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    })
    return res.json(progress)
  }

  if (req.method === 'POST') {
    const { module, score } = req.body
    const entry = await prisma.progress.create({
      data: { userId, module, score: parseFloat(score) },
    })
    return res.status(201).json(entry)
  }

  res.status(405).end()
}