import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3, TrendingUp } from 'lucide-react'
import type { Translations } from '../i18n/translations'
import {
  formatCompactCurrency,
  formatCurrency,
  type CurrencyCode,
} from '../utils/currency'
import type { AnnualScheduleRow } from '../utils/mortgageMath'

interface SimulationChartsProps {
  annualSchedule: AnnualScheduleRow[]
  currency: CurrencyCode
  t: Translations
  showRealValues: boolean
}

type ChartTab = 'wealth' | 'balance'

interface ChartPoint {
  label: string
  year: number
  scenarioAWealth: number
  scenarioBWealth: number
  baselineBalance: number
  acceleratedBalance: number
}

export function SimulationCharts({
  annualSchedule,
  currency,
  t,
  showRealValues,
}: SimulationChartsProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>('wealth')

  const data: ChartPoint[] = useMemo(
    () =>
      annualSchedule.map((row) => ({
        label: `${t.charts.yearPrefix} ${row.year}`,
        year: row.year,
        scenarioAWealth: showRealValues ? row.scenarioANetPortfolioReal : row.scenarioANetPortfolio,
        scenarioBWealth: showRealValues ? row.scenarioBNetPortfolioReal : row.scenarioBNetPortfolio,
        baselineBalance: row.baselineEndingBalance,
        acceleratedBalance: row.scenarioAEndingBalance,
      })),
    [annualSchedule, showRealValues, t.charts.yearPrefix],
  )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            {t.charts.title}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {activeTab === 'wealth' ? t.charts.wealthSubtitle : t.charts.balanceSubtitle}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t.charts.title}
          className="inline-flex shrink-0 rounded-xl bg-slate-100 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'wealth'}
            onClick={() => setActiveTab('wealth')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'wealth'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            {t.charts.tabWealth}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'balance'}
            onClick={() => setActiveTab('balance')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'balance'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            {t.charts.tabBalance}
          </button>
        </div>
      </div>

      <div className="mt-5 h-[300px] w-full sm:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'wealth' ? (
            <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradScenarioA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradScenarioB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                minTickGap={28}
              />
              <YAxis
                tickFormatter={(val: number) => formatCompactCurrency(val, currency, t.lang)}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#F8FAFC' }}
                labelStyle={{ fontWeight: 700, marginBottom: '4px', color: '#CBD5E1' }}
                formatter={(value) => {
                  const num = typeof value === 'number' ? value : Number(value ?? 0)
                  return formatCurrency(num, currency, t.lang, 0)
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="scenarioAWealth"
                name={t.charts.seriesScenarioAWealth}
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#gradScenarioA)"
              />
              <Area
                type="monotone"
                dataKey="scenarioBWealth"
                name={t.charts.seriesScenarioBWealth}
                stroke="#059669"
                strokeWidth={2.5}
                fill="url(#gradScenarioB)"
              />
            </AreaChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradBaselineBal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748B" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAccelBal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                minTickGap={28}
              />
              <YAxis
                tickFormatter={(val: number) => formatCompactCurrency(val, currency, t.lang)}
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#F8FAFC' }}
                labelStyle={{ fontWeight: 700, marginBottom: '4px', color: '#CBD5E1' }}
                formatter={(value) => {
                  const num = typeof value === 'number' ? value : Number(value ?? 0)
                  return formatCurrency(num, currency, t.lang, 0)
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="baselineBalance"
                name={t.charts.seriesBaselineBalance}
                stroke="#64748B"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#gradBaselineBal)"
              />
              <Area
                type="monotone"
                dataKey="acceleratedBalance"
                name={t.charts.seriesAcceleratedBalance}
                stroke="#2563EB"
                strokeWidth={2.5}
                fill="url(#gradAccelBal)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  )
}
