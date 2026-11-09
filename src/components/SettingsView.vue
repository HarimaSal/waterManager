<template>
  <div class="space-y-3 pb-12 select-none">
    <!-- 顶部概览与全部展开/收起快捷控制器 -->
    <div class="flex items-center justify-between px-1 pt-0.5">
      <span class="text-xs font-bold text-slate-500 dark:text-slate-400">系统与个性化配置</span>
      <button
        type="button"
        class="text-[11px] font-semibold text-ios-blue hover:underline cursor-pointer flex items-center space-x-0.5 transition-colors"
        @click="toggleAllSections"
      >
        <span>{{ allSectionsExpanded ? '收起全部卡片' : '展开全部卡片' }}</span>
      </button>
    </div>

    <!-- 模块 0: 运行模式与专属水合算法设定 -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08] space-y-3">
      <!-- 可折叠标题栏 -->
      <div
        class="flex items-center justify-between cursor-pointer select-none"
        @click="toggleSection('mode')"
      >
        <div class="flex items-center space-x-1.5">
          <Sparkles class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">运行模式设定</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" :class="store.settings.appMode === 'fitness' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-ios-blue/10 text-ios-blue'">
            {{ store.settings.appMode === 'fitness' ? '🔥 健身模式' : '💧 日常模式' }}
          </span>
          <ChevronDown
            class="w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="{ '-rotate-90': !openSections.mode }"
          />
        </div>
      </div>

      <div v-show="openSections.mode" class="space-y-3 pt-1">
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="p-2.5 rounded-xl border flex flex-col items-start transition-all cursor-pointer"
            :class="[
              store.settings.appMode !== 'fitness'
                ? 'bg-ios-blue/10 dark:bg-ios-blue-dark/20 border-ios-blue text-ios-blue dark:text-ios-blue-dark ring-2 ring-ios-blue/30 font-bold'
                : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200/60 dark:border-zinc-700/60 text-slate-600 dark:text-slate-400'
            ]"
            @click="store.setAppMode('daily')"
          >
            <div class="flex items-center space-x-1">
              <span class="text-xs font-bold">💧 日常健康模式</span>
            </div>
            <span class="text-[10px] opacity-75 mt-0.5 font-normal">标准 35ml/kg，工间防久坐</span>
          </button>

          <button
            type="button"
            class="p-2.5 rounded-xl border flex flex-col items-start transition-all cursor-pointer"
            :class="[
              store.settings.appMode === 'fitness'
                ? 'bg-gradient-to-br from-amber-500/15 to-orange-500/20 border-amber-500 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/30 font-bold'
                : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200/60 dark:border-zinc-700/60 text-slate-600 dark:text-slate-400'
            ]"
            @click="store.setAppMode('fitness')"
          >
            <div class="flex items-center space-x-1">
              <span class="text-xs font-bold">🔥 硬核健身模式</span>
            </div>
            <span class="text-[10px] opacity-75 mt-0.5 font-normal">高代谢 45ml/kg，围训练水合</span>
          </button>
        </div>

        <!-- 健身模式专属微调选项 (仅在健身模式生效) -->
        <div v-if="store.settings.appMode === 'fitness'" class="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2.5 animate-in fade-in duration-150">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">一水肌酸额外水合 (+500ml)</span>
              <p class="text-[10px] text-slate-400">帮助骨骼肌肌纤维细胞充分储水充盈</p>
            </div>
            <button
              type="button"
              class="w-10 h-6 rounded-full transition-colors relative cursor-pointer"
              :class="store.settings.isTakingCreatine ? 'bg-amber-500' : 'bg-slate-200 dark:bg-zinc-700'"
              @click="store.toggleCreatine()"
            >
              <span
                class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="store.settings.isTakingCreatine ? 'translate-x-4' : 'translate-x-0'"
              ></span>
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">高蛋白增肌期代谢 (+300ml)</span>
              <p class="text-[10px] text-slate-400">加速肾脏排解蛋白质尿素含氮代谢物</p>
            </div>
            <button
              type="button"
              class="w-10 h-6 rounded-full transition-colors relative cursor-pointer"
              :class="store.settings.isHighProteinDiet ? 'bg-amber-500' : 'bg-slate-200 dark:bg-zinc-700'"
              @click="store.toggleHighProteinDiet()"
            >
              <span
                class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="store.settings.isHighProteinDiet ? 'translate-x-4' : 'translate-x-0'"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模块 1: 身体与算法设置 -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08] space-y-3.5">
      <!-- 可折叠标题栏 -->
      <div
        class="flex items-center justify-between cursor-pointer select-none"
        @click="toggleSection('calc')"
      >
        <div class="flex items-center space-x-1.5">
          <Scale class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">饮水目标智能测算</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-[10px] font-mono text-ios-blue font-bold">{{ weight }}kg · {{ store.dailyGoalMl }}ml</span>
          <ChevronDown
            class="w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="{ '-rotate-90': !openSections.calc }"
          />
        </div>
      </div>

      <div v-show="openSections.calc" class="space-y-3.5 pt-1">
        <!-- 体重选择 -->
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-600 dark:text-slate-300">当前体重</span>
          <div class="flex items-center space-x-2.5">
            <input
              type="range"
              min="40"
              max="120"
              step="1"
              v-model.number="weight"
              class="w-28 accent-ios-blue cursor-pointer"
            />
            <span class="text-xs font-black text-ios-blue dark:text-ios-blue-dark w-12 text-right">{{ weight }} kg</span>
          </div>
        </div>

        <!-- 活动量强度选择 (日常模式下展示) -->
        <div v-if="store.settings.appMode !== 'fitness'" class="space-y-1.5">
          <span class="text-xs font-medium text-slate-600 dark:text-slate-300">日常活动负荷</span>
          <div class="grid grid-cols-4 gap-1.5">
            <button
              v-for="act in activityOptions"
              :key="act.value"
              type="button"
              class="py-1.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer"
              :class="[
                activityLevel === act.value
                  ? 'bg-ios-blue text-white border-ios-blue shadow-sm'
                  : 'bg-slate-50 dark:bg-zinc-800 border-slate-200/60 dark:border-zinc-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-700'
              ]"
              @click="activityLevel = act.value"
            >
              {{ act.label }}
            </button>
          </div>
        </div>

        <!-- 推荐每日需水量结果展示 -->
        <div class="p-3 rounded-xl bg-ios-blue/10 dark:bg-ios-blue-dark/20 border border-ios-blue/20 flex items-center justify-between text-xs">
          <div>
            <span class="text-slate-600 dark:text-slate-300 font-medium">推荐每日需水量:</span>
            <p class="text-[10px] text-slate-400 mt-0.5">
              {{
                store.settings.appMode === 'fitness'
                  ? `健身模式 (${weight}kg × 45ml + 训练负荷 + 补剂水合)`
                  : `日常模式 (${weight}kg × 35ml + 活动负荷)`
              }}
            </p>
          </div>
          <span class="font-black text-ios-blue dark:text-ios-blue-dark text-sm">{{ store.dailyGoalMl }} ml</span>
        </div>
      </div>
    </div>

    <!-- 模块 2: 快捷打卡容量按钮管理 -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08] space-y-3">
      <!-- 可折叠标题栏 -->
      <div
        class="flex items-center justify-between cursor-pointer select-none"
        @click="toggleSection('volumes')"
      >
        <div class="flex items-center space-x-1.5">
          <SlidersHorizontal class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">快捷容量按钮管理</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-[10px] text-slate-400 font-mono">{{ store.settings.presetVolumes.join(' / ') }} ml</span>
          <ChevronDown
            class="w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="{ '-rotate-90': !openSections.volumes }"
          />
        </div>
      </div>

      <div v-show="openSections.volumes" class="space-y-3 pt-1">
        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="(_, index) in presetVolumesEdit"
            :key="index"
            class="flex flex-col items-center p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60"
          >
            <span class="text-[10px] text-slate-400 mb-1">槽位 {{ index + 1 }}</span>
            <div class="flex items-center">
              <input
                type="number"
                v-model.number="presetVolumesEdit[index]"
                min="50"
                max="2000"
                step="50"
                class="w-14 text-center font-bold text-xs bg-transparent border-b border-ios-blue/40 focus:outline-hidden focus:border-ios-blue"
              />
              <span class="text-[9px] text-slate-400 ml-0.5">ml</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="w-full py-2 rounded-xl text-xs font-bold bg-ios-blue/10 dark:bg-ios-blue-dark/20 text-ios-blue dark:text-ios-blue-dark hover:bg-ios-blue/20 active:scale-95 transition-all cursor-pointer"
          @click="savePresetVolumes"
        >
          保存快捷容量设置
        </button>
      </div>
    </div>

    <!-- 模块 3: 饮品库全量配置中心 (除了纯水外皆可删除) -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08] space-y-3">
      <!-- 可折叠标题栏 -->
      <div
        class="flex items-center justify-between cursor-pointer select-none"
        @click="toggleSection('beverages')"
      >
        <div class="flex items-center space-x-1.5">
          <Coffee class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">饮品库管理中心</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-[10px] text-slate-400">已配置 {{ beverages.length }} 种饮品</span>
          <ChevronDown
            class="w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="{ '-rotate-90': !openSections.beverages }"
          />
        </div>
      </div>

      <div v-show="openSections.beverages" class="space-y-3 pt-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-slate-400">管理饮品开关、补水折算率或删除</span>
          <div class="flex items-center space-x-2">
            <button
              type="button"
              class="text-[11px] text-slate-500 hover:text-ios-blue hover:underline cursor-pointer flex items-center space-x-0.5"
              title="恢复系统初始内置饮品列表"
              @click="store.resetDefaultBeverages"
            >
              <RotateCcw class="w-3 h-3" :stroke-width="2.2" />
              <span>重置预设</span>
            </button>
            <button
              type="button"
              class="text-[11px] font-bold text-ios-blue hover:underline cursor-pointer flex items-center space-x-0.5"
              @click="showAddBevModal = true"
            >
              <Plus class="w-3 h-3" :stroke-width="2.5" />
              <span>新增饮品</span>
            </button>
          </div>
        </div>

        <!-- 饮品列表 -->
        <div class="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-none">
          <div
            v-for="bev in beverages"
            :key="bev.id"
            class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700/50"
          >
            <div class="flex items-center space-x-2">
              <button
                type="button"
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors cursor-pointer"
                :class="[
                  bev.enabled !== false
                    ? 'bg-ios-blue text-white border-ios-blue'
                    : 'bg-slate-200 dark:bg-zinc-700 text-slate-400 border-transparent'
                ]"
                title="切换启用状态"
                @click="toggleBeverage(bev.id)"
              >
                {{ bev.enabled !== false ? '✓' : '—' }}
              </button>
              <div>
                <div class="flex items-center space-x-1">
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ bev.name.split(' ')[0] }}</span>
                  <span v-if="bev.isFixed" class="text-[9px] px-1 py-0.2 rounded-md bg-ios-blue/10 text-ios-blue font-bold">基础基石</span>
                </div>
                <div class="flex items-center space-x-1.5 text-[10px] text-slate-400">
                  <span>补水系数: {{ Math.round(bev.hydrationFactor * 100) }}%</span>
                </div>
              </div>
            </div>

            <!-- 系数调节与删除（除纯水外皆可删除） -->
            <div class="flex items-center space-x-2">
              <input
                type="number"
                v-model.number="bev.hydrationFactor"
                min="0.1"
                max="1.5"
                step="0.05"
                class="w-12 text-center text-xs font-mono font-bold bg-white dark:bg-zinc-700 rounded-md border border-slate-200 dark:border-zinc-600 py-0.5"
                title="修改有效补水率系数"
                @change="store.updateBeverage(bev.id, { hydrationFactor: bev.hydrationFactor })"
              />
              <button
                v-if="!bev.isFixed"
                type="button"
                class="w-6 h-6 rounded-lg text-slate-400 hover:text-ios-red hover:bg-ios-red/10 flex items-center justify-center cursor-pointer transition-colors"
                title="删除此饮品"
                @click="store.deleteBeverage(bev.id)"
              >
                <Trash2 class="w-3.5 h-3.5" :stroke-width="2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模块 4: 微健康习惯配置中心 -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08] space-y-3">
      <!-- 可折叠标题栏 -->
      <div
        class="flex items-center justify-between cursor-pointer select-none"
        @click="toggleSection('habits')"
      >
        <div class="flex items-center space-x-1.5">
          <HeartPulse class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">健康习惯配置中心</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-[10px] text-slate-400">已启用 {{ habits.filter(h => h.enabled !== false).length }} 项</span>
          <ChevronDown
            class="w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="{ '-rotate-90': !openSections.habits }"
          />
        </div>
      </div>

      <div v-show="openSections.habits" class="space-y-3 pt-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-slate-400">配置各维度目标次数与启用状态</span>
          <button
            type="button"
            class="text-[11px] font-bold text-ios-blue hover:underline cursor-pointer flex items-center space-x-0.5"
            @click="showAddHabitModal = true"
          >
            <Plus class="w-3 h-3" :stroke-width="2.5" />
            <span>新增习惯</span>
          </button>
        </div>

        <!-- 习惯列表 -->
        <div class="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-none">
          <div
            v-for="habit in habits"
            :key="habit.id"
            class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700/50"
          >
            <div class="flex items-center space-x-2">
              <button
                type="button"
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors cursor-pointer"
                :class="[
                  habit.enabled !== false
                    ? 'bg-ios-green text-white border-ios-green'
                    : 'bg-slate-200 dark:bg-zinc-700 text-slate-400 border-transparent'
                ]"
                title="切换启用状态"
                @click="store.updateHabit(habit.id, { enabled: !habit.enabled })"
              >
                {{ habit.enabled !== false ? '✓' : '—' }}
              </button>
              <div>
                <div class="flex items-center space-x-1.5">
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ habit.title }}</span>
                  <span
                    class="text-[9px] px-1.5 py-0.5 rounded-md font-bold flex items-center space-x-0.5"
                    :class="getHabitCategoryBadgeClass(habit.category)"
                  >
                    <component :is="getHabitCategoryIcon(habit.category)" class="w-2.5 h-2.5" :stroke-width="2.2" />
                    <span>{{ getHabitCategoryLabel(habit.category) }}</span>
                  </span>
                </div>
                <div class="flex items-center space-x-1.5 text-[10px] text-slate-400">
                  <span>每日目标: {{ habit.targetCount }} 次</span>
                  <span v-if="habit.intervalMinutes">({{ habit.intervalMinutes }}分钟)</span>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-1.5">
              <button
                type="button"
                class="w-5 h-5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
                @click="store.updateHabit(habit.id, { targetCount: Math.max(1, habit.targetCount - 1) })"
              >
                -
              </button>
              <span class="text-xs font-bold font-mono w-4 text-center">{{ habit.targetCount }}</span>
              <button
                type="button"
                class="w-5 h-5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
                @click="store.updateHabit(habit.id, { targetCount: Math.min(20, habit.targetCount + 1) })"
              >
                +
              </button>
              <button
                v-if="!habit.isSystem"
                type="button"
                class="w-6 h-6 rounded-lg text-slate-400 hover:text-ios-red hover:bg-ios-red/10 flex items-center justify-center cursor-pointer ml-1"
                title="删除此习惯"
                @click="store.deleteHabit(habit.id)"
              >
                <Trash2 class="w-3 h-3" :stroke-width="2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模块 5: 窗口行为、伴侣形态场景与体验偏好 -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08] space-y-3.5">
      <!-- 可折叠标题栏 -->
      <div
        class="flex items-center justify-between cursor-pointer select-none"
        @click="toggleSection('preferences')"
      >
        <div class="flex items-center space-x-1.5">
          <Sparkles class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">窗口与体验偏好</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-[10px] text-slate-400">形态 · 场景 · 托盘行为</span>
          <ChevronDown
            class="w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="{ '-rotate-90': !openSections.preferences }"
          />
        </div>
      </div>

      <div v-show="openSections.preferences" class="space-y-3.5 pt-1">
        <!-- 点击关闭行为 -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-200">点击关闭 (X) 时的窗口行为</span>
            <span class="text-[10px] text-slate-400">{{ closeBehavior === 'exit' ? '直接退出' : '托盘后台' }}</span>
          </div>
          <div class="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              type="button"
              class="py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
              :class="[
                closeBehavior === 'minimize'
                  ? 'bg-white dark:bg-zinc-700 text-ios-blue shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              ]"
              @click="setCloseBehavior('minimize')"
            >
              <span>最小化到托盘</span>
              <span class="text-[9px] opacity-70 font-normal">继续后台定时提醒</span>
            </button>

            <button
              type="button"
              class="py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center"
              :class="[
                closeBehavior === 'exit'
                  ? 'bg-white dark:bg-zinc-700 text-ios-red shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              ]"
              @click="setCloseBehavior('exit')"
            >
              <span>直接退出程序</span>
              <span class="text-[9px] opacity-70 font-normal">完全终结进程释放</span>
            </button>
          </div>
        </div>

        <!-- 水滴精灵伴侣总开关 -->
        <div class="flex items-center justify-between pt-1">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-200">水滴精灵「小若水」伴侣</span>
            <span class="text-[10px] text-slate-400">在首页展示萌系情绪演化与微生活场景</span>
          </div>
          <button
            type="button"
            class="w-11 h-6 rounded-full transition-colors duration-200 p-0.5 cursor-pointer"
            :class="[enableCompanion ? 'bg-ios-green' : 'bg-slate-300 dark:bg-zinc-700']"
            @click="enableCompanion = !enableCompanion"
          >
            <div
              class="w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200"
              :class="[enableCompanion ? 'translate-x-5' : 'translate-x-0']"
            ></div>
          </button>
        </div>

        <!-- 水滴精灵专属形态切换 (4 大独特形态) -->
        <div v-if="enableCompanion" class="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700/50 space-y-2 animate-in fade-in duration-150">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-200">小水滴幻化形态 (4 款)</span>
            <span class="text-[10px] text-slate-400">专属几何体与配件效果</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="morph in companionMorphOptions"
              :key="morph.value"
              type="button"
              class="p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-2"
              :class="[
                currentCompanionMorph === morph.value
                  ? 'bg-white dark:bg-zinc-800 border-ios-blue shadow-xs ring-1 ring-ios-blue/40 font-bold'
                  : 'bg-white/40 dark:bg-zinc-800/40 border-slate-200/60 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800'
              ]"
              @click="setCompanionMorph(morph.value)"
            >
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                :class="morph.iconBgClass"
              >
                <component :is="morph.icon" class="w-4 h-4" :stroke-width="2.2" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{{ morph.title }}</div>
                <p class="text-[10px] text-slate-400 truncate">{{ morph.desc }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- 水滴精灵生活微场景切换 (4 套环境微景观) -->
        <div v-if="enableCompanion" class="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700/50 space-y-2 animate-in fade-in duration-150">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-200">水滴生活微场景 (4 款)</span>
            <span class="text-[10px] text-slate-400">沉浸式专属底座与环境氛围</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="scene in companionSceneOptions"
              :key="scene.value"
              type="button"
              class="p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-2"
              :class="[
                currentCompanionScene === scene.value
                  ? 'bg-white dark:bg-zinc-800 border-ios-blue shadow-xs ring-1 ring-ios-blue/40 font-bold'
                  : 'bg-white/40 dark:bg-zinc-800/40 border-slate-200/60 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800'
              ]"
              @click="setCompanionScene(scene.value)"
            >
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                :class="scene.iconBgClass"
              >
                <component :is="scene.icon" class="w-4 h-4" :stroke-width="2.2" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{{ scene.title }}</div>
                <p class="text-[10px] text-slate-400 truncate">{{ scene.desc }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- 音效开关 -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <div class="flex items-center space-x-1.5">
              <Volume2 class="w-3.5 h-3.5 text-slate-500" :stroke-width="2" />
              <span class="text-xs font-bold text-slate-700 dark:text-slate-200">iOS 仿生水滴音效</span>
            </div>
            <span class="text-[10px] text-slate-400 mt-0.5">打卡与注入水分时伴随清脆微动效</span>
          </div>
          <button
            type="button"
            class="w-11 h-6 rounded-full transition-colors duration-200 p-0.5 cursor-pointer"
            :class="[soundEnabled ? 'bg-ios-green' : 'bg-slate-300 dark:bg-zinc-700']"
            @click="soundEnabled = !soundEnabled"
          >
            <div
              class="w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200"
              :class="[soundEnabled ? 'translate-x-5' : 'translate-x-0']"
            ></div>
          </button>
        </div>

        <!-- 桌面悬浮胶囊模式 -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <div class="flex items-center space-x-1.5">
              <Layers class="w-3.5 h-3.5 text-slate-500" :stroke-width="2" />
              <span class="text-xs font-bold text-slate-700 dark:text-slate-200">桌面微型悬浮胶囊</span>
            </div>
            <span class="text-[10px] text-slate-400 mt-0.5">收缩为屏幕边缘极简半透明水滴</span>
          </div>
          <button
            type="button"
            class="px-3 py-1.5 rounded-full text-[11px] font-bold bg-ios-blue hover:bg-ios-blue/90 text-white shadow-sm active:scale-95 transition-all cursor-pointer"
            @click="store.setMiniMode(true)"
          >
            立即开启
          </button>
        </div>

        <!-- 主题外观选择 -->
        <div class="flex items-center justify-between pt-1">
          <span class="text-xs font-medium text-slate-700 dark:text-slate-200">色彩模式</span>
          <div class="flex items-center space-x-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-full border border-slate-200/50 dark:border-zinc-700/50">
            <button
              type="button"
              class="px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1"
              :class="[theme === 'light' ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500']"
              @click="setTheme('light')"
            >
              <Sun class="w-3 h-3" :stroke-width="2" />
              <span>浅色</span>
            </button>
            <button
              type="button"
              class="px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1"
              :class="[theme === 'dark' ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500']"
              @click="setTheme('dark')"
            >
              <Moon class="w-3 h-3" :stroke-width="2" />
              <span>深色</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模块 6: 心流番茄钟协同偏好 (新增) -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08] space-y-3.5">
      <!-- 可折叠标题栏 -->
      <div
        class="flex items-center justify-between cursor-pointer select-none"
        @click="toggleSection('pomodoro')"
      >
        <div class="flex items-center space-x-1.5">
          <Timer class="w-4 h-4 text-sky-500" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">心流番茄钟协同偏好</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-[10px] text-slate-400">预设 · 声景联动 · 工间补水</span>
          <ChevronDown
            class="w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="{ '-rotate-90': !openSections.pomodoro }"
          />
        </div>
      </div>

      <div v-show="openSections.pomodoro" class="space-y-3 pt-1">
        <!-- 默认专注模式 -->
        <div class="space-y-1.5">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-200">默认专注心流模式</span>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="preset in pomodoroPresets"
              :key="preset.id"
              type="button"
              class="p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-2"
              :class="[
                store.pomodoroMode === preset.id
                  ? 'bg-sky-50/50 dark:bg-sky-950/30 border-sky-400 dark:border-sky-500 text-sky-700 dark:text-sky-300 shadow-xs ring-1 ring-sky-400/30 font-bold'
                  : 'bg-white/40 dark:bg-zinc-800/40 border-slate-200/60 dark:border-zinc-700/60 text-slate-600 dark:text-slate-300'
              ]"
              @click="store.setPomodoroMode(preset.id)"
            >
              <div class="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200/40 flex items-center justify-center text-sky-500 shrink-0">
                <component :is="getPresetIcon(preset.id)" class="w-3.5 h-3.5" :stroke-width="2.2" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold truncate">{{ preset.name }}</div>
                <div class="text-[10px] text-slate-400 truncate">{{ preset.tag }}</div>
              </div>
            </button>
          </div>
        </div>

        <!-- 联动开关 1: 随专注自动播放白噪音 -->
        <div class="flex items-center justify-between pt-1">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-200">随专注自动淡入自然声景</span>
            <span class="text-[10px] text-slate-400">开启心流自动启动选定背景音，暂停/完成自动停播</span>
          </div>
          <button
            type="button"
            class="w-11 h-6 rounded-full transition-colors duration-200 p-0.5 cursor-pointer"
            :class="[store.settings.autoSoundscapeSync ? 'bg-ios-blue' : 'bg-slate-300 dark:bg-zinc-700']"
            @click="store.updateSettings({ autoSoundscapeSync: !store.settings.autoSoundscapeSync })"
          >
            <div
              class="w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200"
              :class="[store.settings.autoSoundscapeSync ? 'translate-x-5' : 'translate-x-0']"
            ></div>
          </button>
        </div>

        <!-- 联动开关 2: 专注达成提示工间补水 -->
        <div class="flex items-center justify-between pt-1">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-200">专注达成引导工间补水</span>
            <span class="text-[10px] text-slate-400">计时结束弹窗提示补充 200ml 水分并活动肩颈</span>
          </div>
          <button
            type="button"
            class="w-11 h-6 rounded-full transition-colors duration-200 p-0.5 cursor-pointer"
            :class="[store.settings.promptHydrationOnPomodoroComplete !== false ? 'bg-ios-green' : 'bg-slate-300 dark:bg-zinc-700']"
            @click="store.updateSettings({ promptHydrationOnPomodoroComplete: store.settings.promptHydrationOnPomodoroComplete === false })"
          >
            <div
              class="w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200"
              :class="[store.settings.promptHydrationOnPomodoroComplete !== false ? 'translate-x-5' : 'translate-x-0']"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <!-- 模块 7: 绿色本地持久化与数据备份恢复 -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-ios-card border border-black/[0.06] dark:border-white/[0.08] space-y-3">
      <!-- 可折叠标题栏 -->
      <div
        class="flex items-center justify-between cursor-pointer select-none"
        @click="toggleSection('backup')"
      >
        <div class="flex items-center space-x-1.5">
          <Database class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">数据存储与备份恢复</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">本地 data/ 绿色便携</span>
          <ChevronDown
            class="w-4 h-4 text-slate-400 transition-transform duration-200"
            :class="{ '-rotate-90': !openSections.backup }"
          />
        </div>
      </div>

      <div v-show="openSections.backup" class="space-y-3 pt-1">
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700/50 text-xs space-y-1">
          <div class="flex items-center space-x-1 text-slate-700 dark:text-slate-200 font-bold">
            <span class="text-emerald-500">●</span>
            <span>本地绿色存储已就绪</span>
          </div>
          <p class="text-[10px] text-slate-400">
            全部健康数据、打卡记录与个性化设置均自动实时写入应用根目录下的 <span class="font-mono text-slate-600 dark:text-slate-300">data/vitalpulse_data.json</span> 文件中，随应用文件夹复制便携迁移。
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center justify-center space-x-1 cursor-pointer transition-all"
            @click="handleExportJson"
          >
            <Download class="w-3.5 h-3.5" :stroke-width="2" />
            <span>{{ copiedExport ? '已复制 JSON' : '复制数据备份' }}</span>
          </button>

          <button
            type="button"
            class="py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center justify-center space-x-1 cursor-pointer transition-all"
            @click="showImportModal = true"
          >
            <Upload class="w-3.5 h-3.5" :stroke-width="2" />
            <span>导入数据恢复</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 弹窗 1: 新增自定义饮品 -->
    <div
      v-if="showAddBevModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    >
      <div class="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-2xl border border-white/40 dark:border-white/10 select-none animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">新增自定义饮品</span>
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
            @click="showAddBevModal = false"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3 my-2 text-xs">
          <div>
            <label class="block text-slate-500 mb-1">饮品名称</label>
            <input
              type="text"
              v-model="newBevName"
              placeholder="例如：生椰拿铁、枸杞茶"
              class="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-hidden focus:border-ios-blue"
            />
          </div>

          <div>
            <div class="flex justify-between mb-1">
              <span class="text-slate-500">有效补水系数</span>
              <span class="font-bold text-ios-blue">{{ Math.round(newBevFactor * 100) }}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.2"
              step="0.05"
              v-model.number="newBevFactor"
              class="w-full accent-ios-blue cursor-pointer"
            />
          </div>
        </div>

        <div class="flex space-x-2 mt-4">
          <button
            type="button"
            class="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            @click="showAddBevModal = false"
          >
            取消
          </button>
          <button
            type="button"
            class="flex-1 py-2 rounded-xl text-xs font-bold bg-ios-blue text-white shadow-sm cursor-pointer"
            @click="confirmAddBeverage"
          >
            确认添加
          </button>
        </div>
      </div>
    </div>

    <!-- 弹窗 2: 新增自定义习惯 (纯矢量分类) -->
    <div
      v-if="showAddHabitModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    >
      <div class="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-2xl border border-white/40 dark:border-white/10 select-none animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">新增微健康习惯</span>
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
            @click="showAddHabitModal = false"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3 my-2 text-xs">
          <div>
            <label class="block text-slate-500 mb-1">习惯分类</label>
            <div class="grid grid-cols-3 gap-1.5">
              <button
                v-for="cat in habitCategoryOptions"
                :key="cat.value"
                type="button"
                class="py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center space-x-1"
                :class="[
                  newHabitCategory === cat.value
                    ? 'bg-ios-blue text-white border-ios-blue shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300'
                ]"
                @click="newHabitCategory = cat.value"
              >
                <component :is="cat.icon" class="w-3.5 h-3.5" :stroke-width="2.2" />
                <span>{{ cat.label }}</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-slate-500 mb-1">习惯标题</label>
            <input
              type="text"
              v-model="newHabitTitle"
              placeholder="例如：桌面颈椎伸展"
              class="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-hidden focus:border-ios-blue"
            />
          </div>

          <div>
            <label class="block text-slate-500 mb-1">副标题描述</label>
            <input
              type="text"
              v-model="newHabitSubtitle"
              placeholder="例如：轻柔转动颈部，舒缓肩周"
              class="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-hidden focus:border-ios-blue"
            />
          </div>

          <div>
            <div class="flex justify-between mb-1">
              <span class="text-slate-500">每日打卡目标次数</span>
              <span class="font-bold text-ios-blue">{{ newHabitTarget }} 次</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              v-model.number="newHabitTarget"
              class="w-full accent-ios-blue cursor-pointer"
            />
          </div>
        </div>

        <div class="flex space-x-2 mt-4">
          <button
            type="button"
            class="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            @click="showAddHabitModal = false"
          >
            取消
          </button>
          <button
            type="button"
            class="flex-1 py-2 rounded-xl text-xs font-bold bg-ios-blue text-white shadow-sm cursor-pointer"
            @click="confirmAddHabit"
          >
            确认添加
          </button>
        </div>
      </div>
    </div>

    <!-- 弹窗 3: 导入数据 JSON -->
    <div
      v-if="showImportModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    >
      <div class="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-2xl border border-white/40 dark:border-white/10 select-none animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100">粘贴 JSON 备份数据</span>
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
            @click="showImportModal = false"
          >
            ✕
          </button>
        </div>

        <textarea
          v-model="importJsonText"
          rows="5"
          placeholder="在此粘贴之前导出的备份 JSON 内容..."
          class="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-mono border border-slate-200 dark:border-zinc-700 focus:outline-hidden focus:border-ios-blue my-2"
        ></textarea>

        <div class="flex space-x-2 mt-2">
          <button
            type="button"
            class="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 cursor-pointer"
            @click="showImportModal = false"
          >
            取消
          </button>
          <button
            type="button"
            class="flex-1 py-2 rounded-xl text-xs font-bold bg-ios-blue text-white shadow-sm cursor-pointer"
            @click="confirmImportJson"
          >
            确认恢复
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import {
  Scale,
  SlidersHorizontal,
  Coffee,
  HeartPulse,
  Sparkles,
  Volume2,
  Layers,
  Sun,
  Moon,
  Database,
  Download,
  Upload,
  Plus,
  Trash2,
  RotateCcw,
  ChevronDown,
  Activity,
  Apple,
  Droplets,
  Snowflake,
  Leaf,
  Zap,
  MountainSnow,
  Sunrise,
  Trees,
  Orbit,
  Timer,
  Compass,
  Flame
} from 'lucide-vue-next'
import { useHealthStore } from '@/stores/health'
import type { ActivityLevel } from '@/utils/calculator'
import {
  type HabitCategory,
  type CompanionMorph,
  type CompanionScene,
  type PomodoroMode,
  POMODORO_PRESETS
} from '@/types'

