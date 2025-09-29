// 岗位类型定义
export type PositionType = 
  | 'sales_engineer'      // 销售工程师
  | 'mechanical_designer' // 机械设计师
  | 'business_leader'     // 事业部领导
  | 'office_staff'        // 其他文职类岗位

// 岗位信息
export interface Position {
  id: PositionType
  name: string
  description: string
  idealTraits: {
    openness: { min: number; max: number; weight: number }
    conscientiousness: { min: number; max: number; weight: number }
    extraversion: { min: number; max: number; weight: number }
    agreeableness: { min: number; max: number; weight: number }
    neuroticism: { min: number; max: number; weight: number }
  }
  keyRequirements: string[]
  careerAdvice: string[]
}

// 岗位配置
export const POSITIONS: Record<PositionType, Position> = {
  sales_engineer: {
    id: 'sales_engineer',
    name: '销售工程师',
    description: '负责舞台机械设备的技术销售工作，需要具备技术背景和销售能力',
    idealTraits: {
      openness: { min: 3.5, max: 5.0, weight: 0.8 },
      conscientiousness: { min: 3.5, max: 5.0, weight: 0.9 },
      extraversion: { min: 4.0, max: 5.0, weight: 1.0 },
      agreeableness: { min: 3.5, max: 5.0, weight: 0.8 },
      neuroticism: { min: 1.0, max: 3.0, weight: 0.7 }
    },
    keyRequirements: [
      '具备良好的沟通表达能力和人际交往技巧',
      '有较强的技术理解能力和学习能力',
      '具备抗压能力和目标导向性',
      '能够快速理解客户需求并提供解决方案',
      '具备团队协作精神和客户服务意识'
    ],
    careerAdvice: [
      '建议加强产品技术知识的学习',
      '多参与客户拜访和商务谈判',
      '培养敏锐的市场洞察力',
      '建立良好的客户关系网络'
    ]
  },
  
  mechanical_designer: {
    id: 'mechanical_designer',
    name: '机械设计师',
    description: '负责舞台机械设备的研发设计工作，需要具备扎实的机械设计能力',
    idealTraits: {
      openness: { min: 4.0, max: 5.0, weight: 1.0 },
      conscientiousness: { min: 4.0, max: 5.0, weight: 1.0 },
      extraversion: { min: 2.0, max: 4.0, weight: 0.5 },
      agreeableness: { min: 3.0, max: 4.5, weight: 0.6 },
      neuroticism: { min: 1.0, max: 3.0, weight: 0.8 }
    },
    keyRequirements: [
      '具备扎实的机械设计理论基础',
      '熟练掌握CAD等设计软件',
      '有较强的创新思维和问题解决能力',
      '工作细致认真，注重细节',
      '能够独立完成复杂的设计任务'
    ],
    careerAdvice: [
      '持续学习最新的设计技术和软件',
      '多参与实际项目积累经验',
      '加强与生产部门的沟通协作',
      '关注行业发展趋势和技术创新'
    ]
  },
  
  business_leader: {
    id: 'business_leader',
    name: '事业部领导',
    description: '负责事业部的整体运营管理，需要具备领导力和战略思维',
    idealTraits: {
      openness: { min: 3.5, max: 5.0, weight: 0.9 },
      conscientiousness: { min: 4.0, max: 5.0, weight: 1.0 },
      extraversion: { min: 3.5, max: 5.0, weight: 0.9 },
      agreeableness: { min: 3.0, max: 4.5, weight: 0.7 },
      neuroticism: { min: 1.0, max: 2.5, weight: 0.9 }
    },
    keyRequirements: [
      '具备优秀的领导力和团队管理能力',
      '有较强的战略思维和决策能力',
      '具备良好的沟通协调能力',
      '抗压能力强，能够在复杂环境下工作',
      '有丰富的行业经验和市场洞察力'
    ],
    careerAdvice: [
      '加强领导力培训和管理技能提升',
      '多关注行业动态和市场趋势',
      '建立高效的团队管理体系',
      '培养全局思维和战略眼光'
    ]
  },
  
  office_staff: {
    id: 'office_staff',
    name: '其他文职类岗位',
    description: '包括行政、财务、人事等文职工作，需要具备良好的执行力和服务意识',
    idealTraits: {
      openness: { min: 2.5, max: 4.0, weight: 0.6 },
      conscientiousness: { min: 4.0, max: 5.0, weight: 1.0 },
      extraversion: { min: 2.5, max: 4.0, weight: 0.6 },
      agreeableness: { min: 3.5, max: 5.0, weight: 0.8 },
      neuroticism: { min: 1.0, max: 3.0, weight: 0.7 }
    },
    keyRequirements: [
      '工作认真负责，执行力强',
      '具备良好的沟通协调能力',
      '有较强的服务意识和团队精神',
      '能够熟练使用办公软件',
      '具备一定的学习适应能力'
    ],
    careerAdvice: [
      '提升专业技能和办公效率',
      '加强跨部门沟通协作',
      '培养主动服务意识',
      '持续学习提升综合素质'
    ]
  }
}

// 计算岗位匹配度
export function calculatePositionMatch(personalityScores: Record<string, number>, positionType: PositionType): {
  matchScore: number
  dimensionMatches: Record<string, { score: number; match: boolean; weight: number }>
  overallMatch: '优秀' | '良好' | '一般' | '需改进'
} {
  const position = POSITIONS[positionType]
  const dimensionMatches: Record<string, { score: number; match: boolean; weight: number }> = {}
  let totalWeightedScore = 0
  let totalWeight = 0

  Object.entries(position.idealTraits).forEach(([dimension, requirements]) => {
    const score = personalityScores[dimension] || 0
    const isInRange = score >= requirements.min && score <= requirements.max
    const match = isInRange ? 1 : 0
    const weightedScore = match * requirements.weight
    
    dimensionMatches[dimension] = {
      score,
      match: isInRange,
      weight: requirements.weight
    }
    
    totalWeightedScore += weightedScore
    totalWeight += requirements.weight
  })

  const matchScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0
  
  let overallMatch: '优秀' | '良好' | '一般' | '需改进'
  if (matchScore >= 80) overallMatch = '优秀'
  else if (matchScore >= 60) overallMatch = '良好'
  else if (matchScore >= 40) overallMatch = '一般'
  else overallMatch = '需改进'

  return {
    matchScore: Math.round(matchScore),
    dimensionMatches,
    overallMatch
  }
}

// 获取所有岗位
export function getAllPositions(): Position[] {
  return Object.values(POSITIONS)
}

// 根据岗位类型获取岗位信息
export function getPositionById(id: PositionType): Position | undefined {
  return POSITIONS[id]
}



