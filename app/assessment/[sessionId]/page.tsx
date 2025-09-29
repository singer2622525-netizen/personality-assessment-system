'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { QUESTIONS } from '@/lib/types'
import { Answer, AssessmentSession } from '@/lib/types'
import { calculatePersonalityScores } from '@/lib/assessment'
import { getAssessmentSession, updateAssessmentSession } from '@/lib/utils'

export default function AssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [session, setSession] = useState<AssessmentSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = QUESTIONS[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100

  useEffect(() => {
    // 从localStorage加载会话信息
    const sessionData = getAssessmentSession(sessionId)
    if (sessionData) {
      setSession(sessionData)
      setAnswers(sessionData.answers || [])
    }
    setIsLoading(false)
  }, [sessionId])

  useEffect(() => {
    // 保存进度到localStorage
    if (session) {
      const updatedSession: AssessmentSession = {
        ...session,
        answers,
        status: (answers.length === QUESTIONS.length ? 'completed' : 'in_progress') as 'pending' | 'in_progress' | 'completed'
      }
      updateAssessmentSession(sessionId, updatedSession)
      setSession(updatedSession)
    }
  }, [answers, sessionId])

  const handleAnswerSelect = (score: number) => {
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer: score
    }

    // 更新或添加答案
    const existingAnswerIndex = answers.findIndex(a => a.questionId === currentQuestion.id)
    let newAnswers: Answer[]
    
    if (existingAnswerIndex >= 0) {
      newAnswers = [...answers]
      newAnswers[existingAnswerIndex] = newAnswer
    } else {
      newAnswers = [...answers, newAnswer]
    }

    setAnswers(newAnswers)

    // 自动进入下一题
    setTimeout(() => {
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      }
    }, 300)
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

  const handleSubmit = async () => {
    if (answers.length !== QUESTIONS.length) {
      alert('请完成所有题目后再提交')
      return
    }

    setIsSubmitting(true)
    
    try {
      // 计算人格分数
      const results = calculatePersonalityScores(answers)
      
      // 更新会话状态
      const completedSession: AssessmentSession = {
        ...session!,
        answers,
        results,
        status: 'completed',
        completedAt: new Date().toISOString()
      }

      updateAssessmentSession(sessionId, completedSession)
      
      // 跳转到结果页面
      router.push(`/assessment/${sessionId}/results`)
    } catch (error) {
      console.error('Failed to submit assessment:', error)
      alert('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">会话不存在</h1>
          <button
            onClick={() => router.push('/assessment/start')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            重新开始
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 进度条 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              题目 {currentQuestionIndex + 1} / {QUESTIONS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% 完成
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 题目 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion.text}
            </h2>
            
            {/* 评分选项 */}
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((score) => {
                const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)
                const isSelected = currentAnswer?.answer === score
                
                return (
                  <button
                    key={score}
                    onClick={() => handleAnswerSelect(score)}
                    className={`w-full p-4 text-left border rounded-lg transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <span className="font-medium">{score}分</span>
                      <span className="ml-2 text-gray-600">
                        {score === 1 ? '完全不符合' : 
                         score === 2 ? '不太符合' : 
                         score === 3 ? '一般' : 
                         score === 4 ? '比较符合' : '完全符合'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 导航按钮 */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              上一题
            </button>

            <div className="flex space-x-3">
              {currentQuestionIndex === QUESTIONS.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || answers.length !== QUESTIONS.length}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      提交中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      完成评测
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === QUESTIONS.length - 1}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一题
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>

          {/* 进度提示 */}
          <div className="mt-6 text-center text-sm text-gray-500">
            已答题：{answers.length} / {QUESTIONS.length}
          </div>
        </div>
      </div>
    </div>
  )
}
