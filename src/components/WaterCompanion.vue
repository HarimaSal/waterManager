<template>
  <div class="w-full flex flex-col items-center select-none py-1 relative">
    <!-- 1. 灵动微景观生态箱主体卡片 (Living Diorama Habitats Card - 参考图 2 艺术意境) -->
    <div
      class="w-full max-w-sm rounded-3xl overflow-hidden relative border border-black/[0.08] dark:border-white/[0.12] shadow-ios-card transition-all duration-500 cursor-pointer group"
      @click="handlePetCompanion"
    >
      <!-- 卡片顶栏操作区：场景切换与互动提示 -->
      <div class="relative z-20 flex items-center justify-between px-3.5 pt-3 pb-1">
        <!-- 所在场景切换微胶囊 (纯矢量图标) -->
        <button
          type="button"
          class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/20 hover:bg-black/30 dark:bg-white/10 dark:hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
          title="点击切换水滴生活场景"
          @click.stop="showSceneModal = true"
        >
          <component :is="currentSceneMeta.icon" class="w-3 h-3 opacity-90" :stroke-width="2.2" />
          <span>{{ currentSceneMeta.title }}</span>
          <ChevronDown class="w-3 h-3 opacity-75" :stroke-width="2.5" />
        </button>

        <!-- 互动小提示与形态切换微胶囊 (支持首页直接切换小水滴外貌皮肤，纯矢量图标) -->
        <div class="flex items-center space-x-1.5 text-white/80">
          <button
            type="button"
            class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/20 hover:bg-black/30 dark:bg-white/10 dark:hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
            title="点击切换小水滴外貌皮肤形态"
            @click.stop="showMorphModal = true"
          >
            <component :is="currentMorphMeta.icon" class="w-3 h-3 opacity-90" :stroke-width="2.2" />
            <span>{{ currentMorphMeta.title }}</span>
            <ChevronDown class="w-3 h-3 opacity-75" :stroke-width="2.5" />
          </button>
          <span class="text-[10px] opacity-75 hidden sm:inline">轻触互动</span>
        </div>
      </div>

      <!-- 2. 灵动对话气泡 (Speech Bubble - 支持自适应完整展开与收起) -->
      <div
        class="relative z-20 mx-auto mt-1 mb-2 transition-all duration-300 ease-out bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-md border border-white/40 dark:border-white/10 cursor-pointer select-text"
        :class="[
          isSpeechExpanded
            ? 'w-[92%] max-w-[320px] p-2.5 ring-1 ring-ios-blue/20'
            : 'max-w-[280px] px-3 py-1.5'
        ]"
        @click.stop="isSpeechExpanded = !isSpeechExpanded"
      >
        <!-- (1) 折叠简报形态 -->
        <div v-if="!isSpeechExpanded" class="flex items-center space-x-1.5">
          <component :is="moodLucideIcon" class="w-3.5 h-3.5 shrink-0" :class="moodLucideColor" :stroke-width="2.2" />
          <p class="text-[11px] font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight truncate flex-1 min-w-0">
            {{ currentSpeech }}
          </p>
          <button
            type="button"
            class="shrink-0 text-[10px] text-ios-blue dark:text-sky-400 font-semibold px-1 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center cursor-pointer"
            title="点击展开完整建议"
            @click.stop="isSpeechExpanded = true"
          >
            <span>展开</span>
            <ChevronDown class="w-3 h-3 ml-0.5" :stroke-width="2.5" />
          </button>
        </div>

        <!-- (2) 舒展完整形态：多行自适应无截断呈现 -->
        <div v-else class="flex flex-col space-y-1.5">
          <div class="flex items-center justify-between w-full border-b border-black/[0.06] dark:border-white/[0.08] pb-1">
            <div class="flex items-center space-x-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <component :is="moodLucideIcon" class="w-3.5 h-3.5 shrink-0" :class="moodLucideColor" :stroke-width="2.2" />
              <span>水滴伴侣 · 科学健康贴士</span>
            </div>
            <button
              type="button"
              class="text-[10px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-1 py-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center cursor-pointer"
              title="点击收起"
              @click.stop="isSpeechExpanded = false"
            >
              <span>收起</span>
              <ChevronUp class="w-3 h-3 ml-0.5" :stroke-width="2.5" />
            </button>
          </div>
          <p class="text-[11px] font-semibold text-slate-800 dark:text-slate-100 tracking-normal leading-relaxed break-words whitespace-normal px-0.5">
            {{ currentSpeech }}
          </p>
        </div>
      </div>

      <!-- 3. 多层深度艺术微景观背景 (Multi-Layer Depth Scenery - 参考图 2 意境) -->
      <div class="relative w-full h-44 overflow-hidden flex items-end justify-center">
        <!-- (1) 场景一：极地冰原 · 纯澈新月 (Polar Moonlit Ridge - 100% 对齐图 2 星夜雪山与暗色冷杉) -->
        <div v-if="currentScene === 'polar_glacier'" class="absolute inset-0">
          <svg class="w-full h-full" viewBox="0 0 360 176" preserveAspectRatio="none">
            <defs>
              <linearGradient id="polarSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#080F1D" />
                <stop offset="50%" stop-color="#0F1F38" />
                <stop offset="100%" stop-color="#1B355A" />
              </linearGradient>
              <linearGradient id="polarFarMountain" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#2D4A77" />
                <stop offset="100%" stop-color="#132742" />
              </linearGradient>
              <linearGradient id="polarNearMountain" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#1E3A5F" />
                <stop offset="100%" stop-color="#0C1B2F" />
              </linearGradient>
              <linearGradient id="polarIceGround" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#38BDF8" />
                <stop offset="100%" stop-color="#0284C7" />
              </linearGradient>
            </defs>

            <!-- 远景：深邃星夜夜空 -->
            <rect width="360" height="176" fill="url(#polarSkyGrad)" />

            <!-- 图 2 同款：银白色皎洁细新月 (Crescent Moon) 与柔和月晕 -->
            <circle cx="270" cy="30" r="14" fill="#E0F2FE" opacity="0.15" />
            <path d="M 270 20 A 10 10 0 1 0 280 30 A 8.5 8.5 0 1 1 270 20 Z" fill="#F0F9FF" />

            <!-- 繁星点点与闪烁微光星尘 -->
            <circle cx="45" cy="22" r="1" fill="#FFFFFF" opacity="0.8" />
            <circle cx="85" cy="38" r="1.2" fill="#FFFFFF" opacity="0.9" />
            <circle cx="130" cy="18" r="0.8" fill="#FFFFFF" opacity="0.7" />
            <circle cx="190" cy="28" r="1.4" fill="#FFFFFF" opacity="0.85" />
            <circle cx="320" cy="24" r="1" fill="#FFFFFF" opacity="0.8" />
            <circle cx="340" cy="42" r="1.2" fill="#FFFFFF" opacity="0.75" />

            <!-- 图 2 同款：优美金色虚线星轨/星座轨迹 (Dashed Golden Arc) -->
            <path
              d="M 20 85 Q 160 30, 340 75"
              stroke="#FDE68A"
              stroke-width="1.2"
              stroke-dasharray="3 4"
              opacity="0.35"
              fill="none"
            />

            <!-- 中景：多层起伏幽蓝雪山剪影 (Layered Mountain Silhouettes) -->
            <!-- 远景雪山峰 -->
            <polygon points="40,110 120,50 180,115" fill="url(#polarFarMountain)" opacity="0.85" />
            <polygon points="120,50 135,68 120,72 108,66" fill="#E2E8F0" opacity="0.75" />
            <polygon points="150,115 220,58 300,120" fill="url(#polarFarMountain)" opacity="0.9" />
            <polygon points="220,58 232,74 220,78 208,72" fill="#E2E8F0" opacity="0.75" />

            <!-- 近景雪山脊 -->
            <polygon points="-20,130 70,75 160,135" fill="url(#polarNearMountain)" />
            <polygon points="210,140 290,70 380,140" fill="url(#polarNearMountain)" />

            <!-- 山间幽蓝晨雾与微霜层 -->
            <rect x="0" y="115" width="360" height="25" fill="#38BDF8" opacity="0.12" />

            <!-- 图 2 同款：前景左侧与右侧深暗冷杉树群剪影 (Dark Pine Forest Silhouettes) -->
            <!-- 左侧松树丛 -->
            <polygon points="12,145 20,115 28,145" fill="#060C17" />
            <polygon points="22,150 30,120 38,150" fill="#091220" />
            <polygon points="0,155 10,125 20,155" fill="#040810" />

            <!-- 右侧松树丛 -->
            <polygon points="325,148 335,118 345,148" fill="#091220" />
            <polygon points="338,152 348,122 358,152" fill="#060C17" />
            <polygon points="315,155 325,128 335,155" fill="#040810" />

            <!-- 前景基座：浮冰平台 (Glacier Ice Floe Pedestal) -->
            <ellipse cx="180" cy="155" rx="75" ry="16" fill="url(#polarIceGround)" opacity="0.75" />
            <ellipse cx="180" cy="153" rx="70" ry="13" fill="#E0F2FE" opacity="0.4" />
          </svg>
        </div>

        <!-- (2) 场景二：晨曦书桌 · 极简工位 (Zen Morning Study) -->
        <div v-else-if="currentScene === 'zen_study'" class="absolute inset-0">
          <svg class="w-full h-full" viewBox="0 0 360 176" preserveAspectRatio="none">
            <defs>
              <linearGradient id="studySkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FEF3C7" />
                <stop offset="50%" stop-color="#FDE68A" />
                <stop offset="100%" stop-color="#BAE6FD" />
              </linearGradient>
              <linearGradient id="studyWoodDesk" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#B45309" />
                <stop offset="50%" stop-color="#D97706" />
                <stop offset="100%" stop-color="#B45309" />
              </linearGradient>
            </defs>

            <!-- 远景：破晓暖阳金色晨曦 -->
            <rect width="360" height="176" fill="url(#studySkyGrad)" />

            <!-- 窗外柔和破晓朝阳 -->
            <circle cx="180" cy="40" r="32" fill="#F59E0B" opacity="0.25" />
            <circle cx="180" cy="40" r="20" fill="#FDE047" opacity="0.4" />

            <!-- 极简木窗框与晨曦山脊远景 -->
            <line x1="0" y1="80" x2="360" y2="80" stroke="#FFFFFF" stroke-width="2" opacity="0.5" />
            <line x1="180" y1="0" x2="180" y2="135" stroke="#FFFFFF" stroke-width="2" opacity="0.5" />
            <polygon points="30,80 80,65 140,80" fill="#CBD5E1" opacity="0.45" />
            <polygon points="220,80 280,60 340,80" fill="#CBD5E1" opacity="0.45" />

            <!-- 晨光微光粒子与微尘浮游 -->
            <circle cx="70" cy="45" r="1.5" fill="#F59E0B" opacity="0.5" />
            <circle cx="130" cy="30" r="2" fill="#F59E0B" opacity="0.6" />
            <circle cx="240" cy="48" r="1.8" fill="#F59E0B" opacity="0.5" />

            <!-- 左侧室内多肉盆栽剪影 -->
            <rect x="25" y="120" width="18" height="18" rx="3" fill="#64748B" opacity="0.65" />
            <path d="M 28 120 Q 20 100, 34 105 Q 40 115, 34 120 Z" fill="#10B981" opacity="0.8" />
            <path d="M 34 120 Q 48 98, 42 110 Q 38 118, 34 120 Z" fill="#059669" opacity="0.8" />

            <!-- 右侧极简水杯倒影 -->
            <rect x="315" y="115" width="14" height="22" rx="3" fill="#E2E8F0" opacity="0.6" />
            <rect x="317" y="122" width="10" height="13" rx="1.5" fill="#38BDF8" opacity="0.5" />

            <!-- 前景：温润橡木桌面 (Oak Desk Pedestal) -->
            <ellipse cx="180" cy="155" rx="80" ry="16" fill="url(#studyWoodDesk)" opacity="0.85" />
            <ellipse cx="180" cy="153" rx="74" ry="13" fill="#FDE68A" opacity="0.45" />
          </svg>
        </div>

        <!-- (3) 场景三：禅意茶庭 · 烟雨竹舍 (Bamboo Mist Sanctuary) -->
        <div v-else-if="currentScene === 'matcha_garden'" class="absolute inset-0">
          <svg class="w-full h-full" viewBox="0 0 360 176" preserveAspectRatio="none">
            <defs>
              <linearGradient id="teaSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#064E3B" />
                <stop offset="55%" stop-color="#065F46" />
                <stop offset="100%" stop-color="#0D9488" />
              </linearGradient>
              <linearGradient id="teaStone" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#334155" />
                <stop offset="50%" stop-color="#475569" />
                <stop offset="100%" stop-color="#334155" />
              </linearGradient>
            </defs>

            <!-- 远景：烟雨空蒙青碧天幕 -->
            <rect width="360" height="176" fill="url(#teaSkyGrad)" />

            <!-- 空灵水月与云烟 -->
            <circle cx="90" cy="35" r="16" fill="#CCFBF1" opacity="0.25" />
            <circle cx="90" cy="35" r="10" fill="#F0FDFA" opacity="0.6" />

            <!-- 中景：苍翠竹林剪影 (Bamboo Groves) -->
            <line x1="30" y1="140" x2="30" y2="20" stroke="#022C22" stroke-width="3" />
            <line x1="45" y1="145" x2="45" y2="35" stroke="#064E3B" stroke-width="2.5" />
            <line x1="60" y1="140" x2="60" y2="45" stroke="#022C22" stroke-width="2" />

            <line x1="305" y1="140" x2="305" y2="30" stroke="#064E3B" stroke-width="2.5" />
            <line x1="325" y1="145" x2="325" y2="15" stroke="#022C22" stroke-width="3.5" />
            <line x1="342" y1="140" x2="342" y2="40" stroke="#064E3B" stroke-width="2" />

            <!-- 中景：禅意水榭飞檐剪影 -->
            <path d="M 200 70 Q 235 60, 270 70 L 255 85 L 215 85 Z" fill="#022C22" opacity="0.8" />

            <!-- 烟雨水雾层 -->
            <rect x="0" y="110" width="360" height="25" fill="#99F6E4" opacity="0.15" />

            <!-- 飘落青绿竹叶微粒 -->
            <path d="M 120 45 Q 128 40, 134 46 Q 128 50, 120 45 Z" fill="#34D399" opacity="0.7" />
            <path d="M 230 55 Q 238 50, 244 56 Q 238 60, 230 55 Z" fill="#6EE7B7" opacity="0.75" />

            <!-- 前景：青石石阶案几台座 (Slate Stone Pedestal) -->
            <ellipse cx="180" cy="155" rx="78" ry="16" fill="url(#teaStone)" opacity="0.85" />
            <ellipse cx="180" cy="153" rx="72" ry="13" fill="#64748B" opacity="0.5" />
            <!-- 水波涟漪微纹 -->
            <ellipse cx="180" cy="155" rx="60" ry="8" fill="none" stroke="#2DD4BF" stroke-width="1" opacity="0.4" />
          </svg>
        </div>

        <!-- (4) 场景四：赛博星舱 · 氧能矩阵 (Cyber Nebula Matrix) -->
        <div v-else-if="currentScene === 'cyber_nebula'" class="absolute inset-0">
          <svg class="w-full h-full" viewBox="0 0 360 176" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cyberSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#090514" />
                <stop offset="50%" stop-color="#1E1B4B" />
                <stop offset="100%" stop-color="#083344" />
              </linearGradient>
              <linearGradient id="cyberDisk" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#06B6D4" />
                <stop offset="50%" stop-color="#A855F7" />
                <stop offset="100%" stop-color="#06B6D4" />
              </linearGradient>
            </defs>

            <!-- 远景：深空暗夜星云 -->
            <rect width="360" height="176" fill="url(#cyberSkyGrad)" />

            <!-- 霓虹星云粉紫光晕 -->
            <circle cx="260" cy="45" r="45" fill="#C084FC" opacity="0.18" />
            <circle cx="100" cy="35" r="35" fill="#22D3EE" opacity="0.15" />

            <!-- 参考图 2 风格：全息星座连线与金色虚线星际轨道 (Cyber Orbital Arc) -->
            <path
              d="M 15 80 Q 180 20, 345 75"
              stroke="#22D3EE"
              stroke-width="1.2"
              stroke-dasharray="4 4"
              opacity="0.45"
              fill="none"
            />
            <path
              d="M 40 40 L 75 30 L 110 50"
              stroke="#A855F7"
              stroke-width="1"
              stroke-dasharray="2 3"
              opacity="0.5"
              fill="none"
            />
            <circle cx="75" cy="30" r="2" fill="#E879F9" />

            <!-- 中景：数码透视地平线矩阵 (Perspective Matrix Grid) -->
            <line x1="0" y1="120" x2="360" y2="120" stroke="#06B6D4" stroke-width="1" opacity="0.3" />
            <line x1="60" y1="120" x2="0" y2="176" stroke="#06B6D4" stroke-width="0.8" opacity="0.25" />
            <line x1="120" y1="120" x2="80" y2="176" stroke="#06B6D4" stroke-width="0.8" opacity="0.25" />
            <line x1="240" y1="120" x2="280" y2="176" stroke="#06B6D4" stroke-width="0.8" opacity="0.25" />
            <line x1="300" y1="120" x2="360" y2="176" stroke="#06B6D4" stroke-width="0.8" opacity="0.25" />

            <!-- 前景：反重力磁悬浮聚能环地台 (Levitation Energy Platform) -->
            <ellipse cx="180" cy="155" rx="80" ry="16" fill="url(#cyberDisk)" opacity="0.4" />
            <ellipse cx="180" cy="155" rx="74" ry="13" fill="#020617" opacity="0.9" />
            <ellipse cx="180" cy="155" rx="66" ry="10" fill="none" stroke="#22D3EE" stroke-width="1.5" stroke-dasharray="6 3" />
            <circle cx="180" cy="155" r="4" fill="#A855F7" />
          </svg>
        </div>

        <!-- 4. 水滴精灵本体居中站立于微景观底座之上 (Pet Mascot On Pedestal) -->
        <div class="relative z-10 mb-2 flex items-center justify-center">
          <!-- 抚摸冒心心动效 -->
          <div
            v-for="heart in activeHearts"
            :key="heart.id"
            class="absolute pointer-events-none text-rose-500 font-bold text-base animate-ping z-30"
            :class="heart.posClass"
          >
            ♥
          </div>

          <!-- (1) 形态 1: 经典若水 (Classic Aqua) - 一体化无缝生芽 + 健身发带哑铃 -->
          <svg
            v-if="currentMorph === 'classic_aqua'"
            class="w-24 h-24 transition-transform duration-300 ease-out group-hover:scale-105 filter drop-shadow-lg"
            :class="{ 'animate-bounce': isSquishing }"
            viewBox="0 0 100 100"
          >
            <defs>
              <linearGradient id="v7ClassicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#38BDF8" />
                <stop offset="100%" stop-color="#0284C7" />
              </linearGradient>
            </defs>

            <!-- 水滴外轮廓 (尖端位于 50, 16) -->
            <path
              d="M 50 16 C 50 16, 18 50, 18 68 C 18 85, 32 94, 50 94 C 68 94, 82 85, 82 68 C 82 50, 50 16, 50 16 Z"
              fill="url(#v7ClassicGrad)"
            />

            <!-- 一体化生芽 (问题1彻底修复：主茎直接植根于 50, 16 尖端，茎叶一体绝对无分离) -->
            <g>
              <!-- 破水而出的翠绿主茎 -->
              <path
                d="M 50 16 Q 49 11, 48 6"
                stroke="#10B981"
                stroke-width="2.5"
                stroke-linecap="round"
                fill="none"
              />
              <!-- 左侧圆润生机嫩叶 (带高光) -->
              <path
                d="M 48 8 C 41 6, 36 0, 41 -1 C 46 -2, 48 3, 48 8 Z"
                fill="#34D399"
              />
              <path d="M 47 6 Q 43 2, 42 0" stroke="#A7F3D0" stroke-width="0.8" fill="none" />
              <!-- 右侧嫩叶 -->
              <path
                d="M 48 7 C 55 5, 60 0, 56 -1 C 51 -2, 48 3, 48 7 Z"
                fill="#10B981"
              />
            </g>

            <!-- 透视水肚线 -->
            <ellipse cx="50" cy="74" rx="22" ry="14" fill="rgba(255, 255, 255, 0.22)" />

            <!-- 水滴高光弧 -->
            <path d="M 48 22 C 40 38, 26 56, 26 66" stroke="rgba(255, 255, 255, 0.6)" stroke-width="3" stroke-linecap="round" fill="none" />

            <!-- 健身模式专属：活力运动发带与哑铃 (问题3全形态健身覆盖) -->
            <g v-if="isFitnessMode">
              <!-- 橙白高弹力吸汗发带 -->
              <path d="M 27 50 Q 50 43, 73 50" stroke="#F97316" stroke-width="5" stroke-linecap="round" fill="none" />
              <path d="M 29 50 Q 50 43, 71 50" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none" />
              <!-- 迷你健身哑铃 -->
              <line x1="72" y1="72" x2="86" y2="78" stroke="#64748B" stroke-width="2.5" stroke-linecap="round" />
              <rect x="70" y="67" width="3.5" height="10" rx="1.5" fill="#334155" />
              <rect x="85" y="73" width="3.5" height="10" rx="1.5" fill="#334155" />
            </g>

            <!-- 眼睛系统 -->
            <g v-if="!isBlinking">
              <ellipse cx="38" cy="60" rx="4.5" ry="6" fill="#0F172A" />
              <circle cx="36.5" cy="58" r="1.8" fill="#FFFFFF" />
              <ellipse cx="62" cy="60" rx="4.5" ry="6" fill="#0F172A" />
              <circle cx="60.5" cy="58" r="1.8" fill="#FFFFFF" />
            </g>
            <g v-else>
              <path d="M 34 61 Q 38 65, 42 61" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round" />
              <path d="M 58 61 Q 62 65, 66 61" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round" />
            </g>

            <!-- 腮红与小嘴 -->
            <circle cx="30" cy="67" r="4" fill="#FB7185" opacity="0.6" />
            <circle cx="70" cy="67" r="4" fill="#FB7185" opacity="0.6" />
            <path v-if="store.progressPercent >= 35" d="M 46 68 Q 50 73, 54 68" stroke="#0F172A" stroke-width="2" fill="none" stroke-linecap="round" />
            <circle v-else cx="50" cy="69" r="1.8" fill="#0F172A" />
          </svg>

          <!-- (2) 形态 2: 极地冰晶 (Frost Crystal) - 八面微晶切割与冰霜战神 -->
          <svg
            v-else-if="currentMorph === 'frost_crystal'"
            class="w-24 h-24 transition-transform duration-300 ease-out group-hover:scale-105 filter drop-shadow-lg"
            :class="{ 'animate-bounce': isSquishing }"
            viewBox="0 0 100 100"
          >
            <defs>
              <linearGradient id="v7FrostGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#E0F2FE" />
                <stop offset="60%" stop-color="#38BDF8" />
                <stop offset="100%" stop-color="#0284C7" />
              </linearGradient>
            </defs>

            <!-- 多边形冰晶轮廓 -->
            <polygon points="50,14 78,36 82,72 50,94 18,72 22,36" fill="url(#v7FrostGrad)" />

            <!-- 冰晶三芒皇冠顶饰 (一体化牢固顶饰) -->
            <polygon points="43,14 50,4 57,14" fill="#38BDF8" />
            <polygon points="36,18 42,9 46,16" fill="#7DD3FC" />
            <polygon points="64,18 58,9 54,16" fill="#7DD3FC" />

            <!-- 折射棱线 -->
            <polygon points="50,14 50,94 18,72 22,36" fill="rgba(255, 255, 255, 0.2)" />
            <line x1="50" y1="14" x2="50" y2="94" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.5" />
            <line x1="50" y1="46" x2="78" y2="36" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1" />
            <line x1="50" y1="46" x2="22" y2="36" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1" />

            <!-- 健身模式：冰原玄冰哑铃与战意冷霜 -->
            <g v-if="isFitnessMode">
              <path d="M 27 48 L 73 48" stroke="#38BDF8" stroke-width="4" stroke-linecap="round" opacity="0.85" />
              <line x1="72" y1="72" x2="86" y2="78" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" />
              <polygon points="68,66 73,63 75,75 70,78" fill="#E0F2FE" />
              <polygon points="83,72 88,69 90,81 85,84" fill="#E0F2FE" />
            </g>

            <!-- 冰晶星眸 -->
            <g v-if="!isBlinking">
              <ellipse cx="38" cy="58" rx="4" ry="5.5" fill="#0C4A6E" />
              <circle cx="36.5" cy="56" r="1.8" fill="#E0F2FE" />
              <ellipse cx="62" cy="58" rx="4" ry="5.5" fill="#0C4A6E" />
              <circle cx="60.5" cy="56" r="1.8" fill="#E0F2FE" />
            </g>
            <g v-else>
              <line x1="34" y1="59" x2="42" y2="59" stroke="#0C4A6E" stroke-width="2.5" stroke-linecap="round" />
              <line x1="58" y1="59" x2="66" y2="59" stroke="#0C4A6E" stroke-width="2.5" stroke-linecap="round" />
            </g>

            <!-- 腮红与微笑 -->
            <circle cx="30" cy="66" r="3.5" fill="#38BDF8" opacity="0.5" />
            <circle cx="70" cy="66" r="3.5" fill="#38BDF8" opacity="0.5" />
            <path d="M 47 68 Q 50 72, 53 68" stroke="#0C4A6E" stroke-width="2" fill="none" stroke-linecap="round" />
          </svg>

          <!-- (3) 形态 3: 治愈茶灵 (Matcha Spirit) - 翡翠双茶芽与禅武摇摇杯 -->
          <svg
            v-else-if="currentMorph === 'matcha_spirit'"
            class="w-24 h-24 transition-transform duration-300 ease-out group-hover:scale-105 filter drop-shadow-lg"
            :class="{ 'animate-bounce': isSquishing }"
            viewBox="0 0 100 100"
          >
            <defs>
              <linearGradient id="v7MatchaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#A7F3D0" />
                <stop offset="60%" stop-color="#34D399" />
                <stop offset="100%" stop-color="#059669" />
              </linearGradient>
            </defs>

            <!-- 丰盈茶灵轮廓 -->
            <path
              d="M 50 16 C 50 16, 20 48, 20 68 C 20 86, 32 94, 50 94 C 68 94, 80 86, 80 68 C 80 48, 50 16, 50 16 Z"
              fill="url(#v7MatchaGrad)"
            />

            <!-- 一体化双茶芽与木茶牌 -->
            <g>
              <path d="M 50 16 Q 42 6, 40 10 Q 43 17, 50 16" fill="#10B981" />
              <path d="M 50 16 Q 58 4, 61 9 Q 55 17, 50 16" fill="#34D399" />
            </g>
            <g>
              <line x1="26" y1="52" x2="22" y2="60" stroke="#78350F" stroke-width="1.2" />
              <rect x="18" y="60" width="7" height="9" rx="1.5" fill="#D97706" />
              <text x="21.5" y="67" font-size="6" fill="#FFFFFF" font-weight="bold">茶</text>
            </g>

            <!-- 健身模式：修行行者头带与竹韵蛋白摇摇杯 (Shaker Cup) -->
            <g v-if="isFitnessMode">
              <path d="M 27 50 Q 50 43, 73 50" stroke="#064E3B" stroke-width="4.5" stroke-linecap="round" fill="none" />
              <path d="M 29 50 Q 50 43, 71 50" stroke="#FDE68A" stroke-width="1.8" stroke-linecap="round" fill="none" />
              <!-- 竹节摇摇杯 -->
              <rect x="74" y="65" width="8" height="15" rx="2" fill="#D97706" />
              <rect x="75" y="62" width="6" height="3" rx="1" fill="#78350F" />
              <line x1="76" y1="70" x2="80" y2="70" stroke="#FFFFFF" stroke-width="1" />
              <line x1="76" y1="74" x2="80" y2="74" stroke="#FFFFFF" stroke-width="1" />
            </g>

            <!-- 眼睛系统 -->
            <g v-if="!isBlinking">
              <ellipse cx="38" cy="60" rx="4.5" ry="6" fill="#064E3B" />
              <circle cx="36.5" cy="58" r="1.8" fill="#ECFDF5" />
              <ellipse cx="62" cy="60" rx="4.5" ry="6" fill="#064E3B" />
              <circle cx="60.5" cy="58" r="1.8" fill="#ECFDF5" />
            </g>
            <g v-else>
              <path d="M 34 61 Q 38 65, 42 61" stroke="#064E3B" stroke-width="2.5" fill="none" stroke-linecap="round" />
              <path d="M 58 61 Q 62 65, 66 61" stroke="#064E3B" stroke-width="2.5" fill="none" stroke-linecap="round" />
            </g>

            <circle cx="30" cy="67" r="4" fill="#F472B6" opacity="0.6" />
            <circle cx="70" cy="67" r="4" fill="#F472B6" opacity="0.6" />
            <path d="M 46 68 Q 50 73, 54 68" stroke="#064E3B" stroke-width="2" fill="none" stroke-linecap="round" />
          </svg>

          <!-- (4) 形态 4: 电光星核 (Cyber Spark - 顶级赛博机甲悬浮核心，问题2彻底美化重塑) -->
          <svg
            v-else-if="currentMorph === 'cyber_spark'"
            class="w-24 h-24 transition-transform duration-300 ease-out group-hover:scale-105 filter drop-shadow-xl"
            :class="{ 'animate-bounce': isSquishing }"
            viewBox="0 0 100 100"
          >
            <defs>
              <!-- 黑曜石深空机甲纳米装甲渐变 -->
              <linearGradient id="cyberArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1E1B4B" />
                <stop offset="45%" stop-color="#0F172A" />
                <stop offset="100%" stop-color="#020617" />
              </linearGradient>
              <!-- 全息高能流光渐变 -->
              <linearGradient id="cyberNeonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#22D3EE" />
                <stop offset="100%" stop-color="#A855F7" />
              </linearGradient>
            </defs>

            <!-- 反重力倾角双轴离子光环 (Dual Orbital Rings) -->
            <ellipse
              cx="50"
              cy="58"
              rx="46"
              ry="18"
              fill="none"
              stroke="#06B6D4"
              stroke-width="1.8"
              stroke-dasharray="8 6"
              opacity="0.85"
            />

            <!-- 左右两侧微型悬浮机甲导能翼 (Aerodynamic Winglets) -->
            <polygon points="12,54 22,46 22,64" fill="#1E293B" stroke="#22D3EE" stroke-width="1" />
            <polygon points="88,54 78,46 78,64" fill="#1E293B" stroke="#22D3EE" stroke-width="1" />

            <!-- 流线型机甲水滴球体本体 (尖端 50, 16) -->
            <path
              d="M 50 16 C 50 16, 20 48, 20 68 C 20 86, 32 94, 50 94 C 68 94, 80 86, 80 68 C 80 48, 50 16, 50 16 Z"
              fill="url(#cyberArmorGrad)"
              stroke="#38BDF8"
              stroke-width="1.2"
            />

            <!-- 顶部微型全息接收天线 -->
            <line x1="50" y1="16" x2="50" y2="6" stroke="#22D3EE" stroke-width="2" stroke-linecap="round" />
            <circle cx="50" cy="5" r="2.5" fill="#A855F7" />

            <!-- 美化重构：流线型贴合曲面全息护目镜 (Curved Cyber Visor) 替代生硬方块 -->
            <path
              d="M 26 52 Q 50 44, 74 52 Q 76 66, 50 68 Q 24 66, 26 52 Z"
              fill="#030712"
              stroke="#22D3EE"
              stroke-width="1.8"
            />

            <!-- 全息护目镜内部扫描线与动态弧形星瞳 -->
            <path d="M 28 59 Q 50 53, 72 59" stroke="#38BDF8" stroke-width="0.8" stroke-dasharray="3 2" opacity="0.6" />
            <g v-if="!isBlinking">
              <ellipse cx="38" cy="58" rx="4" ry="4" fill="#22D3EE" />
              <ellipse cx="62" cy="58" rx="4" ry="4" fill="#22D3EE" />
              <circle cx="38" cy="58" r="1.5" fill="#FFFFFF" />
              <circle cx="62" cy="58" r="1.5" fill="#FFFFFF" />
            </g>
            <g v-else>
              <line x1="33" y1="58" x2="43" y2="58" stroke="#22D3EE" stroke-width="2" stroke-linecap="round" />
              <line x1="57" y1="58" x2="67" y2="58" stroke="#22D3EE" stroke-width="2" stroke-linecap="round" />
            </g>

            <!-- 胸口星核等离子聚变反应堆 (Quantum Core) -->
            <circle cx="50" cy="80" r="7" fill="#020617" stroke="#A855F7" stroke-width="1.6" />
            <polygon points="50,75 54,82 46,82" fill="#22D3EE" />

            <!-- 健身模式：重装超频动力外骨骼手臂与能量杠铃 (Power Exoskeleton) -->
            <g v-if="isFitnessMode">
              <!-- 外骨骼动力机械臂 -->
              <line x1="22" y1="68" x2="10" y2="78" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" />
              <line x1="78" y1="68" x2="90" y2="78" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" />
              <!-- 高能超频电弧杠铃 -->
              <line x1="6" y1="78" x2="94" y2="78" stroke="#22D3EE" stroke-width="2.5" stroke-linecap="round" />
              <rect x="4" y="72" width="4" height="12" rx="1.5" fill="#A855F7" />
              <rect x="92" y="72" width="4" height="12" rx="1.5" fill="#A855F7" />
              <circle cx="50" cy="80" r="7" fill="#F59E0B" opacity="0.4" class="animate-ping" />
            </g>
          </svg>
        </div>
      </div>
    </div>

    <!-- 4. 等级、头衔与成长经验条 (经验值实时跟随补水流水，满级为当日设定总目标) -->
    <div class="mt-2.5 flex items-center space-x-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl px-3 py-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
      <span class="text-[10px] font-black text-ios-blue dark:text-ios-blue-dark tracking-wide">
        {{ companionLevelTitle }}
      </span>
      <!-- 经验条 (以当日目标水量为满级 100%) -->
      <div class="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-ios-blue to-cyan-400 rounded-full transition-all duration-500"
          :class="expProgressWidthClass"
        ></div>
      </div>
      <span class="text-[9px] font-mono font-bold text-slate-400">
        {{ currentWaterExp }}/{{ maxWaterGoal }} ml
      </span>
    </div>

    <!-- 5. 场景切换交互弹窗 (Pet Habitat Switcher Modal) -->
    <div
      v-if="showSceneModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    >
      <div class="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-2xl border border-white/40 dark:border-white/10 select-none animate-in fade-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-1.5">
            <Sparkles class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
            <span class="text-xs font-bold text-slate-800 dark:text-slate-100">切换水滴陪伴微场景</span>
          </div>
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
            @click="showSceneModal = false"
          >
            ✕
          </button>
        </div>

        <div class="space-y-2 my-2">
          <button
            v-for="scene in sceneOptions"
            :key="scene.value"
            type="button"
            class="w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-2.5"
            :class="[
              currentScene === scene.value
                ? 'bg-ios-blue/10 dark:bg-ios-blue-dark/20 border-ios-blue text-ios-blue dark:text-ios-blue-dark ring-1 ring-ios-blue/30 font-bold'
                : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200/60 dark:border-zinc-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
            ]"
            @click="selectScene(scene.value)"
          >
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
              :class="scene.iconBgClass"
            >
              <component :is="scene.icon" class="w-4 h-4" :stroke-width="2.2" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold">{{ scene.title }}</div>
              <p class="text-[10px] text-slate-400 truncate mt-0.5">{{ scene.desc }}</p>
            </div>
            <span v-if="currentScene === scene.value" class="text-xs font-bold text-ios-blue">✓</span>
          </button>
        </div>

        <button
          type="button"
          class="w-full mt-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
          @click="showSceneModal = false"
        >
          完成
        </button>
      </div>
    </div>

    <!-- 6. 首页助手幻化形态切换弹窗 (Companion Morph Switcher Modal) -->
    <div
      v-if="showMorphModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      @click.self="showMorphModal = false"
    >
      <div
        class="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-2xl border border-white/40 dark:border-white/10 select-none animate-in fade-in zoom-in-95 duration-150"
        @click.stop
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-1.5">
            <Sparkles class="w-4 h-4 text-ios-blue" :stroke-width="2.2" />
            <span class="text-xs font-bold text-slate-800 dark:text-slate-100">切换小水滴外貌皮肤形态</span>
          </div>
          <button
            type="button"
            class="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
            @click="showMorphModal = false"
          >
            ✕
          </button>
        </div>

        <div class="space-y-2 my-2">
          <button
            v-for="morph in morphMetaList"
            :key="morph.value"
            type="button"
            class="w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center space-x-2.5"
            :class="[
              currentMorph === morph.value
                ? 'bg-ios-blue/10 dark:bg-ios-blue-dark/20 border-ios-blue text-ios-blue dark:text-ios-blue-dark ring-1 ring-ios-blue/30 font-bold'
                : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200/60 dark:border-zinc-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
            ]"
            @click="selectMorph(morph.value)"
          >
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
              :class="morph.badgeBgClass"
            >
              <component :is="morph.icon" class="w-4 h-4" :stroke-width="2.2" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold">{{ morph.title }}</div>
              <p class="text-[10px] text-slate-400 truncate mt-0.5">{{ morph.desc }}</p>
            </div>
            <span v-if="currentMorph === morph.value" class="text-xs font-bold text-ios-blue">✓</span>
          </button>
        </div>

        <button
          type="button"
          class="w-full mt-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
          @click="showMorphModal = false"
        >
          完成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, type Component } from 'vue'
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Droplets,
  Snowflake,
  Leaf,
  Zap,
  MountainSnow,
  Sunrise,
  Trees,
  Orbit,
  Heart
} from 'lucide-vue-next'
import { useHealthStore } from '@/stores/health'
import { playWaterDropSound } from '@/utils/audio'
import type { CompanionMorph, CompanionScene } from '@/types'

