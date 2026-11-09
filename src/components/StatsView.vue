<template>
  <div class="space-y-3.5 pb-8 select-none">
    <!-- 1. 生涯全量健康指标卡片 (Lifetime Stats Badges - Apple Health Quiet Luxury 磨砂与微光风格) -->
    <div class="grid grid-cols-2 gap-2">
      <!-- 连续打卡成就 -->
      <div class="relative overflow-hidden rounded-2xl p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-ios-card flex items-center justify-between">
        <div class="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-amber-500/10 blur-xl pointer-events-none"></div>
        <div class="relative z-10">
          <div class="flex items-center space-x-1 text-slate-400 dark:text-zinc-400">
            <Flame class="w-3.5 h-3.5 text-amber-500" :stroke-width="2.5" />
            <span class="text-[10px] font-bold uppercase tracking-wider">当前连胜</span>
          </div>
          <div class="flex items-baseline space-x-1 mt-1">
            <span class="text-xl font-black text-slate-800 dark:text-white">{{ streakDays }}</span>
            <span class="text-xs font-semibold text-slate-400 dark:text-zinc-500">天</span>
          </div>
        </div>
        <div class="relative z-10 w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Flame class="w-4 h-4 text-amber-500" :stroke-width="2.2" />
        </div>
      </div>

      <!-- 累计注入水分 -->
      <div class="relative overflow-hidden rounded-2xl p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-ios-card flex items-center justify-between">
        <div class="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-cyan-500/10 blur-xl pointer-events-none"></div>
        <div class="relative z-10">
          <div class="flex items-center space-x-1 text-slate-400 dark:text-zinc-400">
            <Droplets class="w-3.5 h-3.5 text-cyan-500" :stroke-width="2.5" />
            <span class="text-[10px] font-bold uppercase tracking-wider">累计补水</span>
          </div>
          <div class="flex items-baseline space-x-1 mt-1">
            <span class="text-xl font-black text-slate-800 dark:text-white">{{ store.totalHistoricalLiters }}</span>
            <span class="text-xs font-semibold text-slate-400 dark:text-zinc-500">L</span>
          </div>
        </div>
        <div class="relative z-10 w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Droplets class="w-4 h-4 text-cyan-500" :stroke-width="2.2" />
        </div>
      </div>

      <!-- 累计专注时长 (新增) -->
      <div class="relative overflow-hidden rounded-2xl p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-ios-card flex items-center justify-between">
        <div class="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-sky-500/10 blur-xl pointer-events-none"></div>
        <div class="relative z-10">
          <div class="flex items-center space-x-1 text-slate-400 dark:text-zinc-400">
            <Timer class="w-3.5 h-3.5 text-sky-500" :stroke-width="2.5" />
            <span class="text-[10px] font-bold uppercase tracking-wider">累计专注</span>
          </div>
          <div class="flex items-baseline space-x-1 mt-1">
            <span class="text-xl font-black text-slate-800 dark:text-white">{{ store.totalHistoricalFocusMinutes }}</span>
            <span class="text-xs font-semibold text-slate-400 dark:text-zinc-500">分</span>
          </div>
        </div>
        <div class="relative z-10 w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
          <Timer class="w-4 h-4 text-sky-500" :stroke-width="2.2" />
        </div>
      </div>

      <!-- 今日专注周期 (新增) -->
      <div class="relative overflow-hidden rounded-2xl p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-ios-card flex items-center justify-between">
        <div class="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-indigo-500/10 blur-xl pointer-events-none"></div>
        <div class="relative z-10">
          <div class="flex items-center space-x-1 text-slate-400 dark:text-zinc-400">
            <Compass class="w-3.5 h-3.5 text-indigo-500" :stroke-width="2.5" />
            <span class="text-[10px] font-bold uppercase tracking-wider">今日番茄</span>
          </div>
          <div class="flex items-baseline space-x-1 mt-1">
            <span class="text-xl font-black text-slate-800 dark:text-white">{{ store.todayFocusTomatoes }}</span>
            <span class="text-xs font-semibold text-slate-400 dark:text-zinc-500">个 ({{ store.todayFocusMinutes }}m)</span>
          </div>
        </div>
        <div class="relative z-10 w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Compass class="w-4 h-4 text-indigo-500" :stroke-width="2.2" />
        </div>
      </div>
    </div>

    <!-- 2. 全景月度健康打卡日历 (Monthly Health Calendar) -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08]">
      <div class="flex items-center justify-between mb-3">
        <button type="button" class="flex items-center space-x-1.5 cursor-pointer group/cal" @click="openPicker">
          <CalendarIcon class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ periodLabel }}</span>
          <ChevronDown
            class="w-3 h-3 text-slate-400 group-hover/cal:text-slate-600 dark:group-hover/cal:text-slate-200 transition-colors"
            :stroke-width="2.6"
          />
        </button>

        <!-- 视图切换 + 周期翻页 -->
        <div class="flex items-center space-x-1">
          <div class="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
            <button
              v-for="v in viewOptions"
              :key="v.value"
              type="button"
              class="px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer"
              :class="calendarView === v.value
                ? 'bg-white dark:bg-zinc-700 text-ios-blue dark:text-ios-blue-dark shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'"
              @click="calendarView = v.value"
            >
              {{ v.label }}
            </button>
          </div>
          <button
            type="button"
            class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs cursor-pointer transition-colors"
            @click="shiftPeriod(-1)"
          >
            ‹
          </button>
          <button
            type="button"
            class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs cursor-pointer transition-colors"
            @click="shiftPeriod(1)"
          >
            ›
          </button>
        </div>
      </div>

      <!-- 月视图：星期表头 -->
      <div v-if="calendarView === 'month'" class="grid grid-cols-7 gap-1 text-center mb-1.5">
        <span
          v-for="w in ['一', '二', '三', '四', '五', '六', '日']"
          :key="w"
          class="text-[10px] font-bold text-slate-400"
        >
          {{ w }}
        </span>
      </div>

      <!-- 日历网格单元 -->
      <div v-if="calendarView === 'month'" class="grid grid-cols-7 gap-1">
        <button
          v-for="day in calendarDays"
          :key="day.dateKey"
          type="button"
          class="aspect-square rounded-xl p-1 flex flex-col items-center justify-between transition-all duration-150 cursor-pointer border relative"
          :class="[
            day.isCurrentMonth
              ? 'bg-slate-50/80 dark:bg-zinc-800/40 border-slate-200/50 dark:border-zinc-700/40 hover:bg-slate-100 dark:hover:bg-zinc-800'
              : 'opacity-25 border-transparent pointer-events-none',
            day.isToday ? 'ring-2 ring-ios-blue shadow-sm' : ''
          ]"
          @click="selectDayDetail(day)"
        >
          <!-- 日期数字 -->
          <span
            class="text-[10px] font-bold"
            :class="[
              day.isAchieved ? 'text-ios-green dark:text-ios-green-dark' : 'text-slate-700 dark:text-slate-300'
            ]"
          >
            {{ day.dayNum }}
          </span>

          <!-- 习惯与饮水标记徽章点 -->
          <div class="flex items-center space-x-0.5 mt-0.5">
            <!-- 饮水达标彩点 -->
            <span
              v-if="day.waterTotalMl > 0"
              class="w-1.5 h-1.5 rounded-full"
              :class="[day.isAchieved ? 'bg-ios-green' : 'bg-ios-blue']"
            ></span>
            <!-- 习惯达成彩点 -->
            <span
              v-if="day.completedHabitsCount > 0"
              class="w-1.5 h-1.5 rounded-full bg-purple-500"
            ></span>
          </div>
        </button>
      </div>

      <!-- 季 / 年视图：迷你热力月历 -->
      <div
        v-else
        class="grid gap-1.5"
        :class="calendarView === 'quarter' ? 'grid-cols-3' : 'grid-cols-4'"
      >
        <div
          v-for="mm in miniMonths"
          :key="mm.month"
          class="rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 p-1.5"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-[9px] font-bold text-slate-600 dark:text-slate-300">{{ mm.month + 1 }} 月</span>
            <span class="text-[8px] font-bold text-emerald-500">{{ monthAchievedCount(mm) }}</span>
          </div>
          <div class="grid grid-cols-7 gap-[2px]">
            <button
              v-for="d in mm.days"
              :key="d.dateKey"
              type="button"
              class="aspect-square rounded-[2px] transition-all cursor-pointer"
              :class="miniCellClass(d)"
              :aria-label="`${currentYear}-${mm.month + 1}-${d.dayNum}`"
              @click="selectDayDetail(d)"
            ></button>
          </div>
        </div>
      </div>

      <!-- 图例说明 -->
      <div class="flex items-center justify-center space-x-3 text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
        <span class="flex items-center space-x-1">
          <span class="w-2 h-2 rounded-full bg-ios-green"></span>
          <span>饮水达标</span>
        </span>
        <span class="flex items-center space-x-1">
          <span class="w-2 h-2 rounded-full bg-ios-blue"></span>
          <span>饮水打卡</span>
        </span>
        <span class="flex items-center space-x-1">
          <span class="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>习惯完成</span>
        </span>
      </div>
    </div>

    <!-- 3. 近 7 日饮水趋势图表 -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08]">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-1.5">
          <BarChart3 class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">近 7 天补水趋势</span>
        </div>
        <span class="text-[10px] font-semibold text-slate-400">目标: {{ store.dailyGoalMl }} ml</span>
      </div>

      <div class="grid grid-cols-7 gap-2 items-end h-28 pt-2">
        <div
          v-for="day in pastSevenDays"
          :key="day.dateKey"
          class="flex flex-col items-center justify-end h-full"
        >
          <div class="w-full bg-slate-100 dark:bg-zinc-800 rounded-t-lg flex flex-col justify-end overflow-hidden h-20 p-0.5">
            <div
              class="w-full transition-all duration-500 rounded-t-md"
              :class="[
                day.isAchieved ? 'bg-gradient-to-t from-ios-green to-emerald-400' : 'bg-gradient-to-t from-ios-blue to-cyan-400',
                getBarHeightClass(day.ratio)
              ]"
            ></div>
          </div>
          <span
            class="text-[10px] mt-1.5 font-bold"
            :class="[day.isToday ? 'text-ios-blue dark:text-ios-blue-dark' : 'text-slate-400']"
          >
            {{ day.weekdayLabel }}
          </span>
        </div>
      </div>
    </div>

    <!-- 4. 饮品摄入结构占比 (Beverage Breakdown) -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08]">
      <div
        class="flex items-center justify-between cursor-pointer select-none group/section"
        :class="beverageCollapsed ? '' : 'mb-3'"
        @click="beverageCollapsed = !beverageCollapsed"
      >
        <div class="flex items-center space-x-1.5">
          <PieChart class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">今日饮品摄入构成</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-[10px] font-semibold text-slate-400">共 {{ beverageDist.length }} 种饮品</span>
          <ChevronDown
            class="w-3.5 h-3.5 text-slate-400 transition-transform duration-300"
            :class="beverageCollapsed ? '-rotate-90' : ''"
            :stroke-width="2.4"
          />
        </div>
      </div>

      <div
        class="grid transition-all duration-300 ease-out"
        :class="beverageCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'"
      >
        <div class="overflow-hidden">
      <div v-if="beverageDist.length === 0" class="py-4 text-center text-xs text-slate-400 font-medium">
        暂无饮水构成数据
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="item in beverageDist"
          :key="item.name"
          class="space-y-1"
        >
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-700 dark:text-slate-200">{{ item.name }}</span>
            <span class="text-[11px] text-slate-500 font-mono">{{ item.amountMl }}ml ({{ item.percent }}%)</span>
          </div>
          <!-- 进度条 (根据百分比设定 Tailwind 类名) -->
          <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
            <div
              class="h-full bg-ios-blue rounded-full transition-all duration-300"
              :class="getProgressWidthClass(item.percent)"
            ></div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>

    <!-- 5. 今日饮水详细流水时间线 -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08]">
      <div
        class="flex items-center justify-between cursor-pointer select-none group/section"
        :class="recordsCollapsed ? '' : 'mb-3'"
        @click="recordsCollapsed = !recordsCollapsed"
      >
        <div class="flex items-center space-x-1.5">
          <Clock class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">今日流水记录</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-[10px] font-semibold text-slate-400">共 {{ records.length }} 次</span>
          <button
            v-if="records.length > 0"
            type="button"
            class="text-[10px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:underline cursor-pointer transition-colors"
            @click.stop="showClearConfirmModal = true"
          >
            清空今日
          </button>
          <ChevronDown
            class="w-3.5 h-3.5 text-slate-400 transition-transform duration-300"
            :class="recordsCollapsed ? '-rotate-90' : ''"
            :stroke-width="2.4"
          />
        </div>
      </div>

      <div
        class="grid transition-all duration-300 ease-out"
        :class="recordsCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'"
      >
        <div class="overflow-hidden">
      <div v-if="records.length === 0" class="py-6 text-center text-xs text-slate-400 font-medium">
        今日暂无记录
      </div>

      <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-none">
        <div
          v-for="record in reversedRecords"
          :key="record.id"
          class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <div class="flex items-center space-x-2.5">
            <div class="w-7 h-7 rounded-lg bg-ios-blue/10 dark:bg-ios-blue-dark/20 flex items-center justify-center text-ios-blue">
              <Droplets class="w-3.5 h-3.5" :stroke-width="2.2" />
            </div>
            <div>
              <div class="flex items-center space-x-1.5">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">+{{ record.amountMl }}ml</span>
                <span class="text-[10px] text-slate-500">{{ record.beverageName.split(' ')[0] }}</span>
              </div>
              <span class="text-[10px] text-slate-400">折算纯净水 {{ record.effectiveAmountMl }}ml</span>
            </div>
          </div>

          <div class="flex items-center space-x-2.5">
            <span class="text-[11px] font-mono font-medium text-slate-400">{{ formatRecordTime(record.timestamp) }}</span>
            <button
              type="button"
              class="w-6 h-6 rounded-lg text-slate-400 hover:text-ios-red hover:bg-ios-red/10 active:scale-90 transition-all flex items-center justify-center cursor-pointer"
              title="删除此条记录"
              @click="store.removeWaterRecord(record.id)"
            >
              <Trash2 class="w-3 h-3" :stroke-width="2" />
            </button>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>

    <!-- 6. 今日心流专注流水明细 (新增) -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08]">
      <div
        class="flex items-center justify-between cursor-pointer select-none group/section"
        :class="focusCollapsed ? '' : 'mb-3'"
        @click="focusCollapsed = !focusCollapsed"
      >
        <div class="flex items-center space-x-1.5">
          <Timer class="w-4 h-4 text-sky-500" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">今日心流记录</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-[10px] font-semibold text-slate-400">共 {{ todayFocusSessions.length }} 次</span>
          <ChevronDown
            class="w-3.5 h-3.5 text-slate-400 transition-transform duration-300"
            :class="focusCollapsed ? '-rotate-90' : ''"
            :stroke-width="2.4"
          />
        </div>
      </div>

      <div
        class="grid transition-all duration-300 ease-out"
        :class="focusCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'"
      >
        <div class="overflow-hidden">
      <div v-if="todayFocusSessions.length === 0" class="py-6 text-center text-xs text-slate-400 font-medium">
        今日暂无专注记录，前往「专注」板块开启心流
      </div>

      <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-none">
        <div
          v-for="session in reversedFocusSessions"
          :key="session.id"
          class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <div class="flex items-center space-x-2.5">
            <div class="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-800/40 flex items-center justify-center text-sky-500">
              <Timer class="w-3.5 h-3.5" :stroke-width="2.2" />
            </div>
            <div>
              <div class="flex items-center space-x-1.5">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ session.tag }}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-bold border border-sky-200/40">
                  {{ session.durationMinutes }} 分钟
                </span>
              </div>
              <span class="text-[10px] text-slate-400">
                完成于 {{ formatRecordTime(session.timestamp) }}
                <span v-if="session.waterReplenishedMl" class="text-sky-500 ml-1 font-semibold">
                  · 补水 +{{ session.waterReplenishedMl }}ml
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>

    <!-- 6.5 年月自由选择面板 -->
    <div
      v-if="showPicker"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      @click.self="showPicker = false"
    >
      <div class="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-2xl border border-white/40 dark:border-white/10 select-none">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">选择年月</span>
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
            @click="showPicker = false"
          >
            ✕
          </button>
        </div>

        <div class="flex items-center justify-between mb-3">
          <button
            type="button"
            class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm cursor-pointer transition-colors"
            @click="pickerYear -= 1"
          >
            ‹
          </button>
          <span class="text-sm font-black text-slate-800 dark:text-slate-100">{{ pickerYear }} 年</span>
          <button
            type="button"
            class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm cursor-pointer transition-colors"
            @click="pickerYear += 1"
          >
            ›
          </button>
        </div>

        <div class="grid grid-cols-4 gap-1.5">
          <button
            v-for="m in 12"
            :key="m"
            type="button"
            class="py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer"
            :class="(pickerYear === currentYear && currentMonth === m - 1)
              ? 'bg-ios-blue text-white border-ios-blue shadow-sm'
              : 'bg-slate-50 dark:bg-zinc-800 border-slate-200/60 dark:border-zinc-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-700'"
            @click="applyMonth(m - 1)"
          >
            {{ m }} 月
          </button>
        </div>

        <button
          type="button"
          class="w-full mt-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer transition-colors"
          @click="backToToday"
        >
          回到今天
        </button>
      </div>
    </div>

    <!-- 7. 日期详情下钻抽屉 (Day Inspector Modal) -->
    <div
      v-if="selectedDaySummary"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    >
      <div class="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-2xl border border-white/40 dark:border-white/10 select-none animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between mb-3 border-b pb-2 border-slate-100 dark:border-zinc-800">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ selectedDaySummary.date }} 历史健康档案</span>
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
            @click="selectedDaySummary = null"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3 my-2 text-xs">
          <!-- 饮水量表现 -->
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 space-y-1">
            <div class="flex justify-between items-center">
              <span class="text-slate-500">实际补水量:</span>
              <span class="font-black text-ios-blue">{{ selectedDaySummary.waterTotalMl }} ml</span>
            </div>
            <div class="flex justify-between items-center text-[11px] text-slate-400">
              <span>当时设定目标:</span>
              <span>{{ selectedDaySummary.waterTargetMl }} ml</span>
            </div>
            <div class="flex justify-between items-center text-[11px] pt-1">
              <span>达标情况:</span>
              <span
                class="font-bold"
                :class="selectedDaySummary.waterTotalMl >= selectedDaySummary.waterTargetMl ? 'text-ios-green' : 'text-slate-400'"
              >
                {{ selectedDaySummary.waterTotalMl >= selectedDaySummary.waterTargetMl ? '✓ 已达成' : '未达标' }}
              </span>
            </div>
          </div>

          <!-- 专注心流情况 (若有) -->
          <div v-if="selectedDaySummary.focusMinutes" class="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/40 space-y-1">
            <div class="flex justify-between items-center">
              <span class="text-slate-500">当日心流专注:</span>
              <span class="font-black text-rose-500">{{ selectedDaySummary.focusMinutes }} 分钟</span>
            </div>
            <div class="flex justify-between items-center text-[11px] text-slate-400">
              <span>达成周期:</span>
              <span>{{ selectedDaySummary.focusTomatoes || 0 }} 个番茄钟</span>
            </div>
          </div>

          <!-- 习惯完成情况 -->
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 space-y-1.5">
            <span class="text-[11px] font-bold text-slate-700 dark:text-slate-200">当日完成习惯:</span>
            <div v-if="selectedDaySummary.completedHabits.length === 0" class="text-slate-400 text-[10px]">
              该日未记录达成习惯
            </div>
            <div v-else class="flex flex-wrap gap-1">
              <span
                v-for="hId in selectedDaySummary.completedHabits"
                :key="hId"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
              >
                {{ getHabitTitle(hId) }}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="w-full mt-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
          @click="selectedDaySummary = null"
        >
          关闭
        </button>
      </div>
    </div>

    <!-- 8. 一键重置清空今日流水确认弹窗 -->
    <div
      v-if="showClearConfirmModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    >
      <div class="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-2xl border border-white/40 dark:border-white/10 select-none animate-in fade-in zoom-in-95 duration-150">
        <div class="text-center space-y-2">
          <div class="w-10 h-10 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Trash2 class="w-5 h-5" :stroke-width="2.2" />
          </div>
          <h3 class="text-xs font-bold text-slate-800 dark:text-slate-100">清空今日全部饮水记录？</h3>
          <p class="text-[11px] text-slate-400">此操作将移除今天所有已打卡饮水流水并重置小水滴今日经验，操作不可撤销。</p>
        </div>

        <div class="flex space-x-2 mt-4">
          <button
            type="button"
            class="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer transition-colors"
            @click="showClearConfirmModal = false"
          >
            取消
          </button>
          <button
            type="button"
            class="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm cursor-pointer transition-colors"
            @click="handleClearTodayRecords"
          >
            确认清空
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Flame,
  Droplets,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  Clock,
  Trash2,
  Timer,
  Compass,
  ChevronDown
} from 'lucide-vue-next'
import { useHealthStore } from '@/stores/health'
import { formatDateKey, formatTimeKey } from '@/utils/calculator'
import type { DailySummary } from '@/types'

