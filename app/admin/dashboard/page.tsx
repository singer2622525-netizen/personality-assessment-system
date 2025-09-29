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
    const matchesSearch = session.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.candidateEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.position?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const handleCreateAssessment = () => {
    router.push('/admin/create')
  }

  const handleViewResults = (sessionId: string) => {
    router.push(`/assessment/${sessionId}/results`)
  }

  const handleDownloadResults = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session && session.results) {
      // 这里可以添加下载功能
      console.log('下载结果:', session)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待评测'
      case 'in_progress':
        return '评测中'
      case 'completed':
        return '已完成'
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
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                创建评测
              </button>
              <button
                onClick={() => {
                  logoutAdmin()
                  router.push('/admin/login')
                }}
                className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总评测人数</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => s.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">进行中</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => s.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">本月新增</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => {
                    const now = new Date()
                    const sessionDate = new Date(s.createdAt)
                    return sessionDate.getMonth() === now.getMonth() && 
                           sessionDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="搜索候选人姓名、邮箱或岗位..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-gray-400 mr-2" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">全部状态</option>
                    <option value="pending">待评测</option>
                    <option value="in_progress">评测中</option>
                    <option value="completed">已完成</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 评测记录表格 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">评测记录</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    候选人信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    应聘岗位
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {sessions.length === 0 ? '暂无评测记录' : '没有找到匹配的记录'}
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {session.candidateName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {session.candidateEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{session.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          session.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : session.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusText(session.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(session.createdAt).toLocaleDateString('zh-CN')}
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
                          {session.status === 'completed' && (
                            <button
                              onClick={() => handleDownloadResults(session.id)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              下载
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
