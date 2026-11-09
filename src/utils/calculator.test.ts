import { describe, it, expect } from 'vitest'
import {
  calculateDailyWaterGoal,
  calculateFitnessWaterGoal,
  calculateEffectiveWater,
  calculateHydrationProgress,
  formatDateKey,
  allocateScheduleSlots
} from './calculator'

describe('健康饮水计算算法测试', () => {
  it('应当根据体重与基础活动量准确计算默认饮水目标', () => {
    // 60kg * 35 = 2100ml
    const goal = calculateDailyWaterGoal(60, 'sedentary')
    expect(goal).toBe(2100)

    // 70kg * 35 = 2450ml + light (250) = 2700ml
    const goalLight = calculateDailyWaterGoal(70, 'light')
    expect(goalLight).toBe(2700)

    // 80kg * 35 = 2800ml + heavy (800) = 3600ml
    const goalHeavy = calculateDailyWaterGoal(80, 'heavy')
    expect(goalHeavy).toBe(3600)
  })

  it('应当准确计算硬核健身模式下的高代谢需水量', () => {
    // 70kg * 45 = 3150ml (休息日, 无补剂)
    expect(calculateFitnessWaterGoal(70, 'rest', false, false)).toBe(3150)

    // 70kg * 45 = 3150ml + 600ml (中度力量训练) = 3750ml
    expect(calculateFitnessWaterGoal(70, 'moderate', false, false)).toBe(3750)

    // 70kg * 45 = 3150ml + 1000ml (高强度训练) + 500ml (肌酸) + 300ml (高蛋白) = 4950ml
    expect(calculateFitnessWaterGoal(70, 'intense', true, true)).toBe(4950)
  })

  it('当用户指定自定义目标时优先使用用户目标', () => {
    const custom = calculateDailyWaterGoal(60, 'sedentary', 2500)
    expect(custom).toBe(2500)

    const customFitness = calculateFitnessWaterGoal(70, 'intense', true, true, 4200)
    expect(customFitness).toBe(4200)
  })

  it('应当根据饮品补水系数准确折算净水分', () => {
    // 纯水 100%
    expect(calculateEffectiveWater(300, 1.0)).toBe(300)

    // 绿茶 95% -> 300 * 0.95 = 285
    expect(calculateEffectiveWater(300, 0.95)).toBe(285)

    // 美式咖啡 80% -> 350 * 0.8 = 280
    expect(calculateEffectiveWater(350, 0.8)).toBe(280)

    // 含糖饮料 65% -> 500 * 0.65 = 325
    expect(calculateEffectiveWater(500, 0.65)).toBe(325)
  })

  it('应当正确计算进度百分比', () => {
    expect(calculateHydrationProgress(1000, 2000)).toBe(50)
    expect(calculateHydrationProgress(2000, 2000)).toBe(100)
    expect(calculateHydrationProgress(0, 2000)).toBe(0)
    expect(calculateHydrationProgress(2500, 2000)).toBe(125)
  })

  it('格式化日期格式应当符合 YYYY-MM-DD 规范', () => {
    const testDate = new Date(2026, 4, 15) // May 15, 2026
    expect(formatDateKey(testDate)).toBe('2026-05-15')
  })

  it('应当根据总目标水量等比划分 5 大时段且总和精确匹配', () => {
    // 日常模式 2050ml
    const dailySlots = allocateScheduleSlots(2050, false)
    expect(dailySlots.length).toBe(5)
    const dailySum = dailySlots.reduce((acc, s) => acc + s.suggestedMl, 0)
    expect(dailySum).toBe(2050)

    // 健身模式 2900ml
    const fitnessSlots = allocateScheduleSlots(2900, true)
    expect(fitnessSlots.length).toBe(5)
    const fitnessSum = fitnessSlots.reduce((acc, s) => acc + s.suggestedMl, 0)
    expect(fitnessSum).toBe(2900)
  })
})