const store = useHealthStore()

const streakDays = computed(() => store.streakDays)
const records = computed(() => store.waterRecords)
const reversedRecords = computed(() => [...records.value].reverse())
const beverageDist = computed(() => store.beverageDistribution)

const todayFocusSessions = computed(() => store.todayFocusSessions)
const reversedFocusSessions = computed(() => [...todayFocusSessions.value].reverse())

// 统计板块折叠状态
const beverageCollapsed = ref(false)
const recordsCollapsed = ref(false)
const focusCollapsed = ref(false)

// 清空今日饮水记录确认弹窗
const showClearConfirmModal = ref(false)

function handleClearTodayRecords(): void {
  store.clearTodayWaterRecords()
  showClearConfirmModal.value = false
}

function formatRecordTime(ts: number): string {
  return formatTimeKey(ts)
}

function getHabitTitle(id: string): string {
  const h = store.habits.find((item) => item.id === id)
  return h ? h.title : id
}

// 日历年月控制
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

function prevMonth(): void {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}

function nextMonth(): void {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}

// 选中查看详情的日期历史记录
const selectedDaySummary = ref<DailySummary | null>(null)

interface CalendarDayItem {
  dateKey: string
  dayNum: number
  isCurrentMonth: boolean
  isToday: boolean
  waterTotalMl: number
  isAchieved: boolean
  completedHabitsCount: number
}