const store = useHealthStore()

// 0. 对话气泡展开/折叠状态
const isSpeechExpanded = ref(false)

// 1. 小水滴形态皮肤 (Morph - 纯正矢量风格)
const currentMorph = computed<CompanionMorph>(() => store.settings.companionMorph || 'classic_aqua')
const isFitnessMode = computed(() => store.settings.appMode === 'fitness')
const showMorphModal = ref(false)

const morphMetaList: {
  value: CompanionMorph
  title: string
  icon: Component
  desc: string
  badgeBgClass: string
}[] = [
  {
    value: 'classic_aqua',
    title: '经典若水',
    icon: Droplets,
    desc: '清透泉水天蓝，萌态生动头顶幼芽',
    badgeBgClass: 'bg-sky-50 dark:bg-sky-950/50 text-sky-500 border border-sky-200/50 dark:border-sky-800/50'
  },
  {
    value: 'frost_crystal',
    title: '极地冰晶',
    icon: Snowflake,
    desc: '冷冽冰川纯澈，几何棱晶微芒浮动',
    badgeBgClass: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-500 border border-cyan-200/50 dark:border-cyan-800/50'
  },
  {
    value: 'matcha_spirit',
    title: '治愈茶灵',
    icon: Leaf,
    desc: '双茶尖芽·禅武摇摇杯',
    badgeBgClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 border border-emerald-200/50 dark:border-emerald-800/50'
  },
  {
    value: 'cyber_spark',
    title: '电光星核',
    icon: Zap,
    desc: '赛博电光霓虹，反重力离子光环',
    badgeBgClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-500 border border-purple-200/50 dark:border-purple-800/50'
  }
]

