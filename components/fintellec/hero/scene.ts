import { easeInOut, lerp, type Vec } from '@/lib/smooth-path'

/** Scroll positions (0–1 of the pinned hero) where each scene is fully composed. */
export const KEYS = [0.22, 0.44, 0.64, 0.82, 0.96] as const

export const GRAPH_VALUES = [
  8200, 9600, 9100, 12400, 14800, 13900, 17600, 20500, 19200, 23800, 27100, 31400,
]
export const GRAPH_MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
export const GRAPH_MAX = 35000
export const GOAL = { name: 'Travel fund', saved: 50400, target: 70000 }

const N = 14

export type Scene = {
  a: Vec[]
  dots: number[]
  coinX: number
  coinY: number
  coinR: number
  coinO: number
  walletX: number
  walletY: number
  walletS: number
  walletO: number
  split: number
  ringX: number
  ringY: number
  ringR: number
  ringO: number
  ringFill: number
  graph: number
  amp: number
}

export type GraphBox = { x0: number; x1: number; top: number; bottom: number }
export type SceneSet = { w: number; h: number; mobile: boolean; box: GraphBox; scenes: Scene[] }

const dotsAt = (indices: number[], v = 1) => {
  const arr = Array<number>(N).fill(0)
  for (const i of indices) arr[i] = v
  return arr
}
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

