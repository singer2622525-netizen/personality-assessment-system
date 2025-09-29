'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { requireAuth, getCurrentAdmin, logoutAdmin } from '@/lib/auth'
import { 
  Users, 
  FileText, 
  BarChart3, 
  Plus, 
  Eye, 
  Download,
  Search,
  Filter,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { AssessmentSession } from '@/lib/types'

export default function AdminDashboard() {
  const router = useRouter()
  const [sessions, setSessions] = useState<AssessmentSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all')
  const [currentAdmin, setCurrentAdmin] = useState<any>(null)

  useEffect(() => {
    // 检查认证状态
    if (!requireAuth()) {
      return
    }
    
    // 获取当前管理员信息
    const admin = getCurrentAdmin()
    setCurrentAdmin(admin)
    
    // 加载数据
    loadSessions()
  }, [])

  const loadSessions = () => {
    // 从localStorage加载所有会话
    const allSessions: AssessmentSession[] = []
    
    // 检查所有localStorage键
    console.log('检查localStorage中的所有键:')
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      console.log(`键 ${i}: ${key}`)
      
      if (key?.startsWith('assessmentTask_') || key === 'assessmentSession') {
        try {
          const session = JSON.parse(localStorage.getItem(key) || '{}')
          console.log(`加载会话数据:`, session)
          allSessions.push(session)
        } catch (error) {
          console.error('解析会话数据失败:', error)
        }
      }
    }
    
    console.log(`总共加载了 ${allSessions.length} 个会话`)
    setSessions(allSessions)
    setIsLoading(false)
  }

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.candidatePhone.includes(searchTerm)
    const matchesFilter = filterStatus === 'all' || session.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: sessions.length,
    completed: sessions.filter(s => s.status === 'completed').length,
    pending: sessions.filter(s => s.status === 'pending' || s.status === 'in_progress').length,
    completionRate: sessions.length > 0 ? Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100) : 0
  }

  const handleCreateAssessment = () => {
    router.push('/admin/create')
  }

  const handleLogout = () => {
    logoutAdmin()
    router.push('/')
  }

  const handleViewResults = (sessionId: string) => {
    router.push(`/assessment/${sessionId}/results`)
  }

  const handleDownloadResults = (session: AssessmentSession) => {
    if (session.results) {
      // 这里可以实现PDF下载功能
      alert('PDF下载功能开发中...')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成'
      case 'in_progress':
        return '进行中'
      case 'pending':
        return '待开始'
      default:
        return '未知'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">评测管理后台</h1>
              <p className="text-gray-600 mt-1">
                欢迎，{currentAdmin?.username} | 管理候选人评测任务和结果
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/')}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                返回首页
              </button>
              <button
                onClick={() => router.push('/admin/compare')}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                对比分析
              </button>
              <button
                onClick={() => router.push('/admin/statistics')}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                统计分析
              </button>
              <button
                onClick={handleCreateAssessment}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                创建评测任务
              </button>
              <button
                onClick={() => router.push('/admin/profile')}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                账户设置
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总评测数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">进行中</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">完成率</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索候选人姓名、邮箱或手机号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="pending">待开始</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
        </div>

        {/* 评测列表 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">评测任务列表</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    候选人信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    完成时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {session.candidateName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.candidateEmail}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.candidatePhone}
                        </div>
                        {session.uniqueId && (
                          <div className="text-xs text-blue-600 font-mono">
                            ID: {session.uniqueId}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                        {getStatusText(session.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(session.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.completedAt ? new Date(session.completedAt).toLocaleString('zh-CN') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewResults(session.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          查看
                        </button>
                        {session.results && (
                          <button
                            onClick={() => handleDownloadResults(session)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            下载
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无评测数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
