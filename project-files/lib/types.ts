// 5型人格维度
export type PersonalityDimension = 
  | 'openness'      // 开放性
  | 'conscientiousness' // 尽责性
  | 'extraversion'  // 外向性
  | 'agreeableness' // 宜人性
  | 'neuroticism'   // 神经质

// 题目类型
export interface Question {
  id: string
  text: string
  dimension: PersonalityDimension
  reverse: boolean // 是否反向计分
  order: number
}

// 答案类型
export interface Answer {
  questionId: string
  score: number // 1-5分
}

// 评测会话
export interface AssessmentSession {
  id: string
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  position: string
  status: 'pending' | 'in_progress' | 'completed'
  answers: Answer[]
  results?: PersonalityResults
  createdAt: Date
  completedAt?: Date
  uniqueId: string // 唯一ID：日期+姓名+手机号
}

// 人格结果
export interface PersonalityResults {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  overallAnalysis: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

// 用户类型
export interface User {
  id: string
  username: string
  email: string
  companyName: string
  role: 'admin' | 'hr'
  createdAt: Date
}

// 评测任务
export interface AssessmentTask {
  id: string
  userId: string
  candidateName: string
  candidateEmail: string
  position: string
  status: 'pending' | 'sent' | 'completed'
  sessionId?: string
  results?: PersonalityResults
  createdAt: Date
  sentAt?: Date
  completedAt?: Date
}

// 维度描述
export const DIMENSION_DESCRIPTIONS = {
  openness: {
    name: '开放性',
    description: '反映个体对新体验、想法和变化的开放程度',
    high: '富有创造力，喜欢尝试新事物，思维开放',
    low: '偏好传统和熟悉的事物，思维较为保守'
  },
  conscientiousness: {
    name: '尽责性',
    description: '反映个体的组织性、自律性和目标导向性',
    high: '做事有条理，自律性强，目标明确',
    low: '较为随性，缺乏计划性，容易拖延'
  },
  extraversion: {
    name: '外向性',
    description: '反映个体在社交场合中的活跃程度和能量来源',
    high: '善于社交，精力充沛，喜欢与人交往',
    low: '偏好独处，在社交场合较为安静'
  },
  agreeableness: {
    name: '宜人性',
    description: '反映个体的合作性、信任度和同情心',
    high: '善于合作，信任他人，富有同情心',
    low: '较为独立，有时显得不够合作'
  },
  neuroticism: {
    name: '神经质',
    description: '反映个体情绪稳定性和压力应对能力',
    high: '情绪波动较大，容易感到压力和焦虑',
    low: '情绪稳定，抗压能力强，心态平和'
  }
} as const
