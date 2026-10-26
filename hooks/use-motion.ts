'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'
import { clamp } from '@/lib/smooth-path'

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  )
}

export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { threshold = 0.2, once = true }: { threshold?: number; once?: boolean } = {},
) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold, once])
  return inView
}

/**
 * Calls `onProgress` on scroll while the element is in view with a 0–1 value:
 * 0 when the element's top reaches `anchor` of the viewport, 1 when its bottom does.
 * Uses cached offsets and passive scroll listeners to eliminate layout thrashing.
 */
export function useScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onProgress: (p: number) => void,
  anchor = 0.6,
) {
  const cb = useRef(onProgress)
  cb.current = onProgress
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let last = -1
    let cachedOffsetTop = 0
    let cachedHeight = 0

    const updateMetrics = () => {
      let top = 0
      let cur: HTMLElement | null = el
      while (cur) {
        top += cur.offsetTop
        cur = cur.offsetParent as HTMLElement | null
      }
      cachedOffsetTop = top
      cachedHeight = Math.max(1, el.offsetHeight)
    }
    updateMetrics()
    window.addEventListener('resize', updateMetrics, { passive: true })

    const update = () => {
      raf = 0
      const currentTop = cachedOffsetTop - window.scrollY
      const p = clamp((window.innerHeight * anchor - currentTop) / cachedHeight)
      if (Math.abs(p - last) > 0.0005) {
        last = p
        cb.current(p)
      }
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          updateMetrics()
          update()
          window.addEventListener('scroll', onScroll, { passive: true })
        } else {
          window.removeEventListener('scroll', onScroll)
          if (raf) {
            cancelAnimationFrame(raf)
            raf = 0
          }
        }
      },
      { rootMargin: '20% 0px 20% 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.removeEventListener('resize', updateMetrics)
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ref, anchor])
}

export function useTweenedNumber(target: number, duration = 700) {
  const [value, setValue] = useState(target)
  const current = useRef(target)
  useEffect(() => {
    const from = current.current
    if (from === target || window.matchMedia(REDUCED_QUERY).matches) {
      current.current = target
      setValue(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / duration)
      const v = from + (target - from) * (1 - Math.pow(1 - k, 3))
      current.current = v
      setValue(v)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}
