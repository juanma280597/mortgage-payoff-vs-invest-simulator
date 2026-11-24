import { useState } from 'react'
import { Download, Table2 } from 'lucide-react'
import type { Translations } from '../i18n/translations'
import { formatCurrency, type CurrencyCode } from '../utils/currency'
import { buildScheduleCSV, type SimulationResult } from '../utils/mortgageMath'

interface AmortizationTableProps {
  result: SimulationResult
  currency: CurrencyCode
  t: Translations
  showRealValues: boolean
}

export function AmortizationTable({
  result,
  currency,
  t,
  showRealValues,
}: AmortizationTableProps) {
  const [granularity, setGranularity] = useState<'annual' | 'monthly'>('annual')
  const [showAllMonthly, setShowAllMonthly] = useState(false)

  const handleExportCsv = () => {
    const csv = buildScheduleCSV(result, {
      granularity,
      currency,
      locale: t.lang,
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `mortgage-vs-invest-${granularity}-${currency.toLowerCase()}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const visibleMonthlyRows = showAllMonthly
    ? result.monthlySchedule
    : result.monthlySchedule.slice(0, 120)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Table2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {t.schedule.title}
            </h2>
            <p className="text-xs text-slate-500">{t.schedule.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setGranularity('annual')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                granularity === 'annual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.schedule.annualTab}
            </button>
            <button
              type="button"
              onClick={() => setGranularity('monthly')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                granularity === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.schedule.monthlyTab}
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            {t.schedule.exportCsv}
          </button>
        </div>
      </div>

      <div className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-slate-200">
        {granularity === 'annual' ? (
          <table className="min-w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[inset_0_-1px_0_#e2e8f0]">
              <tr>
                <th className="px-3 py-3">{t.schedule.colYear}</th>
                <th className="px-3 py-3 text-right">{t.schedule.colBaseInterest}</th>
                <th className="px-3 py-3 text-right">{t.schedule.colBaseBalance}</th>
                <th className="px-3 py-3 text-right text-blue-700">{t.schedule.colAInterest}</th>
                <th className="px-3 py-3 text-right text-blue-700">{t.schedule.colABalance}</th>
                <th className="px-3 py-3 text-right text-blue-700">{t.schedule.colAWealth}</th>
                <th className="px-3 py-3 text-right text-emerald-700">{t.schedule.colBContrib}</th>
                <th className="px-3 py-3 text-right text-emerald-700">{t.schedule.colBWealth}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {result.annualSchedule.map((row) => (
                <tr key={row.year} className="transition hover:bg-slate-50/80">
                  <td className="px-3 py-2.5 font-sans font-semibold text-slate-800">
                    {row.year}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-600">
                    {formatCurrency(row.baselineInterestPaid, currency, t.lang, 0)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-700">
                    {formatCurrency(row.baselineEndingBalance, currency, t.lang, 0)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-blue-700">
                    {formatCurrency(row.scenarioAInterestPaid, currency, t.lang, 0)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-blue-800">
                    {formatCurrency(row.scenarioAEndingBalance, currency, t.lang, 0)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-blue-900">
                    {formatCurrency(
                      showRealValues ? row.scenarioANetPortfolioReal : row.scenarioANetPortfolio,
                      currency,
                      t.lang,
                      0,
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-emerald-700">
                    {formatCurrency(row.scenarioBAnnualContribution, currency, t.lang, 0)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-emerald-800">
                    {formatCurrency(
                      showRealValues ? row.scenarioBNetPortfolioReal : row.scenarioBNetPortfolio,
                      currency,
                      t.lang,
                      0,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[inset_0_-1px_0_#e2e8f0]">
              <tr>
                <th className="px-3 py-3">{t.schedule.colMonth}</th>
                <th className="px-3 py-3">{t.schedule.colDate}</th>
                <th className="px-3 py-3 text-right">{t.schedule.colBaseInterest}</th>
                <th className="px-3 py-3 text-right">{t.schedule.colBaseBalance}</th>
                <th className="px-3 py-3 text-right text-blue-700">{t.schedule.colAInterest}</th>
                <th className="px-3 py-3 text-right text-blue-700">{t.schedule.colABalance}</th>
                <th className="px-3 py-3 text-right text-blue-700">{t.schedule.colAWealth}</th>
                <th className="px-3 py-3 text-right text-emerald-700">{t.schedule.colBWealth}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {visibleMonthlyRows.map((row) => (
                <tr key={row.month} className="transition hover:bg-slate-50/80">
                  <td className="px-3 py-2 font-sans font-semibold text-slate-800">
                    {row.month}
                  </td>
                  <td className="px-3 py-2 text-slate-500">{row.dateISO.slice(0, 7)}</td>
                  <td className="px-3 py-2 text-right text-slate-600">
                    {formatCurrency(row.baselineInterest, currency, t.lang, 2)}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-700">
                    {formatCurrency(row.baselineBalance, currency, t.lang, 2)}
                  </td>
                  <td className="px-3 py-2 text-right text-blue-700">
                    {formatCurrency(row.scenarioAInterest, currency, t.lang, 2)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-blue-800">
                    {formatCurrency(row.scenarioABalance, currency, t.lang, 2)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-blue-900">
                    {formatCurrency(
                      showRealValues ? row.scenarioANetPortfolioReal : row.scenarioANetPortfolio,
                      currency,
                      t.lang,
                      2,
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-emerald-800">
                    {formatCurrency(
                      showRealValues ? row.scenarioBNetPortfolioReal : row.scenarioBNetPortfolio,
                      currency,
                      t.lang,
                      2,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {granularity === 'monthly' && result.monthlySchedule.length > 120 ? (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllMonthly((prev) => !prev)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {showAllMonthly
              ? t.schedule.showLessRows
              : `${t.schedule.showAllRows} (${result.monthlySchedule.length})`}
          </button>
        </div>
      ) : null}
    </section>
  )
}
