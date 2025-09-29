'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, TrendingUp, Users, Target } from 'lucide-react'
import { AssessmentSession } from '@/lib/types'
import { calculatePositionMatch, getAllPositions } from '@/lib/positions'
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

  const positionMatchData = getAllPositions().map(position => {
    const matches = sessions.map(session => {
      const match = calculatePositionMatch(session.results!, position.id)
      return match.matchScore
    })
    const avgMatch = matches.length > 0 ? matches.reduce((sum, score) => sum + score, 0) / matches.length : 0
    
    return {
      position: position.name,
      matchScore: Math.round(avgMatch)
    }
  })

  const monthlyData = sessions.reduce((acc, session) => {
    const month = new Date(session.completedAt || session.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const monthlyChartData = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count
  }))

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回管理后台
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              返回首页
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">数据统计分析</h1>
              <p className="text-gray-600 mt-1">查看评测数据的统计分析和趋势</p>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总评测数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均开放性</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgScores.openness.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均尽责性</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgScores.conscientiousness.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均外向性</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgScores.extraversion.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 人格维度分布 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">人格维度平均分</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 岗位匹配度统计 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">岗位匹配度统计</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={positionMatchData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="position" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="matchScore" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 月度趋势 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">月度评测趋势</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 人格维度分布饼图 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">人格维度分布</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dimensionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dimensionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 详细统计表格 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">详细统计数据</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">维度</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">平均分</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最高分</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最低分</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标准差</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dimensionData.map((dimension) => {
                  const scores = sessions.map(s => s.results?.[dimension.name.toLowerCase() as keyof typeof s.results] as number || 0)
                  const max = Math.max(...scores)
                  const min = Math.min(...scores)
                  const variance = scores.reduce((sum, score) => sum + Math.pow(score - dimension.value, 2), 0) / scores.length
                  const stdDev = Math.sqrt(variance)
                  
                  return (
                    <tr key={dimension.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dimension.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dimension.value.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {max.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {min.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stdDev.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
