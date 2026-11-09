/**
 * 使用 Web Audio API 合成真实的 iOS 风格水滴、达成庆贺音效与自然流水白噪音
 * 无需外部音频资产文件，无延迟、低开销
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/**
 * 播放清脆的仿生水滴音效 (Water Drip)
 */
export function playWaterDropSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(650, now)
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.35, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.18)
  } catch {
    // 忽略音频受限异常
  }
}

/**
 * 播放达成目标轻风铃音效 (Chime / Complete)
 */
export function playCelebrationSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    const now = ctx.currentTime

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const startTime = now + index * 0.07

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + 0.6)
    })
  } catch {
    // 忽略音频受限异常
  }
}

// 潮汐 / Calm 风格：全套多轨纯 Web Audio 自然仿生声景生成引擎
import type { SoundscapeTrack } from '@/types'

// 当前活跃的声景状态与拓扑节点引用
let activeTrack: SoundscapeTrack | null = null
let masterGainNode: GainNode | null = null
let activeAudioNodes: { stop?: () => void; disconnect: () => void }[] = []
let crackleTimer: ReturnType<typeof setTimeout> | null = null
let fadeOutTimer: ReturnType<typeof setTimeout> | null = null
let currentTargetVolume: number = 0.15

/**
 * 创建高品质粉红噪声 (Pink Noise) 缓冲区 (1/f 波动，最具舒缓与噪音掩蔽特性的自然底噪)
 */
function createPinkNoiseBuffer(ctx: AudioContext, seconds = 3): AudioBuffer {
  const bufferSize = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const output = buffer.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.96900 * b2 + white * 0.1538520
    b3 = 0.86650 * b3 + white * 0.3104856
    b4 = 0.55000 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.0168980
    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.09
    b6 = white * 0.115926
  }
  return buffer
}

/**
 * 创建低沉浑厚的棕色噪声 (Brownian/Red Noise) 缓冲区 (1/f^2 波动，极适合松风、远山、深海)
 */
function createBrownNoiseBuffer(ctx: AudioContext, seconds = 3): AudioBuffer {
  const bufferSize = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const output = buffer.getChannelData(0)
  let lastOut = 0.0

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    output[i] = (lastOut + 0.02 * white) / 1.02
    lastOut = output[i]
    output[i] *= 2.8 // 适度提升振幅
  }
  return buffer
}

/**
 * 启动指定声景轨道的程序化合成
 */
