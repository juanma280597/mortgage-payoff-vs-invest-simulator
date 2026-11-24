export interface SimulationInputs {
  /** Remaining mortgage principal balance */
  principal: number
  /** Annual nominal mortgage interest rate in percent (e.g. 6.5 for 6.5%) */
  annualMortgageRate: number
  /** Remaining mortgage term in months (e.g. 240 for 20 years) */
  remainingTermMonths: number
  /** Extra monthly surplus available to either pay down principal or invest */
  extraMonthlyPayment: number
  /** Expected annual investment return in percent (e.g. 8.5 for 8.5%) */
  expectedInvestmentReturn: number
  /** Capital gains tax rate applied to investment profits in percent (e.g. 15 for 15%) */
  capitalGainsTaxRate: number
  /** Optional annual inflation rate in percent (e.g. 3 for 3%) */
  annualInflationRate: number
  /** Reference start date for payoff date estimation */
  startDate?: Date
}

export interface MonthlyScheduleRow {
  month: number
  year: number
  dateISO: string
  /** Baseline (no extra payment) */
  baselinePayment: number
  baselineInterest: number
  baselinePrincipal: number
  baselineBalance: number
  baselineCumulativeInterest: number
  /** Scenario A (pay extra toward principal, then reinvest freed-up payment after payoff) */
  scenarioAPayment: number
  scenarioAInterest: number
  scenarioAPrincipal: number
  scenarioABalance: number
  scenarioACumulativeInterest: number
  scenarioANetPortfolio: number
  scenarioANetPortfolioReal: number
  /** Scenario B (pay baseline mortgage + invest extra monthly) */
  scenarioBContribution: number
  scenarioBCumulativeContributions: number
  scenarioBGrossPortfolio: number
  scenarioBNetPortfolio: number
  scenarioBNetPortfolioReal: number
}

export interface AnnualScheduleRow {
  year: number
  monthsInYear: number
  baselineInterestPaid: number
  baselinePrincipalPaid: number
  baselineEndingBalance: number
  scenarioAInterestPaid: number
  scenarioAPrincipalPaid: number
  scenarioAEndingBalance: number
  scenarioANetPortfolio: number
  scenarioANetPortfolioReal: number
  scenarioBAnnualContribution: number
  scenarioBCumulativeContributions: number
  scenarioBGrossPortfolio: number
  scenarioBNetPortfolio: number
  scenarioBNetPortfolioReal: number
}

export interface ScenarioAResult {
  payoffMonths: number
  monthsSaved: number
  payoffDateISO: string
  baselineTotalInterest: number
  totalInterestPaid: number
  interestSaved: number
  totalReinvestedPrincipal: number
  grossReinvestedPortfolio: number
  capitalGainsTaxPaid: number
  netWealthAtEndOfTerm: number
  netWealthAtEndOfTermReal: number
}

export interface ScenarioBResult {
  totalContributed: number
  grossFutureValue: number
  grossInvestmentGain: number
  capitalGainsTaxPaid: number
  netFutureValue: number
  netInvestmentGain: number
  netAccumulatedWealth: number
  netAccumulatedWealthReal: number
}

export type VerdictWinner = 'payoff' | 'invest' | 'tie'

export interface SimulationVerdict {
  winner: VerdictWinner
  /** Exact annual investment return (%) at which Scenario B equals Scenario A net wealth at end of term; null if unreachable (e.g. 100% tax) */
  breakEvenRate: number | null
  /** Absolute net wealth advantage of the winning option at end of term (nominal) */
  netDifference: number
  /** Absolute net wealth advantage in today's purchasing power (inflation-adjusted) */
  netDifferenceReal: number
}

export interface SimulationResult {
  baseMonthlyPayment: number
  totalMonthlyBudget: number
  baselineTotalPaid: number
  scenarioA: ScenarioAResult
  scenarioB: ScenarioBResult
  verdict: SimulationVerdict
  monthlySchedule: MonthlyScheduleRow[]
  annualSchedule: AnnualScheduleRow[]
}

export function roundCents(value: number): number {
  if (!Number.isFinite(value)) return 0
  const sign = value < 0 ? -1 : 1
  return (sign * Math.round((Math.abs(value) + 1e-9) * 100)) / 100
}

