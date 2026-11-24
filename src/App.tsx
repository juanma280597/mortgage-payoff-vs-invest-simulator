import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BookmarkPlus,
  Calculator,
  CalendarClock,
  Check,
  Coins,
  Globe2,
  PiggyBank,
  RotateCcw,
  Scale,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { AdSlot } from './components/AdSlot'
import { AmortizationTable } from './components/AmortizationTable'
import { EducationSection } from './components/EducationSection'
import { LegalPage } from './components/LegalPage'
import { NumericInputField } from './components/NumericInputField'
import { SavedScenariosPanel } from './components/SavedScenariosPanel'
import { SeoHead } from './components/SeoHead'
import { SimulationCharts } from './components/SimulationCharts'
import { LEGAL_NAV_LABELS, ROUTE_SLUGS, type PageKey } from './i18n/legalContent'
import { TRANSLATIONS, type Locale } from './i18n/translations'
import {
  convertCurrencyAmount,
  CURRENCY_META,
  FALLBACK_RATES,
  fetchLiveExchangeRates,
  formatCurrency,
  type CurrencyCode,
  type ExchangeRates,
} from './utils/currency'
import { simulateMortgageVsInvest } from './utils/mortgageMath'
import {
  deleteSavedScenario,
  loadLastWorkspaceState,
  loadSavedScenarios,
  persistLastWorkspaceState,
  saveScenarioToStorage,
  type SavedScenario,
  type SavedScenarioInputs,
} from './utils/storage'

const DEFAULT_INPUTS_BY_CURRENCY: Record<CurrencyCode, SavedScenarioInputs> = {
  USD: {
    principal: 250000,
    annualMortgageRate: 6.5,
    remainingYears: 20,
    remainingMonths: 0,
    extraMonthlyPayment: 500,
    expectedInvestmentReturn: 8.5,
    capitalGainsTaxRate: 15,
    annualInflationRate: 2.5,
  },
  MXN: {
    principal: 2500000,
    annualMortgageRate: 10.5,
    remainingYears: 15,
    remainingMonths: 0,
    extraMonthlyPayment: 8000,
    expectedInvestmentReturn: 11.5,
    capitalGainsTaxRate: 10,
    annualInflationRate: 4.0,
  },
  EUR: {
    principal: 220000,
    annualMortgageRate: 3.8,
    remainingYears: 20,
    remainingMonths: 0,
    extraMonthlyPayment: 450,
    expectedInvestmentReturn: 7.5,
    capitalGainsTaxRate: 19,
    annualInflationRate: 2.2,
  },
}

interface RouteState {
  locale: Locale
  page: PageKey
  basePrefix: string
}

function resolvePageKey(subpath: string): PageKey {
  const clean = subpath.replace(/^\/+|\/+$/g, '').toLowerCase()
  if (clean === 'privacy' || clean === 'privacidad') return 'privacy'
  if (clean === 'terms' || clean === 'terminos') return 'terms'
  if (clean === 'cookies') return 'cookies'
  if (clean === 'contact' || clean === 'contacto') return 'contact'
  return 'home'
}

function parseRoute(pathname: string): { route: RouteState; needsRedirect: boolean } {
  const match = pathname.match(/^(.*?)\/(en|es)(?:\/(.*))?$/i)
  if (match) {
    const locale = match[2].toLowerCase() as Locale
    const page = resolvePageKey(match[3] ?? '')
    return {
      route: {
        basePrefix: match[1] === '/' ? '' : match[1],
        locale,
        page,
      },
      needsRedirect: false,
    }
  }

  const trimmedBase = pathname.replace(/\/+$/, '')
  const prefersEs =
    typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('es')

  return {
    route: {
      basePrefix: trimmedBase === '/' ? '' : trimmedBase,
      locale: prefersEs ? 'es' : 'en',
      page: 'home',
    },
    needsRedirect: true,
  }
}