// 生成指定年月的日历天数 (按周一到周日对齐)
function buildMonthDays(year: number, month: number): CalendarDayItem[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const totalDays = lastDay.getDate()

  // 计算1号是周几 (0是周日, 1~6是周一~周六)
  let startWeekday = firstDay.getDay()
  startWeekday = startWeekday === 0 ? 7 : startWeekday // 转为周一为1, 周日为7

  const result: CalendarDayItem[] = []
  const todayKey = store.todayDate

  // 补齐月初空白 (前一个月)
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startWeekday - 1; i > 0; i--) {
    const d = prevMonthLastDay - i + 1
    result.push({
      dateKey: `prev_${d}`,
      dayNum: d,
      isCurrentMonth: false,
      isToday: false,
      waterTotalMl: 0,
      isAchieved: false,
      completedHabitsCount: 0
    })
  }

  // 当月天数
  for (let d = 1; d <= totalDays; d++) {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    const dateKey = `${year}-${mm}-${dd}`
    const isToday = dateKey === todayKey

    let totalMl = 0
    let isAchieved = false
    let completedHabitsCount = 0

    if (isToday) {
      totalMl = store.totalEffectiveWaterMl
      isAchieved = store.isGoalAchieved
      completedHabitsCount = store.habits.filter((h) => h.currentCount >= h.targetCount).length
    } else {
      const hist = store.historicalRecords[dateKey]
      if (hist) {
        totalMl = hist.waterTotalMl || 0
        isAchieved = totalMl >= hist.waterTargetMl
        completedHabitsCount = (hist.completedHabits || []).length
      }
    }

    result.push({
      dateKey,
      dayNum: d,
      isCurrentMonth: true,
      isToday,
      waterTotalMl: totalMl,
      isAchieved,
      completedHabitsCount
    })
  }

  // 补齐周末空位
  const remaining = 7 - (result.length % 7)
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      result.push({
        dateKey: `next_${i}`,
        dayNum: i,
        isCurrentMonth: false,
        isToday: false,
        waterTotalMl: 0,
        isAchieved: false,
        completedHabitsCount: 0
      })
    }
  }

  return result
}

