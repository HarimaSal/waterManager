<template>
  <div class="space-y-3.5 pb-8 select-none">
    <!-- 1. 顶部全景标题与今日心流战报 (Tide / Calm 极简静谧美学) -->
    <div class="relative overflow-hidden rounded-2xl p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-ios-card">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-800/40 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-sm">
            <Timer class="w-5 h-5" :stroke-width="2.2" />
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-sm font-black text-slate-800 dark:text-slate-100">心流专注 · 水合律动</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/50">
                番茄钟
              </span>
            </div>
            <p class="text-[11px] text-slate-400 dark:text-zinc-400 mt-0.5">
              深呼吸沉浸心流，工间休整润养体元
            </p>
          </div>
        </div>

        <!-- 今日战报徽章 -->
        <div class="flex flex-col items-end">
          <div class="flex items-center space-x-1 text-slate-400 dark:text-zinc-500 text-[10px] font-bold">
            <CheckCircle2 class="w-3.5 h-3.5 text-sky-500" :stroke-width="2.2" />
            <span>今日专注</span>
          </div>
          <div class="flex items-baseline space-x-1 mt-0.5">
            <span class="text-base font-black text-slate-800 dark:text-white">{{ todayFocusTomatoes }}</span>
            <span class="text-[10px] font-bold text-slate-400">个周期</span>
            <span class="text-[10px] text-slate-300 dark:text-zinc-600">/</span>
            <span class="text-xs font-black text-sky-600 dark:text-sky-400">{{ todayFocusMinutes }}</span>
            <span class="text-[10px] font-bold text-slate-400">分</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 专注模式预设切换 (4 款预设矩阵，统一软柔光微卡) -->
    <div class="grid grid-cols-2 gap-2.5">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        class="relative overflow-hidden rounded-2xl p-3 text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between"
        :class="[
          store.pomodoroMode === preset.id
            ? 'bg-sky-50/40 dark:bg-sky-950/20 border-sky-400 dark:border-sky-500 shadow-sm ring-2 ring-sky-400/20 font-bold'
            : 'bg-white/70 dark:bg-zinc-900/70 border-black/[0.05] dark:border-white/[0.06] hover:bg-white/90 dark:hover:bg-zinc-800/80 shadow-ios-card'
        ]"
        @click="selectMode(preset.id)"
      >
        <div class="flex items-center justify-between w-full mb-1.5">
          <div
            class="w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs"
            :class="getPresetBadgeClass(preset.id)"
          >
            <component :is="getPresetIcon(preset.id)" class="w-4 h-4" :stroke-width="2.2" />
          </div>
          <span
            class="text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors"
            :class="[
              store.pomodoroMode === preset.id
                ? 'bg-sky-100/70 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
            ]"
          >
            {{ getPresetDurationLabel(preset.id) }}
          </span>
        </div>

        <div>
          <div class="flex items-center space-x-1">
            <span class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ preset.name }}</span>
            <span class="text-[10px] text-slate-400">({{ preset.tag }})</span>
          </div>
          <p class="text-[10px] text-slate-400 dark:text-zinc-400 line-clamp-1 mt-0.5">
            {{ preset.desc }}
          </p>
        </div>
      </button>
    </div>

    <!-- 自定义模式下的时长滑块调节面板 -->
    <div
      v-if="store.pomodoroMode === 'custom' && store.pomodoroState === 'idle'"
      class="rounded-2xl p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-ios-card animate-in fade-in duration-200"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-1.5">
          <SlidersHorizontal class="w-3.5 h-3.5 text-sky-500" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-700 dark:text-slate-200">自定义专注时长</span>
        </div>
        <span class="text-xs font-black text-sky-600 dark:text-sky-400 font-mono">
          {{ customMinutes }} 分钟
        </span>
      </div>

      <div class="flex items-center space-x-3">
        <span class="text-[10px] font-semibold text-slate-400">10m</span>
        <input
          type="range"
          min="10"
          max="90"
          step="5"
          :value="customMinutes"
          class="flex-1 accent-sky-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none"
          @input="handleCustomMinutesChange"
        />
        <span class="text-[10px] font-semibold text-slate-400">90m</span>
      </div>

      <div class="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
        <span class="text-[10px] text-slate-400">快捷预设:</span>
        <div class="flex items-center space-x-1.5">
          <button
            v-for="quickMin in [20, 30, 45, 60]"
            :key="quickMin"
            type="button"
            class="px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
            :class="[
              customMinutes === quickMin
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
            ]"
            @click="setQuickCustomMinutes(quickMin)"
          >
            {{ quickMin }}m
          </button>
        </div>
      </div>
    </div>

    <!-- 3. 核心倒计时流光环与控制核心 (借鉴 Tide 潮汐流体静谧美学) -->
    <div class="relative overflow-hidden rounded-3xl p-6 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-ios-float flex flex-col items-center justify-center">
      <!-- 柔和背部氛围海洋漫射晕光 -->
      <div
        class="absolute w-52 h-52 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        :class="getAmbientGlowClass()"
      ></div>

      <!-- 状态指示微胶囊 (精细透光圆角胶囊) -->
      <div class="relative z-10 mb-2">
        <div
          class="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs"
          :class="getStatusCapsuleClass()"
        >
          <span class="w-2 h-2 rounded-full" :class="getStatusDotClass()"></span>
          <span>{{ getStatusText() }}</span>
        </div>
      </div>

      <!-- SVG 极简进度圆环与超大数字表盘 (定义 SVG 潮汐水感渐变) -->
      <div class="relative w-56 h-56 flex items-center justify-center z-10 my-2">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <defs>
            <!-- 潮汐心流海洋渐变 -->
            <linearGradient id="tideOceanFlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0284C7" />
              <stop offset="50%" stop-color="#0EA5E9" />
              <stop offset="100%" stop-color="#14B8A6" />
            </linearGradient>
            <!-- 工间晨曦小憩渐变 -->
            <linearGradient id="tideBreakFlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#6366F1" />
              <stop offset="100%" stop-color="#38BDF8" />
            </linearGradient>
          </defs>

          <!-- 背景底环 -->
          <circle
            cx="100"
            cy="100"
            r="84"
            class="stroke-slate-100 dark:stroke-zinc-800/80"
            stroke-width="8"
            fill="none"
          />

          <!-- 进度环 (SVG 属性方式声明渐变引用，严格遵守无行内 style 规范) -->
          <circle
            cx="100"
            cy="100"
            r="84"
            :stroke="getProgressRingStroke()"
            :class="getProgressRingClass()"
            stroke-width="8"
            stroke-linecap="round"
            fill="none"
            :stroke-dasharray="circleCircumference"
            :stroke-dashoffset="circleDashOffset"
            class="transition-all duration-500 ease-out"
          />
        </svg>

        <!-- 环内核心表盘信息 -->
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <!-- 倒计时数字 (Apple SF Pro 等宽大字) -->
          <div class="flex items-baseline font-mono tracking-tight text-slate-800 dark:text-white">
            <span class="text-5xl font-black">{{ store.formattedPomodoroMinutes }}</span>
            <span class="text-4xl font-extrabold text-slate-300 dark:text-zinc-600 px-0.5 animate-pulse">:</span>
            <span class="text-5xl font-black">{{ store.formattedPomodoroSeconds }}</span>
          </div>

          <!-- 状态提示文字与推进比例 -->
          <div class="flex items-center space-x-1 text-[11px] font-bold text-slate-400 dark:text-zinc-500 mt-1.5">
            <span>{{ getCenterSubText() }}</span>
          </div>
        </div>
      </div>

      <!-- 任务标签选择胶囊组 (移除生硬纯黑底，借鉴市场产品水感高亮浅蓝微胶囊) -->
      <div class="relative z-10 flex items-center space-x-1.5 mb-5 mt-1 overflow-x-auto max-w-full py-1 scrollbar-none">
        <button
          v-for="tag in focusTags"
          :key="tag"
          type="button"
          class="px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all duration-150 cursor-pointer border whitespace-nowrap"
          :class="[
            store.pomodoroTag === tag
              ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-400/50 dark:border-sky-500/50 shadow-xs ring-1 ring-sky-400/20'
              : 'bg-slate-100/70 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 border-slate-200/50 dark:border-zinc-700/50 hover:bg-slate-100'
          ]"
          @click="store.setPomodoroTag(tag)"
        >
          {{ tag }}
        </button>
      </div>

      <!-- 核心控制器按键组 (统一 Tide / Apple 潮汐水流色系，彻底告别红紫高饱和渐变与突兀原谅绿) -->
      <div class="relative z-10 flex items-center justify-center space-x-3 w-full">
        <!-- 空闲待启动态：如潮汐般深邃静谧的海洋渐变主键 -->
        <template v-if="store.pomodoroState === 'idle'">
          <button
            type="button"
            class="flex items-center justify-center space-x-2 w-48 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm shadow-md shadow-sky-500/25 active:scale-95 transition-all cursor-pointer"
            @click="store.startPomodoro"
          >
            <Play class="w-4 h-4 fill-current" :stroke-width="2.5" />
            <span>开启心流专注</span>
          </button>
        </template>

        <!-- 运行中态：低调磨砂暂停键 + 次级重置键 -->
        <template v-else-if="store.pomodoroState === 'running'">
          <button
            type="button"
            class="flex-1 max-w-36 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs active:scale-95 transition-all cursor-pointer border border-slate-200/80 dark:border-zinc-700"
            @click="store.pausePomodoro"
          >
            <Pause class="w-3.5 h-3.5 fill-current text-amber-500" :stroke-width="2.5" />
            <span>暂停心流</span>
          </button>
          <button
            type="button"
            class="flex-1 max-w-36 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:text-zinc-400 font-medium text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer border border-slate-200/60 dark:border-zinc-700/60"
            @click="store.resetPomodoro"
          >
            <RotateCcw class="w-3.5 h-3.5" :stroke-width="2.2" />
            <span>放弃并重置</span>
          </button>
        </template>

        <!-- 暂停态：和谐水感主键「继续心流」(告别突兀翠绿) + 灰度重置 -->
        <template v-else-if="store.pomodoroState === 'paused'">
          <button
            type="button"
            class="flex-1 max-w-36 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-sky-500/25 active:scale-95 transition-all cursor-pointer"
            @click="store.resumePomodoro"
          >
            <Play class="w-3.5 h-3.5 fill-current" :stroke-width="2.5" />
            <span>继续心流</span>
          </button>
          <button
            type="button"
            class="flex-1 max-w-36 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer border border-slate-200 dark:border-zinc-700"
            @click="store.resetPomodoro"
          >
            <RotateCcw class="w-3.5 h-3.5" :stroke-width="2.2" />
            <span>重置</span>
          </button>
        </template>

        <!-- 休息态：工间跳过按钮 -->
        <template v-else-if="store.pomodoroState === 'break'">
          <button
            type="button"
            class="flex-1 max-w-48 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all cursor-pointer border border-slate-200 dark:border-zinc-700"
            @click="store.skipBreak"
          >
            <Coffee class="w-3.5 h-3.5" :stroke-width="2.2" />
            <span>跳过休整，直接开启</span>
          </button>
        </template>
      </div>
    </div>

    <!-- 4. 智能协同与声景联动偏好卡片 (统一 Apple 经典柔和天蓝开关，消除蓝绿杂糅) -->
    <div class="rounded-2xl p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-ios-card space-y-3">
      <!-- 联动开关 1: 背景声景 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-800/40 flex items-center justify-center text-sky-500">
            <Headphones class="w-4 h-4" :stroke-width="2.2" />
          </div>
          <div>
            <div class="text-xs font-bold text-slate-800 dark:text-slate-100">随专注自动播放自然声景</div>
            <div class="text-[10px] text-slate-400">
              专注开始时平滑淡入白噪音，计时结束时自动停止
            </div>
          </div>
        </div>

        <!-- 统一品牌天蓝色调开关 -->
        <button
          type="button"
          role="switch"
          :aria-checked="!!store.settings.autoSoundscapeSync"
          class="relative shrink-0 w-11 h-6 cursor-pointer active:scale-95 transition-transform"
          @click="toggleAutoSoundscape"
        >
          <!-- 光条轨道：开启时渐变发光 -->
          <span
            class="absolute left-0 right-0 top-1/2 h-[7px] -translate-y-1/2 rounded-full transition-all duration-300"
            :class="store.settings.autoSoundscapeSync
              ? 'bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 shadow-[0_0_10px_2px_rgba(56,189,248,0.45)]'
              : 'bg-slate-200 dark:bg-zinc-700 shadow-inner'"
          ></span>
          <!-- 发光滑块 -->
          <span
            class="absolute top-1/2 left-0 w-[18px] h-[18px] -translate-y-1/2 rounded-full transition-all duration-300 ease-out"
            :class="store.settings.autoSoundscapeSync
              ? 'translate-x-[26px] bg-white ring-2 ring-white/80 shadow-[0_1px_4px_rgba(15,23,42,0.25),0_0_10px_rgba(56,189,248,0.85)]'
              : 'translate-x-0 bg-white ring-2 ring-slate-100 dark:ring-zinc-600 shadow-[0_1px_4px_rgba(15,23,42,0.25)]'"
          ></span>
        </button>
      </div>

      <div class="h-px bg-slate-100 dark:bg-zinc-800"></div>

      <!-- 联动开关 2: 工间水合 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-800/40 flex items-center justify-center text-sky-500">
            <Droplets class="w-4 h-4" :stroke-width="2.2" />
          </div>
          <div>
            <div class="text-xs font-bold text-slate-800 dark:text-slate-100">专注达成引导工间补水</div>
            <div class="text-[10px] text-slate-400">
              每轮番茄周期达成后，主动弹出水合与微活动小卡片
            </div>
          </div>
        </div>

        <!-- 统一品牌天蓝色调开关 -->
        <button
          type="button"
          role="switch"
          :aria-checked="store.settings.promptHydrationOnPomodoroComplete !== false"
          class="relative shrink-0 w-11 h-6 cursor-pointer active:scale-95 transition-transform"
          @click="togglePromptHydration"
        >
          <!-- 光条轨道：开启时渐变发光 -->
          <span
            class="absolute left-0 right-0 top-1/2 h-[7px] -translate-y-1/2 rounded-full transition-all duration-300"
            :class="store.settings.promptHydrationOnPomodoroComplete !== false
              ? 'bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 shadow-[0_0_10px_2px_rgba(56,189,248,0.45)]'
              : 'bg-slate-200 dark:bg-zinc-700 shadow-inner'"
          ></span>
          <!-- 发光滑块 -->
          <span
            class="absolute top-1/2 left-0 w-[18px] h-[18px] -translate-y-1/2 rounded-full transition-all duration-300 ease-out"
            :class="store.settings.promptHydrationOnPomodoroComplete !== false
              ? 'translate-x-[26px] bg-white ring-2 ring-white/80 shadow-[0_1px_4px_rgba(15,23,42,0.25),0_0_10px_rgba(56,189,248,0.85)]'
              : 'translate-x-0 bg-white ring-2 ring-slate-100 dark:ring-zinc-600 shadow-[0_1px_4px_rgba(15,23,42,0.25)]'"
          ></span>
        </button>
      </div>
    </div>

    <!-- 5. 弹窗：工间补水与拉伸达成卡片 (Pomodoro Complete Hydration Modal) -->
    <div
      v-if="store.showHydrationBreakModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      @click.self="store.showHydrationBreakModal = false"
    >
      <div class="w-full max-w-sm rounded-3xl p-5 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 shadow-2xl relative">
        <button
          type="button"
          class="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          @click="store.showHydrationBreakModal = false"
        >
          <X class="w-4 h-4" :stroke-width="2.2" />
        </button>

        <div class="flex items-center space-x-3 mb-3">
          <div class="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-800/40 flex items-center justify-center text-sky-500 shadow-sm">
            <Sparkles class="w-5 h-5" :stroke-width="2.2" />
          </div>
          <div>
            <h3 class="text-sm font-black text-slate-800 dark:text-slate-100">本轮心流已达成</h3>
            <p class="text-[10px] text-slate-400">已沉浸专注 {{ completedDuration }} 分钟，为身心充能</p>
          </div>
        </div>

        <p class="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed mb-4">
          长时间脑力输出会加速脑脊液循环与眼部水分蒸发。喝一杯温水、站起伸展 2 分钟，让大脑满血重启！
        </p>

        <!-- 快捷补水记录按钮组 -->
        <div class="grid grid-cols-3 gap-2 mb-4">
          <button
            v-for="ml in [150, 200, 300]"
            :key="ml"
            type="button"
            class="py-2.5 rounded-xl border border-sky-200/60 dark:border-sky-800/60 bg-sky-50/70 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer"
            @click="handleReplenishWater(ml)"
          >
            <div class="flex items-center space-x-1">
              <Droplets class="w-3.5 h-3.5 text-sky-500" :stroke-width="2.2" />
              <span class="text-xs font-black">+{{ ml }}ml</span>
            </div>
            <span class="text-[9px] text-sky-500/80 mt-0.5">一键补水打卡</span>
          </button>
        </div>

        <!-- 底部仅休息或关闭 -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            class="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
            @click="store.showHydrationBreakModal = false"
          >
            暂不记录，仅工间小憩
          </button>
          <button
            type="button"
            class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-sm shadow-sky-500/20"
            @click="store.showHydrationBreakModal = false"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Timer,
  Compass,
  Flame,
  SlidersHorizontal,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  CheckCircle2,
  Headphones,
  Droplets,
  Sparkles,
  X
} from 'lucide-vue-next'
import { useHealthStore } from '@/stores/health'
import { POMODORO_PRESETS, type PomodoroMode } from '@/types'

