import { useEffect } from 'react'
import { getLegalContent, ROUTE_SLUGS, type PageKey } from '../i18n/legalContent'
import type { Locale, Translations } from '../i18n/translations'

interface SeoHeadProps {
  locale: Locale
  page: PageKey
  t: Translations
  basePrefix: string
}

const DEFAULT_SITE_URL = 'https://mortgage-vs-invest.pages.dev'

function getSiteOrigin(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim()
  if (configured) {
    return configured.replace(/\/+$/, '')
  }
  return DEFAULT_SITE_URL
}

function upsertMeta(selector: string, createAttrs: Record<string, string>, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    for (const [k, v] of Object.entries(createAttrs)) {
      el.setAttribute(k, v)
    }
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    if (hreflang) el.setAttribute('hreflang', hreflang)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function SeoHead({ locale, page, t, basePrefix }: SeoHeadProps) {
  useEffect(() => {
    const siteOrigin = getSiteOrigin()
    const enUrl = `${siteOrigin}${basePrefix}${ROUTE_SLUGS.en[page]}`
    const esUrl = `${siteOrigin}${basePrefix}${ROUTE_SLUGS.es[page]}`
    const canonicalUrl = locale === 'es' ? esUrl : enUrl

    const pageMeta =
      page === 'home'
        ? {
            title: t.seo.title,
            description: t.seo.description,
            ogTitle: t.seo.appName,
          }
        : (() => {
            const legal = getLegalContent(locale)[page]
            return {
              title: legal.metaTitle,
              description: legal.metaDescription,
              ogTitle: legal.title,
            }
          })()

    document.documentElement.lang = locale
    document.title = pageMeta.title

    upsertMeta('meta[name="description"]', { name: 'description' }, pageMeta.description)
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, pageMeta.ogTitle)
    upsertMeta(
      'meta[property="og:description"]',
      { property: 'og:description' },
      pageMeta.description,
    )
    upsertMeta(
      'meta[property="og:locale"]',
      { property: 'og:locale' },
      locale === 'es' ? 'es_ES' : 'en_US',
    )
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl)

    upsertLink('canonical', canonicalUrl)
    upsertLink('alternate', enUrl, 'en')
    upsertLink('alternate', esUrl, 'es')
    upsertLink('alternate', enUrl, 'x-default')

    const jsonLd =
      page === 'home'
        ? {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: t.seo.appName,
            description: t.seo.description,
            url: canonicalUrl,
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'Any',
            inLanguage: locale,
            browserRequirements: 'Requires JavaScript',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }
        : {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: pageMeta.ogTitle,
            description: pageMeta.description,
            url: canonicalUrl,
            inLanguage: locale,
          }

    let script = document.getElementById('app-jsonld') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'app-jsonld'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(jsonLd)
  }, [locale, page, t, basePrefix])

  return null
}
