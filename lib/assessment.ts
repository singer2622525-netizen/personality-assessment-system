import { Answer, PersonalityResults, PersonalityDimension, DIMENSION_DESCRIPTIONS } from './types'
import { QUESTIONS } from './questions'
import { calculatePositionMatch, getAllPositions } from './positions'

// 计算5型人格分数
export function calculatePersonalityScores(answers: Answer[]): PersonalityResults {
  const scores = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0
  }

  const questionCounts = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0
  }

  // 计算各维度总分
  answers.forEach(answer => {
    const question = QUESTIONS.find(q => q.id === answer.questionId)
    if (question) {
      let score = answer.score
      
      // 反向计分
      if (question.reverse) {
        score = 6 - score
      }
      
      scores[question.dimension] += score
      questionCounts[question.dimension]++
    }
  })

  // 计算平均分
  Object.keys(scores).forEach(dimension => {
    const count = questionCounts[dimension as PersonalityDimension]
    if (count > 0) {
      scores[dimension as PersonalityDimension] = Math.round((scores[dimension as PersonalityDimension] / count) * 10) / 10
    }
  })

  // 生成分析报告
  const analysis = generatePersonalityAnalysis(scores)
  
  return {
    ...scores,
    overallAnalysis: analysis.overall,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    recommendations: analysis.recommendations
  }
}

// 生成人格分析报告
function generatePersonalityAnalysis(scores: Record<PersonalityDimension, number>) {
  const analysis = {
    overall: '',
    strengths: [] as string[],
    weaknesses: [] as string[],
    recommendations: [] as string[]
  }

  // 分析各维度
  const dimensionAnalysis = Object.entries(scores).map(([dimension, score]) => {
    const desc = DIMENSION_DESCRIPTIONS[dimension as PersonalityDimension]
    const isHigh = score >= 4.0
    const isLow = score <= 2.0
    
    return {
      dimension,
      score,
      level: isHigh ? '高' : isLow ? '低' : '中等',
      description: isHigh ? desc.high : isLow ? desc.low : '处于中等水平'
    }
  })

  // 生成整体分析
  const highDimensions = dimensionAnalysis.filter(d => d.level === '高')
  const lowDimensions = dimensionAnalysis.filter(d => d.level === '低')
  
  analysis.overall = `根据评测结果，您在${highDimensions.map(d => DIMENSION_DESCRIPTIONS[d.dimension as PersonalityDimension].name).join('、')}方面表现突出，`
  analysis.overall += `在${lowDimensions.map(d => DIMENSION_DESCRIPTIONS[d.dimension as PersonalityDimension].name).join('、')}方面有提升空间。`

  // 生成优势
  highDimensions.forEach(d => {
    const desc = DIMENSION_DESCRIPTIONS[d.dimension as PersonalityDimension]
    analysis.strengths.push(`${desc.name}：${desc.high}`)
  })

  // 生成改进建议
  lowDimensions.forEach(d => {
    const desc = DIMENSION_DESCRIPTIONS[d.dimension as PersonalityDimension]
    analysis.weaknesses.push(`${desc.name}：${desc.low}`)
  })

  // 生成岗位匹配建议
  const positions = getAllPositions()
  const positionMatches = positions.map(position => {
    const match = calculatePositionMatch(scores, position.id)
    return { position, match }
  }).sort((a, b) => b.match.matchScore - a.match.matchScore)

  // 添加最适合的岗位建议
  if (positionMatches.length > 0) {
    const bestMatch = positionMatches[0]
    if (bestMatch.match.matchScore >= 70) {
      analysis.recommendations.push(`最适合${bestMatch.position.name}岗位，匹配度${bestMatch.match.matchScore}%`)
    }
  }

  // 添加通用建议
  if (scores.conscientiousness >= 4.0) {
    analysis.recommendations.push('具备高度责任心，适合需要强执行力的岗位')
  }
  if (scores.extraversion >= 4.0) {
    analysis.recommendations.push('善于人际交往，适合销售、客户服务等岗位')
  }
  if (scores.openness >= 4.0) {
    analysis.recommendations.push('思维开放创新，适合研发、设计等岗位')
  }
  if (scores.agreeableness >= 4.0) {
    analysis.recommendations.push('团队协作能力强，适合需要密切配合的岗位')
  }
  if (scores.neuroticism <= 2.0) {
    analysis.recommendations.push('情绪稳定，抗压能力强，适合高压工作环境')
  }

  return analysis
}

// 获取分数等级
export function getScoreLevel(score: number): '低' | '中等' | '高' {
  if (score >= 4.0) return '高'
  if (score <= 2.0) return '低'
  return '中等'
}

// 获取分数颜色
export function getScoreColor(score: number): string {
  if (score >= 4.0) return 'text-green-600'
  if (score <= 2.0) return 'text-red-600'
  return 'text-yellow-600'
}

// 生成评测链接
export function generateAssessmentLink(sessionId: string): string {
  return `${window.location.origin}/assessment/${sessionId}`
}

// 验证答案完整性
export function validateAnswers(answers: Answer[]): boolean {
  return answers.length === QUESTIONS.length && 
         answers.every(answer => answer.score >= 1 && answer.score <= 5)
}
