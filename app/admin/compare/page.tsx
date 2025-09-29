'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, BarChart3, Download } from 'lucide-react'
import { AssessmentSession } from '@/lib/types'
import { calculatePositionMatch, getAllPositions } from '@/lib/positions'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

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
  const radarData = selectedSessionsData.map(session => ({
    name: session.candidateName,
    openness: session.results?.openness || 0,
    conscientiousness: session.results?.conscientiousness || 0,
    extraversion: session.results?.extraversion || 0,
    agreeableness: session.results?.agreeableness || 0,
    neuroticism: session.results?.neuroticism || 0
  }))

  // 准备对比表格数据
  const comparisonData = selectedSessionsData.map(session => ({
    name: session.candidateName,
    email: session.candidateEmail,
    ...session.results
  }))

  const handleExportComparison = () => {
    if (selectedSessionsData.length === 0) {
      alert('请先选择要对比的候选人')
      return
    }
    
    // 这里可以实现导出功能
    alert('导出功能开发中...')
  }

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
          <div className="flex items-center justify-between">
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
                <h1 className="text-2xl font-bold text-gray-900">候选人对比分析</h1>
                <p className="text-gray-600 mt-1">对比多个候选人的人格特征和岗位匹配度</p>
              </div>
            </div>
            <button
              onClick={handleExportComparison}
              disabled={selectedSessionsData.length === 0}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              导出对比报告
            </button>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 候选人选择 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">选择候选人</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSessions.includes(session.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSessionToggle(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{session.candidateName}</h3>
                        <p className="text-sm text-gray-500">{session.candidateEmail}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedSessions.includes(session.id)
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedSessions.includes(session.id) && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {sessions.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">暂无评测数据</p>
                </div>
              )}
            </div>
          </div>

          {/* 对比分析 */}
          <div className="lg:col-span-2 space-y-8">
            {selectedSessionsData.length > 0 ? (
              <>
                {/* 雷达图对比 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">人格维度对比</h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="dimension" />
                        <PolarRadiusAxis angle={90} domain={[0, 5]} />
                        {selectedSessionsData.map((session, index) => (
                          <Radar
                            key={session.id}
                            name={session.candidateName}
                            dataKey="openness"
                            stroke={`hsl(${index * 60}, 70%, 50%)`}
                            fill={`hsl(${index * 60}, 70%, 50%)`}
                            fillOpacity={0.3}
                          />
                        ))}
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 详细对比表格 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">详细分数对比</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">候选人</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">开放性</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">尽责性</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">外向性</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">宜人性</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">神经质</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {comparisonData.map((candidate, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-gray-900">{candidate.name}</div>
                                <div className="text-sm text-gray-500">{candidate.email}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{candidate.openness?.toFixed(1)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{candidate.conscientiousness?.toFixed(1)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{candidate.extraversion?.toFixed(1)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{candidate.agreeableness?.toFixed(1)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{candidate.neuroticism?.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 岗位匹配度对比 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">岗位匹配度对比</h2>
                  <div className="space-y-4">
                    {getAllPositions().map(position => (
                      <div key={position.id} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-3">{position.name}</h3>
                        <div className="space-y-2">
                          {selectedSessionsData.map(session => {
                            const match = calculatePositionMatch(session.results!, position.id)
                            return (
                              <div key={session.id} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{session.candidateName}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        match.matchScore >= 80 ? 'bg-green-500' :
                                        match.matchScore >= 60 ? 'bg-yellow-500' :
                                        match.matchScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${match.matchScore}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 w-12">
                                    {match.matchScore}%
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    match.overallMatch === '优秀' ? 'bg-green-100 text-green-800' :
                                    match.overallMatch === '良好' ? 'bg-yellow-100 text-yellow-800' :
                                    match.overallMatch === '一般' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {match.overallMatch}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择候选人进行对比</h3>
                <p className="text-gray-500">请从左侧选择2个或更多候选人开始对比分析</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
