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

// 获取当前登录的管理员信息
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
  
  const existingUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]')
  
  // 如果没有用户，创建默认管理员
  if (existingUsers.length === 0) {
    const defaultAdmin: AdminUser = {
      id: '1',
      username: 'admin',
      email: 'admin@company.com',
      password: 'admin123',
      createdAt: new Date().toISOString()
    }
    
    existingUsers.push(defaultAdmin)
    localStorage.setItem('adminUsers', JSON.stringify(existingUsers))
  }
}

// 更新管理员账户信息
export function updateAdminAccount(userId: string, updates: Partial<AdminUser>): boolean {
  if (typeof window === 'undefined') return false
  
  const existingUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]')
  const userIndex = existingUsers.findIndex((u: AdminUser) => u.id === userId)
  
  if (userIndex >= 0) {
    existingUsers[userIndex] = { ...existingUsers[userIndex], ...updates }
    localStorage.setItem('adminUsers', JSON.stringify(existingUsers))
    
    // 如果更新的是当前登录用户，更新本地存储
    const currentAdmin = getCurrentAdmin()
    if (currentAdmin && currentAdmin.id === userId) {
      localStorage.setItem('currentAdmin', JSON.stringify(existingUsers[userIndex]))
    }
    
    return true
  }
  
  return false
}
