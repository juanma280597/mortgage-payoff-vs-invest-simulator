import type { CurrencyCode } from './currency'

export interface SavedScenarioInputs {
  principal: number
  annualMortgageRate: number
  remainingYears: number
  remainingMonths: number
  extraMonthlyPayment: number
  expectedInvestmentReturn: number
  capitalGainsTaxRate: number
  annualInflationRate: number
}

export interface SavedScenario {
  id: string
  name: string
  currency: CurrencyCode
  savedAt: string
  inputs: SavedScenarioInputs
  verdictWinner: 'payoff' | 'invest' | 'tie'
  netDifference: number
}

const SCENARIOS_KEY = 'mpvi_saved_scenarios_v1'
const LAST_STATE_KEY = 'mpvi_last_inputs_v1'
const MAX_SAVED_SCENARIOS = 6

export function loadSavedScenarios(): SavedScenario[] {
  try {
    const raw = window.localStorage.getItem(SCENARIOS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SavedScenario[]) : []
  } catch {
    return []
  }
}

export function saveScenarioToStorage(scenario: SavedScenario): SavedScenario[] {
  const existing = loadSavedScenarios()
  const updated = [scenario, ...existing.filter((item) => item.id !== scenario.id)].slice(
    0,
    MAX_SAVED_SCENARIOS,
  )
  try {
    window.localStorage.setItem(SCENARIOS_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
  return updated
}

export function deleteSavedScenario(id: string): SavedScenario[] {
  const updated = loadSavedScenarios().filter((item) => item.id !== id)
  try {
    window.localStorage.setItem(SCENARIOS_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
  return updated
}

export interface PersistedWorkspaceState {
  currency: CurrencyCode
  inputs: SavedScenarioInputs
}

export function loadLastWorkspaceState(): PersistedWorkspaceState | null {
  try {
    const raw = window.localStorage.getItem(LAST_STATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedWorkspaceState
    if (!parsed?.inputs || !parsed?.currency) return null
    return parsed
  } catch {
    return null
  }
}

export function persistLastWorkspaceState(state: PersistedWorkspaceState): void {
  try {
    window.localStorage.setItem(LAST_STATE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors
  }
}
