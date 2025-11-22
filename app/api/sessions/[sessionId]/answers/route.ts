import { getDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// 保存答案
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const body = await request.json()
    const { answers } = body

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: '答案格式不正确' },
        { status: 400 }
      )
    }

    const db = getDb()
    const now = new Date().toISOString()

    // 更新会话的答案
    db.prepare(`
      UPDATE assessment_sessions
      SET answers = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(JSON.stringify(answers), 'in_progress', now, sessionId)

    return NextResponse.json({ message: '答案保存成功' })
  } catch (error: any) {
    console.error('保存答案失败:', error)
    return NextResponse.json(
      { error: error.message || '保存答案失败' },
      { status: 500 }
    )
  }
}
