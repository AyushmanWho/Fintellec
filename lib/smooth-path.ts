export type Vec = [number, number]

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const r = (v: number) => Math.round(v * 10) / 10

/** Catmull-Rom spline through points, emitted as cubic Béziers. */
export function smoothPath(pts: Vec[], tension = 1): string {
  const n = pts.length
  if (n < 2) return ''
  const k = tension / 6
  let d = `M${r(pts[0][0])},${r(pts[0][1])}`
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    d += ` C${r(p1[0] + (p2[0] - p0[0]) * k)},${r(p1[1] + (p2[1] - p0[1]) * k)} ${r(
      p2[0] - (p3[0] - p1[0]) * k,
    )},${r(p2[1] - (p3[1] - p1[1]) * k)} ${r(p2[0])},${r(p2[1])}`
  }
  return d
}

/** Evaluates the Catmull-Rom cubic Bézier spline at parameter f (0 to 1) in pure JS */
export function getSplinePoint(pts: Vec[], f: number, tension = 1): Vec {
  const n = pts.length
  if (n === 0) return [0, 0]
  if (n === 1) return pts[0]
  const clampedF = clamp(f, 0, 1)
  const totalSegs = n - 1
  const segF = clampedF * totalSegs
  const i = Math.min(Math.floor(segF), totalSegs - 1)
  const u = segF - i

  const p0 = pts[i - 1] ?? pts[i]
  const p1 = pts[i]
  const p2 = pts[i + 1]
  const p3 = pts[i + 2] ?? p2

  const k = tension / 6
  const c1x = p1[0] + (p2[0] - p0[0]) * k
  const c1y = p1[1] + (p2[1] - p0[1]) * k
  const c2x = p2[0] - (p3[0] - p1[0]) * k
  const c2y = p2[1] - (p3[1] - p1[1]) * k

  const oneMinusU = 1 - u
  const b0 = oneMinusU * oneMinusU * oneMinusU
  const b1 = 3 * oneMinusU * oneMinusU * u
  const b2 = 3 * oneMinusU * u * u
  const b3 = u * u * u

  return [
    b0 * p1[0] + b1 * c1x + b2 * c2x + b3 * p2[0],
    b0 * p1[1] + b1 * c1y + b2 * c2y + b3 * p2[1],
  ]
}