export function addMonthsSafe(date: Date, months: number): Date {
  const targetYear = date.getFullYear()
  const targetMonth = date.getMonth() + months
  const day = date.getDate()
  const firstOfTarget = new Date(targetYear, targetMonth, 1)
  const lastDayOfTarget = new Date(
    firstOfTarget.getFullYear(),
    firstOfTarget.getMonth() + 1,
    0,
  ).getDate()
  return new Date(
    firstOfTarget.getFullYear(),
    firstOfTarget.getMonth(),
    Math.min(day, lastDayOfTarget),
  )
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function calculateMonthlyPayment(
  principal: number,
  annualRatePercent: number,
  termMonths: number,
): number {
  if (principal <= 0 || termMonths <= 0) return 0
  const monthlyRate = Math.max(0, annualRatePercent) / 100 / 12
  if (monthlyRate === 0) {
    return principal / termMonths
  }
  const factor = Math.pow(1 + monthlyRate, termMonths)
  return (principal * (monthlyRate * factor)) / (factor - 1)
}

interface SanitizedInputs {
  principalCents: number
  annualMortgageRate: number
  monthlyMortgageRate: number
  termMonths: number
  extraPaymentCents: number
  expectedInvestmentReturn: number
  capitalGainsTaxRate: number
  annualInflationRate: number
  startDate: Date
}

function sanitizeInputs(inputs: SimulationInputs): SanitizedInputs {
  const principal = Math.max(0, Number.isFinite(inputs.principal) ? inputs.principal : 0)
  const annualMortgageRate = clamp(inputs.annualMortgageRate, 0, 100)
  const termMonths = Math.max(1, Math.round(Number.isFinite(inputs.remainingTermMonths) ? inputs.remainingTermMonths : 1))
  const extraMonthlyPayment = Math.max(
    0,
    Number.isFinite(inputs.extraMonthlyPayment) ? inputs.extraMonthlyPayment : 0,
  )
  const expectedInvestmentReturn = clamp(inputs.expectedInvestmentReturn, 0, 100)
  const capitalGainsTaxRate = clamp(inputs.capitalGainsTaxRate, 0, 100)
  const annualInflationRate = clamp(inputs.annualInflationRate, 0, 100)
  const startDate = inputs.startDate ? new Date(inputs.startDate.getTime()) : new Date()

  return {
    principalCents: Math.round(principal * 100),
    annualMortgageRate,
    monthlyMortgageRate: annualMortgageRate / 100 / 12,
    termMonths,
    extraPaymentCents: Math.round(extraMonthlyPayment * 100),
    expectedInvestmentReturn,
    capitalGainsTaxRate,
    annualInflationRate,
    startDate,
  }
}

function computeAfterTaxPortfolio(gross: number, contributed: number, taxRatePercent: number): {
  tax: number
  net: number
} {
  const gain = Math.max(0, gross - contributed)
  const tax = gain * (taxRatePercent / 100)
  return {
    tax,
    net: gross - tax,
  }
}

/**
 * Fast evaluation of Scenario A vs Scenario B end-of-term net wealth at a given annual investment rate.
 * Used for exact break-even rate bisection without allocating schedule arrays.
 */
function evaluateNetWealthDifference(
  s: SanitizedInputs,
  basePaymentCents: number,
  annualInvestmentRate: number,
): number {
  const monthlyInvRate = annualInvestmentRate / 100 / 12
  const monthlyBudget = (basePaymentCents + s.extraPaymentCents) / 100
  const extraMonthly = s.extraPaymentCents / 100

  let balanceACents = s.principalCents
  let portfolioAGross = 0
  let contributedA = 0

  let portfolioBGross = 0
  let contributedB = 0

  for (let month = 1; month <= s.termMonths; month++) {
    let paymentACents = 0
    if (balanceACents > 0) {
      const interestACents = Math.round(balanceACents * s.monthlyMortgageRate)
      const targetACents = basePaymentCents + s.extraPaymentCents
      if (month === s.termMonths || balanceACents + interestACents <= targetACents) {
        paymentACents = balanceACents + interestACents
        balanceACents = 0
      } else {
        paymentACents = targetACents
        const principalACents = paymentACents - interestACents
        balanceACents -= principalACents
      }
    }

    const contribA = Math.max(0, monthlyBudget - paymentACents / 100)
    portfolioAGross = portfolioAGross * (1 + monthlyInvRate) + contribA
    contributedA += contribA

    portfolioBGross = portfolioBGross * (1 + monthlyInvRate) + extraMonthly
    contributedB += extraMonthly
  }

  const afterTaxA = computeAfterTaxPortfolio(portfolioAGross, contributedA, s.capitalGainsTaxRate)
  const afterTaxB = computeAfterTaxPortfolio(portfolioBGross, contributedB, s.capitalGainsTaxRate)

  return afterTaxB.net - afterTaxA.net
}

function solveBreakEvenRate(s: SanitizedInputs, basePaymentCents: number): number | null {
  if (s.principalCents === 0) return 0
  if (s.extraPaymentCents === 0) {
    if (s.capitalGainsTaxRate >= 100) return null
    return roundCents(s.annualMortgageRate / (1 - s.capitalGainsTaxRate / 100))
  }
  if (s.capitalGainsTaxRate >= 100 && s.annualMortgageRate > 0) {
    return null
  }

  const diffAtZero = evaluateNetWealthDifference(s, basePaymentCents, 0)
  if (Math.abs(diffAtZero) < 1e-6) return 0

  let low = 0
  let high = 100
  const diffAtHigh = evaluateNetWealthDifference(s, basePaymentCents, high)
  if (diffAtHigh < 0) {
    return null
  }

  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2
    const diff = evaluateNetWealthDifference(s, basePaymentCents, mid)
    if (diff < 0) {
      low = mid
    } else {
      high = mid
    }
  }

  return roundCents((low + high) / 2)
}

