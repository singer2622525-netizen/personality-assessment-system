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
    setErrors({ name: '', email: '', phone: '', position: '' })
    
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
      newErrors.position = '请选择应聘岗位'
      hasError = true
    }

    if (hasError) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    
    // 生成会话ID和唯一ID
    const sessionId = Math.random().toString(36).substring(2, 15)
    const uniqueId = generateUniqueId(formData.name, formData.phone)
    
    // 保存会话信息到localStorage
    localStorage.setItem('assessmentSession', JSON.stringify({
      id: sessionId,
      candidateName: formData.name,
      candidateEmail: formData.email,
      candidatePhone: formData.phone,
      position: formData.position,
      status: 'in_progress',
      answers: [],
      createdAt: new Date().toISOString(),
      uniqueId: uniqueId
    }))

    // 跳转到评测页面
    router.push(`/assessment/${sessionId}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-8">
          {/* 头部 */}
          <div className="text-center mb-6 md:mb-8">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <User className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              5型人格评测
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              请填写基本信息开始评测
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                姓名 *（仅限中文）
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm md:text-base ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="请输入您的中文姓名（2-4个字符）"
                  required
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱 *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm md:text-base ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="请输入您的邮箱地址"
                  required
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                手机号码 *（中国11位）
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={11}
                  className={`w-full pl-10 pr-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm md:text-base ${
                    errors.phone 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="请输入11位中国手机号码"
                  required
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

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
                  className={`w-full pl-10 pr-4 py-2 md:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm md:text-base ${
                    errors.position 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="请输入您应聘的岗位名称"
                  required
                />
              </div>
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 md:py-3 px-4 md:px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm md:text-base"
            >
              {isLoading ? (
                <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  开始评测
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* 说明 */}
          <div className="mt-6 md:mt-8 p-3 md:p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2 text-sm md:text-base">评测说明</h3>
            <ul className="text-xs md:text-sm text-blue-800 space-y-1">
              <li>• 评测包含50道题目，预计用时10-15分钟</li>
              <li>• 请根据您的真实情况选择最符合的答案</li>
              <li>• 评测结果将用于招聘分析，请认真作答</li>
              <li>• 支持随时保存进度，可多次完成</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
