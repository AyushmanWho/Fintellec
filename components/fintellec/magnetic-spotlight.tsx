'use client'

import { useEffect } from 'react'

export function MagneticSpotlight() {
  useEffect(() => {
    function onMove(e: MouseEvent) {
      // Walk up from the event target to find the nearest specular card
      let el = e.target as HTMLElement | null
      while (el && el !== document.body) {
        if (el.classList.contains('fintellec-specular-card')) {
          const r = el.getBoundingClientRect()
          const x = ((e.clientX - r.left) / r.width) * 100
          const y = ((e.clientY - r.top) / r.height) * 100
          el.style.setProperty('--spot-x', `${x}%`)
          el.style.setProperty('--spot-y', `${y}%`)
          return
        }
        el = el.parentElement
      }
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  return null
}
