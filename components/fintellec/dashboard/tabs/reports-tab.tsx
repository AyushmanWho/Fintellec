'use client'

import React from 'react'
import { FileText, Download, CheckCircle2, Calendar, Share2 } from 'lucide-react'
import { sound } from '@/lib/sound'

export function ReportsTab() {
  const reports = [
    { title: 'October 2026 Monthly Cashflow Statement', size: '240 KB', date: 'Generated Oct 14', status: 'Ready' },
    { title: 'FY 2026-27 Tax Readiness & Capital Gains Summary', size: '512 KB', date: 'Updated Yesterday', status: 'Audited' },
    { title: 'Sole Proprietor FCR Stress Test Audit', size: '180 KB', date: 'Generated Oct 10', status: 'Simulated' },
  ]

  return (
    <div className="space-y-8 pb-28 pt-2">
      <div>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-violet">
          SYSTEM ENGINE / APP / REPORTS
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">
          Audited Statements & Tax Reports
        </h1>
        <p className="text-sm text-steel">
          Automated exportable accounting summaries, collision logs, and annual filing documentation.
        </p>
      </div>

      <div className="divide-y divide-mint/50 rounded-3xl border border-mint/80 bg-white/95 p-6 shadow-xs">
        {reports.map((rep) => (
          <div key={rep.title} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 first:pt-0 last:pb-0 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-aqua text-teal border border-mint">
                <FileText className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-navy text-sm">{rep.title}</h3>
                <p className="text-xs text-steel">
                  {rep.date} • <span className="font-mono">{rep.size}</span> • <span className="text-emerald-700 font-semibold">{rep.status}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => sound.snap('high')}
                className="flex items-center gap-1.5 rounded-full border border-mint bg-aqua/40 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-white hover:border-teal"
              >
                <Download className="size-3.5 text-teal" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