export function startSoundscape(track: SoundscapeTrack = 'stream', volume = 0.15): void {
  try {
    // 立即停止并清理前序节点，杜绝延迟淡出计时器销毁新节点的竞态 Bug
    stopSoundscape(true)
    const ctx = getAudioContext()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    currentTargetVolume = volume
    activeTrack = track

    // 全局主控增益（带平滑淡入，防止音响爆破音）
    masterGainNode = ctx.createGain()
    masterGainNode.gain.setValueAtTime(0, ctx.currentTime)
    masterGainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.3)
    masterGainNode.connect(ctx.destination)

    const now = ctx.currentTime

    switch (track) {
      // 1. 高山清溪：带微波动的带通滤波粉红噪声
      case 'stream': {
        const pinkBuffer = createPinkNoiseBuffer(ctx, 3)
        const source = ctx.createBufferSource()
        source.buffer = pinkBuffer
        source.loop = true

        const bandpass = ctx.createBiquadFilter()
        bandpass.type = 'bandpass'
        bandpass.frequency.setValueAtTime(950, now)
        bandpass.Q.setValueAtTime(2.6, now)

        // 缓慢低频振荡器模拟水流穿过石缝的咕咚涌浪感
        const lfo = ctx.createOscillator()
        lfo.frequency.setValueAtTime(0.38, now)
        const lfoGain = ctx.createGain()
        lfoGain.gain.setValueAtTime(260, now)
        lfo.connect(lfoGain)
        lfoGain.connect(bandpass.frequency)
        lfo.start(now)

        source.connect(bandpass)
        bandpass.connect(masterGainNode)
        source.start(now)

        activeAudioNodes.push(source, lfo, lfoGain, bandpass)
        break
      }

      // 2. 雨落窗台：双层滤波（低频沉闷雨声 + 高频敲击飞溅）
      case 'rain': {
        const pinkBuffer = createPinkNoiseBuffer(ctx, 4)
        const source1 = ctx.createBufferSource()
        source1.buffer = pinkBuffer
        source1.loop = true

        const source2 = ctx.createBufferSource()
        source2.buffer = pinkBuffer
        source2.loop = true

        // 低频雨声 (Low rumble)
        const lowpass = ctx.createBiquadFilter()
        lowpass.type = 'lowpass'
        lowpass.frequency.setValueAtTime(1100, now)

        // 高频雨丝与窗台微击声 (High hiss & crisp drops)
        const highpass = ctx.createBiquadFilter()
        highpass.type = 'highpass'
        highpass.frequency.setValueAtTime(3200, now)

        const highGain = ctx.createGain()
        highGain.gain.setValueAtTime(0.55, now)

        source1.connect(lowpass)
        lowpass.connect(masterGainNode)

        source2.connect(highpass)
        highpass.connect(highGain)
        highGain.connect(masterGainNode)

        source1.start(now)
        source2.start(now)

        activeAudioNodes.push(source1, source2, lowpass, highpass, highGain)
        break
      }

      // 3. 林海松风：超低频棕色噪声 + 慢速风切变
      case 'forest': {
        const brownBuffer = createBrownNoiseBuffer(ctx, 4)
        const source = ctx.createBufferSource()
        source.buffer = brownBuffer
        source.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(450, now)

        // 风力阵阵起伏调节
        const windLfo = ctx.createOscillator()
        windLfo.frequency.setValueAtTime(0.14, now)
        const windGain = ctx.createGain()
        windGain.gain.setValueAtTime(0.35, now)
        windLfo.connect(windGain.gain)

        // 柔和树叶沙沙高频层
        const pinkBuffer = createPinkNoiseBuffer(ctx, 3)
        const leafSource = ctx.createBufferSource()
        leafSource.buffer = pinkBuffer
        leafSource.loop = true
        const leafFilter = ctx.createBiquadFilter()
        leafFilter.type = 'bandpass'
        leafFilter.frequency.setValueAtTime(2400, now)
        leafFilter.Q.setValueAtTime(1.2, now)
        const leafGain = ctx.createGain()
        leafGain.gain.setValueAtTime(0.18, now)

        leafSource.connect(leafFilter)
        leafFilter.connect(leafGain)
        leafGain.connect(masterGainNode)

        source.connect(filter)
        filter.connect(windGain)
        windGain.connect(masterGainNode)

        source.start(now)
        leafSource.start(now)
        windLfo.start(now)

        activeAudioNodes.push(source, leafSource, filter, leafFilter, windLfo, windGain, leafGain)
        break
      }

      // 4. 围炉暖火：暖意低鸣 + 随机木柴爆裂脆响
      case 'campfire': {
        // 持续微火低通
        const brownBuffer = createBrownNoiseBuffer(ctx, 3)
        const roarSource = ctx.createBufferSource()
        roarSource.buffer = brownBuffer
        roarSource.loop = true

        const roarFilter = ctx.createBiquadFilter()
        roarFilter.type = 'lowpass'
        roarFilter.frequency.setValueAtTime(680, now)

        const roarGain = ctx.createGain()
        roarGain.gain.setValueAtTime(0.5, now)

        roarSource.connect(roarFilter)
        roarFilter.connect(roarGain)
        roarGain.connect(masterGainNode)
        roarSource.start(now)

        activeAudioNodes.push(roarSource, roarFilter, roarGain)

        // 随机木柴脆响爆裂发生器 (Pop & Crackle)
        const triggerCrackle = () => {
          if (!activeTrack || activeTrack !== 'campfire' || !audioCtx || audioCtx.state !== 'running') {
            return
          }
          try {
            const crackleLen = Math.floor(audioCtx.sampleRate * 0.015) // 15ms 短促爆裂
            const crackleBuf = audioCtx.createBuffer(1, crackleLen, audioCtx.sampleRate)
            const cData = crackleBuf.getChannelData(0)
            for (let i = 0; i < crackleLen; i++) {
              cData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (crackleLen * 0.3))
            }
            const cSource = audioCtx.createBufferSource()
            cSource.buffer = crackleBuf

            const cFilter = audioCtx.createBiquadFilter()
            cFilter.type = 'highpass'
            cFilter.frequency.setValueAtTime(2600 + Math.random() * 2800, audioCtx.currentTime)

            const cGain = audioCtx.createGain()
            cGain.gain.setValueAtTime(Math.random() * 0.65 + 0.15, audioCtx.currentTime)

            cSource.connect(cFilter)
            cFilter.connect(cGain)
            if (masterGainNode) {
              cGain.connect(masterGainNode)
            }

            cSource.start(audioCtx.currentTime)
          } catch {
            // ignore
          }
          const nextInterval = Math.floor(Math.random() * 280 + 70)
          crackleTimer = setTimeout(triggerCrackle, nextInterval)
        }

        triggerCrackle()
        break
      }

      // 5. 潮汐海浪：8 秒规律涨退潮涌
      case 'waves': {
        const pinkBuffer = createPinkNoiseBuffer(ctx, 4)
        const source = ctx.createBufferSource()
        source.buffer = pinkBuffer
        source.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(600, now)
        filter.Q.setValueAtTime(1.5, now)

        // 8.3 秒周期正弦涌浪 LFO
        const waveLfo = ctx.createOscillator()
        waveLfo.frequency.setValueAtTime(0.12, now)
        const waveGain = ctx.createGain()
        waveGain.gain.setValueAtTime(0.5, now)

        // 调制增益与滤波中心频率
        const waveModGain = ctx.createGain()
        waveModGain.gain.setValueAtTime(0.45, now)
        waveLfo.connect(waveModGain)
        waveModGain.connect(waveGain.gain)

        const freqMod = ctx.createGain()
        freqMod.gain.setValueAtTime(320, now)
        waveLfo.connect(freqMod)
        freqMod.connect(filter.frequency)

        source.connect(filter)
        filter.connect(waveGain)
        waveGain.connect(masterGainNode)

        source.start(now)
        waveLfo.start(now)

        activeAudioNodes.push(source, filter, waveLfo, waveGain, waveModGain, freqMod)
        break
      }

      // 6. 深空星云：双耳节拍 + 柔和太空嗡鸣
      case 'nebula': {
        // 双声道微频差振荡器（制造 Alpha 双耳节拍 55Hz 与 59Hz）
        const osc1 = ctx.createOscillator()
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(55, now)

        const osc2 = ctx.createOscillator()
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(59, now)

        const oscGain = ctx.createGain()
        oscGain.gain.setValueAtTime(0.35, now)

        osc1.connect(oscGain)
        osc2.connect(oscGain)
        oscGain.connect(masterGainNode)

        // 空间空灵粉红噪声
        const pinkBuffer = createPinkNoiseBuffer(ctx, 4)
        const spaceSource = ctx.createBufferSource()
        spaceSource.buffer = pinkBuffer
        spaceSource.loop = true

        const spaceFilter = ctx.createBiquadFilter()
        spaceFilter.type = 'bandpass'
        spaceFilter.frequency.setValueAtTime(1600, now)
        spaceFilter.Q.setValueAtTime(0.8, now)

        const spaceGain = ctx.createGain()
        spaceGain.gain.setValueAtTime(0.12, now)

        spaceSource.connect(spaceFilter)
        spaceFilter.connect(spaceGain)
        spaceGain.connect(masterGainNode)

        osc1.start(now)
        osc2.start(now)
        spaceSource.start(now)

        activeAudioNodes.push(osc1, osc2, oscGain, spaceSource, spaceFilter, spaceGain)
        break
      }
    }
  } catch (err) {
    console.error('Failed to start soundscape:', err)
  }
}

