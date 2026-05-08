// pages/api/ai/chat.js
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: '未登录' })

  const { message, system } = req.body
  if (!message) return res.status(400).json({ error: '消息不能为空' })

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: system || '你是专业的雅思导师，用中文回答，简洁专业。',
      messages: [{ role: 'user', content: message }],
    }),
  })

  const data = await response.json()
  const text = data.content?.[0]?.text || '请稍后重试'
  res.json({ reply: text })
}