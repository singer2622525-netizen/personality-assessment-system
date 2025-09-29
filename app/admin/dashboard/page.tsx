'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut, User, Shield, Clock, Users, FileText, Download } from 'lucide-react'

interface AdminAuth {
  isAdmin: boolean
  userId: string
  username: string
  name: string
  role: string
  permissions: string[]
  sessionToken: string
  loginTime: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [adminAuth, setAdminAuth] = useState<AdminAuth | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 检查登录状态
    const authData = localStorage.getItem('adminAuth')
    if (!authData) {
      router.push('/admin/login')
      return
    }

    try {
      const parsedAuth = JSON.parse(authData)
      setAdminAuth(parsedAuth)
    } catch (error) {
      console.error('解析认证数据失败:', error)
      router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    router.push('/admin/login')
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      super_admin: '超级管理员',
      hr_admin: 'HR管理员',
      manager: '部门经理',
      viewer: '查看者'
    }
    return roleNames[role] || role
  }

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      super_admin: '#dc2626',
      hr_admin: '#2563eb',
      manager: '#059669',
      viewer: '#6b7280'
    }
    return colors[role] || '#6b7280'
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' }}>
        <div style={{ color: 'white', fontSize: '18px' }}>加载中...</div>
      </div>
    )
  }

  if (!adminAuth) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)', padding: '16px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 头部导航 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => router.push('/')}
              style={{ display: 'flex', alignItems: 'center', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', marginRight: '24px' }}
            >
              <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              返回首页
            </button>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '600', margin: '0' }}>
              管理后台
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* 用户信息 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.1)', padding: '8px 16px', borderRadius: '8px' }}>
              <User style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
              <div>
                <div style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                  {adminAuth.name}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                  {adminAuth.username}
                </div>
              </div>
              <div style={{ 
                background: getRoleColor(adminAuth.role), 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '4px', 
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {getRoleDisplayName(adminAuth.role)}
              </div>
            </div>
            
            {/* 退出按钮 */}
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} />
              退出登录
            </button>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* 用户信息卡片 */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Shield style={{ width: '24px', height: '24px', color: '#3b82f6', marginRight: '12px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                账户信息
              </h2>
            </div>
            <div style={{ space: '12px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>用户名</div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{adminAuth.username}</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>姓名</div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{adminAuth.name}</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>角色</div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: 'white', 
                  background: getRoleColor(adminAuth.role),
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>
                  {getRoleDisplayName(adminAuth.role)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>登录时间</div>
                <div style={{ fontSize: '14px', color: '#1f2937' }}>
                  {new Date(adminAuth.loginTime).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
          </div>

          {/* 权限信息卡片 */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Users style={{ width: '24px', height: '24px', color: '#059669', marginRight: '12px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                权限信息
              </h2>
            </div>
            <div>
              {adminAuth.permissions.includes('all') ? (
                <div style={{ fontSize: '14px', color: '#059669', fontWeight: '500' }}>
                  拥有所有权限
                </div>
              ) : (
                <div>
                  {adminAuth.permissions.map((permission, index) => {
                    const permissionNames: { [key: string]: string } = {
                      view_assessments: '查看评测结果',
                      download_reports: '下载报告',
                      manage_candidates: '管理候选人',
                      view_statistics: '查看统计信息'
                    }
                    return (
                      <div key={index} style={{ 
                        fontSize: '14px', 
                        color: '#1f2937', 
                        marginBottom: '8px',
                        padding: '8px 12px',
                        background: '#f3f4f6',
                        borderRadius: '6px'
                      }}>
                        {permissionNames[permission] || permission}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 快速操作卡片 */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <FileText style={{ width: '24px', height: '24px', color: '#f59e0b', marginRight: '12px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                快速操作
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => router.push('/')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Users style={{ width: '16px', height: '16px' }} />
                查看评测系统
              </button>
              <button
                onClick={() => router.push('/admin/login')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: '#6b7280', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Shield style={{ width: '16px', height: '16px' }} />
                切换账号
              </button>
            </div>
          </div>
        </div>

        {/* 系统信息 */}
        <div style={{ marginTop: '32px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            系统信息
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', color: '#d1d5db', fontSize: '14px' }}>
            <div>
              <div style={{ color: '#9ca3af', marginBottom: '4px' }}>系统版本</div>
              <div>v1.0.0</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', marginBottom: '4px' }}>部署平台</div>
              <div>Vercel</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', marginBottom: '4px' }}>会话令牌</div>
              <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>{adminAuth.sessionToken.substring(0, 8)}...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
