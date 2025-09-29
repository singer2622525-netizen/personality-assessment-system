'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Printer, CheckCircle, User, Mail, Phone, Briefcase } from 'lucide-react'
import { AssessmentSession, Answer, QUESTIONS } from '@/lib/types'
import { saveAssessmentRecord, AssessmentRecord } from '@/lib/assessment-storage'

export default function AssessmentResultsPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<AssessmentSession | null>(null)
  const [scores, setScores] = useState({
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // 检查是否是管理员
    const adminAuth = localStorage.getItem('adminAuth')
    setIsAdmin(!!adminAuth)

    // 从 localStorage 加载会话数据
    const sessionData = localStorage.getItem(`assessment_session_${params.sessionId}`)
    if (!sessionData) {
      router.push('/assessment/start')
      return
    }

    try {
      const parsedSession = JSON.parse(sessionData) as AssessmentSession
      if (parsedSession.status !== 'completed') {
        router.push(`/assessment/${params.sessionId}`)
        return
      }

      setSession(parsedSession)
      
      // 计算人格得分
      const calculatedScores = calculatePersonalityScores(parsedSession.answers)
      setScores(calculatedScores)

      // 保存评测记录
      const record: AssessmentRecord = {
        id: generateUniqueId(),
        sessionId: params.sessionId,
        candidateName: parsedSession.candidateName,
        candidateEmail: parsedSession.candidateEmail,
        candidatePhone: parsedSession.candidatePhone,
        position: parsedSession.position,
        answers: parsedSession.answers,
        scores: calculatedScores,
        completedAt: new Date().toISOString(),
        status: 'completed'
      }
      
      saveAssessmentRecord(record)
      console.log('评测记录已保存:', record.id)
      
    } catch (error) {
      console.error('解析会话数据失败:', error)
      router.push('/assessment/start')
    } finally {
      setIsLoading(false)
    }
  }, [params.sessionId, router])

  const calculatePersonalityScores = (answers: Answer[]) => {
    const scores = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    }

    answers.forEach(answer => {
      const question = QUESTIONS.find(q => q.id === answer.questionId)
      if (question) {
        scores[question.trait as keyof typeof scores] += answer.answer
      }
    })

    // 计算平均分
    Object.keys(scores).forEach(trait => {
      const traitQuestions = QUESTIONS.filter(q => q.trait === trait).length
      scores[trait as keyof typeof scores] = traitQuestions > 0 
        ? Math.round((scores[trait as keyof typeof scores] / traitQuestions) * 10) / 10
        : 0
    })

    return scores
  }

  const generateUniqueId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  const getTraitName = (trait: string) => {
    const names: { [key: string]: string } = {
      openness: '开放性',
      conscientiousness: '尽责性',
      extraversion: '外向性',
      agreeableness: '宜人性',
      neuroticism: '神经质'
    }
    return names[trait] || trait
  }

  const getTraitDescription = (trait: string, score: number) => {
    const descriptions: { [key: string]: { [key: number]: string } } = {
      openness: {
        1: '非常保守，喜欢传统和熟悉的事物',
        2: '比较保守，对新事物持谨慎态度',
        3: '中等开放，对新事物有一定兴趣',
        4: '比较开放，喜欢尝试新事物',
        5: '非常开放，热爱创新和变化'
      },
      conscientiousness: {
        1: '缺乏条理，做事随意',
        2: '比较随意，偶尔有计划',
        3: '中等尽责，有一定计划性',
        4: '比较尽责，做事有条理',
        5: '非常尽责，做事严谨认真'
      },
      extraversion: {
        1: '非常内向，喜欢独处',
        2: '比较内向，社交较少',
        3: '中等外向，平衡独处和社交',
        4: '比较外向，喜欢社交活动',
        5: '非常外向，热爱社交和互动'
      },
      agreeableness: {
        1: '非常竞争，不太合作',
        2: '比较竞争，偶尔合作',
        3: '中等合作，平衡竞争与合作',
        4: '比较合作，愿意帮助他人',
        5: '非常合作，乐于助人'
      },
      neuroticism: {
        1: '非常稳定，情绪平和',
        2: '比较稳定，偶尔焦虑',
        3: '中等稳定，有一定情绪波动',
        4: '比较敏感，容易焦虑',
        5: '非常敏感，情绪波动较大'
      }
    }
    
    const scoreLevel = Math.round(score)
    return descriptions[trait]?.[scoreLevel] || '暂无描述'
  }

  const handleDownload = () => {
    if (!session) return

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `${session.candidateName}_评测结果_${timestamp}.html`
    
    const content = isAdmin ? generateAdminPDFContent() : generateCandidatePDFContent()
    
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  const generateAdminPDFContent = () => {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>5型人格评测报告 - ${session?.candidateName}</title>
    <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f97316; padding-bottom: 20px; }
        .header h1 { color: #1f2937; margin: 0; font-size: 24px; }
        .header p { color: #6b7280; margin: 5px 0; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #374151; border-left: 4px solid #f97316; padding-left: 15px; margin-bottom: 15px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .info-item { padding: 10px; background: #f9fafb; border-radius: 5px; }
        .info-label { font-weight: bold; color: #374151; }
        .info-value { color: #6b7280; margin-top: 5px; }
        .score-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 20px; }
        .score-item { text-align: center; padding: 15px; background: #fef3c7; border-radius: 8px; }
        .score-value { font-size: 24px; font-weight: bold; color: #f97316; }
        .score-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
        .description { background: #f8fafc; padding: 15px; border-radius: 5px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>5型人格评测报告</h1>
            <p>广州联创舞台设备有限公司</p>
            <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>
        
        <div class="section">
            <h2>候选人信息</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">姓名</div>
                    <div class="info-value">${session?.candidateName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">邮箱</div>
                    <div class="info-value">${session?.candidateEmail}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">手机号</div>
                    <div class="info-value">${session?.candidatePhone}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">应聘职位</div>
                    <div class="info-value">${session?.position}</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>人格得分</h2>
            <div class="score-grid">
                ${Object.entries(scores).map(([trait, score]) => `
                    <div class="score-item">
                        <div class="score-value">${score}</div>
                        <div class="score-label">${getTraitName(trait)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>详细分析</h2>
            ${Object.entries(scores).map(([trait, score]) => `
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #374151; margin-bottom: 10px;">${getTraitName(trait)} (${score}分)</h3>
                    <div class="description">${getTraitDescription(trait, score)}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>本报告由5型人格评测系统自动生成</p>
            <p>© 2024 广州联创舞台设备有限公司</p>
        </div>
    </div>
</body>
</html>`
  }

  const generateCandidatePDFContent = () => {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的5型人格评测报告</title>
    <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f97316; padding-bottom: 20px; }
        .header h1 { color: #1f2937; margin: 0; font-size: 24px; }
        .score-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 20px; }
        .score-item { text-align: center; padding: 15px; background: #fef3c7; border-radius: 8px; }
        .score-value { font-size: 24px; font-weight: bold; color: #f97316; }
        .score-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>我的5型人格评测报告</h1>
            <p>${session?.candidateName} - ${session?.position}</p>
        </div>
        
        <div class="score-grid">
            ${Object.entries(scores).map(([trait, score]) => `
                <div class="score-item">
                    <div class="score-value">${score}</div>
                    <div class="score-label">${getTraitName(trait)}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>感谢您参与5型人格评测</p>
            <p>© 2024 广州联创舞台设备有限公司</p>
        </div>
    </div>
</body>
</html>`
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)' }}>
        <div style={{ color: '#1f2937', fontSize: '18px' }}>生成报告中...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)', padding: '16px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* 头部导航 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            返回首页
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
              评测结果
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              {session.candidateName} - {session.position}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleDownload}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
            >
              <Download style={{ width: '16px', height: '16px' }} />
              下载报告
            </button>
            <button
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#059669', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
            >
              <Printer style={{ width: '16px', height: '16px' }} />
              打印
            </button>
          </div>
        </div>

        {/* 成功提示 */}
        <div style={{ background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle style={{ width: '20px', height: '20px', color: '#059669' }} />
          <div>
            <div style={{ color: '#065f46', fontWeight: '500' }}>评测完成！</div>
            <div style={{ color: '#047857', fontSize: '14px' }}>您的评测结果已保存，感谢您的参与</div>
          </div>
        </div>

        {/* 候选人信息 */}
        {isAdmin && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
              候选人信息
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>姓名</div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{session.candidateName}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>邮箱</div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{session.candidateEmail}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>手机号</div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{session.candidatePhone}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Briefcase style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>应聘职位</div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{session.position}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 人格得分 */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>
            人格得分
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            {Object.entries(scores).map(([trait, score]) => (
              <div key={trait} style={{ textAlign: 'center', padding: '20px', background: '#fef3c7', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f97316', marginBottom: '8px' }}>
                  {score}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#374151' }}>
                  {getTraitName(trait)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 详细分析 */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>
            详细分析
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(scores).map(([trait, score]) => (
              <div key={trait} style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  {getTraitName(trait)} ({score}分)
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5', margin: '0' }}>
                  {getTraitDescription(trait, score)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
