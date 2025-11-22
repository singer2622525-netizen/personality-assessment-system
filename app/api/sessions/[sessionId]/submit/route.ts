import { calculatePersonalityScores } from '@/lib/assessment'
import { getDb } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// 提交评测
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

    // 计算结果
    const results = calculatePersonalityScores(answers)

    // 更新会话
    db.prepare(`
      UPDATE assessment_sessions
      SET answers = ?, results = ?, status = ?, completed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(
      JSON.stringify(answers),
      JSON.stringify(results),
      'completed',
      now,
      now,
      sessionId
    )

    return NextResponse.json({
      message: '评测提交成功',
      results
    })
  } catch (error: any) {
    console.error('提交评测失败:', error)
    return NextResponse.json(
      { error: error.message || '提交评测失败' },
      { status: 500 }
    )
  }
}
