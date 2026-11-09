import {
  type HydrationScheduleSlot,
  SMART_SCHEDULE_SLOTS,
  FITNESS_SCHEDULE_SLOTS
} from '@/types'

/**
 * 健管与水合计算工具模块
 */

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'heavy'
export type TrainingIntensity = 'rest' | 'light' | 'moderate' | 'intense'

/**
 * 科学计算每日饮水目标 (ml)
 * 基于体重基准 35ml/kg + 运动负荷补偿量
 */
export function calculateDailyWaterGoal(
  weightKg: number,
  activityLevel: ActivityLevel = 'sedentary',
  customGoal: number | null = null
): number {
  if (customGoal !== null && customGoal >= 800 && customGoal <= 6000) {
    return Math.round(customGoal / 50) * 50
  }

  // 基础量：体重 (kg) * 35 ml
  const validWeight = Math.max(30, Math.min(180, weightKg || 65))
  let baseAmount = validWeight * 35

  // 运动加成
  const activityBonus: Record<ActivityLevel, number> = {
    sedentary: 0,
    light: 250,
    moderate: 500,
    heavy: 800
  }

  baseAmount += activityBonus[activityLevel] || 0

  // 限制在合理区间 1200ml ~ 4500ml，并向上取整至 50ml 整倍数
  const clamped = Math.max(1200, Math.min(4500, baseAmount))
  return Math.round(clamped / 50) * 50
}

/**
 * 硬核健身模式专属饮水目标科学测算 (ml)
 * 依据 ACSM/ISSN 运动营养指南：
 * 肌肉水合基础：体重 (kg) * 45 ml
 * + 训练日排汗与出汗量补偿 (休息日 0, 轻度 +300, 中度抗阻 +600, 高强度耐力 +1000)
 * + 肌酸细胞水合补偿 (+500ml)
 * + 高蛋白增肌期尿素氮排泄耗水补偿 (+300ml)
 */
export function calculateFitnessWaterGoal(
  weightKg: number,
  intensity: TrainingIntensity = 'moderate',
  isTakingCreatine: boolean = false,
  isHighProteinDiet: boolean = false,
  customGoal: number | null = null
): number {
  if (customGoal !== null && customGoal >= 800 && customGoal <= 7000) {
    return Math.round(customGoal / 50) * 50
  }

  const validWeight = Math.max(30, Math.min(180, weightKg || 65))
  let baseAmount = validWeight * 45

  const intensityBonus: Record<TrainingIntensity, number> = {
    rest: 0,
    light: 300,
    moderate: 600,
    intense: 1000
  }
  baseAmount += intensityBonus[intensity] || 0

  if (isTakingCreatine) {
    baseAmount += 500
  }

  if (isHighProteinDiet) {
    baseAmount += 300
  }

  // 限制在合理安全区间 1500ml ~ 6500ml，取整至 50ml
  const clamped = Math.max(1500, Math.min(6500, baseAmount))
  return Math.round(clamped / 50) * 50
}

/**
 * 折算单次有效净补水量
 * @param amountMl 实际饮用量 (ml)
 * @param hydrationFactor 饮品补水系数
 */
export function calculateEffectiveWater(amountMl: number, hydrationFactor: number): number {
  if (amountMl <= 0) return 0
  const factor = Math.max(-1.0, Math.min(2.0, hydrationFactor))
  return Math.round(amountMl * factor)
}

/**
 * 计算完成度百分比 (0 ~ 100+)
 */
export function calculateHydrationProgress(currentMl: number, goalMl: number): number {
  if (goalMl <= 0) return 0
  return Math.max(0, Math.round((currentMl / goalMl) * 100))
}

/**
 * 格式化为当前日期标准字符串 (YYYY-MM-DD)
 */
export function formatDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 格式化毫秒时间戳为 HH:mm
 */
export function formatTimeKey(timestamp: number): string {
  const d = new Date(timestamp)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

/**
 * 依据当天总饮水目标与运动模式，按生理波峰黄金比例等比拆分 5 大时段建议量
 * 保证各时段之和严格吻合总目标需水量
 */
export function allocateScheduleSlots(
  dailyGoalMl: number,
  isFitness: boolean = false
): HydrationScheduleSlot[] {
  const baseSlots = isFitness ? FITNESS_SCHEDULE_SLOTS : SMART_SCHEDULE_SLOTS
  const safeGoal = Math.max(1000, dailyGoalMl)

  let allocatedSum = 0
  return baseSlots.map((slot, index) => {
    const ratio = slot.ratio || 0.2
    if (index < baseSlots.length - 1) {
      const ml = Math.round((safeGoal * ratio) / 50) * 50
      allocatedSum += ml
      return {
        ...slot,
        suggestedMl: Math.max(100, ml)
      }
    } else {
      // 最后一个时段补齐差额，确保各时段之和严格等于当天总目标
      const remainder = safeGoal - allocatedSum
      const finalMl = Math.round(remainder / 50) * 50
      return {
        ...slot,
        suggestedMl: Math.max(100, finalMl)
      }
    }
  })
}
