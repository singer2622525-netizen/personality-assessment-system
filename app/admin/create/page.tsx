'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, User, Mail, Phone, Briefcase } from 'lucide-react'
import { validatePhone, validateEmail, validateChineseName, getPhoneValidationError, getNameValidationError } from '@/lib/utils'

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
  const [errors, setErrors] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '',
    position: ''
  })


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 重置错误信息
    setErrors({ candidateName: '', candidateEmail: '', candidatePhone: '', position: '' })
    
    // 验证所有字段
    const newErrors = { candidateName: '', candidateEmail: '', candidatePhone: '', position: '' }
    let hasError = false

    // 验证姓名
    if (!formData.candidateName) {
      newErrors.candidateName = '请输入候选人姓名'
      hasError = true
    } else if (!validateChineseName(formData.candidateName)) {
      newErrors.candidateName = getNameValidationError(formData.candidateName)
      hasError = true
    }

    // 验证邮箱
    if (!formData.candidateEmail) {
      newErrors.candidateEmail = '请输入候选人邮箱'
      hasError = true
    } else if (!validateEmail(formData.candidateEmail)) {
      newErrors.candidateEmail = '请输入正确的邮箱地址'
      hasError = true
    }

    // 验证手机号
    if (!formData.candidatePhone) {
      newErrors.candidatePhone = '请输入候选人手机号码'
      hasError = true
    } else if (!validatePhone(formData.candidatePhone)) {
      newErrors.candidatePhone = getPhoneValidationError(formData.candidatePhone)
      hasError = true
    }

    // 验证岗位
    if (!formData.position) {
      newErrors.position = '请选择应聘岗位'
      hasError = true
    }

    if (hasError) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    
    try {
      // 生成会话ID
      const sessionId = Math.random().toString(36).substring(2, 15)
      
      // 创建评测任务
      const assessmentTask = {
        id: sessionId,
        candidateName: formData.candidateName,
        candidateEmail: formData.candidateEmail,
        candidatePhone: formData.candidatePhone,
        position: formData.position,
        notes: formData.notes,
        status: 'pending',
        createdAt: new Date().toISOString(),
        assessmentUrl: `${window.location.origin}/assessment/${sessionId}`
      }

      // 保存到localStorage
      localStorage.setItem(`assessmentTask_${sessionId}`, JSON.stringify(assessmentTask))
      
      // 显示成功信息
      alert(`评测任务创建成功！\n\n候选人：${formData.candidateName}\n邮箱：${formData.candidateEmail}\n手机：${formData.candidatePhone}\n岗位：${formData.position}\n\n评测链接：${assessmentTask.assessmentUrl}\n\n请将此链接发送给候选人。`)
      
      // 返回管理后台
      router.push('/admin/dashboard')
    } catch (error) {
      console.error('创建失败:', error)
      alert('创建失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // 清除对应字段的错误信息
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回管理后台
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              返回首页
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">创建评测任务</h1>
              <p className="text-gray-600 mt-1">为候选人创建5型人格评测任务</p>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 候选人信息 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">候选人信息</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="candidateName" className="block text-sm font-medium text-gray-700 mb-2">
                    姓名 *（仅限中文）
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="candidateName"
                      name="candidateName"
                      value={formData.candidateName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.candidateName 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="请输入候选人中文姓名（2-4个字符）"
                      required
                    />
                  </div>
                  {errors.candidateName && (
                    <p className="mt-1 text-sm text-red-600">{errors.candidateName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="candidateEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱 *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="candidateEmail"
                      name="candidateEmail"
                      value={formData.candidateEmail}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.candidateEmail 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="请输入候选人邮箱地址"
                      required
                    />
                  </div>
                  {errors.candidateEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.candidateEmail}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="candidatePhone" className="block text-sm font-medium text-gray-700 mb-2">
                    手机号码 *（中国11位）
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      id="candidatePhone"
                      name="candidatePhone"
                      value={formData.candidatePhone}
                      onChange={handleInputChange}
                      maxLength={11}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                        errors.candidatePhone 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-orange-500'
                      }`}
                      placeholder="请输入11位中国手机号码"
                      required
                    />
                  </div>
                  {errors.candidatePhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.candidatePhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 岗位信息 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">岗位信息</h2>
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                  应聘岗位 *
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                      errors.position 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-orange-500'
                    }`}
                    placeholder="请输入候选人应聘的岗位名称"
                    required
                  />
                </div>
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                )}
              </div>
            </div>

            {/* 备注信息 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">备注信息</h2>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  备注
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请输入备注信息（可选）"
                />
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                创建评测任务
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
