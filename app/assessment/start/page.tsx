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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // 清除对应字段的错误
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      position: ''
    }

    // 验证姓名
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名'
    } else if (!validateChineseName(formData.name)) {
      newErrors.name = getNameValidationError(formData.name)
    }

    // 验证邮箱
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    // 验证手机号
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = getPhoneValidationError(formData.phone)
    }

    // 验证职位
    if (!formData.position.trim()) {
      newErrors.position = '请输入应聘职位'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // 生成唯一的会话ID
      const sessionId = generateUniqueId(formData.name.trim(), formData.phone.trim())
      
      // 创建会话数据
      const sessionData = {
        id: sessionId,
        candidateName: formData.name.trim(),
        candidateEmail: formData.email.trim(),
        candidatePhone: formData.phone.trim(),
        position: formData.position.trim(),
        answers: [],
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      }

      // 保存到 localStorage
      localStorage.setItem(`assessment_session_${sessionId}`, JSON.stringify(sessionData))
      
      // 跳转到评测页面
      router.push(`/assessment/${sessionId}`)
      
    } catch (error) {
      console.error('创建评测会话失败:', error)
      alert('创建评测会话失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        {/* 返回按钮 */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          >
            <ArrowRight style={{ width: '16px', height: '16px', marginRight: '8px', transform: 'rotate(180deg)' }} />
            返回首页
          </button>
        </div>

        {/* 表单卡片 */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <User style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              个人信息填写
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              请填写您的基本信息，我们将为您生成个性化的人格评测报告
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 姓名 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                姓名 *
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="请输入您的真实姓名"
                  style={{ width: '100%', padding: '12px 12px 12px 44px', border: `1px solid ${errors.name ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = errors.name ? '#dc2626' : '#d1d5db'}
                />
              </div>
              {errors.name && (
                <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* 邮箱 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                邮箱 *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="请输入您的邮箱地址"
                  style={{ width: '100%', padding: '12px 12px 12px 44px', border: `1px solid ${errors.email ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = errors.email ? '#dc2626' : '#d1d5db'}
                />
              </div>
              {errors.email && (
                <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* 手机号 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                手机号 *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="请输入您的手机号码"
                  style={{ width: '100%', padding: '12px 12px 12px 44px', border: `1px solid ${errors.phone ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = errors.phone ? '#dc2626' : '#d1d5db'}
                />
              </div>
              {errors.phone && (
                <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* 应聘职位 */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                应聘职位 *
              </label>
              <div style={{ position: 'relative' }}>
                <Briefcase style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="请输入您应聘的职位"
                  style={{ width: '100%', padding: '12px 12px 12px 44px', border: `1px solid ${errors.position ? '#dc2626' : '#d1d5db'}`, borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = errors.position ? '#dc2626' : '#d1d5db'}
                />
              </div>
              {errors.position && (
                <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                  {errors.position}
                </p>
              )}
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ 
                width: '100%', 
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #f97316 0%, #eab308 100%)', 
                color: 'white', 
                padding: '12px 24px', 
                borderRadius: '8px', 
                border: 'none', 
                cursor: isLoading ? 'not-allowed' : 'pointer', 
                fontSize: '16px', 
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? '创建评测中...' : (
                <>
                  开始评测
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </>
              )}
            </button>
          </form>

          {/* 提示信息 */}
          <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              评测说明：
            </h3>
            <ul style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5', margin: '0', paddingLeft: '16px' }}>
              <li>评测包含50道题目，预计用时10-15分钟</li>
              <li>请根据您的真实情况选择最符合的答案</li>
              <li>评测结果将用于招聘决策参考</li>
              <li>您的个人信息将被严格保密</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
