import { ArrowLeft, Mail, Shield } from 'lucide-react'
import {
  getContactEmail,
  getLegalContent,
  LEGAL_NAV_LABELS,
  ROUTE_SLUGS,
  type PageKey,
} from '../i18n/legalContent'
import type { Locale } from '../i18n/translations'

interface LegalPageProps {
  locale: Locale
  page: Exclude<PageKey, 'home'>
  basePrefix: string
  onNavigate: (locale: Locale, page: PageKey) => void
}

export function LegalPage({ locale, page, basePrefix, onNavigate }: LegalPageProps) {
  const content = getLegalContent(locale)[page]
  const labels = LEGAL_NAV_LABELS[locale]
  const contactEmail = getContactEmail()

  return (
    <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <a
          href={`${basePrefix}${ROUTE_SLUGS[locale].home}`}
          onClick={(e) => {
            e.preventDefault()
            onNavigate(locale, 'home')
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {labels.backToCalculator}
        </a>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Shield className="h-3.5 w-3.5 text-emerald-600" />
          {content.lastUpdated}
        </span>
      </div>

      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        {content.title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{content.intro}</p>

      <div className="mt-6 space-y-6">
        {content.sections.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-slate-600">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>

      {page === 'contact' ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            {labels.contactEmailLabel}
          </p>
          <a
            href={`mailto:${contactEmail}`}
            className="mt-1.5 inline-flex items-center gap-2 font-mono text-sm font-bold text-emerald-900 underline-offset-4 hover:underline"
          >
            <Mail className="h-4 w-4 text-emerald-700" />
            {contactEmail}
          </a>
        </div>
      ) : null}
    </article>
  )
}
