import { useState } from 'react'
import { BookOpen, ChevronDown, HelpCircle } from 'lucide-react'
import type { Translations } from '../i18n/translations'

interface EducationSectionProps {
  t: Translations
}

export function EducationSection({ t }: EducationSectionProps) {
  const [formulaExpanded, setFormulaExpanded] = useState(true)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  return (
    <div className="space-y-6">
      {/* Formula Methodology Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                {t.methodology.title}
              </h2>
              <p className="text-xs text-slate-500">{t.methodology.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            aria-expanded={formulaExpanded}
            onClick={() => setFormulaExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:self-auto"
          >
            {formulaExpanded ? t.methodology.collapseLabel : t.methodology.expandLabel}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${formulaExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {formulaExpanded ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {t.methodology.blocks.map((block) => (
              <article
                key={block.title}
                className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
              >
                <h3 className="text-sm font-bold text-slate-900">{block.title}</h3>
                <div className="mt-2 overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-emerald-300">
                  {block.formula}
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-600">{block.body}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {/* FAQ Accordion Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">{t.faq.title}</h2>
            <p className="text-xs text-slate-500">{t.faq.subtitle}</p>
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {t.faq.items.map((item, idx) => {
            const isOpen = openFaqIndex === idx
            return (
              <div key={item.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-slate-700' : ''
                    }`}
                  />
                </button>
                {isOpen ? (
                  <div className="px-4 pb-4 text-sm leading-relaxed text-slate-600">
                    {item.answer}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
