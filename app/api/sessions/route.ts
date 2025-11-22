import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { generateUniqueId } from '@/lib/utils'
import { calculatePersonalityScores } from '@/lib/assessment'

// 创建会话
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { candidateName, candidateEmail, candidatePhone, position } = body

    if (!candidateName || !candidateEmail || !candidatePhone || !position) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      )
    }

    const db = getDb()
    const sessionId = Math.random().toString(36).substring(2, 15)
    const uniqueId = generateUniqueId(candidateName, candidatePhone)
    const now = new Date().toISOString()

    // 插入会话
    db.prepare(`
      INSERT INTO assessment_sessions
      (id, unique_id, candidate_name, candidate_email, candidate_phone, position, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sessionId, uniqueId, candidateName, candidateEmail, candidatePhone, position, 'in_progress', now)

    return NextResponse.json({
      sessionId,
      uniqueId,
      message: '会话创建成功'
    })
  } catch (error: any) {
    console.error('创建会话失败:', error)
    return NextResponse.json(
      { error: error.message || '创建会话失败' },
      { status: 500 }
    )
  }
}

// 获取所有会话（管理员）
export async function GET(request: NextRequest) {
  try {
    // TODO: 添加认证检查
    const db = getDb()
    const sessions = db.prepare(`
      SELECT
        id,
        unique_id,
        candidate_name,
        candidate_email,
        candidate_phone,
        position,
        status,
        answers,
        results,
        created_at,
        completed_at
      FROM assessment_sessions
      ORDER BY created_at DESC
    `).all()

    // 解析JSON字段并转换为驼峰命名
    const parsedSessions = sessions.map((session: any) => ({
      id: session.id,
      uniqueId: session.unique_id,
      candidateName: session.candidate_name,
      candidateEmail: session.candidate_email,
      candidatePhone: session.candidate_phone,
      position: session.position,
      status: session.status,
      answers: session.answers ? JSON.parse(session.answers) : [],
      results: session.results ? JSON.parse(session.results) : null,
      createdAt: session.created_at,
      completedAt: session.completed_at || null,
    }))

    return NextResponse.json(parsedSessions)
  } catch (error: any) {
    console.error('获取会话失败:', error)
    return NextResponse.json(
      { error: error.message || '获取会话失败' },
      { status: 500 }
    )
  }
}
