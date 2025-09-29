'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { QUESTIONS } from '@/lib/questions'
import { Answer, AssessmentSession } from '@/lib/types'
import { calculatePersonalityScores } from '@/lib/assessment'

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
    const savedSession = localStorage.getItem('assessmentSession')
    if (savedSession) {
      const sessionData = JSON.parse(savedSession)
      setSession(sessionData)
      setAnswers(sessionData.answers || [])
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // 保存进度到localStorage
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
  }, [answers]) // 移除session依赖，避免循环

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

  const handleSubmit = async () => {
    if (answers.length !== QUESTIONS.length) {
      alert('请完成所有题目')
      return
    }

    setIsSubmitting(true)
    
    try {
      // 计算结果
      const results = calculatePersonalityScores(answers)
      
      // 更新会话
      const completedSession = {
        ...session!,
        answers,
        results,
        status: 'completed' as const,
        completedAt: new Date().toISOString()
      }
      
      localStorage.setItem('assessmentSession', JSON.stringify(completedSession))
      
      // 同时更新管理员后台的任务数据
      const taskKey = `assessmentTask_${sessionId}`
      const existingTask = localStorage.getItem(taskKey)
      if (existingTask) {
        const taskData = JSON.parse(existingTask)
        const updatedTask = {
          ...taskData,
          status: 'completed',
          completedAt: new Date().toISOString(),
          results: results
        }
        localStorage.setItem(taskKey, JSON.stringify(updatedTask))
      }
      
      // 跳转到结果页面
      router.push(`/assessment/${sessionId}/results`)
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentAnswer = () => {
    return answers.find(a => a.questionId === currentQuestion.id)?.score || 0
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
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* 题目 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion.text}
            </h2>
            
            {/* 选项 */}
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => handleAnswerSelect(score)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                    getCurrentAnswer() === score
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      getCurrentAnswer() === score
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {getCurrentAnswer() === score && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className="font-medium">
                      {score === 1 && '完全不符合'}
                      {score === 2 && '不太符合'}
                      {score === 3 && '一般'}
                      {score === 4 && '比较符合'}
                      {score === 5 && '完全符合'}
                    </span>
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
              className="flex items-center px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              上一题
            </button>

            {currentQuestionIndex === QUESTIONS.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={getCurrentAnswer() === 0 || isSubmitting}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                完成评测
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={getCurrentAnswer() === 0}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一题
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