const currentMorphMeta = computed(() => {
  return morphMetaList.find((m) => m.value === currentMorph.value) || morphMetaList[0]
})

function selectMorph(morph: CompanionMorph): void {
  store.setCompanionMorph(morph)
  showMorphModal.value = false
}

// 2. 小水滴所在微生活场景 (Habitat Scene - 纯正矢量风格)
const currentScene = computed<CompanionScene>(() => store.settings.companionScene || 'polar_glacier')
const showSceneModal = ref(false)

const sceneOptions: {
  value: CompanionScene
  title: string
  icon: Component
  desc: string
  containerBgClass: string
  iconBgClass: string
}[] = [
  {
    value: 'polar_glacier',
    title: '极地冰原',
    icon: MountainSnow,
    desc: '深邃夜空，月华雪山与暗林剪影 (图2同款)',
    containerBgClass: 'bg-slate-900 border-sky-500/20 shadow-sky-950/30',
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 border border-indigo-200/50 dark:border-indigo-800/50'
  },
  {
    value: 'zen_study',
    title: '晨曦书桌',
    icon: Sunrise,
    desc: '破晓暖阳金光，龟背多肉与浅橡木书案',
    containerBgClass: 'bg-amber-50 dark:bg-zinc-900 border-amber-300/30 shadow-amber-950/20',
    iconBgClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-200/50 dark:border-amber-800/50'
  },
  {
    value: 'matcha_garden',
    title: '禅意茶庭',
    icon: Trees,
    desc: '烟雨空蒙，飞檐竹舍与青石石阶案几',
    containerBgClass: 'bg-emerald-950/40 dark:bg-zinc-900 border-emerald-500/20 shadow-emerald-950/30',
    iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-200/50 dark:border-emerald-800/50'
  },
  {
    value: 'cyber_nebula',
    title: '赛博星舱',
    icon: Orbit,
    desc: '反重力聚能环，霓虹星轨与数码矩阵',
    containerBgClass: 'bg-purple-950/40 dark:bg-zinc-900 border-cyan-400/25 shadow-purple-950/30',
    iconBgClass: 'bg-violet-50 dark:bg-violet-950/40 text-violet-500 border border-violet-200/50 dark:border-violet-800/50'
  }
]