export function buildScenes(w: number, h: number): SceneSet {
  const m = w < 768
  const R = m ? Math.min(w * 0.27, h * 0.15) : Math.min(w * 0.155, h * 0.27)

  /* Scene 1 — the coin: ribbon enters, orbits through the coin, becomes a small graph, lands in the wallet */
  const c1 = { x: m ? w * 0.64 : w * 0.68, y: m ? h * 0.73 : h * 0.46 }
  const w1 = { x: m ? w * 0.86 : w * 0.885, y: m ? h * 0.91 : h * 0.78, s: m ? 0.46 : 0.72 }
  const g1 = {
    x0: m ? w * 0.48 : w * 0.735,
    x1: m ? w * 0.7 : w * 0.835,
    top: m ? h * 0.87 : h * 0.76,
    bottom: m ? h * 0.95 : h * 0.87,
  }
  const gShape = [0.85, 0.4, 0.6, 0]
  const s1: Scene = {
    a: [
      [-0.06 * w, m ? 0.6 * h : 0.8 * h],
      [m ? 0.14 * w : 0.2 * w, m ? 0.67 * h : 0.94 * h],
      [m ? 0.3 * w : 0.46 * w, 0.8 * h],
      [c1.x - 1.2 * R, c1.y + 0.25 * R],
      [c1.x - 0.55 * R, c1.y - 0.62 * R],
      [c1.x + 0.35 * R, c1.y - 0.78 * R],
      [c1.x + 0.82 * R, c1.y - 0.05 * R],
      [c1.x + 0.25 * R, c1.y + 0.8 * R],
      ...gShape.map(
        (fy, i): Vec => [g1.x0 + (i / 3) * (g1.x1 - g1.x0), g1.top + fy * (g1.bottom - g1.top)],
      ),
      [w1.x - 70 * w1.s, w1.y - 40 * w1.s],
      [w1.x, w1.y],
    ],
    dots: dotsAt([8, 9, 10, 11]),
    coinX: c1.x,
    coinY: c1.y,
    coinR: R,
    coinO: 1,
    walletX: w1.x,
    walletY: w1.y,
    walletS: w1.s,
    walletO: 1,
    split: 0,
    ringX: w1.x,
    ringY: w1.y,
    ringR: R * 0.5,
    ringO: 0,
    ringFill: 0,
    graph: 0,
    amp: 1,
  }

  /* Scene 2 — the flow: coin centres, ribbon stretches across the viewport */
  const cy2 = m ? h * 0.55 : h * 0.5
  const s2: Scene = {
    ...s1,
    a: range(0, N - 1).map((i): Vec => [
      -0.06 * w + i * ((1.12 * w) / (N - 1)),
      cy2 + (m ? 0.09 : 0.14) * h * Math.sin(i * 0.72 - 0.4),
    ]),
    dots: dotsAt([]),
    coinX: w * 0.5,
    coinY: cy2,
    coinR: R * 1.15,
    walletX: w * 1.12,
    walletY: h * 0.7,
    walletS: 0.8,
    walletO: 0,
    ringX: w * 0.7,
    ringO: 0,
    amp: 1.25,
  }

  /* Scene 3 — the graph: the ribbon becomes twelve months of savings */
  const box: GraphBox = {
    x0: m ? w * 0.08 : w * 0.1,
    x1: m ? w * 0.92 : w * 0.9,
    top: m ? h * 0.4 : h * 0.34,
    bottom: m ? h * 0.72 : h * 0.76,
  }
  const gy = (v: number, b: GraphBox) => b.bottom - (v / GRAPH_MAX) * (b.bottom - b.top)
  const data3 = GRAPH_VALUES.map((v, i): Vec => [box.x0 + (i / 11) * (box.x1 - box.x0), gy(v, box)])
  const s3: Scene = {
    ...s2,
    a: [[-0.06 * w, box.bottom - 0.02 * h], ...data3, [1.06 * w, data3[11][1] - 0.06 * h]],
    dots: dotsAt(range(1, 12)),
    coinX: m ? w * 0.84 : w * 0.87,
    coinY: m ? h * 0.2 : h * 0.17,
    coinR: R * 0.42,
    coinO: 0.45,
    graph: 1,
    amp: 0.22,
  }

  /* Scene 4 — the wallet: graph compresses and curves down into a layered wallet */
  const w4 = { x: m ? w * 0.5 : w * 0.7, y: m ? h * 0.66 : h * 0.58, s: m ? 0.9 : 1.1 }
  const b4: GraphBox = m
    ? { x0: w * 0.04, x1: w * 0.62, top: h * 0.3, bottom: h * 0.42 }
    : { x0: w * 0.06, x1: w * 0.46, top: h * 0.46, bottom: h * 0.72 }
  const data4 = GRAPH_VALUES.slice(0, 9).map(
    (v, i): Vec => [b4.x0 + (i / 8) * (b4.x1 - b4.x0), b4.bottom - (v / 22000) * (b4.bottom - b4.top)],
  )
  const s4: Scene = {
    ...s3,
    a: [
      [-0.06 * w, b4.bottom],
      ...data4,
      [m ? w * 0.82 : w * 0.55, m ? h * 0.32 : h * 0.37],
      [m ? w * 0.84 : w4.x - w * 0.06, m ? h * 0.46 : w4.y - h * 0.26],
      [w4.x + (m ? w * 0.06 : 0), w4.y - h * 0.13],
      [w4.x, w4.y - h * 0.01],
    ],
    dots: dotsAt(range(1, 9), 0.5),
    coinX: m ? w * 0.88 : w * 0.9,
    coinY: h * 0.1,
    coinR: R * 0.3,
    coinO: 0,
    walletX: w4.x,
    walletY: w4.y,
    walletS: w4.s,
    walletO: 1,
    split: 1,
    ringX: w4.x,
    ringY: w4.y,
    ringR: m ? w * 0.36 : Math.min(h * 0.24, 220),
    ringO: 0.85,
    ringFill: 0.42,
    graph: 0.12,
    amp: 0.35,
  }

  /* Scene 5 — the destination: the ribbon wraps the savings ring and settles */
  const rx = m ? w * 0.5 : w * 0.66
  const ry = m ? h * 0.62 : h * 0.52
  const rr = m ? w * 0.3 : Math.min(h * 0.22, w * 0.14)
  const lead: Vec[] = [
    [-0.06 * w, m ? 0.88 * h : 0.7 * h],
    [m ? 0.1 * w : 0.2 * w, m ? 0.93 * h : 0.79 * h],
    [m ? 0.2 * w : 0.42 * w, m ? 0.86 * h : 0.68 * h],
    [rx - rr * 1.35, ry + rr * 0.6],
  ]
  const wrap = range(0, 9).map((k): Vec => {
    const ang = Math.PI * 0.86 + k * ((Math.PI * 2 * 0.93) / 9)
    return [rx + Math.cos(ang) * rr * 1.16, ry + Math.sin(ang) * rr * 1.16]
  })
  const s5: Scene = {
    ...s4,
    a: [...lead, ...wrap],
    dots: dotsAt([]),
    coinX: rx,
    coinY: ry,
    coinO: 0,
    walletX: rx,
    walletY: ry,
    walletS: 0.55,
    walletO: 0,
    split: 1.5,
    ringX: rx,
    ringY: ry,
    ringR: rr,
    ringO: 1,
    ringFill: GOAL.saved / GOAL.target,
    graph: 0,
    amp: 0.3,
  }

  return { w, h, mobile: m, box, scenes: [s1, s2, s3, s4, s5] }
}

function mix(a: Scene, b: Scene, t: number): Scene {
  const out = {} as Scene
  for (const key of Object.keys(a) as (keyof Scene)[]) {
    if (key === 'a') out.a = a.a.map((p, i): Vec => [lerp(p[0], b.a[i][0], t), lerp(p[1], b.a[i][1], t)])
    else if (key === 'dots') out.dots = a.dots.map((v, i) => lerp(v, b.dots[i], t))
    else (out[key] as number) = lerp(a[key] as number, b[key] as number, t)
  }
  return out
}

export function sceneAt(set: SceneSet, p: number): Scene {
  const { scenes } = set
  if (p <= KEYS[0]) return scenes[0]
  if (p >= KEYS[4]) return scenes[4]
  let i = 0
  while (p > KEYS[i + 1]) i++
  return mix(scenes[i], scenes[i + 1], easeInOut((p - KEYS[i]) / (KEYS[i + 1] - KEYS[i])))
}