// 当前展示月份的日历
const calendarDays = computed<CalendarDayItem[]>(() => buildMonthDays(currentYear.value, currentMonth.value))

// 月 / 季 / 年 视图
type CalendarView = 'month' | 'quarter' | 'year'
const calendarView = ref<CalendarView>('month')
const viewOptions: { value: CalendarView; label: string }[] = [
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季' },
  { value: 'year', label: '年' }
]

const quarterIndex = computed(() => Math.floor(currentMonth.value / 3))
const periodLabel = computed(() => {
  if (calendarView.value === 'year') return `${currentYear.value} 年`
  if (calendarView.value === 'quarter') return `${currentYear.value} 年 Q${quarterIndex.value + 1}`
  return `${currentYear.value} 年 ${currentMonth.value + 1} 月`
})

// 季视图 3 个月、年视图 12 个月的迷你热力月历
interface MiniMonthItem {
  month: number
  days: CalendarDayItem[]
}
const miniMonths = computed<MiniMonthItem[]>(() => {
  const months = calendarView.value === 'quarter'
    ? [quarterIndex.value * 3, quarterIndex.value * 3 + 1, quarterIndex.value * 3 + 2]
    : Array.from({ length: 12 }, (_, i) => i)
  return months.map((m) => ({ month: m, days: buildMonthDays(currentYear.value, m) }))
})

