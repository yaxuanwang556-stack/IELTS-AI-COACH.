// pages/api/auth/register.js
import bcrypt from 'bcryptjs'
import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })

  const { email, password, name } = req.body
  if (!email || !password)
    return res.status(400).json({ error: '邮箱和密码不能为空' })

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists)
    return res.status(400).json({ error: '该邮箱已被注册' })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hashed, name: name || '' },
  })

  res.status(201).json({ id: user.id, email: user.email })
}