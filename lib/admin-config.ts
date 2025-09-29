// 管理员账号配置
export const ADMIN_ACCOUNTS = [
  {
    id: 'admin001',
    username: 'admin',
    password: 'admin123456', // 默认密码，建议首次登录后修改
    name: '系统管理员',
    role: 'super_admin',
    permissions: ['all'],
    createdAt: new Date().toISOString(),
    lastLogin: null
  },
  {
    id: 'hr001',
    username: 'hr',
    password: 'hr123456', // HR专用账号
    name: 'HR管理员',
    role: 'hr_admin',
    permissions: ['view_assessments', 'download_reports', 'manage_candidates'],
    createdAt: new Date().toISOString(),
    lastLogin: null
  },
  {
    id: 'manager001',
    username: 'manager',
    password: 'manager123456', // 部门经理账号
    name: '部门经理',
    role: 'manager',
    permissions: ['view_assessments', 'download_reports'],
    createdAt: new Date().toISOString(),
    lastLogin: null
  }
]

// 角色权限定义
export const ROLE_PERMISSIONS = {
  super_admin: ['all'],
  hr_admin: ['view_assessments', 'download_reports', 'manage_candidates', 'view_statistics'],
  manager: ['view_assessments', 'download_reports'],
  viewer: ['view_assessments']
}

// 权限检查函数
export function hasPermission(userRole: string, requiredPermission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || []
  return permissions.includes('all') || permissions.includes(requiredPermission)
}

// 简单的密码验证（生产环境建议使用更安全的加密）
export function validatePassword(inputPassword: string, storedPassword: string): boolean {
  return inputPassword === storedPassword
}

// 生成简单的会话令牌
export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
