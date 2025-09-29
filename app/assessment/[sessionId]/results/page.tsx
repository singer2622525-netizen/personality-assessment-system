'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Home, CheckCircle, Download, Printer, Share2 } from 'lucide-react'
import { AssessmentSession, PersonalityResults } from '@/lib/types'
import { getScoreLevel, getScoreColor } from '@/lib/assessment'
import { DIMENSION_DESCRIPTIONS } from '@/lib/types'
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
    const savedSession = localStorage.getItem('assessmentSession')
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true'
    
    if (savedSession) {
      const sessionData = JSON.parse(savedSession)
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
  }, [])

  // 页面离开前提醒
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '您已完成评测，确定要离开吗？'
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])


  const handleExit = () => {
    setShowExitModal(true)
  }

  const handleConfirmExit = () => {
    console.log('确认退出，清理应聘者数据并返回首页')
    // 只清理应聘者的会话数据，保留管理后台的任务数据
    localStorage.removeItem('assessmentSession')
    // 返回首页
    router.push('/')
  }

  const handleReturnHome = () => {
    console.log('直接返回首页')
    router.push('/')
  }

  const handlePrint = () => {
    // 创建打印样式
    const printStyles = `
      <style>
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
          .avoid-break {
            page-break-inside: avoid;
          }
        }
      </style>
    `
    
    // 创建打印内容
    const printContent = document.createElement('div')
    printContent.className = 'print-content'
    printContent.innerHTML = generatePrintContent()
    
    // 添加打印样式
    const styleElement = document.createElement('div')
    styleElement.innerHTML = printStyles
    
    // 临时添加到页面
    document.body.appendChild(styleElement)
    document.body.appendChild(printContent)
    
    // 执行打印
    window.print()
    
    // 清理临时元素
    document.body.removeChild(styleElement)
    document.body.removeChild(printContent)
  }

  // 生成打印内容
  const generatePrintContent = () => {
    if (!session || !session.results) return ''
    
    const currentDate = new Date().toLocaleDateString('zh-CN')
    const completionDate = new Date(session.completedAt || '').toLocaleDateString('zh-CN')
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true'
    
    return `
      <div style="font-family: 'Microsoft YaHei', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
        <!-- 头部 -->
        <div style="text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #f97316; margin: 0; font-size: 28px;">5型人格评测报告</h1>
          <p style="margin: 5px 0; color: #666;">广州联创舞台设备有限公司</p>
          <p style="margin: 5px 0; color: #666;">生成时间：${currentDate}</p>
        </div>

        <!-- 候选人信息 -->
        <div style="margin-bottom: 30px;" class="avoid-break">
          <h2 style="color: #f97316; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px; margin-bottom: 20px;">候选人基本信息</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #f97316;">姓名：</strong>${session.candidateName}
            </div>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #f97316;">邮箱：</strong>${session.candidateEmail}
            </div>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #f97316;">手机：</strong>${session.candidatePhone}
            </div>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #f97316;">应聘岗位：</strong>${session.position}
            </div>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #f97316;">评测时间：</strong>${completionDate}
            </div>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #f97316;">唯一ID：</strong>${session.uniqueId}
            </div>
          </div>
        </div>

        <!-- 人格维度得分 -->
        <div style="margin-bottom: 30px;" class="avoid-break">
          <h2 style="color: #f97316; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px; margin-bottom: 20px;">人格维度得分</h2>
          ${Object.entries(session.results).filter(([key]) => key !== 'overallAnalysis' && key !== 'strengths' && key !== 'weaknesses' && key !== 'recommendations').map(([dimension, score]) => {
            const desc = DIMENSION_DESCRIPTIONS[dimension as keyof typeof DIMENSION_DESCRIPTIONS]
            const level = getScoreLevel(score as number)
            const levelColor = level === '高' ? '#28a745' : level === '中等' ? '#ffc107' : '#dc3545'
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin: 10px 0; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #f97316;">
                <div>
                  <strong>${desc.name}</strong><br>
                  <small style="color: #666;">${desc.description}</small>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 18px; font-weight: bold; color: #f97316;">${score}分</div>
                  <div style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: ${levelColor}; color: white;">${level}</div>
                </div>
              </div>
            `
          }).join('')}
        </div>

        ${isAdmin ? `
        <!-- 整体分析 - 仅管理员显示 -->
        <div style="margin-bottom: 30px;" class="avoid-break">
          <h2 style="color: #f97316; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px; margin-bottom: 20px;">整体分析</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <p>${session.results.overallAnalysis}</p>
          </div>
          
          ${session.results.strengths && session.results.strengths.length > 0 ? `
          <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px;">优势特征</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
            ${session.results.strengths.map(strength => `
              <div style="margin: 8px 0; padding: 8px 12px; border-radius: 5px; background: #d4edda; border-left: 4px solid #28a745;">${strength}</div>
            `).join('')}
          </div>
          ` : ''}
          
          ${session.results.weaknesses && session.results.weaknesses.length > 0 ? `
          <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px;">待提升方面</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
            ${session.results.weaknesses.map(weakness => `
              <div style="margin: 8px 0; padding: 8px 12px; border-radius: 5px; background: #f8d7da; border-left: 4px solid #dc3545;">${weakness}</div>
            `).join('')}
          </div>
          ` : ''}
          
          ${session.results.recommendations && session.results.recommendations.length > 0 ? `
          <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px;">职业建议</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
            ${session.results.recommendations.map(recommendation => `
              <div style="margin: 8px 0; padding: 8px 12px; border-radius: 5px; background: #cce5ff; border-left: 4px solid #007bff;">${recommendation}</div>
            `).join('')}
          </div>
          ` : ''}
        </div>

        <!-- 岗位适配度分析 - 仅管理员显示 -->
        <div style="margin-bottom: 30px;" class="avoid-break">
          <h2 style="color: #f97316; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px; margin-bottom: 20px;">岗位适配度分析</h2>
          <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px;">针对${session.position}岗位的分析</h3>
            ${generatePositionAnalysisForPrint(session.position, session.results)}
          </div>
        </div>

        <!-- 招聘建议 - 仅管理员显示 -->
        <div style="margin-bottom: 30px;" class="avoid-break">
          <h2 style="color: #f97316; border-bottom: 1px solid #e5e5e5; padding-bottom: 10px; margin-bottom: 20px;">招聘建议</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px;">面试建议</h3>
            <ul>
              <li>重点关注候选人的专业技能和实际工作经验</li>
              <li>评估候选人与岗位要求的匹配度</li>
              <li>了解候选人的职业发展规划</li>
            </ul>
            
            <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px;">入职建议</h3>
            <ul>
              <li>提供适当的培训和指导</li>
              <li>建立有效的反馈机制</li>
              <li>安排合适的导师或同事支持</li>
            </ul>
          </div>
        </div>
        ` : ''}

        <!-- 页脚 -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 12px;">
          <p>本报告基于5型人格理论生成，仅供参考</p>
          <p>© 2024 广州联创舞台设备有限公司</p>
        </div>
      </div>
    `
  }

  // 生成岗位分析内容（用于PDF）
  const generatePositionAnalysisForPDF = (position: string, results: PersonalityResults) => {
    let analysis = ''
    
    if (position.includes('销售') || position.includes('客户') || position.includes('市场')) {
      analysis = `
        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #28a745;">
          <strong>沟通能力：</strong>
          ${results.extraversion >= 4 ? '✅ 外向性强，善于与人沟通，适合销售工作' : '⚠️ 内向性格，在销售工作中可能需要更多培训'}
        </div>
        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #28a745;">
          <strong>客户服务：</strong>
          ${results.agreeableness >= 4 ? '✅ 善于理解客户需求，客户服务意识强' : '⚠️ 需要提升客户服务意识和同理心'}
        </div>
        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #28a745;">
          <strong>抗压能力：</strong>
          ${results.neuroticism <= 2 ? '✅ 情绪稳定，能够应对销售压力' : '⚠️ 需要提升抗压能力，适应销售环境'}
        </div>
      `
    } else if (position.includes('技术') || position.includes('开发') || position.includes('工程师')) {
      analysis = `
        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #28a745;">
          <strong>责任心：</strong>
          ${results.conscientiousness >= 4 ? '✅ 责任心强，适合需要精确性的技术工作' : '⚠️ 需要提升责任心和细致程度'}
        </div>
        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #28a745;">
          <strong>创新思维：</strong>
          ${results.openness >= 4 ? '✅ 创新思维强，适合技术研发工作' : '⚠️ 需要提升创新思维和技术学习能力'}
        </div>
        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #28a745;">
          <strong>专注能力：</strong>
          ${results.extraversion <= 2 ? '✅ 内向性格，适合专注的技术工作' : '⚠️ 外向性格，可能需要更多团队协作'}
        </div>
      `
    } else if (position.includes('管理') || position.includes('主管') || position.includes('经理')) {
      analysis = `
        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #28a745;">
          <strong>执行力：</strong>
          ${results.conscientiousness >= 4 ? '✅ 责任心强，执行力高，适合管理岗位' : '⚠️ 需要提升责任心和执行力'}
        </div>
        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #28a745;">
          <strong>团队协作：</strong>
          ${results.agreeableness >= 4 ? '✅ 团队合作意识强，善于协调团队关系' : '⚠️ 需要提升团队协作和沟通能力'}
        </div>
        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #28a745;">
          <strong>领导沟通：</strong>
          ${results.extraversion >= 4 ? '✅ 外向性格，善于与下属沟通' : '⚠️ 内向性格，需要提升领导沟通能力'}
        </div>
      `
    } else {
      analysis = `
        <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #28a745;">
          <strong>综合评估：</strong>
          基于人格特征的综合分析，该候选人在多个维度表现均衡
        </div>
      `
    }
    
    return analysis
  }

  const handleDownload = () => {
    if (!session || !session.results) {
      alert('无法下载：评测数据不完整')
      return
    }

    try {
      const isAdmin = localStorage.getItem('adminLoggedIn') === 'true'
      
      // 根据身份生成不同的PDF内容
      const pdfContent = isAdmin ? generateAdminPDFContent(session, session.results) : generateCandidatePDFContent(session, session.results)
      
      // 创建Blob对象
      const blob = new Blob([pdfContent], { type: 'text/html;charset=utf-8' })
      
      // 生成带时间戳的文件名，避免重复下载时覆盖
      const now = new Date()
      const timestamp = now.getFullYear() + 
        String(now.getMonth() + 1).padStart(2, '0') + 
        String(now.getDate()).padStart(2, '0') + '_' +
        String(now.getHours()).padStart(2, '0') + 
        String(now.getMinutes()).padStart(2, '0') + 
        String(now.getSeconds()).padStart(2, '0')
      
      const fileType = isAdmin ? '招聘分析报告' : '评测结果'
      
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${session.candidateName}_${fileType}_${timestamp}.html`
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // 清理URL对象
      URL.revokeObjectURL(url)
      
      alert('评测报告已下载，请使用浏览器打印功能保存为PDF')
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请重试')
    }
  }

  // 生成管理员PDF内容
  const generateAdminPDFContent = (session: AssessmentSession, results: PersonalityResults) => {
    const currentDate = new Date().toLocaleDateString('zh-CN')
    const completionDate = new Date(session.completedAt || '').toLocaleDateString('zh-CN')
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${session.candidateName} - 招聘分析报告</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #f97316;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #f97316;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #f97316;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .section h3 {
            color: #333;
            margin-top: 25px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .info-item strong {
            color: #f97316;
        }
        .score-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #f97316;
        }
        .score-value {
            font-size: 18px;
            font-weight: bold;
            color: #f97316;
        }
        .level-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        .level-high { background: #d4edda; color: #155724; }
        .level-medium { background: #fff3cd; color: #856404; }
        .level-low { background: #f8d7da; color: #721c24; }
        .analysis-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .strength-item, .weakness-item {
            margin: 8px 0;
            padding: 8px 12px;
            border-radius: 5px;
        }
        .strength-item {
            background: #d4edda;
            border-left: 4px solid #28a745;
        }
        .weakness-item {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
        }
        .recommendation-item {
            background: #cce5ff;
            border-left: 4px solid #007bff;
            margin: 8px 0;
            padding: 8px 12px;
            border-radius: 5px;
        }
        .position-analysis {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .match-item {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 5px;
            border-left: 4px solid #28a745;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>招聘分析报告</h1>
        <p>广州联创舞台设备有限公司</p>
        <p>生成时间：${currentDate}</p>
    </div>

    <div class="section">
        <h2>候选人基本信息</h2>
        <div class="info-grid">
            <div class="info-item">
                <strong>姓名：</strong>${session.candidateName}
            </div>
            <div class="info-item">
                <strong>邮箱：</strong>${session.candidateEmail}
            </div>
            <div class="info-item">
                <strong>手机：</strong>${session.candidatePhone}
            </div>
            <div class="info-item">
                <strong>应聘岗位：</strong>${session.position}
            </div>
            <div class="info-item">
                <strong>评测时间：</strong>${completionDate}
            </div>
            <div class="info-item">
                <strong>唯一ID：</strong>${session.uniqueId}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>人格维度得分</h2>
        ${Object.entries(results).filter(([key]) => key !== 'overallAnalysis' && key !== 'strengths' && key !== 'weaknesses' && key !== 'recommendations').map(([dimension, score]) => {
          const desc = DIMENSION_DESCRIPTIONS[dimension as keyof typeof DIMENSION_DESCRIPTIONS]
          const level = getScoreLevel(score as number)
          const levelClass = level === '高' ? 'level-high' : level === '中等' ? 'level-medium' : 'level-low'
          return `
            <div class="score-item">
              <div>
                <strong>${desc.name}</strong><br>
                <small>${desc.description}</small>
              </div>
              <div>
                <div class="score-value">${score}分</div>
                <div class="level-badge ${levelClass}">${level}</div>
              </div>
            </div>
          `
        }).join('')}
    </div>

    <div class="section">
        <h2>招聘分析报告</h2>
        
        <!-- 候选人基本信息 -->
        <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px;">候选人信息</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                    <strong style="color: #f97316;">姓名：</strong>${session.candidateName}
                </div>
                <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                    <strong style="color: #f97316;">邮箱：</strong>${session.candidateEmail}
                </div>
                <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                    <strong style="color: #f97316;">手机：</strong>${session.candidatePhone}
                </div>
                <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                    <strong style="color: #f97316;">应聘岗位：</strong>${session.position}
                </div>
                <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                    <strong style="color: #f97316;">评测时间：</strong>${completionDate}
                </div>
                <div style="padding: 10px; background: #f8f9fa; border-radius: 5px;">
                    <strong style="color: #f97316;">唯一ID：</strong>${session.uniqueId}
                </div>
            </div>
        </div>

        <!-- 人格特征分析 -->
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px;">人格特征分析</h3>
            ${Object.entries(results).filter(([key]) => key !== 'overallAnalysis' && key !== 'strengths' && key !== 'weaknesses' && key !== 'recommendations').map(([dimension, score]) => {
              const desc = DIMENSION_DESCRIPTIONS[dimension as keyof typeof DIMENSION_DESCRIPTIONS]
              const level = getScoreLevel(score as number)
              const colorClass = getScoreColor(score as number)
              return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin: 10px 0; background: white; border-radius: 8px; border-left: 4px solid #f97316;">
                  <div style="flex: 1;">
                    <div style="font-weight: bold; color: #333;">${desc.name}</div>
                    <div style="font-size: 14px; color: #666;">${desc.description}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 18px; font-weight: bold; color: #f97316;">${score}分</div>
                    <div style="font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; background: ${colorClass.replace('text-', 'bg-').replace('-600', '-100')}; color: ${colorClass.replace('text-', '')};">${level}</div>
                  </div>
                </div>
              `
            }).join('')}
        </div>

        <!-- 招聘建议 -->
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px;">招聘建议</h3>
            
            ${results.strengths && results.strengths.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4 style="font-weight: bold; color: #059669; margin-bottom: 10px;">✅ 优势特征</h4>
                <ul style="list-style: disc; padding-left: 20px;">
                    ${results.strengths.map(strength => `<li style="margin: 5px 0;">${strength}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${results.weaknesses && results.weaknesses.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4 style="font-weight: bold; color: #dc2626; margin-bottom: 10px;">⚠️ 待提升方面</h4>
                <ul style="list-style: disc; padding-left: 20px;">
                    ${results.weaknesses.map(weakness => `<li style="margin: 5px 0;">${weakness}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${results.recommendations && results.recommendations.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4 style="font-weight: bold; color: #2563eb; margin-bottom: 10px;">💼 职业建议</h4>
                <ul style="list-style: disc; padding-left: 20px;">
                    ${results.recommendations.map(recommendation => `<li style="margin: 5px 0;">${recommendation}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>

        <!-- 职业能力分析 -->
        <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px;">职业能力分析</h3>
            
            <!-- 沟通能力分析 -->
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #3b82f6;">
                <h4 style="font-weight: bold; color: #333; margin-bottom: 10px;">🗣️ 沟通与人际交往能力</h4>
                <div style="font-size: 14px; color: #666;">
                    ${results.extraversion >= 4 ? `
                        <p style="margin-bottom: 10px;"><strong>优势：</strong>热情外向，善于表达，喜欢与人互动</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>适合需要频繁人际互动的岗位：销售、公共关系、客户服务、市场推广</li>
                            <li>在团队中能够活跃气氛，促进团队凝聚力</li>
                            <li>善于建立和维护客户关系，适合对外沟通工作</li>
                            <li>在会议和演讲中表现自信，能够有效传达信息</li>
                        </ul>
                    ` : results.extraversion <= 2 ? `
                        <p style="margin-bottom: 10px;"><strong>特点：</strong>内向谨慎，偏好深度思考，不善于频繁社交</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>适合需要专注和独立工作的岗位：研究、数据分析、编程、技术开发</li>
                            <li>在需要深度思考的问题上表现突出</li>
                            <li>一对一沟通效果较好，但大型会议可能表现拘谨</li>
                            <li>书面沟通能力强，适合技术文档编写</li>
                        </ul>
                    ` : `
                        <p style="margin-bottom: 10px;"><strong>特点：</strong>社交能力适中，能够平衡独立工作与团队协作</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>适应性强，既能独立工作也能团队协作</li>
                            <li>在需要适度沟通的岗位中表现良好</li>
                            <li>能够根据工作需求调整沟通方式</li>
                        </ul>
                    `}
                </div>
            </div>

            <!-- 管理能力分析 -->
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #10b981;">
                <h4 style="font-weight: bold; color: #333; margin-bottom: 10px;">👥 管理与领导能力</h4>
                <div style="font-size: 14px; color: #666;">
                    ${results.conscientiousness >= 4 && results.agreeableness >= 3 ? `
                        <p style="margin-bottom: 10px;"><strong>优势：</strong>具备优秀的管理潜质</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>责任心强，执行力高，能够有效组织和管理团队</li>
                            <li>善于制定计划，目标导向明确</li>
                            <li>团队合作意识强，能够协调团队成员关系</li>
                            <li>适合管理岗位：项目经理、部门主管、团队领导</li>
                            <li>在需要高度责任感的岗位中表现突出</li>
                        </ul>
                    ` : results.conscientiousness >= 4 ? `
                        <p style="margin-bottom: 10px;"><strong>特点：</strong>执行力强，但可能缺乏团队协调能力</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>个人执行力强，能够高效完成工作任务</li>
                            <li>适合需要高度责任感的岗位：会计、审计、质量控制</li>
                            <li>在需要独立决策的岗位中表现良好</li>
                            <li>可能需要提升团队协作和沟通技巧</li>
                        </ul>
                    ` : `
                        <p style="margin-bottom: 10px;"><strong>特点：</strong>灵活性高，但需要提升组织管理能力</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>适应性强，能够快速应对变化</li>
                            <li>适合需要创新和灵活性的岗位：创意设计、市场策划</li>
                            <li>在需要标准化管理的岗位中可能需要更多指导</li>
                            <li>建议通过培训提升时间管理和组织能力</li>
                        </ul>
                    `}
                </div>
            </div>

            <!-- 数字分析能力 -->
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #f59e0b;">
                <h4 style="font-weight: bold; color: #333; margin-bottom: 10px;">📊 数字分析与逻辑思维能力</h4>
                <div style="font-size: 14px; color: #666;">
                    ${results.conscientiousness >= 4 && results.neuroticism <= 2 ? `
                        <p style="margin-bottom: 10px;"><strong>优势：</strong>具备优秀的数字分析能力</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>逻辑思维清晰，能够处理复杂的数字分析任务</li>
                            <li>情绪稳定，能够在压力下保持冷静分析</li>
                            <li>适合数据分析、财务分析、统计研究等岗位</li>
                            <li>在需要精确计算和逻辑推理的工作中表现突出</li>
                            <li>能够独立完成复杂的数据处理任务</li>
                        </ul>
                    ` : results.openness >= 4 ? `
                        <p style="margin-bottom: 10px;"><strong>特点：</strong>创新思维强，但可能缺乏系统性分析</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>思维活跃，能够从不同角度分析问题</li>
                            <li>适合需要创新思维的分析工作：市场研究、产品开发</li>
                            <li>在需要标准化数据分析的岗位中可能需要更多训练</li>
                            <li>建议通过培训提升系统性分析能力</li>
                        </ul>
                    ` : `
                        <p style="margin-bottom: 10px;"><strong>特点：</strong>分析能力适中，需要根据具体岗位要求评估</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>能够完成基本的数字分析任务</li>
                            <li>在需要深度分析的工作中可能需要更多支持</li>
                            <li>适合中等复杂度的分析工作</li>
                        </ul>
                    `}
                </div>
            </div>

            <!-- 情商分析 -->
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #ec4899;">
                <h4 style="font-weight: bold; color: #333; margin-bottom: 10px;">💝 情商与情绪管理能力</h4>
                <div style="font-size: 14px; color: #666;">
                    ${results.agreeableness >= 4 && results.neuroticism <= 2 ? `
                        <p style="margin-bottom: 10px;"><strong>优势：</strong>情商较高，情绪管理能力强</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>善于理解他人情感，具有强烈的同理心</li>
                            <li>情绪稳定，能够在压力下保持冷静</li>
                            <li>适合需要高人际敏感度的岗位：人力资源、心理咨询、客户服务</li>
                            <li>在团队中能够有效调解冲突，促进团队和谐</li>
                            <li>能够敏锐察觉他人情绪变化，提供适当支持</li>
                        </ul>
                    ` : results.neuroticism >= 4 ? `
                        <p style="margin-bottom: 10px;"><strong>特点：</strong>情感丰富，但情绪波动较大</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>情感敏感度高，能够深刻理解他人情感</li>
                            <li>适合需要高度同理心的岗位：艺术创作、心理咨询、护理</li>
                            <li>在高压环境下可能需要更多情绪支持</li>
                            <li>建议通过培训提升情绪调节能力</li>
                        </ul>
                    ` : `
                        <p style="margin-bottom: 10px;"><strong>特点：</strong>情绪管理能力适中</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>能够处理一般的情绪管理任务</li>
                            <li>在需要高情商的岗位中可能需要更多发展</li>
                            <li>适合大多数常规工作环境</li>
                        </ul>
                    `}
                </div>
            </div>

            <!-- 创新与适应能力 -->
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #8b5cf6;">
                <h4 style="font-weight: bold; color: #333; margin-bottom: 10px;">🚀 创新与适应能力</h4>
                <div style="font-size: 14px; color: #666;">
                    ${results.openness >= 4 ? `
                        <p style="margin-bottom: 10px;"><strong>优势：</strong>创新思维强，适应能力强</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>富有想象力和创造力，乐于接受新事物</li>
                            <li>适合需要创新和创造力的岗位：研发、设计、市场策划、艺术创作</li>
                            <li>能够快速适应变化，在变革中表现突出</li>
                            <li>善于提出新颖的解决方案</li>
                            <li>在需要突破传统思维的工作中表现优秀</li>
                        </ul>
                    ` : results.openness <= 2 ? `
                        <p style="margin-bottom: 10px;"><strong>特点：</strong>传统务实，偏好稳定</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>偏好传统和熟悉的工作方式</li>
                            <li>适合需要遵循标准流程的岗位：行政、会计、法律、质量控制</li>
                            <li>在需要稳定性和可靠性的工作中表现良好</li>
                            <li>能够严格执行既定程序和标准</li>
                            <li>在快速变化的环境中可能需要更多适应时间</li>
                        </ul>
                    ` : `
                        <p style="margin-bottom: 10px;"><strong>特点：</strong>平衡发展，适应性强</p>
                        <ul style="list-style: disc; padding-left: 20px;">
                            <li>能够在创新与传统之间找到平衡</li>
                            <li>适应性强，能够根据工作需要调整思维方式</li>
                            <li>适合大多数常规工作环境</li>
                        </ul>
                    `}
                </div>
            </div>
        </div>

        <!-- 综合评估与招聘建议 -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #333; margin-top: 25px; margin-bottom: 15px;">综合评估与招聘建议</h3>
            
            <!-- 整体人格特征 -->
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <h4 style="font-weight: bold; color: #333; margin-bottom: 10px;">📋 整体人格特征</h4>
                <div style="font-size: 14px; color: #666;">
                    <p style="margin-bottom: 10px;">${results.overallAnalysis}</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                        <div>
                            <h5 style="font-weight: bold; color: #059669; margin-bottom: 5px;">核心优势</h5>
                            <ul style="list-style: disc; padding-left: 20px; font-size: 12px;">
                                ${results.strengths && results.strengths.length > 0 ? 
                                  results.strengths.slice(0, 3).map(strength => `<li>${strength}</li>`).join('') : 
                                  '<li>人格特征均衡发展</li>'
                                }
                            </ul>
                        </div>
                        <div>
                            <h5 style="font-weight: bold; color: #dc2626; margin-bottom: 5px;">发展空间</h5>
                            <ul style="list-style: disc; padding-left: 20px; font-size: 12px;">
                                ${results.weaknesses && results.weaknesses.length > 0 ? 
                                  results.weaknesses.slice(0, 3).map(weakness => `<li>${weakness}</li>`).join('') : 
                                  '<li>各维度发展较为均衡</li>'
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 岗位适配度分析 -->
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <h4 style="font-weight: bold; color: #333; margin-bottom: 10px;">🎯 岗位适配度分析</h4>
                <div style="font-size: 14px; color: #666;">
                    <div style="margin-bottom: 15px;">
                        <strong>应聘岗位：</strong>${session.position}
                    </div>
                    <div style="background: #e7f3ff; padding: 15px; border-radius: 8px;">
                        <h5 style="font-weight: bold; color: #2563eb; margin-bottom: 10px;">针对${session.position}岗位的分析：</h5>
                        ${generatePositionAnalysisForPDF(session.position, results)}
                    </div>
                </div>
            </div>

            <!-- 面试建议 -->
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <h4 style="font-weight: bold; color: #333; margin-bottom: 10px;">💼 面试建议</h4>
                <div style="font-size: 14px; color: #666;">
                    <div style="margin-bottom: 15px;">
                        <strong>重点关注领域：</strong>
                        <ul style="list-style: disc; padding-left: 20px; margin-top: 5px;">
                            ${results.weaknesses && results.weaknesses.length > 0 ? 
                              results.weaknesses.slice(0, 2).map(weakness => `<li>如何提升${weakness.split('：')[0]}</li>`).join('') : 
                              '<li>专业技能和实际工作经验</li>'
                            }
                        </ul>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>优势展示：</strong>
                        <ul style="list-style: disc; padding-left: 20px; margin-top: 5px;">
                            ${results.strengths && results.strengths.length > 0 ? 
                              results.strengths.slice(0, 2).map(strength => `<li>如何发挥${strength.split('：')[0]}优势</li>`).join('') : 
                              '<li>综合能力展示</li>'
                            }
                        </ul>
                    </div>
                    <div>
                        <strong>面试方式建议：</strong>
                        <ul style="list-style: disc; padding-left: 20px; margin-top: 5px;">
                            ${results.extraversion >= 4 ? 
                              '<li>采用小组讨论或团队合作场景测试</li>' : 
                              '<li>采用一对一深度面试，关注专业能力</li>'
                            }
                            ${results.conscientiousness >= 4 ? 
                              '<li>设置具体的工作任务和截止时间测试</li>' : 
                              '<li>关注候选人的灵活性和适应性</li>'
                            }
                        </ul>
                    </div>
                </div>
            </div>

            <!-- 入职建议 -->
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <h4 style="font-weight: bold; color: #333; margin-bottom: 10px;">🚀 入职建议</h4>
                <div style="font-size: 14px; color: #666;">
                    <div style="margin-bottom: 15px;">
                        <strong>工作环境：</strong>
                        <ul style="list-style: disc; padding-left: 20px; margin-top: 5px;">
                            ${results.neuroticism >= 4 ? 
                              '<li>提供稳定的工作环境和充分的支持</li>' : 
                              '<li>可以提供适当的挑战和成长机会</li>'
                            }
                            ${results.extraversion >= 4 ? 
                              '<li>安排团队协作和社交活动</li>' : 
                              '<li>提供独立工作空间和深度思考时间</li>'
                            }
                        </ul>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>培训重点：</strong>
                        <ul style="list-style: disc; padding-left: 20px; margin-top: 5px;">
                            ${results.conscientiousness < 3 ? '<li>时间管理和组织能力培训</li>' : ''}
                            ${results.agreeableness < 3 ? '<li>团队协作和沟通技巧培训</li>' : ''}
                            ${results.openness < 3 ? '<li>创新思维和适应性培训</li>' : ''}
                            ${results.neuroticism >= 4 ? '<li>压力管理和情绪调节培训</li>' : ''}
                        </ul>
                    </div>
                    <div>
                        <strong>职业发展：</strong>
                        <ul style="list-style: disc; padding-left: 20px; margin-top: 5px;">
                            ${results.conscientiousness >= 4 && results.agreeableness >= 3 ? '<li>考虑管理岗位发展路径</li>' : ''}
                            ${results.openness >= 4 ? '<li>考虑创新和研发岗位发展</li>' : ''}
                            ${results.extraversion >= 4 ? '<li>考虑销售和客户关系岗位发展</li>' : ''}
                            ${results.neuroticism <= 2 ? '<li>考虑高压和高责任岗位发展</li>' : ''}
                        </ul>
                    </div>
                </div>
            </div>

            <!-- 风险评估 -->
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <h4 style="font-weight: bold; color: #333; margin-bottom: 10px;">⚠️ 风险评估</h4>
                <div style="font-size: 14px; color: #666;">
                    <div style="margin-bottom: 15px;">
                        <strong>潜在风险：</strong>
                        <ul style="list-style: disc; padding-left: 20px; margin-top: 5px;">
                            ${results.neuroticism >= 4 ? '<li>在高压环境下可能出现情绪波动</li>' : ''}
                            ${results.conscientiousness < 3 ? '<li>在需要高度责任感的岗位中可能表现不稳定</li>' : ''}
                            ${results.agreeableness < 3 ? '<li>在团队协作中可能出现沟通问题</li>' : ''}
                            ${results.openness < 3 ? '<li>在快速变化的环境中可能适应较慢</li>' : ''}
                        </ul>
                    </div>
                    <div>
                        <strong>风险缓解措施：</strong>
                        <ul style="list-style: disc; padding-left: 20px; margin-top: 5px;">
                            <li>提供适当的培训和指导</li>
                            <li>建立有效的反馈机制</li>
                            <li>安排合适的导师或同事支持</li>
                            <li>定期评估和调整工作安排</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>本报告基于5型人格理论生成，仅供参考</p>
        <p>© 2024 广州联创舞台设备有限公司</p>
    </div>
</body>
</html>
    `
  }

  // 生成应聘者PDF内容
  const generateCandidatePDFContent = (session: AssessmentSession, results: PersonalityResults) => {
    const currentDate = new Date().toLocaleDateString('zh-CN')
    const completionDate = new Date(session.completedAt || '').toLocaleDateString('zh-CN')
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${session.candidateName} - 5型人格评测结果</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #f97316;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #f97316;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #f97316;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .info-item strong {
            color: #f97316;
        }
        .score-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #f97316;
        }
        .score-value {
            font-size: 18px;
            font-weight: bold;
            color: #f97316;
        }
        .level-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        .level-high { background: #d4edda; color: #155724; }
        .level-medium { background: #fff3cd; color: #856404; }
        .level-low { background: #f8d7da; color: #721c24; }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>5型人格评测结果</h1>
        <p>广州联创舞台设备有限公司</p>
        <p>生成时间：${currentDate}</p>
    </div>

    <div class="section">
        <h2>候选人基本信息</h2>
        <div class="info-grid">
            <div class="info-item">
                <strong>姓名：</strong>${session.candidateName}
            </div>
            <div class="info-item">
                <strong>邮箱：</strong>${session.candidateEmail}
            </div>
            <div class="info-item">
                <strong>手机：</strong>${session.candidatePhone}
            </div>
            <div class="info-item">
                <strong>应聘岗位：</strong>${session.position}
            </div>
            <div class="info-item">
                <strong>评测时间：</strong>${completionDate}
            </div>
            <div class="info-item">
                <strong>唯一ID：</strong>${session.uniqueId}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>人格维度得分</h2>
        ${Object.entries(results).filter(([key]) => key !== 'overallAnalysis' && key !== 'strengths' && key !== 'weaknesses' && key !== 'recommendations').map(([dimension, score]) => {
          const desc = DIMENSION_DESCRIPTIONS[dimension as keyof typeof DIMENSION_DESCRIPTIONS]
          const level = getScoreLevel(score as number)
          const levelClass = level === '高' ? 'level-high' : level === '中等' ? 'level-medium' : 'level-low'
          return `
            <div class="score-item">
              <div>
                <strong>${desc.name}</strong><br>
                <small>${desc.description}</small>
              </div>
              <div>
                <div class="score-value">${score}分</div>
                <div class="level-badge ${levelClass}">${level}</div>
              </div>
            </div>
          `
        }).join('')}
    </div>

    <div class="footer">
        <p>本报告基于5型人格理论生成，仅供参考</p>
        <p>© 2024 广州联创舞台设备有限公司</p>
    </div>
</body>
</html>
    `
  }

  // 生成PDF内容
  const generatePDFContent = (session: AssessmentSession, results: PersonalityResults) => {
    const currentDate = new Date().toLocaleDateString('zh-CN')
    const completionDate = new Date(session.completedAt || '').toLocaleDateString('zh-CN')
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true'
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${session.candidateName} - 5型人格评测报告</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #f97316;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #f97316;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #f97316;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .section h3 {
            color: #333;
            margin-top: 25px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-item {
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .info-item strong {
            color: #f97316;
        }
        .score-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #f97316;
        }
        .score-value {
            font-size: 18px;
            font-weight: bold;
            color: #f97316;
        }
        .level-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        .level-high { background: #d4edda; color: #155724; }
        .level-medium { background: #fff3cd; color: #856404; }
        .level-low { background: #f8d7da; color: #721c24; }
        .analysis-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .strength-item, .weakness-item {
            margin: 8px 0;
            padding: 8px 12px;
            border-radius: 5px;
        }
        .strength-item {
            background: #d4edda;
            border-left: 4px solid #28a745;
        }
        .weakness-item {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
        }
        .recommendation-item {
            background: #cce5ff;
            border-left: 4px solid #007bff;
            margin: 8px 0;
            padding: 8px 12px;
            border-radius: 5px;
        }
        .position-analysis {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .match-item {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 5px;
            border-left: 4px solid #28a745;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>5型人格评测报告</h1>
        <p>广州联创舞台设备有限公司</p>
        <p>生成时间：${currentDate}</p>
    </div>

    <div class="section">
        <h2>候选人基本信息</h2>
        <div class="info-grid">
            <div class="info-item">
                <strong>姓名：</strong>${session.candidateName}
            </div>
            <div class="info-item">
                <strong>邮箱：</strong>${session.candidateEmail}
            </div>
            <div class="info-item">
                <strong>手机：</strong>${session.candidatePhone}
            </div>
            <div class="info-item">
                <strong>应聘岗位：</strong>${session.position}
            </div>
            <div class="info-item">
                <strong>评测时间：</strong>${completionDate}
            </div>
            <div class="info-item">
                <strong>唯一ID：</strong>${session.uniqueId}
            </div>
        </div>
    </div>

    <div class="section">
        <h2>人格维度得分</h2>
        ${Object.entries(results).filter(([key]) => key !== 'overallAnalysis' && key !== 'strengths' && key !== 'weaknesses' && key !== 'recommendations').map(([dimension, score]) => {
          const desc = DIMENSION_DESCRIPTIONS[dimension as keyof typeof DIMENSION_DESCRIPTIONS]
          const level = getScoreLevel(score as number)
          const levelClass = level === '高' ? 'level-high' : level === '中等' ? 'level-medium' : 'level-low'
          return `
            <div class="score-item">
              <div>
                <strong>${desc.name}</strong><br>
                <small>${desc.description}</small>
              </div>
              <div>
                <div class="score-value">${score}分</div>
                <div class="level-badge ${levelClass}">${level}</div>
              </div>
            </div>
          `
        }).join('')}
    </div>

    ${isAdmin ? `
    <div class="section">
        <h2>整体分析</h2>
        <div class="analysis-box">
            <p>${results.overallAnalysis}</p>
        </div>
        
        ${results.strengths && results.strengths.length > 0 ? `
        <h3>优势特征</h3>
        <div class="analysis-box">
            ${results.strengths.map(strength => `<div class="strength-item">${strength}</div>`).join('')}
        </div>
        ` : ''}
        
        ${results.weaknesses && results.weaknesses.length > 0 ? `
        <h3>待提升方面</h3>
        <div class="analysis-box">
            ${results.weaknesses.map(weakness => `<div class="weakness-item">${weakness}</div>`).join('')}
        </div>
        ` : ''}
        
        ${results.recommendations && results.recommendations.length > 0 ? `
        <h3>职业建议</h3>
        <div class="analysis-box">
            ${results.recommendations.map(recommendation => `<div class="recommendation-item">${recommendation}</div>`).join('')}
        </div>
        ` : ''}
    </div>

    <div class="section">
        <h2>岗位适配度分析</h2>
        <div class="position-analysis">
            <h3>针对${session.position}岗位的分析</h3>
            ${generatePositionAnalysisForPDF(session.position, results)}
        </div>
    </div>

    <div class="section">
        <h2>招聘建议</h2>
        <div class="analysis-box">
            <h3>面试建议</h3>
            <ul>
                <li>重点关注候选人的专业技能和实际工作经验</li>
                <li>评估候选人与岗位要求的匹配度</li>
                <li>了解候选人的职业发展规划</li>
            </ul>
            
            <h3>入职建议</h3>
            <ul>
                <li>提供适当的培训和指导</li>
                <li>建立有效的反馈机制</li>
                <li>安排合适的导师或同事支持</li>
            </ul>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <p>本报告基于5型人格理论生成，仅供参考</p>
        <p>© 2024 广州联创舞台设备有限公司</p>
    </div>
</body>
</html>
    `
  }

  // 生成岗位分析内容
  const generatePositionAnalysis = (position: string, results: PersonalityResults) => {
    let analysis = ''
    
    if (position.includes('销售') || position.includes('客户') || position.includes('市场')) {
      analysis = `
        <div class="match-item">
          <strong>沟通能力：</strong>
          ${results.extraversion >= 4 ? '✅ 外向性强，善于与人沟通，适合销售工作' : '⚠️ 内向性格，在销售工作中可能需要更多培训'}
        </div>
        <div class="match-item">
          <strong>客户服务：</strong>
          ${results.agreeableness >= 4 ? '✅ 善于理解客户需求，客户服务意识强' : '⚠️ 需要提升客户服务意识和同理心'}
        </div>
        <div class="match-item">
          <strong>抗压能力：</strong>
          ${results.neuroticism <= 2 ? '✅ 情绪稳定，能够应对销售压力' : '⚠️ 需要提升抗压能力，适应销售环境'}
        </div>
      `
    } else if (position.includes('技术') || position.includes('开发') || position.includes('工程师')) {
      analysis = `
        <div class="match-item">
          <strong>责任心：</strong>
          ${results.conscientiousness >= 4 ? '✅ 责任心强，适合需要精确性的技术工作' : '⚠️ 需要提升责任心和细致程度'}
        </div>
        <div class="match-item">
          <strong>创新思维：</strong>
          ${results.openness >= 4 ? '✅ 创新思维强，适合技术研发工作' : '⚠️ 需要提升创新思维和技术学习能力'}
        </div>
        <div class="match-item">
          <strong>专注能力：</strong>
          ${results.extraversion <= 2 ? '✅ 内向性格，适合专注的技术工作' : '⚠️ 外向性格，可能需要更多团队协作'}
        </div>
      `
    } else if (position.includes('管理') || position.includes('主管') || position.includes('经理')) {
      analysis = `
        <div class="match-item">
          <strong>执行力：</strong>
          ${results.conscientiousness >= 4 ? '✅ 责任心强，执行力高，适合管理岗位' : '⚠️ 需要提升责任心和执行力'}
        </div>
        <div class="match-item">
          <strong>团队协作：</strong>
          ${results.agreeableness >= 4 ? '✅ 团队合作意识强，善于协调团队关系' : '⚠️ 需要提升团队协作和沟通能力'}
        </div>
        <div class="match-item">
          <strong>领导沟通：</strong>
          ${results.extraversion >= 4 ? '✅ 外向性格，善于与下属沟通' : '⚠️ 内向性格，需要提升领导沟通能力'}
        </div>
      `
    } else {
      analysis = `
        <div class="match-item">
          <strong>综合评估：</strong>
          基于人格特征的综合分析，该候选人在多个维度表现均衡
        </div>
      `
    }
    
    return analysis
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '5型人格评测结果',
        text: `${session?.candidateName}的5型人格评测结果`,
        url: window.location.href
      })
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">结果不存在</h1>
          <button
            onClick={() => router.push('/assessment/start')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            重新开始
          </button>
        </div>
      </div>
    )
  }

  const results = session.results

  // 准备雷达图数据
  const radarData = [
    {
      dimension: '开放性',
      score: results.openness,
      fullMark: 5
    },
    {
      dimension: '尽责性',
      score: results.conscientiousness,
      fullMark: 5
    },
    {
      dimension: '外向性',
      score: results.extraversion,
      fullMark: 5
    },
    {
      dimension: '宜人性',
      score: results.agreeableness,
      fullMark: 5
    },
    {
      dimension: '神经质',
      score: results.neuroticism,
      fullMark: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {session.candidateName} 的5型人格评测结果
              </h1>
              <p className="text-gray-600 mt-1">
                评测完成时间：{new Date(session.completedAt || '').toLocaleString('zh-CN')}
              </p>
            </div>
            <div className="flex space-x-3">
              {localStorage.getItem('adminLoggedIn') === 'true' ? (
                <>
                  <button
                    onClick={handleDownload}
                    className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    打印
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    分享
                  </button>
                  <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="flex items-center px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回管理后台
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleReturnHome}
                    className="flex items-center px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    返回首页
                  </button>
                  <button
                    onClick={handleExit}
                    className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    结束评测
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 雷达图 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">人格维度分析</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} />
                  <Radar
                    name="分数"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 详细分数 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">详细分数</h2>
            <div className="space-y-4">
              {Object.entries(results).filter(([key]) => key !== 'overallAnalysis' && key !== 'strengths' && key !== 'weaknesses' && key !== 'recommendations').map(([dimension, score]) => {
                const desc = DIMENSION_DESCRIPTIONS[dimension as keyof typeof DIMENSION_DESCRIPTIONS]
                const level = getScoreLevel(score as number)
                const colorClass = getScoreColor(score as number)
                
                return (
                  <div key={dimension} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">{desc.name}</h3>
                      <span className={`font-bold ${colorClass}`}>
                        {score}分 ({level})
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{desc.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(score as number / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 整体分析 - 只对管理员显示 */}
        {localStorage.getItem('adminLoggedIn') === 'true' && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">招聘分析报告</h2>
            <div className="space-y-6">
              {/* 候选人基本信息 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">候选人信息</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">姓名：</span>{session?.candidateName}</div>
                  <div><span className="font-medium">邮箱：</span>{session?.candidateEmail}</div>
                  <div><span className="font-medium">手机：</span>{session?.candidatePhone}</div>
                  <div><span className="font-medium">应聘岗位：</span>{session?.position}</div>
                  <div><span className="font-medium">评测时间：</span>{new Date(session?.completedAt || '').toLocaleString('zh-CN')}</div>
                  <div><span className="font-medium">唯一ID：</span>{session?.uniqueId}</div>
                </div>
              </div>

              {/* 人格特征分析 */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3">人格特征分析</h3>
                <div className="space-y-3">
                  {Object.entries(results).filter(([key]) => key !== 'overallAnalysis' && key !== 'strengths' && key !== 'weaknesses' && key !== 'recommendations').map(([dimension, score]) => {
                    const desc = DIMENSION_DESCRIPTIONS[dimension as keyof typeof DIMENSION_DESCRIPTIONS]
                    const level = getScoreLevel(score as number)
                    const colorClass = getScoreColor(score as number)
                    
                    return (
                      <div key={dimension} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{desc.name}</div>
                          <div className="text-sm text-gray-600">{desc.description}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${colorClass}`}>{score}分</div>
                          <div className={`text-sm font-medium px-2 py-1 rounded-full ${colorClass.replace('text-', 'bg-').replace('-600', '-100')} ${colorClass}`}>{level}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 招聘建议 */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">招聘建议</h3>
                <div className="space-y-4">
                  {/* 优势特征 */}
                  {results.strengths.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-800 mb-2">✅ 优势特征</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {results.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 待提升方面 */}
                  {results.weaknesses.length > 0 && (
                    <div>
                      <h4 className="font-medium text-orange-800 mb-2">⚠️ 待提升方面</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {results.weaknesses.map((weakness, index) => (
                          <li key={index}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 职业建议 */}
                  {results.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">💼 职业建议</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {results.recommendations.map((recommendation, index) => (
                          <li key={index}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* 职业能力分析 */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">职业能力分析</h3>
                <div className="space-y-4">
                  {/* 沟通能力分析 */}
                  <div className="bg-white rounded-lg p-3 border">
                    <h4 className="font-medium text-gray-900 mb-2">🗣️ 沟通与人际交往能力</h4>
                    <div className="text-sm text-gray-700">
                      {results.extraversion >= 4 ? (
                        <div>
                          <p className="mb-2"><strong>优势：</strong>热情外向，善于表达，喜欢与人互动</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>适合需要频繁人际互动的岗位：销售、公共关系、客户服务、市场推广</li>
                            <li>在团队中能够活跃气氛，促进团队凝聚力</li>
                            <li>善于建立和维护客户关系，适合对外沟通工作</li>
                            <li>在会议和演讲中表现自信，能够有效传达信息</li>
                          </ul>
                        </div>
                      ) : results.extraversion <= 2 ? (
                        <div>
                          <p className="mb-2"><strong>特点：</strong>内向谨慎，偏好深度思考，不善于频繁社交</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>适合需要专注和独立工作的岗位：研究、数据分析、编程、技术开发</li>
                            <li>在需要深度思考的问题上表现突出</li>
                            <li>一对一沟通效果较好，但大型会议可能表现拘谨</li>
                            <li>书面沟通能力强，适合技术文档编写</li>
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <p className="mb-2"><strong>特点：</strong>社交能力适中，能够平衡独立工作与团队协作</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>适应性强，既能独立工作也能团队协作</li>
                            <li>在需要适度沟通的岗位中表现良好</li>
                            <li>能够根据工作需求调整沟通方式</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 管理能力分析 */}
                  <div className="bg-white rounded-lg p-3 border">
                    <h4 className="font-medium text-gray-900 mb-2">👥 管理与领导能力</h4>
                    <div className="text-sm text-gray-700">
                      {results.conscientiousness >= 4 && results.agreeableness >= 3 ? (
                        <div>
                          <p className="mb-2"><strong>优势：</strong>具备优秀的管理潜质</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>责任心强，执行力高，能够有效组织和管理团队</li>
                            <li>善于制定计划，目标导向明确</li>
                            <li>团队合作意识强，能够协调团队成员关系</li>
                            <li>适合管理岗位：项目经理、部门主管、团队领导</li>
                            <li>在需要高度责任感的岗位中表现突出</li>
                          </ul>
                        </div>
                      ) : results.conscientiousness >= 4 ? (
                        <div>
                          <p className="mb-2"><strong>特点：</strong>执行力强，但可能缺乏团队协调能力</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>个人执行力强，能够高效完成工作任务</li>
                            <li>适合需要高度责任感的岗位：会计、审计、质量控制</li>
                            <li>在需要独立决策的岗位中表现良好</li>
                            <li>可能需要提升团队协作和沟通技巧</li>
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <p className="mb-2"><strong>特点：</strong>灵活性高，但需要提升组织管理能力</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>适应性强，能够快速应对变化</li>
                            <li>适合需要创新和灵活性的岗位：创意设计、市场策划</li>
                            <li>在需要标准化管理的岗位中可能需要更多指导</li>
                            <li>建议通过培训提升时间管理和组织能力</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 数字分析能力 */}
                  <div className="bg-white rounded-lg p-3 border">
                    <h4 className="font-medium text-gray-900 mb-2">📊 数字分析与逻辑思维能力</h4>
                    <div className="text-sm text-gray-700">
                      {results.conscientiousness >= 4 && results.neuroticism <= 2 ? (
                        <div>
                          <p className="mb-2"><strong>优势：</strong>具备优秀的数字分析能力</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>逻辑思维清晰，能够处理复杂的数字分析任务</li>
                            <li>情绪稳定，能够在压力下保持冷静分析</li>
                            <li>适合数据分析、财务分析、统计研究等岗位</li>
                            <li>在需要精确计算和逻辑推理的工作中表现突出</li>
                            <li>能够独立完成复杂的数据处理任务</li>
                          </ul>
                        </div>
                      ) : results.openness >= 4 ? (
                        <div>
                          <p className="mb-2"><strong>特点：</strong>创新思维强，但可能缺乏系统性分析</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>思维活跃，能够从不同角度分析问题</li>
                            <li>适合需要创新思维的分析工作：市场研究、产品开发</li>
                            <li>在需要标准化数据分析的岗位中可能需要更多训练</li>
                            <li>建议通过培训提升系统性分析能力</li>
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <p className="mb-2"><strong>特点：</strong>分析能力适中，需要根据具体岗位要求评估</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>能够完成基本的数字分析任务</li>
                            <li>在需要深度分析的工作中可能需要更多支持</li>
                            <li>适合中等复杂度的分析工作</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 情商分析 */}
                  <div className="bg-white rounded-lg p-3 border">
                    <h4 className="font-medium text-gray-900 mb-2">💝 情商与情绪管理能力</h4>
                    <div className="text-sm text-gray-700">
                      {results.agreeableness >= 4 && results.neuroticism <= 2 ? (
                        <div>
                          <p className="mb-2"><strong>优势：</strong>情商较高，情绪管理能力强</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>善于理解他人情感，具有强烈的同理心</li>
                            <li>情绪稳定，能够在压力下保持冷静</li>
                            <li>适合需要高人际敏感度的岗位：人力资源、心理咨询、客户服务</li>
                            <li>在团队中能够有效调解冲突，促进团队和谐</li>
                            <li>能够敏锐察觉他人情绪变化，提供适当支持</li>
                          </ul>
                        </div>
                      ) : results.neuroticism >= 4 ? (
                        <div>
                          <p className="mb-2"><strong>特点：</strong>情感丰富，但情绪波动较大</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>情感敏感度高，能够深刻理解他人情感</li>
                            <li>适合需要高度同理心的岗位：艺术创作、心理咨询、护理</li>
                            <li>在高压环境下可能需要更多情绪支持</li>
                            <li>建议通过培训提升情绪调节能力</li>
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <p className="mb-2"><strong>特点：</strong>情绪管理能力适中</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>能够处理一般的情绪管理任务</li>
                            <li>在需要高情商的岗位中可能需要更多发展</li>
                            <li>适合大多数常规工作环境</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 创新与适应能力 */}
                  <div className="bg-white rounded-lg p-3 border">
                    <h4 className="font-medium text-gray-900 mb-2">🚀 创新与适应能力</h4>
                    <div className="text-sm text-gray-700">
                      {results.openness >= 4 ? (
                        <div>
                          <p className="mb-2"><strong>优势：</strong>创新思维强，适应能力强</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>富有想象力和创造力，乐于接受新事物</li>
                            <li>适合需要创新和创造力的岗位：研发、设计、市场策划、艺术创作</li>
                            <li>能够快速适应变化，在变革中表现突出</li>
                            <li>善于提出新颖的解决方案</li>
                            <li>在需要突破传统思维的工作中表现优秀</li>
                          </ul>
                        </div>
                      ) : results.openness <= 2 ? (
                        <div>
                          <p className="mb-2"><strong>特点：</strong>传统务实，偏好稳定</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>偏好传统和熟悉的工作方式</li>
                            <li>适合需要遵循标准流程的岗位：行政、会计、法律、质量控制</li>
                            <li>在需要稳定性和可靠性的工作中表现良好</li>
                            <li>能够严格执行既定程序和标准</li>
                            <li>在快速变化的环境中可能需要更多适应时间</li>
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <p className="mb-2"><strong>特点：</strong>平衡发展，适应性强</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>能够在创新与传统之间找到平衡</li>
                            <li>适应性强，能够根据工作需要调整思维方式</li>
                            <li>适合大多数常规工作环境</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 综合评估与招聘建议 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">综合评估与招聘建议</h3>
                <div className="space-y-4">
                  {/* 整体人格特征 */}
                  <div className="bg-white rounded-lg p-3 border">
                    <h4 className="font-medium text-gray-900 mb-2">📋 整体人格特征</h4>
                    <div className="text-sm text-gray-700">
                      <p className="mb-2">{results.overallAnalysis}</p>
                      <div className="grid md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <h5 className="font-medium text-green-800 mb-1">核心优势</h5>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            {results.strengths && results.strengths.length > 0 ? (
                              results.strengths.slice(0, 3).map((strength, index) => (
                                <li key={index}>{strength}</li>
                              ))
                            ) : (
                              <li>人格特征均衡发展</li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-orange-800 mb-1">发展空间</h5>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            {results.weaknesses && results.weaknesses.length > 0 ? (
                              results.weaknesses.slice(0, 3).map((weakness, index) => (
                                <li key={index}>{weakness}</li>
                              ))
                            ) : (
                              <li>各维度发展较为均衡</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 岗位适配度分析 */}
                  <div className="bg-white rounded-lg p-3 border">
                    <h4 className="font-medium text-gray-900 mb-2">🎯 岗位适配度分析</h4>
                    <div className="text-sm text-gray-700">
                      <div className="mb-3">
                        <strong>应聘岗位：</strong>{session?.position}
                      </div>
                      
                      {/* 针对具体岗位的分析 */}
                      <div className="mb-4 p-3 bg-blue-50 rounded border">
                        <h5 className="font-medium text-blue-900 mb-2">针对{session?.position}岗位的分析：</h5>
                        <div className="space-y-2">
                          {/* 销售类岗位 */}
                          {(session?.position?.includes('销售') || session?.position?.includes('客户') || session?.position?.includes('市场')) && (
                            <div>
                              {results.extraversion >= 4 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 外向性强，善于与人沟通，适合销售工作</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 内向性格，在销售工作中可能需要更多培训</span>
                                </div>
                              )}
                              {results.agreeableness >= 4 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 善于理解客户需求，客户服务意识强</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 需要提升客户服务意识和同理心</span>
                                </div>
                              )}
                              {results.neuroticism <= 2 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 情绪稳定，能够应对销售压力</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 需要提升抗压能力，适应销售环境</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* 技术类岗位 */}
                          {(session?.position?.includes('技术') || session?.position?.includes('开发') || session?.position?.includes('工程师') || session?.position?.includes('程序')) && (
                            <div>
                              {results.conscientiousness >= 4 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 责任心强，适合需要精确性的技术工作</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 需要提升责任心和细致程度</span>
                                </div>
                              )}
                              {results.openness >= 4 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 创新思维强，适合技术研发工作</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 需要提升创新思维和技术学习能力</span>
                                </div>
                              )}
                              {results.extraversion <= 2 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 内向性格，适合专注的技术工作</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 外向性格，可能需要更多团队协作</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* 管理类岗位 */}
                          {(session?.position?.includes('管理') || session?.position?.includes('主管') || session?.position?.includes('经理') || session?.position?.includes('领导')) && (
                            <div>
                              {results.conscientiousness >= 4 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 责任心强，执行力高，适合管理岗位</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 需要提升责任心和执行力</span>
                                </div>
                              )}
                              {results.agreeableness >= 4 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 团队合作意识强，善于协调团队关系</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 需要提升团队协作和沟通能力</span>
                                </div>
                              )}
                              {results.extraversion >= 4 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 外向性格，善于与下属沟通</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 内向性格，需要提升领导沟通能力</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* 财务类岗位 */}
                          {(session?.position?.includes('财务') || session?.position?.includes('会计') || session?.position?.includes('审计')) && (
                            <div>
                              {results.conscientiousness >= 4 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 责任心强，适合需要精确性的财务工作</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 需要提升责任心和细致程度</span>
                                </div>
                              )}
                              {results.openness <= 2 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 传统务实，适合遵循标准流程的财务工作</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 创新思维强，需要适应标准化工作流程</span>
                                </div>
                              )}
                              {results.neuroticism <= 2 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 情绪稳定，适合需要冷静分析的财务工作</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 需要提升情绪管理能力，适应财务工作压力</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* 设计类岗位 */}
                          {(session?.position?.includes('设计') || session?.position?.includes('创意') || session?.position?.includes('美术')) && (
                            <div>
                              {results.openness >= 4 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 创新思维强，适合需要创造力的设计工作</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 需要提升创新思维和创造力</span>
                                </div>
                              )}
                              {results.extraversion >= 4 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 外向性格，善于与客户沟通设计需求</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 内向性格，需要提升客户沟通能力</span>
                                </div>
                              )}
                              {results.agreeableness >= 4 ? (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 善于理解客户需求，团队合作意识强</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-700 mb-1">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  <span>⚠️ 需要提升客户服务意识和团队协作</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* 通用分析 */}
                          {!session?.position?.includes('销售') && !session?.position?.includes('客户') && !session?.position?.includes('市场') && 
                           !session?.position?.includes('技术') && !session?.position?.includes('开发') && !session?.position?.includes('工程师') && !session?.position?.includes('程序') &&
                           !session?.position?.includes('管理') && !session?.position?.includes('主管') && !session?.position?.includes('经理') && !session?.position?.includes('领导') &&
                           !session?.position?.includes('财务') && !session?.position?.includes('会计') && !session?.position?.includes('审计') &&
                           !session?.position?.includes('设计') && !session?.position?.includes('创意') && !session?.position?.includes('美术') && (
                            <div>
                              <p className="text-gray-600 mb-2">基于人格特征的综合评估：</p>
                              {results.conscientiousness >= 4 && (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 责任心强，适合需要高度责任感的岗位</span>
                                </div>
                              )}
                              {results.extraversion >= 4 && (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 外向性强，适合需要人际交往的岗位</span>
                                </div>
                              )}
                              {results.agreeableness >= 4 && (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 团队合作意识强，适合协作性工作</span>
                                </div>
                              )}
                              {results.openness >= 4 && (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 创新思维强，适合需要创造力的岗位</span>
                                </div>
                              )}
                              {results.neuroticism <= 2 && (
                                <div className="flex items-center text-green-700 mb-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  <span>✅ 情绪稳定，适合高压工作环境</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 面试建议 */}
                  <div className="bg-white rounded-lg p-3 border">
                    <h4 className="font-medium text-gray-900 mb-2">💼 面试建议</h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <div>
                        <strong>重点关注领域：</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {results.weaknesses.length > 0 ? (
                            results.weaknesses.slice(0, 2).map((weakness, index) => (
                              <li key={index}>如何提升{weakness.split('：')[0]}</li>
                            ))
                          ) : (
                            <li>专业技能和实际工作经验</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <strong>优势展示：</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {results.strengths.slice(0, 2).map((strength, index) => (
                            <li key={index}>如何发挥{strength.split('：')[0]}优势</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>面试方式建议：</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {results.extraversion >= 4 ? (
                            <li>采用小组讨论或团队合作场景测试</li>
                          ) : (
                            <li>采用一对一深度面试，关注专业能力</li>
                          )}
                          {results.conscientiousness >= 4 ? (
                            <li>设置具体的工作任务和截止时间测试</li>
                          ) : (
                            <li>关注候选人的灵活性和适应性</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 入职建议 */}
                  <div className="bg-white rounded-lg p-3 border">
                    <h4 className="font-medium text-gray-900 mb-2">🚀 入职建议</h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <div>
                        <strong>工作环境：</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {results.neuroticism >= 4 ? (
                            <li>提供稳定的工作环境和充分的支持</li>
                          ) : (
                            <li>可以提供适当的挑战和成长机会</li>
                          )}
                          {results.extraversion >= 4 ? (
                            <li>安排团队协作和社交活动</li>
                          ) : (
                            <li>提供独立工作空间和深度思考时间</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <strong>培训重点：</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {results.conscientiousness < 3 && (
                            <li>时间管理和组织能力培训</li>
                          )}
                          {results.agreeableness < 3 && (
                            <li>团队协作和沟通技巧培训</li>
                          )}
                          {results.openness < 3 && (
                            <li>创新思维和适应性培训</li>
                          )}
                          {results.neuroticism >= 4 && (
                            <li>压力管理和情绪调节培训</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <strong>职业发展：</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {results.conscientiousness >= 4 && results.agreeableness >= 3 && (
                            <li>考虑管理岗位发展路径</li>
                          )}
                          {results.openness >= 4 && (
                            <li>考虑创新和研发岗位发展</li>
                          )}
                          {results.extraversion >= 4 && (
                            <li>考虑销售和客户关系岗位发展</li>
                          )}
                          {results.neuroticism <= 2 && (
                            <li>考虑高压和高责任岗位发展</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 风险评估 */}
                  <div className="bg-white rounded-lg p-3 border">
                    <h4 className="font-medium text-gray-900 mb-2">⚠️ 风险评估</h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <div>
                        <strong>潜在风险：</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {results.neuroticism >= 4 && (
                            <li>在高压环境下可能出现情绪波动</li>
                          )}
                          {results.conscientiousness < 3 && (
                            <li>在需要高度责任感的岗位中可能表现不稳定</li>
                          )}
                          {results.agreeableness < 3 && (
                            <li>在团队协作中可能出现沟通问题</li>
                          )}
                          {results.openness < 3 && (
                            <li>在快速变化的环境中可能适应较慢</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <strong>风险缓解措施：</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>提供适当的培训和指导</li>
                          <li>建立有效的反馈机制</li>
                          <li>安排合适的导师或同事支持</li>
                          <li>定期评估和调整工作安排</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 完成提示和操作按钮 - 只对应聘者显示 */}
        {localStorage.getItem('adminLoggedIn') !== 'true' && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                评测完成！
              </h3>
              <p className="text-green-700 mb-4">
                感谢您完成5型人格评测，您的评测结果已保存。
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleReturnHome}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </button>
                <button
                  onClick={handleExit}
                  className="flex items-center px-6 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50"
                >
                  结束评测
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 退出确认模态框 */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                评测完成确认
              </h3>
              <p className="text-gray-600 mb-6">
                您已完成5型人格评测，感谢您的参与！<br/>
                评测结果已保存，建议您：
              </p>
              <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
                <li>• 查看详细结果报告</li>
                <li>• 保存或打印结果</li>
                <li>• 返回首页结束评测</li>
              </ul>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    console.log('继续查看，关闭对话框')
                    setShowExitModal(false)
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  继续查看
                </button>
                <button
                  onClick={handleConfirmExit}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
