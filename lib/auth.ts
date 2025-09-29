// 认证相关工具函数

export interface AdminUser {
  id: string
  username: string
  email: string
  password: string
  createdAt: string
}

// 检查是否已登录
export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('adminLoggedIn') === 'true'
}

// 获取当前管理员
export function getCurrentAdmin(): AdminUser | null {
  if (typeof window === 'undefined') return null
  const adminData = localStorage.getItem('currentAdmin')
  return adminData ? JSON.parse(adminData) : null
}

// 登录
export function loginAdmin(user: AdminUser): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('adminLoggedIn', 'true')
  localStorage.setItem('currentAdmin', JSON.stringify(user))
}

// 登出
export function logoutAdmin(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('adminLoggedIn')
  localStorage.removeItem('currentAdmin')
}

// 检查管理员权限
export function requireAuth(): boolean {
  if (!isAdminLoggedIn()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    return false
  }
  return true
}

// 创建默认管理员账户
export function createDefaultAdmin(): void {
  if (typeof window === 'undefined') return
  
  const defaultAdmin: AdminUser = {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@company.com',
    password: 'admin123456',
    createdAt: new Date().toISOString()
  }
  
  // 检查是否已存在
  if (!getCurrentAdmin()) {
    loginAdmin(defaultAdmin)
  }
}