const store = useHealthStore()

const presets = POMODORO_PRESETS
const focusTags = ['健康办公', '代码沉浸', '深度研读', '文案撰写', '创意构想']

const todayFocusTomatoes = computed(() => store.todayFocusTomatoes)
const todayFocusMinutes = computed(() => store.todayFocusMinutes)
const customMinutes = computed(() => store.settings.customPomodoroMinutes || 30)

const completedDuration = computed(() => {
  return store.lastCompletedSession?.durationMinutes || 25
})

// SVG 圆环参数 (半径 84, 周长 ≈ 527.79)
const circleCircumference = 527.79
const circleDashOffset = computed(() => {
  const percent = store.pomodoroProgressPercent
  return circleCircumference * (1 - percent / 100)
})

function getPresetIcon(mode: PomodoroMode) {
  switch (mode) {
    case 'classic':
      return Timer
    case 'deep':
      return Compass
    case 'blitz':
      return Flame
    case 'custom':
      return SlidersHorizontal
    default:
      return Timer
  }
}

function getPresetBadgeClass(mode: PomodoroMode): string {
  switch (mode) {
    case 'classic':
      return 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200/50 dark:border-sky-800/40'
    case 'deep':
      return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/40'
    case 'blitz':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/40'
    case 'custom':
      return 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200/50 dark:border-teal-800/40'
    default:
      return 'bg-slate-50 text-slate-500 border-slate-200'
  }
}

