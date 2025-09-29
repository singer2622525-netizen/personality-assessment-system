'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, TrendingUp, Users, Target } from 'lucide-react'
import { AssessmentSession } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

export default function StatisticsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<AssessmentSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = () => {
    const allSessions: AssessmentSession[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('assessmentSession')) {
        try {
          const session = JSON.parse(localStorage.getItem(key) || '{}')
          if (session.results) {
            allSessions.push(session)
          }
        } catch (error) {
          console.error('解析会话数据失败:', error)
        }
      }
    }
    setSessions(allSessions)
    setIsLoading(false)
  }

  // 计算统计数据
  const stats = {
    total: sessions.length,
    avgScores: {
      openness: sessions.reduce((sum, s) => sum + (s.results?.openness || 0), 0) / sessions.length,
      conscientiousness: sessions.reduce((sum, s) => sum + (s.results?.conscientiousness || 0), 0) / sessions.length,
      extraversion: sessions.reduce((sum, s) => sum + (s.results?.extraversion || 0), 0) / sessions.length,
      agreeableness: sessions.reduce((sum, s) => sum + (s.results?.agreeableness || 0), 0) / sessions.length,
      neuroticism: sessions.reduce((sum, s) => sum + (s.results?.neuroticism || 0), 0) / sessions.length
    }
  }

  // 准备图表数据
  const dimensionData = [
    { name: '开放性', value: stats.avgScores.openness, color: '#FF6B6B' },
    { name: '尽责性', value: stats.avgScores.conscientiousness, color: '#4ECDC4' },
    { name: '外向性', value: stats.avgScores.extraversion, color: '#45B7D1' },
    { name: '宜人性', value: stats.avgScores.agreeableness, color: '#96CEB4' },
    { name: '神经质', value: stats.avgScores.neuroticism, color: '#FFEAA7' }
  ]

  // 岗位分布数据
  const positionData = sessions.reduce((acc, session) => {
    const position = session.position || '未指定'
    acc[position] = (acc[position] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const positionChartData = Object.entries(positionData).map(([position, count]) => ({
    position,
    count
  }))

  // 月度趋势数据
  const monthlyData = sessions.reduce((acc, session) => {
    const date = new Date(session.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    acc[monthKey] = (acc[monthKey] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const monthlyChartData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month,
      count
    }))

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
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回仪表板
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="w-8 h-8 mr-3 text-green-600" />
                  统计分析
                </h1>
                <p className="text-gray-600 mt-1">
                  查看评测数据的统计分析和趋势
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总评测人数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          {dimensionData.map((dimension) => (
            <div key={dimension.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: dimension.color }}
                >
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{dimension.name}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dimension.value.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 人格维度分布 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">人格维度平均分</h2>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dimensionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 岗位分布 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">岗位分布</h2>
            </div>
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={positionChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ position, percent }) => `${position} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {positionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* 月度趋势 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">月度评测趋势</h2>
          </div>
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 详细统计表格 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">详细统计信息</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    统计项目
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    数值
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    说明
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    总评测人数
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stats.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    已完成评测的候选人总数
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    平均开放性得分
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stats.avgScores.openness.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    所有候选人的开放性平均分
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    平均尽责性得分
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stats.avgScores.conscientiousness.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    所有候选人的尽责性平均分
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    平均外向性得分
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stats.avgScores.extraversion.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    所有候选人的外向性平均分
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    平均宜人性得分
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stats.avgScores.agreeableness.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    所有候选人的宜人性平均分
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    平均神经质得分
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stats.avgScores.neuroticism.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    所有候选人的神经质平均分
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
