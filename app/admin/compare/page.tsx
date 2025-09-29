'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BarChart3, Users, Target } from 'lucide-react'
import { AssessmentSession } from '@/lib/types'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function ComparePage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<AssessmentSession[]>([])
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
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

  const handleSessionToggle = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    )
  }

  const selectedSessionsData = sessions.filter(s => selectedSessions.includes(s.id))

  // 准备雷达图数据
  const radarData = [
    { dimension: '开放性', ...selectedSessionsData.reduce((acc, session, index) => ({
      ...acc,
      [`候选人${index + 1}`]: session.results?.openness || 0
    }), {}) },
    { dimension: '尽责性', ...selectedSessionsData.reduce((acc, session, index) => ({
      ...acc,
      [`候选人${index + 1}`]: session.results?.conscientiousness || 0
    }), {}) },
    { dimension: '外向性', ...selectedSessionsData.reduce((acc, session, index) => ({
      ...acc,
      [`候选人${index + 1}`]: session.results?.extraversion || 0
    }), {}) },
    { dimension: '宜人性', ...selectedSessionsData.reduce((acc, session, index) => ({
      ...acc,
      [`候选人${index + 1}`]: session.results?.agreeableness || 0
    }), {}) },
    { dimension: '神经质', ...selectedSessionsData.reduce((acc, session, index) => ({
      ...acc,
      [`候选人${index + 1}`]: session.results?.neuroticism || 0
    }), {}) }
  ]

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00']

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
                  <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                  候选人对比分析
                </h1>
                <p className="text-gray-600 mt-1">
                  选择多个候选人进行横向对比分析
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 候选人选择 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              选择候选人
            </h2>
          </div>
          <div className="p-6">
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无完成的评测记录</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSessions.includes(session.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSessionToggle(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{session.candidateName}</h3>
                        <p className="text-sm text-gray-500">{session.position}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(session.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded border-2 ${
                        selectedSessions.includes(session.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedSessions.includes(session.id) && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 对比分析结果 */}
        {selectedSessionsData.length > 0 && (
          <div className="space-y-6">
            {/* 雷达图对比 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  人格维度对比
                </h2>
              </div>
              <div className="p-6">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dimension" />
                      <PolarRadiusAxis angle={90} domain={[0, 5]} />
                      {selectedSessionsData.map((session, index) => (
                        <Radar
                          key={session.id}
                          name={session.candidateName}
                          dataKey={`候选人${index + 1}`}
                          stroke={colors[index % colors.length]}
                          fill={colors[index % colors.length]}
                          fillOpacity={0.3}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 柱状图对比 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">详细分数对比</h2>
              </div>
              <div className="p-6">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={radarData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dimension" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      {selectedSessionsData.map((session, index) => (
                        <Bar
                          key={session.id}
                          dataKey={`候选人${index + 1}`}
                          fill={colors[index % colors.length]}
                          name={session.candidateName}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 候选人信息表格 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">候选人详细信息</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        候选人
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        开放性
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        尽责性
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        外向性
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        宜人性
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        神经质
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedSessionsData.map((session) => (
                      <tr key={session.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {session.candidateName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {session.position}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {session.results?.openness?.toFixed(1) || '0.0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {session.results?.conscientiousness?.toFixed(1) || '0.0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {session.results?.extraversion?.toFixed(1) || '0.0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {session.results?.agreeableness?.toFixed(1) || '0.0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {session.results?.neuroticism?.toFixed(1) || '0.0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedSessionsData.length === 0 && sessions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">选择候选人进行对比</h3>
            <p className="text-gray-500">请从上方选择至少一个候选人开始对比分析</p>
          </div>
        )}
      </div>
    </div>
  )
}
