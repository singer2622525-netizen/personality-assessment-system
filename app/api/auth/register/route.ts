import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

// 注册
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, companyName } = body

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '请填写完整信息' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      )
    }

    const db = getDb()

    // 检查用户名是否已存在
    const existingUser = db.prepare(`
      SELECT id FROM admin_users WHERE username = ?
    `).get(username)

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingEmail = db.prepare(`
      SELECT id FROM admin_users WHERE email = ?
    `).get(email)

    if (existingEmail) {
      return NextResponse.json(
        { error: '邮箱已被注册' },
        { status: 400 }
      )
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10)

    // 创建用户
    const userId = `user-${Date.now()}`
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO admin_users (id, username, email, password_hash, company_name, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, username, email, passwordHash, companyName || null, 'admin', now)

    return NextResponse.json({
      message: '注册成功',
      userId
    })
  } catch (error: any) {
    console.error('注册失败:', error)
    return NextResponse.json(
      { error: error.message || '注册失败' },
      { status: 500 }
    )
  }
}


