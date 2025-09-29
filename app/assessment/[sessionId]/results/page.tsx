'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Home, CheckCircle, Download, Printer, Share2 } from 'lucide-react'
import { AssessmentSession, PersonalityResults } from '@/lib/types'
import { getAssessmentSession } from '@/lib/utils'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<AssessmentSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showExitModal, setShowExitModal] = useState(false)

  useEffect(() => {
    // 从localStorage加载会话信息
    const sessionData = getAssessmentSession(sessionId)
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true'
    
    if (sessionData) {
      setSession(sessionData)
      
      // 只有应聘者（非管理员）才显示退出提醒
      if (sessionData.status === 'completed' && !isAdmin) {
        console.log('应聘者评测已完成，2秒后显示退出提醒')
        setTimeout(() => {
          console.log('显示退出提醒对话框')
          setShowExitModal(true)
        }, 2000) // 2秒后自动显示退出提醒
      } else if (isAdmin) {
        console.log('管理员查看结果，不显示退出提醒')
      } else {
        console.log('评测状态:', sessionData.status)
      }
    } else {
      console.log('未找到评测会话数据')
    }
    setIsLoading(false)
  }, [sessionId])

  // 页面离开前提醒
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '确定要离开吗？您的评测结果将无法再次查看。'
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const handleDownload = () => {
    if (!session || !session.results) return

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const fileName = `${session.candidateName}_评测结果_${timestamp}.html`

    // 生成HTML内容
    const htmlContent = generatePDFContent(session, session.results)
    
    // 创建Blob并下载
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  const generatePDFContent = (session: AssessmentSession, results: PersonalityResults): string => {
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true'
    
    if (isAdmin) {
      return generateAdminPDFContent(session, results)
    } else {
      return generateCandidatePDFContent(session, results)
    }
  }

  const generateAdminPDFContent = (session: AssessmentSession, results: PersonalityResults): string => {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>5型人格评测结果 - ${session.candidateName}</title>
    <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        .header h1 { color: #1f2937; margin: 0; font-size: 28px; }
        .header p { color: #6b7280; margin: 10px 0 0 0; font-size: 16px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #374151; border-left: 4px solid #3b82f6; padding-left: 15px; margin-bottom: 20px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-item { padding: 15px; background: #f8fafc; border-radius: 8px; }
        .info-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .info-value { color: #6b7280; }
        .score-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 20px; }
        .score-item { text-align: center; padding: 20px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 10px; }
        .score-label { font-weight: bold; color: #1e40af; margin-bottom: 10px; }
        .score-value { font-size: 24px; font-weight: bold; color: #1d4ed8; }
        .analysis { background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .analysis h3 { color: #92400e; margin-top: 0; }
        .analysis p { color: #78350f; line-height: 1.6; }
        .recommendations { background: #ecfdf5; padding: 20px; border-radius: 8px; }
        .recommendations h3 { color: #065f46; margin-top: 0; }
        .recommendations ul { color: #047857; padding-left: 20px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        @media print { body { background: white; } .container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>5型人格评测结果报告</h1>
            <p>广州联创舞台设备有限公司 - 招聘评测系统</p>
        </div>

        <div class="section">
            <h2>候选人信息</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">姓名</div>
                    <div class="info-value">${session.candidateName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">邮箱</div>
                    <div class="info-value">${session.candidateEmail}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">手机号</div>
                    <div class="info-value">${session.candidatePhone}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">应聘岗位</div>
                    <div class="info-value">${session.position}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>人格维度得分</h2>
            <div class="score-grid">
                <div class="score-item">
                    <div class="score-label">开放性</div>
                    <div class="score-value">${results.openness.toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">尽责性</div>
                    <div class="score-value">${results.conscientiousness.toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">外向性</div>
                    <div class="score-value">${results.extraversion.toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">宜人性</div>
                    <div class="score-value">${results.agreeableness.toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">神经质</div>
                    <div class="score-value">${results.neuroticism.toFixed(1)}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>综合评估</h2>
            <div class="analysis">
                <h3>整体分析</h3>
                <p>${results.overallAnalysis}</p>
            </div>
            
            <div class="analysis">
                <h3>优势特质</h3>
                <p>${results.strengths.join('、')}</p>
            </div>
            
            <div class="analysis">
                <h3>需要关注的方面</h3>
                <p>${results.weaknesses.join('、')}</p>
            </div>
        </div>

        <div class="section">
            <div class="recommendations">
                <h3>建议</h3>
                <ul>
                    ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>评测时间：${new Date(session.createdAt).toLocaleString('zh-CN')}</p>
            <p>本报告由5型人格评测系统自动生成</p>
        </div>
    </div>
</body>
</html>
    `
  }

  const generateCandidatePDFContent = (session: AssessmentSession, results: PersonalityResults): string => {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的5型人格评测结果</title>
    <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        .header h1 { color: #1f2937; margin: 0; font-size: 24px; }
        .header p { color: #6b7280; margin: 10px 0 0 0; font-size: 14px; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #374151; border-left: 4px solid #3b82f6; padding-left: 15px; margin-bottom: 15px; }
        .score-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 20px; }
        .score-item { text-align: center; padding: 15px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 8px; }
        .score-label { font-weight: bold; color: #1e40af; margin-bottom: 8px; font-size: 14px; }
        .score-value { font-size: 20px; font-weight: bold; color: #1d4ed8; }
        .analysis { background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
        .analysis h3 { color: #92400e; margin-top: 0; font-size: 16px; }
        .analysis p { color: #78350f; line-height: 1.5; font-size: 14px; }
        .footer { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        @media print { body { background: white; } .container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>我的5型人格评测结果</h1>
            <p>感谢您完成评测！</p>
        </div>

        <div class="section">
            <h2>人格维度得分</h2>
            <div class="score-grid">
                <div class="score-item">
                    <div class="score-label">开放性</div>
                    <div class="score-value">${results.openness.toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">尽责性</div>
                    <div class="score-value">${results.conscientiousness.toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">外向性</div>
                    <div class="score-value">${results.extraversion.toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">宜人性</div>
                    <div class="score-value">${results.agreeableness.toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">神经质</div>
                    <div class="score-value">${results.neuroticism.toFixed(1)}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="analysis">
                <h3>整体分析</h3>
                <p>${results.overallAnalysis}</p>
            </div>
        </div>

        <div class="footer">
            <p>评测时间：${new Date(session.createdAt).toLocaleString('zh-CN')}</p>
            <p>广州联创舞台设备有限公司</p>
        </div>
    </div>
</body>
</html>
    `
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session || !session.results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">评测结果不存在</h1>
          <button
            onClick={() => router.push('/assessment/start')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            重新开始评测
          </button>
        </div>
      </div>
    )
  }

  const results = session.results
  const isAdmin = localStorage.getItem('adminLoggedIn') === 'true'

  // 准备雷达图数据
  const radarData = [
    { dimension: '开放性', value: results.openness },
    { dimension: '尽责性', value: results.conscientiousness },
    { dimension: '外向性', value: results.extraversion },
    { dimension: '宜人性', value: results.agreeableness },
    { dimension: '神经质', value: results.neuroticism }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push(isAdmin ? '/admin/dashboard' : '/')}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {isAdmin ? '返回管理后台' : '返回首页'}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isAdmin ? '评测结果详情' : '我的评测结果'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isAdmin ? `${session.candidateName} 的5型人格评测结果` : '感谢您完成5型人格评测'}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                下载报告
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Printer className="w-4 h-4 mr-2" />
                打印
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 候选人信息（仅管理员可见） */}
        {isAdmin && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">候选人信息</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">姓名</label>
                  <p className="mt-1 text-sm text-gray-900">{session.candidateName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">邮箱</label>
                  <p className="mt-1 text-sm text-gray-900">{session.candidateEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">手机号</label>
                  <p className="mt-1 text-sm text-gray-900">{session.candidatePhone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">应聘岗位</label>
                  <p className="mt-1 text-sm text-gray-900">{session.position}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 雷达图 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">人格维度雷达图</h2>
          </div>
          <div className="p-6">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} />
                  <Radar
                    name="得分"
                    dataKey="value"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 详细分析（仅管理员可见） */}
        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">优势特质</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {results.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center text-green-700">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">需要关注的方面</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-2">
                  {results.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-center text-orange-700">
                      <div className="w-4 h-4 mr-2 bg-orange-500 rounded-full"></div>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 建议（仅管理员可见） */}
        {isAdmin && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">建议</h2>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {results.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 退出提醒模态框 */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">评测完成</h3>
            <p className="text-gray-600 mb-6">
              恭喜您完成5型人格评测！您的评测结果已保存，HR将根据结果进行后续安排。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                继续查看
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
