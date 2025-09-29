// 评测记录存储系统
export interface AssessmentRecord {
  id: string
  sessionId: string
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  position: string
  answers: Array<{
    questionId: number
    answer: number
  }>
  scores: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  completedAt: string
  status: 'completed'
}

// 存储评测记录
export function saveAssessmentRecord(record: AssessmentRecord): void {
  try {
    const existingRecords = getAssessmentRecords()
    const updatedRecords = [...existingRecords, record]
    localStorage.setItem('assessmentRecords', JSON.stringify(updatedRecords))
    console.log('评测记录已保存:', record.id)
  } catch (error) {
    console.error('保存评测记录失败:', error)
  }
}

// 获取所有评测记录
export function getAssessmentRecords(): AssessmentRecord[] {
  try {
    const records = localStorage.getItem('assessmentRecords')
    return records ? JSON.parse(records) : []
  } catch (error) {
    console.error('获取评测记录失败:', error)
    return []
  }
}

// 根据ID获取评测记录
export function getAssessmentRecordById(id: string): AssessmentRecord | null {
  const records = getAssessmentRecords()
  return records.find(record => record.id === id) || null
}

// 删除评测记录
export function deleteAssessmentRecord(id: string): boolean {
  try {
    const records = getAssessmentRecords()
    const filteredRecords = records.filter(record => record.id !== id)
    localStorage.setItem('assessmentRecords', JSON.stringify(filteredRecords))
    return true
  } catch (error) {
    console.error('删除评测记录失败:', error)
    return false
  }
}

// 清空所有评测记录
export function clearAllAssessmentRecords(): void {
  try {
    localStorage.removeItem('assessmentRecords')
    console.log('所有评测记录已清空')
  } catch (error) {
    console.error('清空评测记录失败:', error)
  }
}

// 获取统计信息
export function getAssessmentStats() {
  const records = getAssessmentRecords()
  return {
    total: records.length,
    completed: records.filter(r => r.status === 'completed').length,
    thisMonth: records.filter(r => {
      const recordDate = new Date(r.completedAt)
      const now = new Date()
      return recordDate.getMonth() === now.getMonth() && 
             recordDate.getFullYear() === now.getFullYear()
    }).length,
    thisWeek: records.filter(r => {
      const recordDate = new Date(r.completedAt)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return recordDate >= weekAgo
    }).length
  }
}