function getPresetDurationLabel(mode: PomodoroMode): string {
  switch (mode) {
    case 'classic':
      return '25 分钟'
    case 'deep':
      return '50 分钟'
    case 'blitz':
      return '15 分钟'
    case 'custom':
      return `${customMinutes.value} 分钟`
    default:
      return '25 分钟'
  }
}

function selectMode(mode: PomodoroMode) {
  store.setPomodoroMode(mode)
}

function handleCustomMinutesChange(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  store.setCustomPomodoroMinutes(val)
}

function setQuickCustomMinutes(val: number) {
  store.setCustomPomodoroMinutes(val)
}

function toggleAutoSoundscape() {
  store.updateSettings({
    autoSoundscapeSync: !store.settings.autoSoundscapeSync
  })
}

function togglePromptHydration() {
  const current = store.settings.promptHydrationOnPomodoroComplete !== false
  store.updateSettings({
    promptHydrationOnPomodoroComplete: !current
  })
}

function handleReplenishWater(amountMl: number) {
  store.recordBreakHydration(amountMl)
}

function getStatusText(): string {
  switch (store.pomodoroState) {
    case 'running':
      return '心流专注中'
    case 'paused':
      return '已暂停'
    case 'break':
      return '工间舒缓小憩'
    case 'idle':
    default:
      return '准备就绪'
  }
}