const currentSceneMeta = computed(() => {
  return sceneOptions.find((s) => s.value === currentScene.value) || sceneOptions[0]
})

function selectScene(scene: CompanionScene): void {
  store.setCompanionScene(scene)
  showSceneModal.value = false
}

// 3. 等级体系：严格跟随当日流水记录，满级以当日设定的总补水目标为基准
const currentWaterExp = computed(() => store.totalEffectiveWaterMl)
const maxWaterGoal = computed(() => store.dailyGoalMl)
const currentRatio = computed(() => {
  if (maxWaterGoal.value <= 0) return 0
  return currentWaterExp.value / maxWaterGoal.value
})

const companionLevel = computed<number>(() => {
  if (currentRatio.value >= 1.0) return 4
  if (currentRatio.value >= 0.5) return 3
  if (currentRatio.value >= 0.25) return 2
  return 1
})

const companionLevelTitle = computed(() => {
  const isFitness = store.settings.appMode === 'fitness'
  switch (companionLevel.value) {
    case 4:
      return isFitness ? 'Lv.4 黄金奥赛战神 👑' : 'Lv.4 冠冕水灵 👑'
    case 3:
      return isFitness ? 'Lv.3 肌肉水泵巨兽 🦍' : 'Lv.3 晶澈泉源 ✨'
    case 2:
      return isFitness ? 'Lv.2 撸铁活力达人 ⚡' : 'Lv.2 活力水滴 💧'
    default:
      return isFitness ? 'Lv.1 举铁新手小白 🌱' : 'Lv.1 萌态幼芽 🌱'
  }
})

