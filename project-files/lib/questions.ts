import { Question, PersonalityDimension } from './types'

// 5型人格评测题目库
export const QUESTIONS: Question[] = [
  // 开放性 (Openness)
  {
    id: 'o1',
    text: '我喜欢尝试新的食物和菜肴',
    dimension: 'openness',
    reverse: false,
    order: 1
  },
  {
    id: 'o2',
    text: '我对艺术和音乐很感兴趣',
    dimension: 'openness',
    reverse: false,
    order: 2
  },
  {
    id: 'o3',
    text: '我喜欢思考抽象的概念',
    dimension: 'openness',
    reverse: false,
    order: 3
  },
  {
    id: 'o4',
    text: '我更喜欢熟悉的环境而不是新环境',
    dimension: 'openness',
    reverse: true,
    order: 4
  },
  {
    id: 'o5',
    text: '我喜欢学习新的技能和知识',
    dimension: 'openness',
    reverse: false,
    order: 5
  },
  {
    id: 'o6',
    text: '我对哲学和理论问题很感兴趣',
    dimension: 'openness',
    reverse: false,
    order: 6
  },
  {
    id: 'o7',
    text: '我更喜欢传统的做事方式',
    dimension: 'openness',
    reverse: true,
    order: 7
  },
  {
    id: 'o8',
    text: '我喜欢探索不同的文化和生活方式',
    dimension: 'openness',
    reverse: false,
    order: 8
  },
  {
    id: 'o9',
    text: '我经常有创造性的想法',
    dimension: 'openness',
    reverse: false,
    order: 9
  },
  {
    id: 'o10',
    text: '我更喜欢具体的事实而不是抽象的概念',
    dimension: 'openness',
    reverse: true,
    order: 10
  },

  // 尽责性 (Conscientiousness)
  {
    id: 'c1',
    text: '我总是按时完成任务',
    dimension: 'conscientiousness',
    reverse: false,
    order: 11
  },
  {
    id: 'c2',
    text: '我喜欢制定详细的计划',
    dimension: 'conscientiousness',
    reverse: false,
    order: 12
  },
  {
    id: 'c3',
    text: '我经常拖延重要任务',
    dimension: 'conscientiousness',
    reverse: true,
    order: 13
  },
  {
    id: 'c4',
    text: '我做事很有条理',
    dimension: 'conscientiousness',
    reverse: false,
    order: 14
  },
  {
    id: 'c5',
    text: '我经常忘记把东西放回原处',
    dimension: 'conscientiousness',
    reverse: true,
    order: 15
  },
  {
    id: 'c6',
    text: '我喜欢把事情做得完美',
    dimension: 'conscientiousness',
    reverse: false,
    order: 16
  },
  {
    id: 'c7',
    text: '我经常迟到',
    dimension: 'conscientiousness',
    reverse: true,
    order: 17
  },
  {
    id: 'c8',
    text: '我做事很仔细，很少出错',
    dimension: 'conscientiousness',
    reverse: false,
    order: 18
  },
  {
    id: 'c9',
    text: '我经常改变计划',
    dimension: 'conscientiousness',
    reverse: true,
    order: 19
  },
  {
    id: 'c10',
    text: '我工作很努力，从不偷懒',
    dimension: 'conscientiousness',
    reverse: false,
    order: 20
  },

  // 外向性 (Extraversion)
  {
    id: 'e1',
    text: '我喜欢在人群中成为焦点',
    dimension: 'extraversion',
    reverse: false,
    order: 21
  },
  {
    id: 'e2',
    text: '我很容易与陌生人交谈',
    dimension: 'extraversion',
    reverse: false,
    order: 22
  },
  {
    id: 'e3',
    text: '我更喜欢独处而不是社交',
    dimension: 'extraversion',
    reverse: true,
    order: 23
  },
  {
    id: 'e4',
    text: '我在社交场合很活跃',
    dimension: 'extraversion',
    reverse: false,
    order: 24
  },
  {
    id: 'e5',
    text: '我说话声音很大',
    dimension: 'extraversion',
    reverse: false,
    order: 25
  },
  {
    id: 'e6',
    text: '我经常感到精力充沛',
    dimension: 'extraversion',
    reverse: false,
    order: 26
  },
  {
    id: 'e7',
    text: '我更喜欢安静的环境',
    dimension: 'extraversion',
    reverse: true,
    order: 27
  },
  {
    id: 'e8',
    text: '我喜欢参加聚会和活动',
    dimension: 'extraversion',
    reverse: false,
    order: 28
  },
  {
    id: 'e9',
    text: '我经常主动与别人交流',
    dimension: 'extraversion',
    reverse: false,
    order: 29
  },
  {
    id: 'e10',
    text: '我在人群中感到不自在',
    dimension: 'extraversion',
    reverse: true,
    order: 30
  },

  // 宜人性 (Agreeableness)
  {
    id: 'a1',
    text: '我经常关心别人的感受',
    dimension: 'agreeableness',
    reverse: false,
    order: 31
  },
  {
    id: 'a2',
    text: '我喜欢帮助别人',
    dimension: 'agreeableness',
    reverse: false,
    order: 32
  },
  {
    id: 'a3',
    text: '我经常与别人争论',
    dimension: 'agreeableness',
    reverse: true,
    order: 33
  },
  {
    id: 'a4',
    text: '我信任大多数人',
    dimension: 'agreeableness',
    reverse: false,
    order: 34
  },
  {
    id: 'a5',
    text: '我经常批评别人',
    dimension: 'agreeableness',
    reverse: true,
    order: 35
  },
  {
    id: 'a6',
    text: '我很容易原谅别人',
    dimension: 'agreeableness',
    reverse: false,
    order: 36
  },
  {
    id: 'a7',
    text: '我经常怀疑别人的动机',
    dimension: 'agreeableness',
    reverse: true,
    order: 37
  },
  {
    id: 'a8',
    text: '我喜欢与他人合作',
    dimension: 'agreeableness',
    reverse: false,
    order: 38
  },
  {
    id: 'a9',
    text: '我经常对别人发脾气',
    dimension: 'agreeableness',
    reverse: true,
    order: 39
  },
  {
    id: 'a10',
    text: '我经常考虑别人的需求',
    dimension: 'agreeableness',
    reverse: false,
    order: 40
  },

  // 神经质 (Neuroticism)
  {
    id: 'n1',
    text: '我经常感到焦虑',
    dimension: 'neuroticism',
    reverse: false,
    order: 41
  },
  {
    id: 'n2',
    text: '我很容易感到压力',
    dimension: 'neuroticism',
    reverse: false,
    order: 42
  },
  {
    id: 'n3',
    text: '我经常感到沮丧',
    dimension: 'neuroticism',
    reverse: false,
    order: 43
  },
  {
    id: 'n4',
    text: '我情绪很稳定',
    dimension: 'neuroticism',
    reverse: true,
    order: 44
  },
  {
    id: 'n5',
    text: '我经常担心未来',
    dimension: 'neuroticism',
    reverse: false,
    order: 45
  },
  {
    id: 'n6',
    text: '我很容易感到愤怒',
    dimension: 'neuroticism',
    reverse: false,
    order: 46
  },
  {
    id: 'n7',
    text: '我经常感到紧张',
    dimension: 'neuroticism',
    reverse: false,
    order: 47
  },
  {
    id: 'n8',
    text: '我心态很平和',
    dimension: 'neuroticism',
    reverse: true,
    order: 48
  },
  {
    id: 'n9',
    text: '我经常感到孤独',
    dimension: 'neuroticism',
    reverse: false,
    order: 49
  },
  {
    id: 'n10',
    text: '我很容易从挫折中恢复',
    dimension: 'neuroticism',
    reverse: true,
    order: 50
  }
]

// 按维度分组题目
export const QUESTIONS_BY_DIMENSION = {
  openness: QUESTIONS.filter(q => q.dimension === 'openness'),
  conscientiousness: QUESTIONS.filter(q => q.dimension === 'conscientiousness'),
  extraversion: QUESTIONS.filter(q => q.dimension === 'extraversion'),
  agreeableness: QUESTIONS.filter(q => q.dimension === 'agreeableness'),
  neuroticism: QUESTIONS.filter(q => q.dimension === 'neuroticism')
}

// 获取随机题目（用于测试）
export function getRandomQuestions(count: number = 50): Question[] {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}



