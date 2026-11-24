export type CurrencyCode = 'USD' | 'MXN' | 'EUR'

export interface ExchangeRates {
  base: 'USD'
  rates: Record<CurrencyCode, number>
  date: string
  source: 'frankfurter' | 'fallback'
}

export const FALLBACK_RATES: ExchangeRates = {
  base: 'USD',
  rates: {
    USD: 1,
    MXN: 18.5,
    EUR: 0.92,
  },
  date: '2026-01-01',
  source: 'fallback',
}

export const CURRENCY_META: Record<
  CurrencyCode,
  { symbol: string; labelEn: string; labelEs: string; stepPrincipal: number; stepExtra: number }
> = {
  USD: {
    symbol: '$',
    labelEn: 'USD ($)',
    labelEs: 'USD ($)',
    stepPrincipal: 5000,
    stepExtra: 50,
  },
  MXN: {
    symbol: '$',
    labelEn: 'MXN ($)',
    labelEs: 'MXN ($)',
    stepPrincipal: 50000,
    stepExtra: 500,
  },
  EUR: {
    symbol: '€',
    labelEn: 'EUR (€)',
    labelEs: 'EUR (€)',
    stepPrincipal: 5000,
    stepExtra: 50,
  },
}

const RATES_CACHE_KEY = 'mpvi_frankfurter_rates_v1'
const CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

interface CachedRatesPayload {
  fetchedAt: number
  data: ExchangeRates
}

export function getCachedRates(): ExchangeRates | null {
  try {
    const raw = window.localStorage.getItem(RATES_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedRatesPayload
    if (!parsed?.data?.rates?.MXN || !parsed?.data?.rates?.EUR) return null
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null
    return parsed.data
  } catch {
    return null
  }
}

export async function fetchLiveExchangeRates(): Promise<ExchangeRates> {
  const cached = getCachedRates()
  if (cached) return cached

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 4500)

  try {
    const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=MXN,EUR', {
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const json = (await response.json()) as {
      date?: string
      rates?: { MXN?: number; EUR?: number }
    }
    if (
      typeof json.rates?.MXN !== 'number' ||
      typeof json.rates?.EUR !== 'number'
    ) {
      throw new Error('Malformed Frankfurter response')
    }

    const live: ExchangeRates = {
      base: 'USD',
      rates: {
        USD: 1,
        MXN: json.rates.MXN,
        EUR: json.rates.EUR,
      },
      date: json.date ?? new Date().toISOString().slice(0, 10),
      source: 'frankfurter',
    }

    try {
      const payload: CachedRatesPayload = { fetchedAt: Date.now(), data: live }
      window.localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(payload))
    } catch {
      // Ignore storage quota errors
    }

    return live
  } catch {
    return FALLBACK_RATES
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export function convertCurrencyAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates,
): number {
  if (from === to || !Number.isFinite(amount)) return amount
  const fromRate = rates.rates[from] || 1
  const toRate = rates.rates[to] || 1
  const usdValue = amount / fromRate
  return Math.round(usdValue * toRate)
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  locale: 'en' | 'es',
  fractionDigits = 0,
): string {
  const intlLocale =
    locale === 'es'
      ? currency === 'EUR'
        ? 'es-ES'
        : 'es-MX'
      : currency === 'EUR'
        ? 'en-IE'
        : 'en-US'

  try {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount)
  } catch {
    return `${CURRENCY_META[currency].symbol}${amount.toFixed(fractionDigits)}`
  }
}

export function formatCompactCurrency(
  amount: number,
  currency: CurrencyCode,
  locale: 'en' | 'es',
): string {
  const intlLocale = locale === 'es' ? 'es-MX' : 'en-US'
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  } catch {
    return formatCurrency(amount, currency, locale, 0)
  }
}
