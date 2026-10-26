import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7 text-teal', className)} aria-hidden fill="none">
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
      <path
        d="M5 19c4-9 8.5-9 11-3s7 6 11-3"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="27" cy="13" r="2.2" className="fill-bright" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-[-0.03em] text-violet">Fintellec</span>
    </span>
  )
}