export function App() {
  const initialRoute = useMemo(() => parseRoute(window.location.pathname), [])
  const [route, setRoute] = useState<RouteState>(initialRoute.route)

  useEffect(() => {
    if (initialRoute.needsRedirect) {
      const targetPath = `${initialRoute.route.basePrefix}${ROUTE_SLUGS[initialRoute.route.locale][initialRoute.route.page]}`
      window.history.replaceState(null, '', targetPath + window.location.search)
    }
  }, [initialRoute])

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseRoute(window.location.pathname)
      setRoute(parsed.route)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const t = TRANSLATIONS[route.locale]
  const legalNav = LEGAL_NAV_LABELS[route.locale]

  const navigateTo = useCallback(
    (nextLocale: Locale, nextPage: PageKey) => {
      if (nextLocale === route.locale && nextPage === route.page) return
      const nextPath = `${route.basePrefix}${ROUTE_SLUGS[nextLocale][nextPage]}`
      window.history.pushState(null, '', nextPath)
      setRoute((prev) => ({ ...prev, locale: nextLocale, page: nextPage }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [route.basePrefix, route.locale, route.page],
  )

  const switchLocale = useCallback(
    (nextLocale: Locale) => {
      navigateTo(nextLocale, route.page)
    },
    [navigateTo, route.page],
  )

  const initialWorkspace = useMemo(() => loadLastWorkspaceState(), [])

  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    if (initialWorkspace?.currency) return initialWorkspace.currency
    return initialRoute.route.locale === 'es' ? 'MXN' : 'USD'
  })

  const [inputs, setInputs] = useState<SavedScenarioInputs>(() => {
    if (initialWorkspace?.inputs) return initialWorkspace.inputs
    const defaultCur: CurrencyCode = initialRoute.route.locale === 'es' ? 'MXN' : 'USD'
    return DEFAULT_INPUTS_BY_CURRENCY[defaultCur]
  })

  const [rates, setRates] = useState<ExchangeRates>(FALLBACK_RATES)
  const [convertOnCurrencySwitch, setConvertOnCurrencySwitch] = useState(true)
  const [showRealValues, setShowRealValues] = useState(false)
  const [scenarioName, setScenarioName] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(() =>
    loadSavedScenarios(),
  )

  useEffect(() => {
    let active = true
    fetchLiveExchangeRates().then((fetched) => {
      if (active) setRates(fetched)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    persistLastWorkspaceState({ currency, inputs })
  }, [currency, inputs])

  const handleCurrencyChange = (nextCurrency: CurrencyCode) => {
    if (nextCurrency === currency) return
    if (convertOnCurrencySwitch) {
      setInputs((prev) => ({
        ...prev,
        principal: Math.max(
          1000,
          convertCurrencyAmount(prev.principal, currency, nextCurrency, rates),
        ),
        extraMonthlyPayment: Math.max(
          0,
          convertCurrencyAmount(prev.extraMonthlyPayment, currency, nextCurrency, rates),
        ),
      }))
    }
    setCurrency(nextCurrency)
  }

  const totalRemainingMonths = Math.max(
    1,
    inputs.remainingYears * 12 + inputs.remainingMonths,
  )

  const simulation = useMemo(
    () =>
      simulateMortgageVsInvest({
        principal: inputs.principal,
        annualMortgageRate: inputs.annualMortgageRate,
        remainingTermMonths: totalRemainingMonths,
        extraMonthlyPayment: inputs.extraMonthlyPayment,
        expectedInvestmentReturn: inputs.expectedInvestmentReturn,
        capitalGainsTaxRate: inputs.capitalGainsTaxRate,
        annualInflationRate: inputs.annualInflationRate,
      }),
    [inputs, totalRemainingMonths],
  )

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS_BY_CURRENCY[currency])
    setShowRealValues(false)
  }

  const handleSaveScenario = () => {
    const defaultLabel = `${formatCurrency(inputs.principal, currency, t.lang, 0)} · ${inputs.annualMortgageRate}% vs ${inputs.expectedInvestmentReturn}%`
    const item: SavedScenario = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: scenarioName.trim() || defaultLabel,
      currency,
      savedAt: new Date().toISOString(),
      inputs: { ...inputs },
      verdictWinner: simulation.verdict.winner,
      netDifference: simulation.verdict.netDifference,
    }
    const updated = saveScenarioToStorage(item)
    setSavedScenarios(updated)
    setScenarioName('')
    setJustSaved(true)
    window.setTimeout(() => setJustSaved(false), 2000)
  }

  const handleLoadScenario = (scenario: SavedScenario) => {
    setCurrency(scenario.currency)
    setInputs(scenario.inputs)
  }

  const handleDeleteScenario = (id: string) => {
    setSavedScenarios(deleteSavedScenario(id))
  }

  const currencyMeta = CURRENCY_META[currency]
  const principalSliderMax = currency === 'MXN' ? 12_000_000 : 1_500_000
  const extraSliderMax = currency === 'MXN' ? 80_000 : 5_000

  const useReal = showRealValues && inputs.annualInflationRate > 0
  const displayedAdvantage = useReal
    ? simulation.verdict.netDifferenceReal
    : simulation.verdict.netDifference
  const displayedScenarioAWealth = useReal
    ? simulation.scenarioA.netWealthAtEndOfTermReal
    : simulation.scenarioA.netWealthAtEndOfTerm
  const displayedScenarioBWealth = useReal
    ? simulation.scenarioB.netAccumulatedWealthReal
    : simulation.scenarioB.netAccumulatedWealth

  const formattedPayoffDate = useMemo(() => {
    const [y, m, d] = simulation.scenarioA.payoffDateISO.split('-').map(Number)
    const dt = new Date(y, (m || 1) - 1, d || 1)
    return new Intl.DateTimeFormat(t.lang === 'es' ? 'es-MX' : 'en-US', {
      month: 'short',
      year: 'numeric',
    }).format(dt)
  }, [simulation.scenarioA.payoffDateISO, t.lang])

  const savedYears = Math.floor(simulation.scenarioA.monthsSaved / 12)
  const savedRemMonths = simulation.scenarioA.monthsSaved % 12
  const payoffYears = Math.floor(simulation.scenarioA.payoffMonths / 12)
  const payoffRemMonths = simulation.scenarioA.payoffMonths % 12

  const breakEvenMarkerPct = useMemo(() => {
    const be = simulation.verdict.breakEvenRate
    if (be === null) return 90
    const maxScale = Math.max(15, be * 1.6, inputs.expectedInvestmentReturn * 1.3)
    return Math.min(95, Math.max(5, (be / maxScale) * 100))
  }, [simulation.verdict.breakEvenRate, inputs.expectedInvestmentReturn])

  const expectedMarkerPct = useMemo(() => {
    const be = simulation.verdict.breakEvenRate ?? 12
    const maxScale = Math.max(15, be * 1.6, inputs.expectedInvestmentReturn * 1.3)
    return Math.min(97, Math.max(3, (inputs.expectedInvestmentReturn / maxScale) * 100))
  }, [simulation.verdict.breakEvenRate, inputs.expectedInvestmentReturn])

  const verdictColorClasses =
    simulation.verdict.winner === 'invest'
      ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50/70'
      : simulation.verdict.winner === 'payoff'
        ? 'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50/70'
        : 'border-slate-200 bg-white'

  const verdictTitle =
    simulation.verdict.winner === 'invest'
      ? t.verdict.investWinsTitle
      : simulation.verdict.winner === 'payoff'
        ? t.verdict.payoffWinsTitle
        : t.verdict.tieTitle

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SeoHead locale={route.locale} page={route.page} t={t} basePrefix={route.basePrefix} />

      {/* Top Navigation & Controls Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{t.header.badge}</span>
              </div>
              {route.page === 'home' ? (
                <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  {t.header.h1}
                </h1>
              ) : (
                <a
                  href={`${route.basePrefix}${ROUTE_SLUGS[route.locale].home}`}
                  onClick={(e) => {
                    e.preventDefault()
                    navigateTo(route.locale, 'home')
                  }}
                  className="mt-1.5 block text-2xl font-extrabold tracking-tight text-slate-900 hover:text-emerald-700 sm:text-3xl"
                >
                  {t.header.h1}
                </a>
              )}
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {t.header.subtitle}
              </p>
            </div>

            {/* Currency & Language Switcher Bar */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              {/* Currency Selector */}
              <div className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-slate-50 p-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <Coins className="h-3.5 w-3.5" />
                    {t.header.currencyLabel}
                  </span>
                  <div className="inline-flex rounded-lg bg-slate-200/70 p-0.5">
                    {(['USD', 'MXN', 'EUR'] as CurrencyCode[]).map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleCurrencyChange(code)}
                        className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                          currency === code
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex w-full items-center justify-between gap-3 px-0.5 text-[10px] text-slate-500">
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={convertOnCurrencySwitch}
                      onChange={(e) => setConvertOnCurrencySwitch(e.target.checked)}
                      className="h-3 w-3 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span>{t.header.convertToggle}</span>
                  </label>
                  <span className="font-mono">
                    {rates.source === 'frankfurter'
                      ? `${t.header.rateLiveLabel} (${rates.date})`
                      : t.header.rateFallbackLabel}
                  </span>
                </div>
              </div>

              {/* Bilingual /en/ vs /es/ Switcher */}
              <nav
                aria-label="Language"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1"
              >
                <Globe2 className="mx-2 h-4 w-4 text-slate-400" />
                <a
                  href={`${route.basePrefix}/en/`}
                  onClick={(e) => {
                    e.preventDefault()
                    switchLocale('en')
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    route.locale === 'en'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  EN
                </a>
                <a
                  href={`${route.basePrefix}/es/`}
                  onClick={(e) => {
                    e.preventDefault()
                    switchLocale('es')
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    route.locale === 'es'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ES
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {route.page !== 'home' ? (
          <LegalPage
            locale={route.locale}
            page={route.page}
            basePrefix={route.basePrefix}
            onNavigate={navigateTo}
          />
        ) : (
          <>
        {/* Core Simulator Grid: Inputs Left + Results Right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Inputs + Sidebar AdSlot + Saved Scenarios */}
          <div className="space-y-6 lg:col-span-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Calculator className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{t.inputs.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t.inputs.reset}
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <NumericInputField
                  label={t.inputs.principalLabel}
                  hint={t.inputs.principalHint}
                  value={inputs.principal}
                  onChange={(v) => setInputs((p) => ({ ...p, principal: v }))}
                  min={1000}
                  max={50_000_000}
                  sliderMax={principalSliderMax}
                  step={currencyMeta.stepPrincipal}
                  prefix={currencyMeta.symbol}
                />

                <NumericInputField
                  label={t.inputs.mortgageRateLabel}
                  value={inputs.annualMortgageRate}
                  onChange={(v) => setInputs((p) => ({ ...p, annualMortgageRate: v }))}
                  min={0}
                  max={30}
                  sliderMax={18}
                  step={0.1}
                  suffix="%"
                />

                {/* Remaining Term Years + Months */}
                <div className="space-y-1.5">
                  <span className="block text-sm font-medium text-slate-700">
                    {t.inputs.termLabel}
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        aria-label={`${t.inputs.termLabel} (${t.inputs.yearsUnit})`}
                        min={0}
                        max={40}
                        step={1}
                        value={inputs.remainingYears}
                        onChange={(e) => {
                          const yr = Math.min(40, Math.max(0, Math.round(Number(e.target.value) || 0)))
                          setInputs((p) => ({
                            ...p,
                            remainingYears: yr,
                            remainingMonths: yr === 0 && p.remainingMonths === 0 ? 1 : p.remainingMonths,
                          }))
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-12 font-mono text-sm font-semibold text-slate-900 tabular-nums shadow-xs focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                      <span className="pointer-events-none absolute right-3 text-xs font-semibold text-slate-400">
                        {t.inputs.yearsUnit}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        aria-label={`${t.inputs.termLabel} (${t.inputs.monthsUnit})`}
                        min={0}
                        max={11}
                        step={1}
                        value={inputs.remainingMonths}
                        onChange={(e) => {
                          const mo = Math.min(11, Math.max(0, Math.round(Number(e.target.value) || 0)))
                          setInputs((p) => ({
                            ...p,
                            remainingMonths: p.remainingYears === 0 && mo === 0 ? 1 : mo,
                          }))
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-14 font-mono text-sm font-semibold text-slate-900 tabular-nums shadow-xs focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                      <span className="pointer-events-none absolute right-3 text-xs font-semibold text-slate-400">
                        {t.inputs.monthsUnit}
                      </span>
                    </div>
                  </div>
                </div>

                <NumericInputField
                  label={t.inputs.extraMonthlyLabel}
                  hint={t.inputs.extraMonthlyHint}
                  value={inputs.extraMonthlyPayment}
                  onChange={(v) => setInputs((p) => ({ ...p, extraMonthlyPayment: v }))}
                  min={0}
                  max={1_000_000}
                  sliderMax={extraSliderMax}
                  step={currencyMeta.stepExtra}
                  prefix={currencyMeta.symbol}
                />

                <div className="border-t border-slate-100 pt-4">
                  <NumericInputField
                    label={t.inputs.investReturnLabel}
                    hint={t.inputs.investReturnHint}
                    value={inputs.expectedInvestmentReturn}
                    onChange={(v) =>
                      setInputs((p) => ({ ...p, expectedInvestmentReturn: v }))
                    }
                    min={0}
                    max={30}
                    sliderMax={18}
                    step={0.1}
                    suffix="%"
                  />
                </div>

                <NumericInputField
                  label={t.inputs.taxRateLabel}
                  hint={t.inputs.taxRateHint}
                  value={inputs.capitalGainsTaxRate}
                  onChange={(v) => setInputs((p) => ({ ...p, capitalGainsTaxRate: v }))}
                  min={0}
                  max={60}
                  sliderMax={45}
                  step={0.5}
                  suffix="%"
                />

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <NumericInputField
                    label={t.inputs.inflationLabel}
                    hint={t.inputs.inflationHint}
                    value={inputs.annualInflationRate}
                    onChange={(v) => setInputs((p) => ({ ...p, annualInflationRate: v }))}
                    min={0}
                    max={20}
                    sliderMax={10}
                    step={0.1}
                    suffix="%"
                  />

                  {inputs.annualInflationRate > 0 ? (
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={showRealValues}
                        onChange={(e) => setShowRealValues(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span>{t.inputs.showRealPower}</span>
                    </label>
                  ) : null}
                </div>
              </div>

              {/* Monthly Budget Summary Pill */}
              <div className="mt-5 space-y-1.5 rounded-xl bg-slate-900 p-3.5 text-white">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{t.inputs.basePaymentSummary}</span>
                  <span className="font-mono font-semibold text-white tabular-nums">
                    {formatCurrency(simulation.baseMonthlyPayment, currency, t.lang, 2)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-700/80 pt-1.5 text-xs">
                  <span className="text-slate-300">{t.inputs.totalBudgetSummary}</span>
                  <span className="font-mono font-bold text-emerald-300 tabular-nums">
                    {formatCurrency(simulation.totalMonthlyBudget, currency, t.lang, 2)}
                  </span>
                </div>
              </div>

              {/* Save to localStorage Controls */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder={t.inputs.scenarioNamePlaceholder}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveScenario}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  {justSaved ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      {t.inputs.savedToast}
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="h-3.5 w-3.5" />
                      {t.inputs.saveScenario}
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Saved Scenarios Panel */}
            <SavedScenariosPanel
              scenarios={savedScenarios}
              onLoad={handleLoadScenario}
              onDelete={handleDeleteScenario}
              t={t}
            />

            {/* AdSlot 2: Desktop Sidebar 300x250 (Zero CLS) */}
            <AdSlot
              variant="sidebar"
              slotId="sidebar-300x250"
              adLabel={t.ads.label}
              slotTitle={t.ads.sidebarSlotTitle}
            />
          </div>

          {/* Right Column: Verdict Hero, Scenario Cards, Top Banner AdSlot, Charts */}
          <div className="space-y-6 lg:col-span-8">
            {/* Verdict Hero Card */}
            <section
              className={`rounded-2xl border p-5 shadow-xs sm:p-6 ${verdictColorClasses}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <Scale className="h-4 w-4" />
                  {t.verdict.label}
                </span>
                <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                  {useReal ? t.verdict.realAdjustedBadge : t.verdict.nominalBadge}
                </span>
              </div>

              <div className="mt-3 grid gap-5 sm:grid-cols-12 sm:items-end">
                <div className="sm:col-span-7">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                    {verdictTitle}
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">{t.verdict.advantageLabel}</p>
                  <p
                    className={`mt-1 font-mono text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl ${
                      simulation.verdict.winner === 'invest'
                        ? 'text-emerald-700'
                        : simulation.verdict.winner === 'payoff'
                          ? 'text-blue-700'
                          : 'text-slate-700'
                    }`}
                  >
                    {simulation.verdict.winner === 'tie'
                      ? formatCurrency(0, currency, t.lang, 0)
                      : `+${formatCurrency(displayedAdvantage, currency, t.lang, 0)}`}
                  </p>
                </div>

                {/* Break-Even Rate Callout */}
                <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3.5 sm:col-span-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {t.verdict.breakEvenLabel}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-amber-600 tabular-nums">
                    {simulation.verdict.breakEvenRate === null
                      ? t.verdict.breakEvenUnreachable
                      : `${simulation.verdict.breakEvenRate.toFixed(2)}%`}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500">
                    {t.verdict.breakEvenHint}
                  </p>
                </div>
              </div>

              {/* Break-Even Visual Comparison Bar */}
              <div className="mt-5 rounded-xl border border-slate-200/80 bg-white/80 p-3.5">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-blue-700">{t.verdict.scalePayoffZone}</span>
                  <span className="font-mono text-slate-700">
                    {t.verdict.yourReturnLabel}: {inputs.expectedInvestmentReturn.toFixed(1)}%
                  </span>
                  <span className="text-emerald-700">{t.verdict.scaleInvestZone}</span>
                </div>
                <div className="relative mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                    style={{ width: `${breakEvenMarkerPct}%` }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 bg-gradient-to-r from-emerald-400 to-emerald-600"
                    style={{ left: `${breakEvenMarkerPct}%` }}
                  />
                  {/* Break-even divider */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-600"
                    style={{ left: `${breakEvenMarkerPct}%` }}
                  />
                  {/* Expected Return marker */}
                  <div
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow-sm"
                    style={{ left: `${expectedMarkerPct}%` }}
                  />
                </div>
              </div>
            </section>

            {/* Side-by-Side Scenario A & Scenario B Cards */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Scenario A Card */}
              <section className="flex flex-col justify-between rounded-2xl border border-blue-200/80 bg-white p-5 shadow-xs">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {t.scenarios.scenarioABadge}
                    </span>
                    <PiggyBank className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="mt-3 text-base font-bold text-slate-900">
                    {t.scenarios.scenarioATitle}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t.scenarios.scenarioASubtitle}
                  </p>

                  <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="text-xs text-slate-500">{t.scenarios.interestSaved}</dt>
                      <dd className="font-mono text-base font-bold text-blue-700 tabular-nums">
                        {formatCurrency(simulation.scenarioA.interestSaved, currency, t.lang, 0)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="text-xs text-slate-500">{t.scenarios.monthsSaved}</dt>
                      <dd className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                        {t.scenarios.yearsMonthsFormat(savedYears, savedRemMonths)} (
                        {simulation.scenarioA.monthsSaved} {t.inputs.monthsUnit})
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="flex items-center gap-1 text-xs text-slate-500">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {t.scenarios.payoffDate}
                      </dt>
                      <dd className="font-mono text-sm font-semibold text-slate-800">
                        {formattedPayoffDate} ({t.scenarios.newPayoffTime}{' '}
                        {t.scenarios.yearsMonthsFormat(payoffYears, payoffRemMonths)})
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-4 rounded-xl bg-blue-50/70 p-3">
                  <p className="text-[11px] font-medium text-blue-900/70">
                    {t.scenarios.postPayoffWealth}
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-extrabold text-blue-900 tabular-nums">
                    {formatCurrency(displayedScenarioAWealth, currency, t.lang, 0)}
                  </p>
                </div>
              </section>

              {/* Scenario B Card */}
              <section className="flex flex-col justify-between rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-xs">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      {t.scenarios.scenarioBBadge}
                    </span>
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="mt-3 text-base font-bold text-slate-900">
                    {t.scenarios.scenarioBTitle}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t.scenarios.scenarioBSubtitle}
                  </p>

                  <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="text-xs text-slate-500">{t.scenarios.totalContributed}</dt>
                      <dd className="font-mono text-sm font-semibold text-slate-800 tabular-nums">
                        {formatCurrency(simulation.scenarioB.totalContributed, currency, t.lang, 0)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="text-xs text-slate-500">{t.scenarios.grossValue}</dt>
                      <dd className="font-mono text-sm font-semibold text-slate-800 tabular-nums">
                        {formatCurrency(simulation.scenarioB.grossFutureValue, currency, t.lang, 0)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <dt className="text-xs text-slate-500">{t.scenarios.estimatedTax}</dt>
                      <dd className="font-mono text-sm font-semibold text-amber-700 tabular-nums">
                        -
                        {formatCurrency(
                          simulation.scenarioB.capitalGainsTaxPaid,
                          currency,
                          t.lang,
                          0,
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-4 rounded-xl bg-emerald-50/70 p-3">
                  <p className="text-[11px] font-medium text-emerald-900/70">
                    {t.scenarios.netFutureValue}
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-extrabold text-emerald-900 tabular-nums">
                    {formatCurrency(displayedScenarioBWealth, currency, t.lang, 0)}
                  </p>
                </div>
              </section>
            </div>

            {/* AdSlot 1: Top / Post-Verdict Responsive Banner (Zero CLS) */}
            <AdSlot
              variant="banner"
              slotId="banner-leaderboard"
              adLabel={t.ads.label}
              slotTitle={t.ads.topSlotTitle}
            />

            {/* Interactive Charts */}
            <SimulationCharts
              annualSchedule={simulation.annualSchedule}
              currency={currency}
              t={t}
              showRealValues={useReal}
            />
          </div>
        </div>

        {/* Full-Width Amortization Table + CSV Export */}
        <div className="mt-6">
          <AmortizationTable
            result={simulation}
            currency={currency}
            t={t}
            showRealValues={useReal}
          />
        </div>

        {/* AdSense Publisher Quality Content: Formula Breakdown & FAQ */}
        <div className="mt-6">
          <EducationSection t={t} />
        </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-1 text-xs leading-relaxed text-slate-500">
              <p>{t.footer.disclaimer}</p>
              <p>
                {t.footer.privacyNote} • {t.footer.ratesAttribution}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <nav
                aria-label="Legal"
                className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-slate-600"
              >
                {(
                  [
                    ['privacy', legalNav.privacy],
                    ['terms', legalNav.terms],
                    ['cookies', legalNav.cookies],
                    ['contact', legalNav.contact],
                  ] as const
                ).map(([pageKey, label]) => (
                  <a
                    key={pageKey}
                    href={`${route.basePrefix}${ROUTE_SLUGS[route.locale][pageKey]}`}
                    onClick={(e) => {
                      e.preventDefault()
                      navigateTo(route.locale, pageKey)
                    }}
                    className={`underline-offset-4 transition hover:text-slate-900 hover:underline ${
                      route.page === pageKey ? 'font-bold text-slate-900 underline' : ''
                    }`}
                  >
                    {label}
                  </a>
                ))}
              </nav>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <a
                  href={`${route.basePrefix}${ROUTE_SLUGS.en[route.page]}`}
                  onClick={(e) => {
                    e.preventDefault()
                    switchLocale('en')
                  }}
                  className="text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
                >
                  English (/en/)
                </a>
                <span className="text-slate-300">|</span>
                <a
                  href={`${route.basePrefix}${ROUTE_SLUGS.es[route.page]}`}
                  onClick={(e) => {
                    e.preventDefault()
                    switchLocale('es')
                  }}
                  className="text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
                >
                  Español (/es/)
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
