import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 生成唯一ID - 简化版本，避免URL问题
export function generateUniqueId(name: string, phone: string): string {
  const timestamp = Date.now().toString(36)
  const nameHash = name.slice(0, 2)
  const phoneHash = phone.slice(-4)
  return `${timestamp}_${nameHash}_${phoneHash}`
}

// 手机号码验证
export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function getPhoneValidationError(phone: string): string {
  if (!phone) return '手机号码不能为空'
  if (!/^1[3-9]\d{9}$/.test(phone)) return '请输入11位有效手机号码'
  return ''
}

// 邮箱验证
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 中文姓名验证 (2-10个汉字)
export function validateChineseName(name: string): boolean {
  return /^[\u4e00-\u9fa5]{2,10}$/.test(name)
}

export function getNameValidationError(name: string): string {
  if (!name) return '姓名不能为空'
  if (!/^[\u4e00-\u9fa5]{2,10}$/.test(name)) return '姓名必须是2-10个汉字'
  return ''
}

// 格式化日期
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 生成评测链接
export function generateAssessmentLink(sessionId: string): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/assessment/${sessionId}`
}

// 获取评测会话
export function getAssessmentSession(sessionId: string) {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(`assessmentSession_${sessionId}`)
  if (data) {
    try {
      return JSON.parse(data)
    } catch (e) {
      console.error(`Failed to parse assessment session ${sessionId} from localStorage`, e)
      return null
    }
  }
  return null
}

// 更新评测会话
export function updateAssessmentSession(sessionId: string, sessionData: any) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`assessmentSession_${sessionId}`, JSON.stringify(sessionData))
}

// 创建评测会话
export function createAssessmentSession(sessionData: any) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`assessmentSession_${sessionData.id}`, JSON.stringify(sessionData))
}
