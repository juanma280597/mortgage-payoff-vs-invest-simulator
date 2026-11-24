import { History, Trash2, Upload } from 'lucide-react'
import type { Translations } from '../i18n/translations'
import { formatCurrency } from '../utils/currency'
import type { SavedScenario } from '../utils/storage'

interface SavedScenariosPanelProps {
  scenarios: SavedScenario[]
  onLoad: (scenario: SavedScenario) => void
  onDelete: (id: string) => void
  t: Translations
}

export function SavedScenariosPanel({
  scenarios,
  onLoad,
  onDelete,
  t,
}: SavedScenariosPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-900">{t.savedDrawer.title}</h3>
      </div>

      {scenarios.length === 0 ? (
        <p className="mt-2.5 text-xs leading-relaxed text-slate-500">{t.savedDrawer.empty}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {scenarios.map((item) => {
            const winnerBadgeClass =
              item.verdictWinner === 'invest'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : item.verdictWinner === 'payoff'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'

            const winnerLabel =
              item.verdictWinner === 'invest'
                ? t.savedDrawer.winnerInvest
                : item.verdictWinner === 'payoff'
                  ? t.savedDrawer.winnerPayoff
                  : t.savedDrawer.winnerTie

            return (
              <li
                key={item.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900">{item.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                      {formatCurrency(item.inputs.principal, item.currency, t.lang, 0)} @{' '}
                      {item.inputs.annualMortgageRate}% vs {item.inputs.expectedInvestmentReturn}%
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${winnerBadgeClass}`}
                  >
                    {winnerLabel}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-semibold text-slate-700">
                    +{formatCurrency(item.netDifference, item.currency, t.lang, 0)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onLoad(item)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-slate-800"
                    >
                      <Upload className="h-3 w-3" />
                      {t.savedDrawer.load}
                    </button>
                    <button
                      type="button"
                      aria-label={t.savedDrawer.delete}
                      onClick={() => onDelete(item.id)}
                      className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 text-slate-400 transition hover:border-red-200 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