const expProgressWidthClass = computed(() => {
  const percent = Math.min(100, Math.max(0, store.progressPercent))
  if (percent <= 10) return 'w-[10%]'
  if (percent <= 25) return 'w-1/4'
  if (percent <= 50) return 'w-1/2'
  if (percent <= 75) return 'w-3/4'
  return 'w-full'
})

// 眨眼状态机
const isBlinking = ref(false)
let blinkTimer: number | null = null

function triggerBlink(): void {
  isBlinking.value = true
  setTimeout(() => {
    isBlinking.value = false
    scheduleNextBlink()
  }, 220)
}

function scheduleNextBlink(): void {
  const nextInterval = Math.random() * 3000 + 2500
  blinkTimer = window.setTimeout(triggerBlink, nextInterval)
}

// 触摸挤压与冒心心动效
const isSquishing = ref(false)
interface FloatingHeart {
  id: number
  posClass: string
}
const activeHearts = ref<FloatingHeart[]>([])

const dailyPetDialogues = [
  '主人，今天也要像山间清泉一样元气满满呀！',
  '咕咚咕咚～把好心情和水分一起喝下去吧！',
  '久坐记得站起来舒展一下肩颈哦，若水陪着你呢～',
  '身体有70%都是水，多喝水皮肤会水当当的哦！',
  '目标达成啦！你今天真是太棒、太自律了！'
]

