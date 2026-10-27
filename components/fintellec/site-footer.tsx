import { Wordmark } from './logo'
import { Heart, Sparkles } from 'lucide-react'

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#simulator', label: 'Decision Engine' },
  { href: '#money-insights', label: 'Money insights' },
  { href: '#anatomy', label: 'Architecture' },
  { href: '#top', label: 'About' },
  { href: '#top', label: 'Privacy' },
  { href: '#top', label: 'Terms' },
]

export function SiteFooter() {
  return (
    <footer
      className="border-t border-navy/10"
      style={{
        background: 'linear-gradient(180deg, #AEE6DC 0%, #B8F2EC 30%, #A0DDD4 100%)',
      }}
    >
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <a href="#top" aria-label="Back to top" className="w-fit rounded-full">
            <img
              src="/fintellec-logo-clean.png"
              alt="Fintellec"
              className="h-9 w-auto object-contain"
            />
          </a>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-navy/75">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="transition-colors hover:text-teal">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Fold Money Style Witty Fintech Disclaimers */}
        <div className="mt-10 pt-8 border-t border-navy/10 grid gap-6 md:grid-cols-12 md:items-center">
          <div className="md:col-span-8 space-y-2">
            <p className="text-xs text-navy/70 leading-relaxed">
              © 2026 Fintellec Technologies Private Limited. All figures shown are illustrative demo data.
            </p>
            <p className="text-[11px] text-steel leading-relaxed">
              * Statutory Disclosure: Mutual funds are subject to market risks, and 2 AM food delivery orders are subject to next-day regret risks. No spreadsheets or <code className="text-navy font-mono">#REF!</code> formulas were harmed in the making of this canvas.
            </p>
          </div>
          <div className="md:col-span-4 flex md:justify-end">
            <div className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-white/70 px-3.5 py-1.5 text-[11px] font-mono text-navy/80 shadow-xs backdrop-blur-sm">
              <img src="/fintellec-f.png" alt="" aria-hidden="true" className="h-4 w-auto shrink-0" />
              <span>Obsessively crafted in Delhi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
