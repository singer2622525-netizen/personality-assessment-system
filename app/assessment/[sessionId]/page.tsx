'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { QUESTIONS } from '@/lib/questions'
import { AssessmentSession, Answer, PersonalityResults } from '@/lib/types'
import { calculatePersonalityResults } from '@/lib/assessment'

interface AssessmentPageProps {
  params: {
    sessionId: string
  }
}

export default function AssessmentPage({ params }: AssessmentPageProps) {
  const router = useRouter()
  const [session, setSession] = useState<AssessmentSession | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const currentQuestion = QUESTIONS[currentQuestionIndex]

  useEffect(() => {
    const savedSession = localStorage.getItem('assessmentSession')
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession)
      setSession(parsedSession)
      setAnswers(parsedSession.answers || [])
    }
  }, [])

  useEffect(() => {
    if (session) {
      const updatedSession: AssessmentSession = {
        ...session,
        answers,
        status: (answers.length === QUESTIONS.length ? 'completed' : 'in_progress') as 'pending' | 'in_progress' | 'completed'
      }
      localStorage.setItem('assessmentSession', JSON.stringify(updatedSession))
      // 避免无限循环，只在状态真正改变时更新
      if (JSON.stringify(updatedSession) !== JSON.stringify(session)) {
        setSession(updatedSession)
      }
    }
  }, [answers])

  const handleAnswerSelect = (score: number) => {
    const existingAnswerIndex = answers.findIndex(a => a.questionId === currentQuestion.id)
    
    if (existingAnswerIndex >= 0) {
      // 更新现有答案
      const updatedAnswers = [...answers]
      updatedAnswers[existingAnswerIndex] = { questionId: currentQuestion.id, score }
      setAnswers(updatedAnswers)
    } else {
      // 添加新答案
      setAnswers([...answers, { questionId: currentQuestion.id, score }])
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleComplete = () => {
    if (session) {
      const results = calculatePersonalityResults(answers)
      const completedSession: AssessmentSession = {
        ...session,
        answers,
        status: 'completed',
        results,
        completedAt: new Date()
      }
      localStorage.setItem('assessmentSession', JSON.stringify(completedSession))
      router.push(`/assessment/${params.sessionId}/results`)
    }
  }

  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* 头部 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </button>
            <div className="text-sm text-gray-500">
              {session.candidateName} - {session.position}
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>题目 {currentQuestionIndex + 1} / {QUESTIONS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 题目卡片 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion.text}
            </h2>
            <p className="text-sm text-gray-500">
              请根据您的实际情况选择最符合的选项
            </p>
          </div>

          {/* 选项 */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => handleAnswerSelect(score)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  currentAnswer?.score === score
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {score === 1 && '完全不符合'}
                    {score === 2 && '不太符合'}
                    {score === 3 && '一般'}
                    {score === 4 && '比较符合'}
                    {score === 5 && '完全符合'}
                  </span>
                  <span className="text-lg font-bold">{score}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            上一题
          </button>

          {currentQuestionIndex === QUESTIONS.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={answers.length !== QUESTIONS.length}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              完成评测
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all"
            >
              下一题
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