const store = useHealthStore()

// 1. 各模块折叠收缩状态机 (默认常用关键模块展开，精细配置模块可收起)
const openSections = ref<Record<string, boolean>>({
  mode: true,
  calc: true,
  volumes: false,
  beverages: false,
  habits: false,
  pomodoro: false,
  preferences: true,
  backup: false
})

const pomodoroPresets = POMODORO_PRESETS

function getPresetIcon(mode: PomodoroMode): Component {
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

function toggleSection(key: string): void {
  openSections.value[key] = !openSections.value[key]
}

const allSectionsExpanded = computed(() => {
  return Object.values(openSections.value).every(Boolean)
})

function toggleAllSections(): void {
  const target = !allSectionsExpanded.value
  Object.keys(openSections.value).forEach((k) => {
    openSections.value[k] = target
  })
}

// 2. 算法与身体设置
const activityOptions: { label: string; value: ActivityLevel }[] = [
  { label: '久坐', value: 'sedentary' },
  { label: '轻度', value: 'light' },
  { label: '中度', value: 'moderate' },
  { label: '高强度', value: 'heavy' }
]

const weight = computed({
  get: () => store.settings.weightKg,
  set: (val: number) => store.updateSettings({ weightKg: val })
})

const activityLevel = computed({
  get: () => store.settings.activityLevel,
  set: (val: ActivityLevel) => store.updateSettings({ activityLevel: val })
})

const soundEnabled = computed({
  get: () => store.settings.soundEnabled,
  set: (val: boolean) => store.updateSettings({ soundEnabled: val })
})

const enableCompanion = computed({
  get: () => store.settings.enableCompanion,
  set: (val: boolean) => store.updateSettings({ enableCompanion: val })
})

// 3. 水滴精灵幻化形态选项 (4 款独特外观与配饰，纯正矢量设计)
const companionMorphOptions: {
  value: CompanionMorph
  title: string
  icon: Component
  desc: string
  iconBgClass: string
}[] = [
  {
    value: 'classic_aqua',
    title: '经典若水',
    icon: Droplets,
    desc: '一体生芽·运动发带',
    iconBgClass: 'bg-sky-50 dark:bg-sky-950/40 text-sky-500 border border-sky-200/50 dark:border-sky-800/50'
  },
  {
    value: 'frost_crystal',
    title: '极地冰晶',
    icon: Snowflake,
    desc: '微晶冰冠·战意玄冰',
    iconBgClass: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 border border-cyan-200/50 dark:border-cyan-800/50'
  },
  {
    value: 'matcha_spirit',
    title: '治愈茶灵',
    icon: Leaf,
    desc: '双茶尖芽·禅武摇摇杯',
    iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-200/50 dark:border-emerald-800/50'
  },
  {
    value: 'cyber_spark',
    title: '电光星核',
    icon: Zap,
    desc: '机甲流线·外骨骼星核',
    iconBgClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-500 border border-purple-200/50 dark:border-purple-800/50'
  }
]

const currentCompanionMorph = computed(() => store.settings.companionMorph || 'classic_aqua')

function setCompanionMorph(morph: CompanionMorph): void {
  store.setCompanionMorph(morph)
}

// 4. 水滴精灵生活微场景选项 (4 款环境景观底座，纯正矢量设计)
const companionSceneOptions: {
  value: CompanionScene
  title: string
  icon: Component
  desc: string
  iconBgClass: string
}[] = [
  {
    value: 'polar_glacier',
    title: '极地冰原',
    icon: MountainSnow,
    desc: '新月雪山，暗林星轨 (图2)',
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 border border-indigo-200/50 dark:border-indigo-800/50'
  },
  {
    value: 'zen_study',
    title: '晨曦书桌',
    icon: Sunrise,
    desc: '破晓暖阳，多肉木案',
    iconBgClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-200/50 dark:border-amber-800/50'
  },
  {
    value: 'matcha_garden',
    title: '禅意茶庭',
    icon: Trees,
    desc: '青碧竹影，水月青石',
    iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-200/50 dark:border-emerald-800/50'
  },
  {
    value: 'cyber_nebula',
    title: '赛博星舱',
    icon: Orbit,
    desc: '聚能浮环，星云矩阵',
    iconBgClass: 'bg-violet-50 dark:bg-violet-950/40 text-violet-500 border border-violet-200/50 dark:border-violet-800/50'
  }
]

const currentCompanionScene = computed(() => store.settings.companionScene || 'polar_glacier')

function setCompanionScene(scene: CompanionScene): void {
  store.setCompanionScene(scene)
}

// 5. 窗口关闭行为
const closeBehavior = computed({
  get: () => store.settings.closeBehavior,
  set: (val: 'minimize' | 'exit') => store.updateSettings({ closeBehavior: val })
})

function setCloseBehavior(val: 'minimize' | 'exit'): void {
  store.updateSettings({ closeBehavior: val })
}

// 6. 主题模式
const theme = computed(() => store.settings.theme)

function setTheme(val: 'light' | 'dark' | 'system'): void {
  store.updateSettings({ theme: val })
  if (val === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// 7. 快捷容量预设管理
const presetVolumesEdit = ref<number[]>([...store.settings.presetVolumes])

function savePresetVolumes(): void {
  store.updatePresetVolumes(presetVolumesEdit.value)
  window.electronAPI?.sendNotification('设置已保存', '快捷打卡容量已更新！')
}

// 8. 饮品管理
const beverages = computed(() => store.beverages)
const showAddBevModal = ref(false)
const newBevName = ref('')
const newBevFactor = ref(0.85)

function toggleBeverage(id: string): void {
  const b = store.beverages.find((item) => item.id === id)
  if (b) {
    store.updateBeverage(id, { enabled: b.enabled === false })
  }
}

function confirmAddBeverage(): void {
  if (!newBevName.value.trim()) return
  store.addCustomBeverage({
    name: newBevName.value.trim(),
    icon: 'Droplet',
    hydrationFactor: newBevFactor.value,
    color: '#007AFF',
    category: 'custom',
    description: '用户自定义饮品'
  })
  newBevName.value = ''
  showAddBevModal.value = false
}

// 9. 习惯管理与纯矢量分类系统
const habits = computed(() => store.habits)
const showAddHabitModal = ref(false)
const newHabitTitle = ref('')
const newHabitSubtitle = ref('')
const newHabitTarget = ref(3)
const newHabitCategory = ref<HabitCategory>('movement')

const habitCategoryOptions: {
  value: HabitCategory
  label: string
  icon: Component
}[] = [
  { value: 'movement', label: '动作体态', icon: Activity },
  { value: 'nutrition', label: '营养膳食', icon: Apple },
  { value: 'mindfulness', label: '身心恢复', icon: Sparkles }
]

function getHabitCategoryLabel(cat?: HabitCategory): string {
  switch (cat) {
    case 'nutrition':
      return '营养'
    case 'mindfulness':
      return '身心'
    case 'movement':
    default:
      return '动作'
  }
}

function getHabitCategoryIcon(cat?: HabitCategory): Component {
  switch (cat) {
    case 'nutrition':
      return Apple
    case 'mindfulness':
      return Sparkles
    case 'movement':
    default:
      return Activity
  }
}

function getHabitCategoryBadgeClass(cat?: HabitCategory): string {
  switch (cat) {
    case 'nutrition':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
    case 'mindfulness':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
    case 'movement':
    default:
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
  }
}

function confirmAddHabit(): void {
  if (!newHabitTitle.value.trim()) return
  store.addCustomHabit({
    title: newHabitTitle.value.trim(),
    subTitle: newHabitSubtitle.value.trim() || '每日自主健康打卡',
    icon: 'Sparkles',
    color: '#007AFF',
    enabled: true,
    targetCount: newHabitTarget.value,
    category: newHabitCategory.value
  })
  newHabitTitle.value = ''
  newHabitSubtitle.value = ''
  newHabitCategory.value = 'movement'
  showAddHabitModal.value = false
}

// 10. 数据导入导出
const copiedExport = ref(false)
const showImportModal = ref(false)
const importJsonText = ref('')

function handleExportJson(): void {
  const jsonStr = store.exportDataJson()
  navigator.clipboard.writeText(jsonStr)
  copiedExport.value = true
  setTimeout(() => {
    copiedExport.value = false
  }, 2500)
}

function confirmImportJson(): void {
  if (!importJsonText.value.trim()) return
  const success = store.importDataJson(importJsonText.value.trim())
  if (success) {
    showImportModal.value = false
    importJsonText.value = ''
    window.electronAPI?.sendNotification('导入成功', '健康数据已完整恢复！')
  } else {
    alert('JSON 格式有误，导入失败，请检查数据！')
  }
}
</script>
