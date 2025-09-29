'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LogOut, User, Shield, Clock, Users, FileText, Download, Eye, Trash2 } from 'lucide-react'
import { getAssessmentRecords, getAssessmentStats, AssessmentRecord, clearAllAssessmentRecords } from '@/lib/assessment-storage'

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
  const [assessmentRecords, setAssessmentRecords] = useState<AssessmentRecord[]>([])
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    thisMonth: 0,
    thisWeek: 0
  })

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
      
      // 加载评测记录
      const records = getAssessmentRecords()
      setAssessmentRecords(records)
      
      // 加载统计信息
      const statistics = getAssessmentStats()
      setStats(statistics)
      
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

  const handleClearRecords = () => {
    if (confirm('确定要清空所有评测记录吗？此操作不可恢复！')) {
      clearAllAssessmentRecords()
      setAssessmentRecords([])
      setStats(getAssessmentStats())
      alert('所有评测记录已清空')
    }
  }

  const handleViewRecord = (record: AssessmentRecord) => {
    // 跳转到评测结果页面
    router.push(`/assessment/${record.sessionId}/results`)
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

        {/* 统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Users style={{ width: '24px', height: '24px', color: '#3b82f6', marginRight: '12px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                总评测数
              </h2>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
              {stats.total}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <CheckCircle style={{ width: '24px', height: '24px', color: '#059669', marginRight: '12px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                已完成
              </h2>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
              {stats.completed}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Clock style={{ width: '24px', height: '24px', color: '#f59e0b', marginRight: '12px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                本月评测
              </h2>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats.thisMonth}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <FileText style={{ width: '24px', height: '24px', color: '#8b5cf6', marginRight: '12px' }} />
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
                本周评测
              </h2>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>
              {stats.thisWeek}
            </div>
          </div>
        </div>

        {/* 评测记录列表 */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', margin: '0' }}>
              评测记录
            </h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: '#6b7280', 
                  color: 'white', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontSize: '14px'
                }}
              >
                刷新
              </button>
              {adminAuth.role === 'super_admin' && (
                <button
                  onClick={handleClearRecords}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    background: '#dc2626', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontSize: '14px'
                  }}
                >
                  <Trash2 style={{ width: '16px', height: '16px' }} />
                  清空记录
                </button>
              )}
            </div>
          </div>

          {assessmentRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <FileText style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', margin: '0' }}>暂无评测记录</p>
              <p style={{ fontSize: '14px', margin: '8px 0 0' }}>候选人完成评测后，记录将显示在这里</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>姓名</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>职位</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>邮箱</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>完成时间</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentRecords.map((record) => (
                    <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                        {record.candidateName}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                        {record.position}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                        {record.candidateEmail}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                        {new Date(record.completedAt).toLocaleString('zh-CN')}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleViewRecord(record)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            background: '#3b82f6', 
                            color: 'white', 
                            border: 'none', 
                            padding: '6px 12px', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            fontSize: '12px'
                          }}
                        >
                          <Eye style={{ width: '14px', height: '14px' }} />
                          查看
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            <div>
              <div style={{ color: '#9ca3af', marginBottom: '4px' }}>登录时间</div>
              <div>{new Date(adminAuth.loginTime).toLocaleString('zh-CN')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
