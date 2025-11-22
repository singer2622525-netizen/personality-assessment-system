import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// 登录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: '请填写用户名和密码' },
        { status: 400 }
      )
    }

    const db = getDb()

    // 查找用户
    const user = db.prepare(`
      SELECT id, username, email, password_hash, role, company_name
      FROM admin_users
      WHERE username = ?
    `).get(username) as any

    if (!user) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 记录访问日志
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    db.prepare(`
      INSERT INTO access_logs (user_id, action, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(user.id, 'login', ip, userAgent, new Date().toISOString())

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        companyName: user.company_name,
      }
    })
  } catch (error: any) {
    console.error('登录失败:', error)
    return NextResponse.json(
      { error: error.message || '登录失败' },
      { status: 500 }
    )
  }
}


