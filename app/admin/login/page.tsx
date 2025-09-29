'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, User, Eye, EyeOff } from 'lucide-react'
import { ADMIN_ACCOUNTS, validatePassword, generateSessionToken } from '@/lib/admin-config'

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // 清除错误信息
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      // 查找用户
      const user = ADMIN_ACCOUNTS.find(account => account.username === formData.username)
      
      if (!user) {
        setError('用户名不存在')
        setIsLoading(false)
        return
      }
      
      // 验证密码
      if (!validatePassword(formData.password, user.password)) {
        setError('密码错误')
        setIsLoading(false)
        return
      }
      
      // 生成会话令牌
      const sessionToken = generateSessionToken()
      
      // 保存登录信息到 localStorage
      const loginData = {
        isAdmin: true,
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        sessionToken,
        loginTime: new Date().toISOString()
      }
      
      localStorage.setItem('adminAuth', JSON.stringify(loginData))
      
      // 跳转到管理后台
      router.push('/admin/dashboard')
      
    } catch (error) {
      console.error('登录错误:', error)
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* 返回按钮 */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            返回首页
          </button>
        </div>

        {/* 登录表单 */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Lock style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              管理员登录
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              请输入您的管理员账号和密码
            </p>
          </div>

          <form onSubmit={handleLogin}>
            {/* 用户名输入 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                用户名
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="请输入用户名"
                  required
                  style={{ width: '100%', padding: '12px 12px 12px 44px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                密码
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="请输入密码"
                  required
                  style={{ width: '100%', padding: '12px 44px 12px 44px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                >
                  {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                </button>
              </div>
            </div>

            {/* 错误信息 */}
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                <p style={{ color: '#dc2626', fontSize: '14px', margin: '0' }}>
                  {error}
                </p>
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ 
                width: '100%', 
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                color: 'white', 
                padding: '12px 24px', 
                borderRadius: '8px', 
                border: 'none', 
                cursor: isLoading ? 'not-allowed' : 'pointer', 
                fontSize: '16px', 
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>

          {/* 安全提示 */}
          <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              安全提示：
            </h3>
            <ul style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5', margin: '0', paddingLeft: '16px' }}>
              <li>请使用管理员提供的账号密码登录</li>
              <li>请勿在公共场所输入密码</li>
              <li>登录后请及时退出</li>
              <li>如有问题请联系系统管理员</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