export function simulateMortgageVsInvest(inputs: SimulationInputs): SimulationResult {
  const s = sanitizeInputs(inputs)
  const rawBasePayment = calculateMonthlyPayment(
    s.principalCents / 100,
    s.annualMortgageRate,
    s.termMonths,
  )
  const basePaymentCents = Math.round(rawBasePayment * 100)
  const totalBudgetCents = basePaymentCents + s.extraPaymentCents
  const monthlyInvRate = s.expectedInvestmentReturn / 100 / 12
  const extraMonthly = s.extraPaymentCents / 100
  const totalMonthlyBudget = totalBudgetCents / 100

  let baselineBalanceCents = s.principalCents
  let baselineCumulativeInterestCents = 0
  let baselineTotalPaidCents = 0

  let scenarioABalanceCents = s.principalCents
  let scenarioACumulativeInterestCents = 0
  let scenarioAPayoffMonth = s.principalCents === 0 ? 0 : s.termMonths
  let scenarioAPaidOff = s.principalCents === 0

  let portfolioAGross = 0
  let contributedA = 0

  let portfolioBGross = 0
  let contributedB = 0

  const monthlySchedule: MonthlyScheduleRow[] = []
  const annualMap = new Map<number, AnnualScheduleRow>()

  for (let month = 1; month <= s.termMonths; month++) {
    const year = Math.ceil(month / 12)
    const rowDate = addMonthsSafe(s.startDate, month)
    const inflationDeflator =
      s.annualInflationRate > 0 ? Math.pow(1 + s.annualInflationRate / 100, month / 12) : 1

    // 1. Baseline mortgage step
    let baselineInterestCents = 0
    let baselinePrincipalCents = 0
    let baselinePaymentCents = 0

    if (baselineBalanceCents > 0) {
      baselineInterestCents = Math.round(baselineBalanceCents * s.monthlyMortgageRate)
      if (month === s.termMonths || baselineBalanceCents + baselineInterestCents <= basePaymentCents) {
        baselinePaymentCents = baselineBalanceCents + baselineInterestCents
        baselinePrincipalCents = baselineBalanceCents
        baselineBalanceCents = 0
      } else {
        baselinePaymentCents = basePaymentCents
        baselinePrincipalCents = baselinePaymentCents - baselineInterestCents
        baselineBalanceCents -= baselinePrincipalCents
      }
      baselineCumulativeInterestCents += baselineInterestCents
      baselineTotalPaidCents += baselinePaymentCents
    }

    // 2. Scenario A (Pay down mortgage faster, then reinvest freed-up budget)
    let scenarioAInterestCents = 0
    let scenarioAPrincipalCents = 0
    let scenarioAPaymentCents = 0

    if (scenarioABalanceCents > 0) {
      scenarioAInterestCents = Math.round(scenarioABalanceCents * s.monthlyMortgageRate)
      if (month === s.termMonths || scenarioABalanceCents + scenarioAInterestCents <= totalBudgetCents) {
        scenarioAPaymentCents = scenarioABalanceCents + scenarioAInterestCents
        scenarioAPrincipalCents = scenarioABalanceCents
        scenarioABalanceCents = 0
        if (!scenarioAPaidOff) {
          scenarioAPayoffMonth = month
          scenarioAPaidOff = true
        }
      } else {
        scenarioAPaymentCents = totalBudgetCents
        scenarioAPrincipalCents = scenarioAPaymentCents - scenarioAInterestCents
        scenarioABalanceCents -= scenarioAPrincipalCents
      }
      scenarioACumulativeInterestCents += scenarioAInterestCents
    }

    const contribA = Math.max(0, totalMonthlyBudget - scenarioAPaymentCents / 100)
    portfolioAGross = portfolioAGross * (1 + monthlyInvRate) + contribA
    contributedA += contribA
    const afterTaxA = computeAfterTaxPortfolio(portfolioAGross, contributedA, s.capitalGainsTaxRate)

    // 3. Scenario B (Invest extra monthly from month 1)
    portfolioBGross = portfolioBGross * (1 + monthlyInvRate) + extraMonthly
    contributedB += extraMonthly
    const afterTaxB = computeAfterTaxPortfolio(portfolioBGross, contributedB, s.capitalGainsTaxRate)

    const row: MonthlyScheduleRow = {
      month,
      year,
      dateISO: toISODate(rowDate),
      baselinePayment: baselinePaymentCents / 100,
      baselineInterest: baselineInterestCents / 100,
      baselinePrincipal: baselinePrincipalCents / 100,
      baselineBalance: baselineBalanceCents / 100,
      baselineCumulativeInterest: baselineCumulativeInterestCents / 100,
      scenarioAPayment: scenarioAPaymentCents / 100,
      scenarioAInterest: scenarioAInterestCents / 100,
      scenarioAPrincipal: scenarioAPrincipalCents / 100,
      scenarioABalance: scenarioABalanceCents / 100,
      scenarioACumulativeInterest: scenarioACumulativeInterestCents / 100,
      scenarioANetPortfolio: roundCents(afterTaxA.net),
      scenarioANetPortfolioReal: roundCents(afterTaxA.net / inflationDeflator),
      scenarioBContribution: extraMonthly,
      scenarioBCumulativeContributions: roundCents(contributedB),
      scenarioBGrossPortfolio: roundCents(portfolioBGross),
      scenarioBNetPortfolio: roundCents(afterTaxB.net),
      scenarioBNetPortfolioReal: roundCents(afterTaxB.net / inflationDeflator),
    }

    monthlySchedule.push(row)

    const existingAnnual = annualMap.get(year)
    if (!existingAnnual) {
      annualMap.set(year, {
        year,
        monthsInYear: 1,
        baselineInterestPaid: row.baselineInterest,
        baselinePrincipalPaid: row.baselinePrincipal,
        baselineEndingBalance: row.baselineBalance,
        scenarioAInterestPaid: row.scenarioAInterest,
        scenarioAPrincipalPaid: row.scenarioAPrincipal,
        scenarioAEndingBalance: row.scenarioABalance,
        scenarioANetPortfolio: row.scenarioANetPortfolio,
        scenarioANetPortfolioReal: row.scenarioANetPortfolioReal,
        scenarioBAnnualContribution: row.scenarioBContribution,
        scenarioBCumulativeContributions: row.scenarioBCumulativeContributions,
        scenarioBGrossPortfolio: row.scenarioBGrossPortfolio,
        scenarioBNetPortfolio: row.scenarioBNetPortfolio,
        scenarioBNetPortfolioReal: row.scenarioBNetPortfolioReal,
      })
    } else {
      existingAnnual.monthsInYear += 1
      existingAnnual.baselineInterestPaid = roundCents(
        existingAnnual.baselineInterestPaid + row.baselineInterest,
      )
      existingAnnual.baselinePrincipalPaid = roundCents(
        existingAnnual.baselinePrincipalPaid + row.baselinePrincipal,
      )
      existingAnnual.baselineEndingBalance = row.baselineBalance
      existingAnnual.scenarioAInterestPaid = roundCents(
        existingAnnual.scenarioAInterestPaid + row.scenarioAInterest,
      )
      existingAnnual.scenarioAPrincipalPaid = roundCents(
        existingAnnual.scenarioAPrincipalPaid + row.scenarioAPrincipal,
      )
      existingAnnual.scenarioAEndingBalance = row.scenarioABalance
      existingAnnual.scenarioANetPortfolio = row.scenarioANetPortfolio
      existingAnnual.scenarioANetPortfolioReal = row.scenarioANetPortfolioReal
      existingAnnual.scenarioBAnnualContribution = roundCents(
        existingAnnual.scenarioBAnnualContribution + row.scenarioBContribution,
      )
      existingAnnual.scenarioBCumulativeContributions = row.scenarioBCumulativeContributions
      existingAnnual.scenarioBGrossPortfolio = row.scenarioBGrossPortfolio
      existingAnnual.scenarioBNetPortfolio = row.scenarioBNetPortfolio
      existingAnnual.scenarioBNetPortfolioReal = row.scenarioBNetPortfolioReal
    }
  }

  const lastRow = monthlySchedule[monthlySchedule.length - 1]
  const finalDeflator =
    s.annualInflationRate > 0 ? Math.pow(1 + s.annualInflationRate / 100, s.termMonths / 12) : 1

  const finalTaxA = computeAfterTaxPortfolio(portfolioAGross, contributedA, s.capitalGainsTaxRate)
  const finalTaxB = computeAfterTaxPortfolio(portfolioBGross, contributedB, s.capitalGainsTaxRate)

  const baselineTotalInterest = baselineCumulativeInterestCents / 100
  const scenarioATotalInterest = scenarioACumulativeInterestCents / 100
  const interestSaved = roundCents(baselineTotalInterest - scenarioATotalInterest)
  const monthsSaved = Math.max(0, s.termMonths - scenarioAPayoffMonth)
  const payoffDateISO = toISODate(addMonthsSafe(s.startDate, scenarioAPayoffMonth))

  const netWealthA = roundCents(finalTaxA.net)
  const netWealthAReal = roundCents(finalTaxA.net / finalDeflator)
  const netWealthB = roundCents(finalTaxB.net)
  const netWealthBReal = roundCents(finalTaxB.net / finalDeflator)

  const rawDiff = netWealthB - netWealthA
  const rawDiffReal = netWealthBReal - netWealthAReal

  let winner: VerdictWinner = 'tie'
  if (Math.abs(rawDiff) >= 0.01) {
    winner = rawDiff > 0 ? 'invest' : 'payoff'
  }

  const breakEvenRate = solveBreakEvenRate(s, basePaymentCents)

  return {
    baseMonthlyPayment: basePaymentCents / 100,
    totalMonthlyBudget: roundCents(totalMonthlyBudget),
    baselineTotalPaid: baselineTotalPaidCents / 100,
    scenarioA: {
      payoffMonths: scenarioAPayoffMonth,
      monthsSaved,
      payoffDateISO,
      baselineTotalInterest,
      totalInterestPaid: scenarioATotalInterest,
      interestSaved,
      totalReinvestedPrincipal: roundCents(contributedA),
      grossReinvestedPortfolio: roundCents(portfolioAGross),
      capitalGainsTaxPaid: roundCents(finalTaxA.tax),
      netWealthAtEndOfTerm: lastRow ? lastRow.scenarioANetPortfolio : netWealthA,
      netWealthAtEndOfTermReal: lastRow ? lastRow.scenarioANetPortfolioReal : netWealthAReal,
    },
    scenarioB: {
      totalContributed: roundCents(contributedB),
      grossFutureValue: roundCents(portfolioBGross),
      grossInvestmentGain: roundCents(Math.max(0, portfolioBGross - contributedB)),
      capitalGainsTaxPaid: roundCents(finalTaxB.tax),
      netFutureValue: netWealthB,
      netInvestmentGain: roundCents(netWealthB - contributedB),
      netAccumulatedWealth: lastRow ? lastRow.scenarioBNetPortfolio : netWealthB,
      netAccumulatedWealthReal: lastRow ? lastRow.scenarioBNetPortfolioReal : netWealthBReal,
    },
    verdict: {
      winner,
      breakEvenRate,
      netDifference: roundCents(Math.abs(rawDiff)),
      netDifferenceReal: roundCents(Math.abs(rawDiffReal)),
    },
    monthlySchedule,
    annualSchedule: Array.from(annualMap.values()),
  }
}

