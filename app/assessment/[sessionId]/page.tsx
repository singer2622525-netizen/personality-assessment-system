'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { AssessmentSession, Answer, QUESTIONS } from '@/lib/types'

export default function AssessmentPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<AssessmentSession | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 从 localStorage 加载会话数据
    const sessionData = localStorage.getItem(`assessment_session_${params.sessionId}`)
    if (!sessionData) {
      router.push('/assessment/start')
      return
    }

    try {
      const parsedSession = JSON.parse(sessionData) as AssessmentSession
      setSession(parsedSession)
      setAnswers(parsedSession.answers || [])
    } catch (error) {
      console.error('解析会话数据失败:', error)
      router.push('/assessment/start')
    } finally {
      setIsLoading(false)
    }
  }, [params.sessionId, router])

  const handleAnswerSelect = (questionId: number, answer: number) => {
    const newAnswers = answers.filter(a => a.questionId !== questionId)
    newAnswers.push({ questionId, answer })
    setAnswers(newAnswers)

    // 更新会话数据
    const updatedSession: AssessmentSession = {
      ...session!,
      answers: newAnswers,
      status: (newAnswers.length === QUESTIONS.length ? 'completed' : 'in_progress') as 'pending' | 'in_progress' | 'completed'
    }
    
    localStorage.setItem(`assessment_session_${params.sessionId}`, JSON.stringify(updatedSession))
    setSession(updatedSession)
  }

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // 评测完成，跳转到结果页面
      router.push(`/assessment/${params.sessionId}/results`)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const getCurrentAnswer = () => {
    const currentQuestion = QUESTIONS[currentQuestionIndex]
    const answer = answers.find(a => a.questionId === currentQuestion.id)
    return answer ? answer.answer : null
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)' }}>
        <div style={{ color: '#1f2937', fontSize: '18px' }}>加载中...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const currentQuestion = QUESTIONS[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)', padding: '16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* 头部导航 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button
            onClick={() => router.push('/assessment/start')}
            style={{ display: 'flex', alignItems: 'center', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            返回
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
              5型人格评测
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              {session.candidateName} - {session.position}
            </p>
          </div>
          
          <div style={{ width: '80px' }}></div>
        </div>

        {/* 进度条 */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              题目 {currentQuestionIndex + 1} / {QUESTIONS.length}
            </span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${progress}%`, 
              height: '100%', 
              background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)', 
              transition: 'width 0.3s ease' 
            }}></div>
          </div>
        </div>

        {/* 题目卡片 */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '32px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '24px', lineHeight: '1.5' }}>
            {currentQuestion.text}
          </h2>

          {/* 选项 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4, 5].map((value) => {
              const isSelected = getCurrentAnswer() === value
              return (
                <button
                  key={value}
                  onClick={() => handleAnswerSelect(currentQuestion.id, value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    border: `2px solid ${isSelected ? '#f97316' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: isSelected ? '#fef3c7' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '16px',
                    color: '#374151',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#d1d5db'
                      e.currentTarget.style.background = '#f9fafb'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.background = 'white'
                    }
                  }}
                >
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    border: `2px solid ${isSelected ? '#f97316' : '#d1d5db'}`,
                    background: isSelected ? '#f97316' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    {isSelected && <CheckCircle style={{ width: '16px', height: '16px', color: 'white' }} />}
                  </div>
                  <span style={{ fontWeight: isSelected ? '500' : '400' }}>
                    {value === 1 && '完全不符合'}
                    {value === 2 && '比较不符合'}
                    {value === 3 && '不确定'}
                    {value === 4 && '比较符合'}
                    {value === 5 && '完全符合'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 导航按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              background: currentQuestionIndex === 0 ? '#f9fafb' : 'white',
              color: currentQuestionIndex === 0 ? '#9ca3af' : '#374151',
              cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            上一题
          </button>

          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            已答题: {answers.length} / {QUESTIONS.length}
          </div>

          <button
            onClick={handleNext}
            disabled={!getCurrentAnswer()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: getCurrentAnswer() ? 'linear-gradient(135deg, #f97316 0%, #eab308 100%)' : '#e5e7eb',
              color: getCurrentAnswer() ? 'white' : '#9ca3af',
              cursor: getCurrentAnswer() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {currentQuestionIndex === QUESTIONS.length - 1 ? '完成评测' : '下一题'}
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
    </div>
  )
}
