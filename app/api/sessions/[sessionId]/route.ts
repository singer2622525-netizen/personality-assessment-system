import { getDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (value == null || value === '') return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

// 获取单个会话
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const db = getDb()
    const session = db.prepare(`
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
      WHERE id = ?
    `).get(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      )
    }

    // 解析JSON字段
    const parsedSession = {
      id: (session as any).id,
      uniqueId: (session as any).unique_id,
      candidateName: (session as any).candidate_name,
      candidateEmail: (session as any).candidate_email,
      candidatePhone: (session as any).candidate_phone,
      position: (session as any).position,
      status: (session as any).status,
      answers: safeJsonParse((session as any).answers, [] as unknown[]),
      results: safeJsonParse((session as any).results, null as unknown | null),
      createdAt: (session as any).created_at,
      completedAt: (session as any).completed_at || null,
    }

    return NextResponse.json(parsedSession)
  } catch (error: any) {
    console.error('获取会话失败:', error)
    return NextResponse.json(
      { error: error.message || '获取会话失败' },
      { status: 500 }
    )
  }
}

// 更新会话
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const body = await request.json()
    const db = getDb()
    const now = new Date().toISOString()

    // 构建更新字段
    const updates: string[] = []
    const values: any[] = []

    if (body.answers !== undefined) {
      updates.push('answers = ?')
      values.push(JSON.stringify(body.answers))
    }

    if (body.status !== undefined) {
      updates.push('status = ?')
      values.push(body.status)
    }

    if (body.results !== undefined) {
      updates.push('results = ?')
      values.push(JSON.stringify(body.results))
    }

    if (body.status === 'completed') {
      updates.push('completed_at = ?')
      values.push(now)
    }

    updates.push('updated_at = ?')
    values.push(now)
    values.push(sessionId)

    if (updates.length === 0) {
      return NextResponse.json({ message: '没有需要更新的字段' })
    }

    db.prepare(`
      UPDATE assessment_sessions
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values)

    return NextResponse.json({ message: '会话更新成功' })
  } catch (error: any) {
    console.error('更新会话失败:', error)
    return NextResponse.json(
      { error: error.message || '更新会话失败' },
      { status: 500 }
    )
  }
}
