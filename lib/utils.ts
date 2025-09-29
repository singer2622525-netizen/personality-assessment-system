import { AssessmentSession } from './types'

// 生成唯一ID
export function generateUniqueId(name: string, phone: string): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
  const nameHash = name.slice(0, 2)
  const phoneHash = phone.slice(-4)
  
  return `${dateStr}_${timeStr}_${nameHash}_${phoneHash}`
}

// 验证手机号
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 验证邮箱
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证中文姓名
export function validateChineseName(name: string): boolean {
  const nameRegex = /^[\u4e00-\u9fa5]{2,4}$/
  return nameRegex.test(name)
}

// 获取手机号验证错误信息
export function getPhoneValidationError(phone: string): string {
  if (!phone) return '请输入手机号'
  if (!validatePhone(phone)) return '请输入正确的手机号格式'
  return ''
}

// 获取姓名验证错误信息
export function getNameValidationError(name: string): string {
  if (!name) return '请输入姓名'
  if (!validateChineseName(name)) return '请输入2-4个中文字符的姓名'
  return ''
}

// 格式化日期
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生成评测链接
export function generateAssessmentLink(sessionId: string): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/assessment/${sessionId}`
}

// 创建评测会话
export function createAssessmentSession(sessionData: AssessmentSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`assessmentSession_${sessionData.id}`, JSON.stringify(sessionData))
}

// 获取评测会话
export function getAssessmentSession(sessionId: string): AssessmentSession | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(`assessmentSession_${sessionId}`)
  if (data) {
    try {
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to parse session data:', error)
      return null
    }
  }
  return null
}

// 更新评测会话
export function updateAssessmentSession(sessionId: string, updates: Partial<AssessmentSession>): void {
  if (typeof window === 'undefined') return
  const session = getAssessmentSession(sessionId)
  if (session) {
    const updatedSession = { ...session, ...updates }
    localStorage.setItem(`assessmentSession_${sessionId}`, JSON.stringify(updatedSession))
  }
}

// 保存评测结果
export function saveAssessmentSession(session: AssessmentSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`assessmentSession_${session.id}`, JSON.stringify(session))
}
