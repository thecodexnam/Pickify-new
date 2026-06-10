import React from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'

function PageHeader({ eyebrow, title, subtitle, onBack, backLabel = 'Back' }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="back-btn" aria-label={backLabel}>
          <IoIosArrowRoundBack size={26} />
        </button>
      )}
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-black tracking-tight text-slate-900">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-xs font-bold text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

export default PageHeader