export interface CsvExportOptions {
  granularity: 'monthly' | 'annual'
  currency: string
  locale: 'en' | 'es'
}

function escapeCsvCell(cell: string | number): string {
  const str = String(cell)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function buildScheduleCSV(
  result: SimulationResult,
  options: CsvExportOptions,
): string {
  const { granularity, currency, locale } = options
  const isEs = locale === 'es'

  if (granularity === 'annual') {
    const headers = isEs
      ? [
          'Año',
          `Interés Base (${currency})`,
          `Capital Base (${currency})`,
          `Saldo Final Base (${currency})`,
          `Interés Escenario A (${currency})`,
          `Capital Escenario A (${currency})`,
          `Saldo Final Escenario A (${currency})`,
          `Patrimonio Neto Escenario A (${currency})`,
          `Aporte Anual Escenario B (${currency})`,
          `Valor Futuro Neto Escenario B (${currency})`,
        ]
      : [
          'Year',
          `Baseline Interest (${currency})`,
          `Baseline Principal (${currency})`,
          `Baseline Ending Balance (${currency})`,
          `Scenario A Interest (${currency})`,
          `Scenario A Principal (${currency})`,
          `Scenario A Ending Balance (${currency})`,
          `Scenario A Net Wealth (${currency})`,
          `Scenario B Contribution (${currency})`,
          `Scenario B Net Future Value (${currency})`,
        ]

    const lines = [headers.map(escapeCsvCell).join(',')]
    for (const row of result.annualSchedule) {
      lines.push(
        [
          row.year,
          row.baselineInterestPaid.toFixed(2),
          row.baselinePrincipalPaid.toFixed(2),
          row.baselineEndingBalance.toFixed(2),
          row.scenarioAInterestPaid.toFixed(2),
          row.scenarioAPrincipalPaid.toFixed(2),
          row.scenarioAEndingBalance.toFixed(2),
          row.scenarioANetPortfolio.toFixed(2),
          row.scenarioBAnnualContribution.toFixed(2),
          row.scenarioBNetPortfolio.toFixed(2),
        ]
          .map(escapeCsvCell)
          .join(','),
      )
    }
    return `\uFEFF${lines.join('\r\n')}`
  }

  const headers = isEs
    ? [
        'Mes',
        'Fecha',
        `Pago Base (${currency})`,
        `Interés Base (${currency})`,
        `Capital Base (${currency})`,
        `Saldo Base (${currency})`,
        `Pago Escenario A (${currency})`,
        `Interés Escenario A (${currency})`,
        `Capital Escenario A (${currency})`,
        `Saldo Escenario A (${currency})`,
        `Patrimonio Neto Escenario A (${currency})`,
        `Aporte Escenario B (${currency})`,
        `Valor Futuro Neto Escenario B (${currency})`,
      ]
    : [
        'Month',
        'Date',
        `Baseline Payment (${currency})`,
        `Baseline Interest (${currency})`,
        `Baseline Principal (${currency})`,
        `Baseline Balance (${currency})`,
        `Scenario A Payment (${currency})`,
        `Scenario A Interest (${currency})`,
        `Scenario A Principal (${currency})`,
        `Scenario A Balance (${currency})`,
        `Scenario A Net Wealth (${currency})`,
        `Scenario B Contribution (${currency})`,
        `Scenario B Net Future Value (${currency})`,
      ]

  const lines = [headers.map(escapeCsvCell).join(',')]
  for (const row of result.monthlySchedule) {
    lines.push(
      [
        row.month,
        row.dateISO,
        row.baselinePayment.toFixed(2),
        row.baselineInterest.toFixed(2),
        row.baselinePrincipal.toFixed(2),
        row.baselineBalance.toFixed(2),
        row.scenarioAPayment.toFixed(2),
        row.scenarioAInterest.toFixed(2),
        row.scenarioAPrincipal.toFixed(2),
        row.scenarioABalance.toFixed(2),
        row.scenarioANetPortfolio.toFixed(2),
        row.scenarioBContribution.toFixed(2),
        row.scenarioBNetPortfolio.toFixed(2),
      ]
        .map(escapeCsvCell)
        .join(','),
    )
  }
  return `\uFEFF${lines.join('\r\n')}`
}
