// 5型人格维度
export type PersonalityDimension = 
  | 'openness'      // 开放性
  | 'conscientiousness' // 尽责性
  | 'extraversion'  // 外向性
  | 'agreeableness' // 宜人性
  | 'neuroticism'   // 神经质

// 题目类型
export interface Question {
  id: number
  text: string
  trait: PersonalityDimension
  reverse: boolean // 是否反向计分
}

// 答案类型
export interface Answer {
  questionId: number
  answer: number // 1-5分
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
  createdAt: Date | string
  completedAt?: Date | string
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

// 5型人格评测题目库
export const QUESTIONS: Question[] = [
  // 开放性 (Openness)
  { id: 1, text: '我喜欢尝试新的食物和菜肴', trait: 'openness', reverse: false },
  { id: 2, text: '我对艺术和音乐很感兴趣', trait: 'openness', reverse: false },
  { id: 3, text: '我喜欢思考抽象的概念', trait: 'openness', reverse: false },
  { id: 4, text: '我更喜欢熟悉的环境而不是新环境', trait: 'openness', reverse: true },
  { id: 5, text: '我喜欢学习新的技能和知识', trait: 'openness', reverse: false },
  { id: 6, text: '我对哲学和理论问题很感兴趣', trait: 'openness', reverse: false },
  { id: 7, text: '我更喜欢传统的做事方式', trait: 'openness', reverse: true },
  { id: 8, text: '我喜欢探索不同的文化和生活方式', trait: 'openness', reverse: false },
  { id: 9, text: '我经常有创造性的想法', trait: 'openness', reverse: false },
  { id: 10, text: '我更喜欢具体的事实而不是抽象的概念', trait: 'openness', reverse: true },

  // 尽责性 (Conscientiousness)
  { id: 11, text: '我总是按时完成任务', trait: 'conscientiousness', reverse: false },
  { id: 12, text: '我喜欢制定详细的计划', trait: 'conscientiousness', reverse: false },
  { id: 13, text: '我经常拖延重要任务', trait: 'conscientiousness', reverse: true },
  { id: 14, text: '我做事很有条理', trait: 'conscientiousness', reverse: false },
  { id: 15, text: '我经常忘记把东西放回原处', trait: 'conscientiousness', reverse: true },
  { id: 16, text: '我喜欢把事情做得完美', trait: 'conscientiousness', reverse: false },
  { id: 17, text: '我经常迟到', trait: 'conscientiousness', reverse: true },
  { id: 18, text: '我做事很仔细，很少出错', trait: 'conscientiousness', reverse: false },
  { id: 19, text: '我经常改变计划', trait: 'conscientiousness', reverse: true },
  { id: 20, text: '我工作很努力，从不偷懒', trait: 'conscientiousness', reverse: false },

  // 外向性 (Extraversion)
  { id: 21, text: '我喜欢在人群中成为焦点', trait: 'extraversion', reverse: false },
  { id: 22, text: '我很容易与陌生人交谈', trait: 'extraversion', reverse: false },
  { id: 23, text: '我更喜欢独处而不是社交', trait: 'extraversion', reverse: true },
  { id: 24, text: '我在社交场合很活跃', trait: 'extraversion', reverse: false },
  { id: 25, text: '我说话声音很大', trait: 'extraversion', reverse: false },
  { id: 26, text: '我经常感到精力充沛', trait: 'extraversion', reverse: false },
  { id: 27, text: '我更喜欢安静的环境', trait: 'extraversion', reverse: true },
  { id: 28, text: '我喜欢参加聚会和活动', trait: 'extraversion', reverse: false },
  { id: 29, text: '我经常主动与别人交流', trait: 'extraversion', reverse: false },
  { id: 30, text: '我在人群中感到不自在', trait: 'extraversion', reverse: true },

  // 宜人性 (Agreeableness)
  { id: 31, text: '我经常关心别人的感受', trait: 'agreeableness', reverse: false },
  { id: 32, text: '我喜欢帮助别人', trait: 'agreeableness', reverse: false },
  { id: 33, text: '我经常与别人争论', trait: 'agreeableness', reverse: true },
  { id: 34, text: '我信任大多数人', trait: 'agreeableness', reverse: false },
  { id: 35, text: '我经常批评别人', trait: 'agreeableness', reverse: true },
  { id: 36, text: '我很容易原谅别人', trait: 'agreeableness', reverse: false },
  { id: 37, text: '我经常怀疑别人的动机', trait: 'agreeableness', reverse: true },
  { id: 38, text: '我喜欢与他人合作', trait: 'agreeableness', reverse: false },
  { id: 39, text: '我经常对别人发脾气', trait: 'agreeableness', reverse: true },
  { id: 40, text: '我经常考虑别人的需求', trait: 'agreeableness', reverse: false },

  // 神经质 (Neuroticism)
  { id: 41, text: '我经常感到焦虑', trait: 'neuroticism', reverse: false },
  { id: 42, text: '我很容易感到压力', trait: 'neuroticism', reverse: false },
  { id: 43, text: '我经常感到沮丧', trait: 'neuroticism', reverse: false },
  { id: 44, text: '我情绪很稳定', trait: 'neuroticism', reverse: true },
  { id: 45, text: '我经常担心未来', trait: 'neuroticism', reverse: false },
  { id: 46, text: '我很容易感到愤怒', trait: 'neuroticism', reverse: false },
  { id: 47, text: '我经常感到紧张', trait: 'neuroticism', reverse: false },
  { id: 48, text: '我心态很平和', trait: 'neuroticism', reverse: true },
  { id: 49, text: '我经常感到孤独', trait: 'neuroticism', reverse: false },
  { id: 50, text: '我很容易从挫折中恢复', trait: 'neuroticism', reverse: true }
]