/**
 * 切换声景轨道（立即停止旧轨道，并无缝开启新轨道）
 */
export function switchSoundscape(track: SoundscapeTrack, volume: number = currentTargetVolume): void {
  startSoundscape(track, volume)
}

/**
 * 调节声景全局音量 (0.0 ~ 1.0)
 */
export function setSoundscapeVolume(volume: number): void {
  try {
    currentTargetVolume = Math.max(0, Math.min(1, volume))
    if (masterGainNode && audioCtx) {
      masterGainNode.gain.cancelScheduledValues(audioCtx.currentTime)
      masterGainNode.gain.linearRampToValueAtTime(currentTargetVolume, audioCtx.currentTime + 0.1)
    }
  } catch {
    // ignore
  }
}

/**
 * 停止当前播放的自然声景
 * @param immediate 是否立即切断（当切换新声音或快速试听时设为 true，彻底避免定时器重叠）
 */
export function stopSoundscape(immediate = false): void {
  try {
    if (crackleTimer) {
      clearTimeout(crackleTimer)
      crackleTimer = null
    }
    if (fadeOutTimer) {
      clearTimeout(fadeOutTimer)
      fadeOutTimer = null
    }

    if (immediate || !masterGainNode || !audioCtx) {
      cleanupNodes(activeAudioNodes, masterGainNode)
      activeAudioNodes = []
      masterGainNode = null
    } else {
      // 隔离当前节点副本，防止延时清理殃及后续新生成的节点
      const nodesToClean = [...activeAudioNodes]
      const gainToClean = masterGainNode
      activeAudioNodes = []
      masterGainNode = null

      gainToClean.gain.cancelScheduledValues(audioCtx.currentTime)
      gainToClean.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.25)
      fadeOutTimer = setTimeout(() => {
        cleanupNodes(nodesToClean, gainToClean)
        fadeOutTimer = null
      }, 280)
    }
  } catch {
    cleanupNodes(activeAudioNodes, masterGainNode)
    activeAudioNodes = []
    masterGainNode = null
  }
  activeTrack = null
}

function cleanupNodes(
  nodes: { stop?: () => void; disconnect: () => void }[],
  gain: GainNode | null
): void {
  nodes.forEach((node) => {
    try {
      if (node.stop) node.stop()
      node.disconnect()
    } catch {
      // ignore
    }
  })
  if (gain) {
    try {
      gain.disconnect()
    } catch {
      // ignore
    }
  }
}

export function isSoundscapePlaying(): boolean {
  return activeTrack !== null
}

export function getCurrentSoundscapeTrack(): SoundscapeTrack | null {
  return activeTrack
}

// 向上兼容旧版接口
export const startWaterSoundscape = (volume = 0.15) => startSoundscape('stream', volume)
export const stopWaterSoundscape = () => stopSoundscape()