function monthAchievedCount(mm: MiniMonthItem): number {
  return mm.days.filter((d) => d.isCurrentMonth && d.isAchieved).length
}

function miniCellClass(day: CalendarDayItem): string {
  if (!day.isCurrentMonth) return 'bg-transparent pointer-events-none'
  if (day.isToday) return 'bg-ios-blue ring-1 ring-ios-blue/40'
  if (day.isAchieved) return 'bg-emerald-400'
  if (day.waterTotalMl > 0) return 'bg-ios-blue/70'
  if (day.completedHabitsCount > 0) return 'bg-purple-400/80'
  return 'bg-slate-200/70 dark:bg-zinc-700/60'
}

// 按当前视图翻页：月 / 季度 / 年
function shiftPeriod(dir: number): void {
  if (calendarView.value === 'month') {
    dir > 0 ? nextMonth() : prevMonth()
    return
  }
  if (calendarView.value === 'quarter') {
    const m = currentMonth.value + dir * 3
    if (m < 0) {
      currentMonth.value = m + 12
      currentYear.value -= 1
    } else if (m > 11) {
      currentMonth.value = m - 12
      currentYear.value += 1
    } else {
      currentMonth.value = m
    }
    return
  }
  currentYear.value += dir
}

// 年月自由选择
const showPicker = ref(false)
const pickerYear = ref(today.getFullYear())

