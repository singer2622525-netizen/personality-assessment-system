import { Answer, PersonalityResults, PersonalityDimension, DIMENSION_DESCRIPTIONS, QUESTIONS } from './types'

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
      let score = answer.answer
      
      // 反向计分
      if (question.reverse) {
        score = 6 - score
      }
      
      scores[question.trait] += score
      questionCounts[question.trait]++
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
  Object.entries(scores).forEach(([dimension, score]) => {
    const dim = dimension as PersonalityDimension
    const desc = DIMENSION_DESCRIPTIONS[dim]
    
    if (score >= 4) {
      analysis.strengths.push(desc.high)
    } else if (score <= 2) {
      analysis.weaknesses.push(desc.low)
    }
  })

  // 生成整体分析
  if (analysis.strengths.length > 0) {
    analysis.overall += `您的优势特质包括：${analysis.strengths.join('、')}。`
  }
  
  if (analysis.weaknesses.length > 0) {
    analysis.overall += `需要关注的方面：${analysis.weaknesses.join('、')}。`
  }

  // 生成建议
  if (scores.conscientiousness < 3) {
    analysis.recommendations.push('建议制定更详细的工作计划，提高时间管理能力')
  }
  
  if (scores.extraversion < 3) {
    analysis.recommendations.push('可以尝试多参与团队活动，提升沟通表达能力')
  }
  
  if (scores.neuroticism > 3) {
    analysis.recommendations.push('建议学习压力管理技巧，保持情绪稳定')
  }

  return analysis
}

// 岗位匹配分析
export function generatePositionAnalysis(position: string, scores: PersonalityResults): string {
  const positionRequirements = {
    '销售工程师': {
      extraversion: 4,
      agreeableness: 3.5,
      conscientiousness: 3.5,
      openness: 3,
      neuroticism: 2.5
    },
    '机械设计师': {
      conscientiousness: 4,
      openness: 3.5,
      neuroticism: 2.5,
      extraversion: 2.5,
      agreeableness: 3
    },
    '事业部领导': {
      extraversion: 4,
      conscientiousness: 4,
      agreeableness: 3.5,
      neuroticism: 2.5,
      openness: 3.5
    },
    '文职类岗位': {
      conscientiousness: 4,
      agreeableness: 3.5,
      neuroticism: 2.5,
      extraversion: 2.5,
      openness: 3
    }
  }

  const requirements = positionRequirements[position as keyof typeof positionRequirements]
  if (!requirements) {
    return '该岗位暂无特定的匹配标准。'
  }

  let analysis = `针对${position}岗位的分析：\n\n`
  
  // 计算匹配度
  const matchScores = Object.keys(requirements).map(dimension => {
    const dim = dimension as PersonalityDimension
    const required = requirements[dim]
    const actual = scores[dim]
    const match = Math.max(0, 5 - Math.abs(required - actual)) / 5
    return { dimension: dim, match, required, actual }
  })

  const overallMatch = matchScores.reduce((sum, item) => sum + item.match, 0) / matchScores.length

  analysis += `整体匹配度：${(overallMatch * 100).toFixed(1)}%\n\n`

  // 详细分析
  matchScores.forEach(item => {
    const desc = DIMENSION_DESCRIPTIONS[item.dimension]
    const status = item.match >= 0.8 ? '✓ 优秀' : item.match >= 0.6 ? '○ 良好' : '△ 需提升'
    analysis += `${desc.name}：${status} (${item.actual.toFixed(1)}/5.0)\n`
  })

  return analysis
}

// 生成面试建议
export function generateInterviewSuggestions(scores: PersonalityResults): string[] {
  const suggestions = []

  if (scores.extraversion >= 4) {
    suggestions.push('候选人善于沟通，可以重点了解其团队合作经验')
  } else {
    suggestions.push('候选人较为内向，可以询问其独立工作能力')
  }

  if (scores.conscientiousness >= 4) {
    suggestions.push('候选人做事认真负责，可以了解其项目管理经验')
  } else {
    suggestions.push('候选人可能较为随性，需要了解其时间管理能力')
  }

  if (scores.neuroticism >= 3) {
    suggestions.push('候选人可能容易感到压力，需要了解其抗压能力')
  } else {
    suggestions.push('候选人情绪稳定，可以了解其处理困难情况的经验')
  }

  return suggestions
}

// 生成入职建议
export function generateOnboardingSuggestions(scores: PersonalityResults): string[] {
  const suggestions = []

  if (scores.openness >= 4) {
    suggestions.push('候选人喜欢新事物，可以提供更多创新性工作')
  } else {
    suggestions.push('候选人偏好稳定，可以提供结构化的培训计划')
  }

  if (scores.agreeableness >= 4) {
    suggestions.push('候选人善于合作，适合团队协作项目')
  } else {
    suggestions.push('候选人较为独立，可以安排独立性强的工作')
  }

  return suggestions
}

// 风险评估
export function generateRiskAssessment(scores: PersonalityResults): string {
  const risks = []

  if (scores.neuroticism >= 4) {
    risks.push('情绪稳定性较低，可能影响工作表现')
  }

  if (scores.conscientiousness <= 2.5) {
    risks.push('责任心不足，可能影响工作质量')
  }

  if (scores.agreeableness <= 2.5) {
    risks.push('合作性较差，可能影响团队和谐')
  }

  if (risks.length === 0) {
    return '风险较低，候选人整体表现良好'
  }

  return `需要注意的风险：${risks.join('；')}`
}
