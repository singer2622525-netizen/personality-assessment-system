'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, ArrowRight, Briefcase } from 'lucide-react'
import { generateUniqueId, validatePhone, validateEmail, validateChineseName, getPhoneValidationError, getNameValidationError } from '@/lib/utils'

export default function AssessmentStartPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    position: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 重置错误信息
    setErrors({
      name: '',
      email: '',
      phone: '',
      position: ''
    })
    
    // 验证所有字段
    const newErrors = { name: '', email: '', phone: '', position: '' }
    let hasError = false

    // 验证姓名
    if (!formData.name) {
      newErrors.name = '请输入姓名'
      hasError = true
    } else if (!validateChineseName(formData.name)) {
      newErrors.name = getNameValidationError(formData.name)
      hasError = true
    }

    // 验证邮箱
    if (!formData.email) {
      newErrors.email = '请输入邮箱'
      hasError = true
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '请输入正确的邮箱地址'
      hasError = true
    }

    // 验证手机号
    if (!formData.phone) {
      newErrors.phone = '请输入手机号码'
      hasError = true
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = getPhoneValidationError(formData.phone)
      hasError = true
    }

    // 验证岗位
    if (!formData.position) {
      newErrors.position = '请输入应聘岗位'
      hasError = true
    }

    if (hasError) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    
    try {
      // 生成会话ID和唯一ID
      const sessionId = generateUniqueId(formData.name, formData.phone)
      
      // 创建会话数据
      const sessionData = {
        id: sessionId,
        candidateName: formData.name.trim(),
        candidateEmail: formData.email.trim(),
        candidatePhone: formData.phone.trim(),
        position: formData.position.trim(),
        status: 'in_progress' as 'in_progress',
        answers: [],
        createdAt: new Date().toISOString(),
        uniqueId: sessionId
      }

      // 保存会话信息到localStorage - 使用统一的键名
      localStorage.setItem(`assessmentSession_${sessionId}`, JSON.stringify(sessionData))

      // 跳转到评测页面
      router.push(`/assessment/${sessionId}`)
    } catch (error) {
      console.error('Failed to start assessment:', error)
      alert('启动评测失败，请稍后再试。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            返回首页
          </button>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              5型人格评测
            </h1>
            <p className="text-gray-600">
              请填写您的基本信息，开始专业的人格评测
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 姓名输入 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                姓名 *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="请输入您的姓名"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* 邮箱输入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                邮箱 *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="请输入您的邮箱"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* 手机号输入 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                手机号 *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="请输入您的手机号"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* 岗位输入 - 文本输入框 */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                应聘岗位 *
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="请输入您应聘的岗位名称"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.position ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position}</p>
              )}
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  启动中...
                </>
              ) : (
                <>
                  开始评测
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* 说明信息 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-900 mb-2">评测说明：</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 评测包含50道题目，预计用时10-15分钟</li>
              <li>• 请根据您的真实情况选择最符合的答案</li>
              <li>• 评测结果将用于招聘决策参考</li>
              <li>• 评测过程中可以随时保存进度</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
