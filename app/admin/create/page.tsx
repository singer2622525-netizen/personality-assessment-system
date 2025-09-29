'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, User, Mail, Phone, Briefcase, Send } from 'lucide-react'
import { generateUniqueId } from '@/lib/utils'

export default function CreateAssessmentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    position: '',
    notes: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // 验证必填字段
      if (!formData.candidateName.trim()) {
        setError('请输入候选人姓名')
        setIsLoading(false)
        return
      }

      if (!formData.candidateEmail.trim()) {
        setError('请输入候选人邮箱')
        setIsLoading(false)
        return
      }

      if (!formData.position.trim()) {
        setError('请选择应聘岗位')
        setIsLoading(false)
        return
      }

      // 生成唯一的会话ID
      const sessionId = generateUniqueId(formData.candidateName.trim(), formData.candidatePhone.trim())
      
      // 创建评测会话
      const sessionData = {
        id: sessionId,
        candidateName: formData.candidateName.trim(),
        candidateEmail: formData.candidateEmail.trim(),
        candidatePhone: formData.candidatePhone.trim(),
        position: formData.position.trim(),
        notes: formData.notes.trim(),
        status: 'pending' as 'pending',
        answers: [],
        createdAt: new Date().toISOString(),
        uniqueId: sessionId
      }

      // 保存到localStorage
      localStorage.setItem(`assessmentSession_${sessionId}`, JSON.stringify(sessionData))

      // 跳转到评测页面
      router.push(`/assessment/${sessionId}`)

    } catch (error) {
      console.error('创建评测任务失败:', error)
      setError('创建评测任务失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const positions = [
    '销售工程师',
    '机械设计师',
    '事业部领导',
    '文职类岗位',
    '技术工程师',
    '项目经理',
    '其他'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回仪表板
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Plus className="w-8 h-8 mr-3 text-blue-600" />
                  创建评测任务
                </h1>
                <p className="text-gray-600 mt-1">
                  为候选人创建新的5型人格评测任务
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">候选人信息</h2>
            <p className="text-sm text-gray-600 mt-1">
              请填写候选人的基本信息，系统将为其生成专属的评测链接
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 候选人姓名 */}
            <div>
              <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                候选人姓名 *
              </label>
              <input
                type="text"
                id="candidateName"
                name="candidateName"
                value={formData.candidateName}
                onChange={handleInputChange}
                placeholder="请输入候选人姓名"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 候选人邮箱 */}
            <div>
              <label htmlFor="candidateEmail" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                候选人邮箱 *
              </label>
              <input
                type="email"
                id="candidateEmail"
                name="candidateEmail"
                value={formData.candidateEmail}
                onChange={handleInputChange}
                placeholder="请输入候选人邮箱"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 候选人电话 */}
            <div>
              <label htmlFor="candidatePhone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                候选人电话
              </label>
              <input
                type="tel"
                id="candidatePhone"
                name="candidatePhone"
                value={formData.candidatePhone}
                onChange={handleInputChange}
                placeholder="请输入候选人电话（可选）"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 应聘岗位 */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                应聘岗位 *
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择应聘岗位</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            {/* 备注信息 */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                备注信息
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="请输入备注信息（可选）"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    创建中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    创建评测任务
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 说明信息 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">创建说明：</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 创建评测任务后，系统将生成专属的评测链接</li>
            <li>• 候选人可以通过链接完成5型人格评测</li>
            <li>• 评测完成后，您可以在管理后台查看详细结果</li>
            <li>• 支持导出PDF格式的评测报告</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
