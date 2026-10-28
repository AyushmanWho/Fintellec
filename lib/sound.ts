// Real-time Web Audio Synthesizer (Zero External Assets, Zero Latency)
// Synthesizes tactile Apple-grade haptic clicks, latches, chimes, and crisis warnings.

class SoundManager {
  private ctx: AudioContext | null = null
  public enabled: boolean = true

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  // 1. Tactile Crown Tick (Digital dial / slider step click)
  public tick(pitch = 1800) {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const now = ctx.currentTime

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(pitch, now)
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, now + 0.015)

      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.016)
    } catch {
      // Audio fallback silent
    }
  }

  // 2. Mechanical Latch / Snap (Segmented tab / button toggle)
  public snap(variant: 'high' | 'low' = 'high') {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const baseFreq = variant === 'high' ? 620 : 380

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(baseFreq, now)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.04)

      gain.gain.setValueAtTime(0.09, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.042)
    } catch {
      // Audio fallback silent
    }
  }

  // 3. Crystalline Glass Chime (3D layer click / achievement)
  public chime() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const freqs = [1046.5, 1567.98, 2093.0] // C6, G6, C7 crystalline triad

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)

        const volume = 0.05 / (idx + 1)
        gain.gain.setValueAtTime(volume, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.36)
      })
    } catch {
      // Audio fallback silent
    }
  }

  // 4. Low-Frequency Crisis Warning (Burn-only mode trigger)
  public warning() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(140, now)
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.45)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.46)
    } catch {
      // Audio fallback silent
    }
  }

  // 5. Crown Knurled Tick (Precise mechanical ratchet tick)
  public crownTick(freq = 2400) {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, now + 0.008)

      gain.gain.setValueAtTime(0.045, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.01)
    } catch {
      // Audio fallback silent
    }
  }

  // 6. Tactile Liquid Click
  public click() {
    this.tick(2200)
  }

  // 6.1 Metallic Silver Coin Clink
  public clink(pitch = 3400) {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return
    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(pitch, now)
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, now + 0.035)
      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.038)
    } catch {}
  }

  // 7. Coin Airborne Toss Chime
  public coinToss() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const notes = [1318.5, 1760.0, 2637.0] // E6, A6, E7
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.04)
        gain.gain.setValueAtTime(0.06 / (i + 1), now + i * 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.28)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.04)
        osc.stop(now + i * 0.04 + 0.30)
      })
    } catch {
      // Audio fallback
    }
  }

  // 8. Nocturnal Ambient Chime (2 AM Danger Zone Shift)
  public nightShift() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.45)

      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.48)
    } catch {}
  }

  // 9. Morning Uplift Chime (9 AM Clarity Shift)
  public dayShift() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const freqs = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.05)
        gain.gain.setValueAtTime(0.05, now + idx * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.05)
        osc.stop(now + idx * 0.05 + 0.28)
      })
    } catch {}
  }

  // 10. Triumph / Willpower Victory Chime (Saved money, resisted temptation)
  public triumph() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const freqs = [659.25, 880, 1174.66, 1318.51] // E5, A5, D6, E6
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.07)
        gain.gain.setValueAtTime(0.08 / (i + 1), now + i * 0.07)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.35)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.07)
        osc.stop(now + i * 0.07 + 0.38)
      })
    } catch {}
  }

  // 11. Playful Downward Slide (Late night guilt slide)
  public sadSlide() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.35)
      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.38)
    } catch {}
  }
}

export const sound = new SoundManager()