function getStatusCapsuleClass(): string {
  switch (store.pomodoroState) {
    case 'running':
      return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
    case 'paused':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    case 'break':
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
    case 'idle':
    default:
      return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
  }
}

function getStatusDotClass(): string {
  switch (store.pomodoroState) {
    case 'running':
      return 'bg-teal-500 animate-ping'
    case 'paused':
      return 'bg-amber-500'
    case 'break':
      return 'bg-indigo-500 animate-pulse'
    case 'idle':
    default:
      return 'bg-sky-400'
  }
}

function getProgressRingStroke(): string {
  switch (store.pomodoroState) {
    case 'break':
      return 'url(#tideBreakFlow)'
    case 'running':
    case 'paused':
      return 'url(#tideOceanFlow)'
    case 'idle':
    default:
      return 'currentColor'
  }
}

function getProgressRingClass(): string {
  if (store.pomodoroState === 'idle') {
    return 'text-sky-200/90 dark:text-sky-900/60'
  }
  return ''
}

function getCenterSubText(): string {
  switch (store.pomodoroState) {
    case 'running':
      return `${store.pomodoroProgressPercent}% · 保持心流律动`
    case 'paused':
      return `${store.pomodoroProgressPercent}% · 已暂停心流`
    case 'break':
      return '工间休整 · 远眺深呼吸'
    case 'idle':
    default:
      return `${store.pomodoroProgressPercent}% 已推进`
  }
}

function getAmbientGlowClass(): string {
  switch (store.pomodoroState) {
    case 'running':
      return 'bg-teal-400/15 dark:bg-teal-500/20 animate-pulse'
    case 'break':
      return 'bg-indigo-400/15 dark:bg-indigo-500/20'
    case 'paused':
      return 'bg-amber-400/10 dark:bg-amber-500/15'
    case 'idle':
    default:
      return 'bg-sky-400/10 dark:bg-sky-500/15'
  }
}
</script>
