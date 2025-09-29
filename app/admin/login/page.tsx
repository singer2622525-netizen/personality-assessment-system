'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { createDefaultAdmin } from '@/lib/auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // 创建默认管理员账户
    createDefaultAdmin()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isLogin) {
        // 登录逻辑
        if (!formData.username || !formData.password) {
          setError('请填写用户名和密码')
          return
        }

        // 简单的本地验证（实际项目中应该连接后端）
        const savedUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]')
        const user = savedUsers.find((u: any) => 
          u.username === formData.username && u.password === formData.password
        )

        if (user) {
          // 保存登录状态
          localStorage.setItem('adminLoggedIn', 'true')
          localStorage.setItem('currentAdmin', JSON.stringify(user))
          router.push('/admin/dashboard')
        } else {
          setError('用户名或密码错误')
        }
      } else {
        // 注册逻辑
        if (!formData.username || !formData.email || !formData.password) {
          setError('请填写完整信息')
          return
        }

        if (formData.password !== formData.confirmPassword) {
          setError('两次输入的密码不一致')
          return
        }

        if (formData.password.length < 6) {
          setError('密码长度至少6位')
          return
        }

        // 检查用户名是否已存在
        const savedUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]')
        const existingUser = savedUsers.find((u: any) => u.username === formData.username)
        
        if (existingUser) {
          setError('用户名已存在')
          return
        }

        // 保存新用户
        const newUser = {
          id: Date.now().toString(),
          username: formData.username,
          email: formData.email,
          password: formData.password,
          createdAt: new Date().toISOString()
        }

        savedUsers.push(newUser)
        localStorage.setItem('adminUsers', JSON.stringify(savedUsers))
        
        alert('注册成功！请使用新账户登录。')
        setIsLogin(true)
        setFormData({ username: '', email: '', password: '', confirmPassword: '' })
      }
    } catch (error) {
      console.error('操作失败:', error)
      setError('操作失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* 头部 */}
          <div className="text-center mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </button>
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? '管理员登录' : '管理员注册'}
            </h1>
            <p className="text-gray-600">
              {isLogin ? '请输入您的登录凭据' : '创建新的管理员账户'}
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                用户名 *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请输入用户名"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱 *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="请输入邮箱"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码 *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码 *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="请再次输入密码"
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setFormData({ username: '', email: '', password: '', confirmPassword: '' })
              }}
              className="text-orange-600 hover:text-orange-700 text-sm"
            >
              {isLogin ? '没有账户？点击注册' : '已有账户？点击登录'}
            </button>
          </div>

          {/* 说明 */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <h3 className="font-medium text-orange-900 mb-2">管理员权限说明</h3>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• 创建和管理评测任务</li>
              <li>• 查看候选人评测结果</li>
              <li>• 进行结果对比分析</li>
              <li>• 查看数据统计分析</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