const fitnessPetDialogues = [
  '肌纤维正在渴求水分！充沛水合，把肌肉泵感喝出来！',
  '一水肌酸已就绪！水合充足，大重量爆发才能更持久！',
  '训中补充电解质，维持肌肉电解平衡，状态拉满！',
  '练完及时补充蛋白质，肌肉修复超量恢复满分达成！',
  '肌肉水泵充盈！恭喜今天的硬核打卡，实至名归！'
]

const currentSpeech = ref('今天也要多喝水保持活力哦～')

const moodLucideIcon = computed(() => {
  if (store.isGoalAchieved) return Sparkles
  if (store.progressPercent >= 50) return Heart
  if (store.progressPercent >= 25) return Droplets
  return Leaf
})

const moodLucideColor = computed(() => {
  if (store.isGoalAchieved) return 'text-amber-500'
  if (store.progressPercent >= 50) return 'text-rose-500'
  if (store.progressPercent >= 25) return 'text-sky-500'
  return 'text-emerald-500'
})

function handlePetCompanion(): void {
  playWaterDropSound()
  isSquishing.value = true
  setTimeout(() => {
    isSquishing.value = false
  }, 300)

  const dialogues = store.settings.appMode === 'fitness' ? fitnessPetDialogues : dailyPetDialogues
  const randomIndex = Math.floor(Math.random() * dialogues.length)
  currentSpeech.value = dialogues[randomIndex]

  // 生成升腾爱心
  const id = Date.now() + Math.random()
  const positions = ['-top-3 left-4', '-top-4 right-4', '-top-2 left-8', '-top-5 right-8']
  const posClass = positions[Math.floor(Math.random() * positions.length)]
  activeHearts.value.push({ id, posClass })
  setTimeout(() => {
    activeHearts.value = activeHearts.value.filter((h) => h.id !== id)
  }, 800)
}

onMounted(() => {
  scheduleNextBlink()
})

onUnmounted(() => {
  if (blinkTimer !== null) {
    clearTimeout(blinkTimer)
  }
})
</script>
