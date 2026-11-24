interface AdSlotProps {
  variant: 'banner' | 'sidebar'
  slotId: string
  adLabel: string
  slotTitle: string
  className?: string
}

/**
 * Zero-CLS Google AdSense slot container.
 * Reserves exact minimum dimensions so asynchronous ad loading never shifts page layout.
 *
 * To activate Google AdSense in production:
 * 1. Add the AdSense <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX" crossorigin="anonymous"></script> to index.html.
 * 2. Replace the inner subtle placeholder with <ins className="adsbygoogle" data-ad-client="ca-pub-XXXX" data-ad-slot={slotId} ... /> and call (window.adsbygoogle = window.adsbygoogle || []).push({}).
 */
export function AdSlot({ variant, slotId, adLabel, slotTitle, className = '' }: AdSlotProps) {
  const dimensionsClass =
    variant === 'banner'
      ? 'min-h-[100px] w-full'
      : 'min-h-[250px] w-full'

  return (
    <aside
      aria-label={adLabel}
      data-ad-slot={slotId}
      className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-slate-100/60 px-5 py-4 text-center shadow-2xs ${dimensionsClass} ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="h-px w-4 bg-slate-300/80" aria-hidden="true" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {adLabel}
        </span>
        <span className="h-px w-4 bg-slate-300/80" aria-hidden="true" />
      </div>
      <p className="mt-1.5 text-xs font-medium text-slate-500/90">{slotTitle}</p>
    </aside>
  )
}