function openPicker(): void {
  pickerYear.value = currentYear.value
  showPicker.value = true
}

function applyMonth(month: number): void {
  currentYear.value = pickerYear.value
  currentMonth.value = month
  showPicker.value = false
}

function backToToday(): void {
  const now = new Date()
  currentYear.value = now.getFullYear()
  currentMonth.value = now.getMonth()
  pickerYear.value = now.getFullYear()
  showPicker.value = false
}

function selectDayDetail(day: CalendarDayItem): void {
  if (!day.isCurrentMonth) return
  if (day.isToday) {
    selectedDaySummary.value = {
      date: day.dateKey,
      waterTotalMl: store.totalEffectiveWaterMl,
      waterTargetMl: store.dailyGoalMl,
      completedHabits: store.habits.filter((h) => h.currentCount >= h.targetCount).map((h) => h.id),
      streakDays: store.streakDays
    }
  } else {
    const hist = store.historicalRecords[day.dateKey]
    if (hist) {
      selectedDaySummary.value = hist
    } else {
      selectedDaySummary.value = {
        date: day.dateKey,
        waterTotalMl: 0,
        waterTargetMl: store.dailyGoalMl,
        completedHabits: [],
        streakDays: 0
      }
    }
  }
}

// 近 7 天图表
const pastSevenDays = computed(() => {
  const result = []
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const todayKey = store.todayDate

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateKey = formatDateKey(d)
    const isToday = dateKey === todayKey

    let totalMl = 0
    if (isToday) {
      totalMl = store.totalEffectiveWaterMl
    } else {
      const summary = store.historicalRecords[dateKey]
      totalMl = summary ? summary.waterTotalMl : 0
    }

    const ratio = Math.min(1.0, totalMl / store.dailyGoalMl)
    const isAchieved = totalMl >= store.dailyGoalMl

    result.push({
      dateKey,
      weekdayLabel: isToday ? '今' : weekdays[d.getDay()],
      totalMl,
      ratio,
      isAchieved,
      isToday
    })
  }

  return result
})

function getBarHeightClass(ratio: number): string {
  if (ratio <= 0.05) return 'h-1'
  if (ratio <= 0.2) return 'h-1/5'
  if (ratio <= 0.4) return 'h-2/5'
  if (ratio <= 0.6) return 'h-3/5'
  if (ratio <= 0.8) return 'h-4/5'
  return 'h-full'
}

function getProgressWidthClass(percent: number): string {
  if (percent <= 10) return 'w-1/12'
  if (percent <= 25) return 'w-1/4'
  if (percent <= 50) return 'w-1/2'
  if (percent <= 75) return 'w-3/4'
  return 'w-full'
}
</script>
