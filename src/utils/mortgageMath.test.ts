import { describe, expect, it } from 'vitest'
import {
  addMonthsSafe,
  buildScheduleCSV,
  calculateMonthlyPayment,
  roundCents,
  simulateMortgageVsInvest,
} from './mortgageMath'

describe('mortgageMath financial engine', () => {
  it('computes standard fixed-rate monthly payment accurately', () => {
    const payment = calculateMonthlyPayment(250_000, 6.0, 360)
    expect(roundCents(payment)).toBe(1498.88)

    const zeroRatePayment = calculateMonthlyPayment(120_000, 0, 120)
    expect(roundCents(zeroRatePayment)).toBe(1000)
  })

  it('maintains zero rounding drift across 360 monthly amortization rows', () => {
    const principal = 315_450.75
    const result = simulateMortgageVsInvest({
      principal,
      annualMortgageRate: 6.375,
      remainingTermMonths: 360,
      extraMonthlyPayment: 425.5,
      expectedInvestmentReturn: 8.25,
      capitalGainsTaxRate: 15,
      annualInflationRate: 2.5,
      startDate: new Date(2026, 0, 15),
    })

    const baselinePrincipalSum = result.monthlySchedule.reduce(
      (acc, r) => acc + Math.round(r.baselinePrincipal * 100),
      0,
    )
    const scenarioAPrincipalSum = result.monthlySchedule.reduce(
      (acc, r) => acc + Math.round(r.scenarioAPrincipal * 100),
      0,
    )

    expect(baselinePrincipalSum).toBe(Math.round(principal * 100))
    expect(scenarioAPrincipalSum).toBe(Math.round(principal * 100))

    const lastRow = result.monthlySchedule[result.monthlySchedule.length - 1]
    expect(lastRow.baselineBalance).toBe(0)
    expect(lastRow.scenarioABalance).toBe(0)

    for (const row of result.monthlySchedule) {
      expect(roundCents(row.baselineInterest + row.baselinePrincipal)).toBe(
        roundCents(row.baselinePayment),
      )
      expect(roundCents(row.scenarioAInterest + row.scenarioAPrincipal)).toBe(
        roundCents(row.scenarioAPayment),
      )
    }
  })

  it('produces identical baseline and Scenario A when extraMonthlyPayment is 0', () => {
    const result = simulateMortgageVsInvest({
      principal: 200_000,
      annualMortgageRate: 5.5,
      remainingTermMonths: 240,
      extraMonthlyPayment: 0,
      expectedInvestmentReturn: 8,
      capitalGainsTaxRate: 15,
      annualInflationRate: 0,
      startDate: new Date(2026, 0, 1),
    })

    expect(result.scenarioA.monthsSaved).toBe(0)
    expect(result.scenarioA.interestSaved).toBe(0)
    expect(result.scenarioA.payoffMonths).toBe(240)
    expect(result.scenarioB.totalContributed).toBe(0)
    expect(result.scenarioB.netFutureValue).toBe(0)
    expect(result.verdict.winner).toBe('tie')
  })

  it('satisfies break-even equivalence invariant when invest return equals mortgage rate and tax is 0%', () => {
    const result = simulateMortgageVsInvest({
      principal: 250_000,
      annualMortgageRate: 6.0,
      remainingTermMonths: 300,
      extraMonthlyPayment: 600,
      expectedInvestmentReturn: 6.0,
      capitalGainsTaxRate: 0,
      annualInflationRate: 0,
      startDate: new Date(2026, 0, 1),
    })

    // Paying down a 6% mortgage is mathematically equivalent to earning 6% tax-free.
    // Over 300 months (~$450k portfolio), banking cent-rounding on monthly interest produces < $5 variance (< 0.001%).
    expect(Math.abs(result.scenarioA.netWealthAtEndOfTerm - result.scenarioB.netFutureValue)).toBeLessThan(5)
    expect(result.verdict.breakEvenRate).not.toBeNull()
    expect(Math.abs((result.verdict.breakEvenRate ?? 0) - 6.0)).toBeLessThanOrEqual(0.02)
  })

  it('favors mortgage payoff when investment return equals mortgage rate but capital gains tax > 0%', () => {
    const result = simulateMortgageVsInvest({
      principal: 250_000,
      annualMortgageRate: 6.5,
      remainingTermMonths: 240,
      extraMonthlyPayment: 500,
      expectedInvestmentReturn: 6.5,
      capitalGainsTaxRate: 20,
      annualInflationRate: 0,
      startDate: new Date(2026, 0, 1),
    })

    expect(result.verdict.winner).toBe('payoff')
    expect(result.verdict.netDifference).toBeGreaterThan(0)
    expect(result.verdict.breakEvenRate).not.toBeNull()
    expect(result.verdict.breakEvenRate!).toBeGreaterThan(6.5)
  })

  it('favors investing when expected return clearly exceeds break-even rate', () => {
    const result = simulateMortgageVsInvest({
      principal: 300_000,
      annualMortgageRate: 4.5,
      remainingTermMonths: 300,
      extraMonthlyPayment: 700,
      expectedInvestmentReturn: 9.5,
      capitalGainsTaxRate: 15,
      annualInflationRate: 0,
      startDate: new Date(2026, 0, 1),
    })

    expect(result.verdict.winner).toBe('invest')
    expect(result.verdict.netDifference).toBeGreaterThan(50_000)
    expect(result.scenarioA.monthsSaved).toBeGreaterThan(90)
    expect(result.scenarioA.interestSaved).toBeGreaterThan(60_000)
    expect(result.scenarioB.capitalGainsTaxPaid).toBeGreaterThan(0)
    expect(result.scenarioB.netFutureValue).toBeLessThan(result.scenarioB.grossFutureValue)
  })

  it('applies annual inflation deflator accurately to real purchasing power outputs', () => {
    const result = simulateMortgageVsInvest({
      principal: 200_000,
      annualMortgageRate: 6.0,
      remainingTermMonths: 240, // exactly 20 years
      extraMonthlyPayment: 500,
      expectedInvestmentReturn: 8.5,
      capitalGainsTaxRate: 15,
      annualInflationRate: 3.0,
      startDate: new Date(2026, 0, 1),
    })

    const expectedDeflator = Math.pow(1.03, 20)
    expect(
      Math.abs(
        result.scenarioB.netAccumulatedWealthReal -
          roundCents(result.scenarioB.netAccumulatedWealth / expectedDeflator),
      ),
    ).toBeLessThanOrEqual(0.02)
  })

  it('handles 0% mortgage interest cleanly', () => {
    const result = simulateMortgageVsInvest({
      principal: 60_000,
      annualMortgageRate: 0,
      remainingTermMonths: 60,
      extraMonthlyPayment: 500,
      expectedInvestmentReturn: 5,
      capitalGainsTaxRate: 15,
      annualInflationRate: 0,
      startDate: new Date(2026, 0, 1),
    })

    expect(result.baseMonthlyPayment).toBe(1000)
    expect(result.scenarioA.payoffMonths).toBe(40)
    expect(result.scenarioA.monthsSaved).toBe(20)
    expect(result.scenarioA.interestSaved).toBe(0)
    expect(result.verdict.winner).toBe('invest')
  })

  it('calculates safe calendar payoff dates across leap years and month-ends', () => {
    const jan31 = new Date(2024, 0, 31)
    const febLeap = addMonthsSafe(jan31, 1)
    expect(febLeap.getFullYear()).toBe(2024)
    expect(febLeap.getMonth()).toBe(1)
    expect(febLeap.getDate()).toBe(29)

    const nonLeapJan31 = new Date(2026, 0, 31)
    const febNonLeap = addMonthsSafe(nonLeapJan31, 1)
    expect(febNonLeap.getFullYear()).toBe(2026)
    expect(febNonLeap.getMonth()).toBe(1)
    expect(febNonLeap.getDate()).toBe(28)
  })

  it('aggregates annual schedule accurately and exports valid UTF-8 CSV', () => {
    const result = simulateMortgageVsInvest({
      principal: 150_000,
      annualMortgageRate: 6.0,
      remainingTermMonths: 120,
      extraMonthlyPayment: 300,
      expectedInvestmentReturn: 8.0,
      capitalGainsTaxRate: 15,
      annualInflationRate: 2.0,
      startDate: new Date(2026, 0, 1),
    })

    expect(result.annualSchedule).toHaveLength(10)
    const totalAnnualInterest = result.annualSchedule.reduce(
      (sum, row) => roundCents(sum + row.baselineInterestPaid),
      0,
    )
    expect(Math.abs(totalAnnualInterest - result.scenarioA.baselineTotalInterest)).toBeLessThanOrEqual(0.1)

    const csvAnnual = buildScheduleCSV(result, {
      granularity: 'annual',
      currency: 'USD',
      locale: 'en',
    })
    expect(csvAnnual.startsWith('\uFEFFYear,')).toBe(true)
    expect(csvAnnual.split('\r\n')).toHaveLength(11) // header + 10 years

    const csvMonthlyEs = buildScheduleCSV(result, {
      granularity: 'monthly',
      currency: 'MXN',
      locale: 'es',
    })
    expect(csvMonthlyEs.startsWith('\uFEFFMes,Fecha,')).toBe(true)
    expect(csvMonthlyEs.split('\r\n')).toHaveLength(121) // header + 120 months
  })
})
