// 工具函数

// 生成唯一ID
export function generateUniqueId(name: string, phone: string): string {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '') // YYYYMMDD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '') // HHMMSS
  const nameHash = name.slice(-2) // 姓名后两位
  const phoneHash = phone.slice(-4) // 手机号后四位
  
  return `${dateStr}${timeStr}${nameHash}${phoneHash}`
}

// 格式化日期
export function formatDate(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 验证中文姓名
export function validateChineseName(name: string): boolean {
  // 中文姓名：2-4个中文字符，可包含常见中文标点
  const chineseNameRegex = /^[\u4e00-\u9fa5]{2,4}$/
  return chineseNameRegex.test(name)
}

// 验证手机号（中国11位）
export function validatePhone(phone: string): boolean {
  // 中国手机号：1开头，第二位3-9，总共11位数字
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 获取手机号验证错误信息
export function getPhoneValidationError(phone: string): string {
  if (!phone) return '请输入手机号码'
  if (phone.length !== 11) return '手机号码必须是11位数字'
  if (!/^1/.test(phone)) return '手机号码必须以1开头'
  if (!/^1[3-9]/.test(phone)) return '手机号码第二位必须是3-9'
  if (!/^\d+$/.test(phone)) return '手机号码只能包含数字'
  return '请输入正确的中国手机号码'
}

// 获取姓名验证错误信息
export function getNameValidationError(name: string): string {
  if (!name) return '请输入姓名'
  if (name.length < 2) return '姓名至少需要2个字符'
  if (name.length > 4) return '姓名最多4个字符'
  if (!/^[\u4e00-\u9fa5]+$/.test(name)) return '姓名只能包含中文字符'
  return '请输入正确的中文姓名'
}

// 验证邮箱
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 生成评测链接
export function generateAssessmentLink(sessionId: string): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/assessment/${sessionId}`
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

// 显示退出确认对话框
export function showExitConfirmation(): Promise<boolean> {
  return new Promise((resolve) => {
    const confirmed = window.confirm(
      '您已完成评测，感谢您的参与！\n\n' +
      '评测结果已保存，您可以：\n' +
      '• 查看详细结果报告\n' +
      '• 返回首页\n' +
      '• 关闭页面\n\n' +
      '确定要退出吗？'
    )
    resolve(confirmed)
  })
}
