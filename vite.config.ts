import fs from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const DEFAULT_SITE_URL = 'https://mortgage-vs-invest.pages.dev'

function getSiteUrl(): string {
  const raw = process.env.VITE_SITE_URL?.trim()
  if (raw) {
    return raw.replace(/\/+$/, '')
  }
  return DEFAULT_SITE_URL
}

interface StaticSeoVariant {
  lang: 'en' | 'es'
  title: string
  description: string
  appName: string
  routePath: string
  enAlternatePath: string
  esAlternatePath: string
  schemaType: 'WebApplication' | 'WebPage'
  priority: string
}

const SEO_VARIANTS: StaticSeoVariant[] = [
  {
    lang: 'en',
    title: 'Mortgage Payoff vs. Invest Calculator | Free Simulator',
    description:
      'Compare paying off your mortgage early vs. investing extra cash. Real-time break-even rate, capital gains tax, inflation adjustment, and CSV amortization schedule.',
    appName: 'Mortgage Payoff vs. Invest Calculator',
    routePath: '/en/',
    enAlternatePath: '/en/',
    esAlternatePath: '/es/',
    schemaType: 'WebApplication',
    priority: '1.0',
  },
  {
    lang: 'es',
    title: 'Simulador: ¿Abonar a Hipoteca o Invertir? | Calculadora Gratuita',
    description:
      'Compara abonar a capital de tu hipoteca contra invertir el excedente. Tasa de equilibrio en tiempo real, impuestos, inflación y tabla de amortización exportable a CSV.',
    appName: 'Simulador: ¿Abonar a Hipoteca o Invertir?',
    routePath: '/es/',
    enAlternatePath: '/en/',
    esAlternatePath: '/es/',
    schemaType: 'WebApplication',
    priority: '1.0',
  },
  {
    lang: 'en',
    title: 'Privacy Policy | Mortgage Payoff vs. Invest Calculator',
    description:
      'Learn how we protect your privacy: 100% local browser calculations, localStorage usage, Frankfurter API currency lookups, and Google AdSense cookies.',
    appName: 'Privacy Policy',
    routePath: '/en/privacy/',
    enAlternatePath: '/en/privacy/',
    esAlternatePath: '/es/privacidad/',
    schemaType: 'WebPage',
    priority: '0.4',
  },
  {
    lang: 'es',
    title: 'Política de Privacidad | Simulador Hipoteca vs. Invertir',
    description:
      'Conoce cómo protegemos tu privacidad: cálculos 100% locales en tu navegador, uso de localStorage, consultas a Frankfurter API y cookies publicitarias.',
    appName: 'Política de Privacidad',
    routePath: '/es/privacidad/',
    enAlternatePath: '/en/privacy/',
    esAlternatePath: '/es/privacidad/',
    schemaType: 'WebPage',
    priority: '0.4',
  },
  {
    lang: 'en',
    title: 'Terms of Use | Mortgage Payoff vs. Invest Calculator',
    description:
      'Terms of Use for Mortgage Payoff vs. Invest Calculator. Educational simulation tool provided as-is without personalized financial advice.',
    appName: 'Terms of Use',
    routePath: '/en/terms/',
    enAlternatePath: '/en/terms/',
    esAlternatePath: '/es/terminos/',
    schemaType: 'WebPage',
    priority: '0.4',
  },
  {
    lang: 'es',
    title: 'Términos de Uso | Simulador Hipoteca vs. Invertir',
    description:
      'Términos y condiciones de uso del Simulador Hipoteca vs. Invertir. Herramienta educativa y matemática sin asesoría financiera personalizada.',
    appName: 'Términos de Uso',
    routePath: '/es/terminos/',
    enAlternatePath: '/en/terms/',
    esAlternatePath: '/es/terminos/',
    schemaType: 'WebPage',
    priority: '0.4',
  },
  {
    lang: 'en',
    title: 'Cookie Policy | Mortgage Payoff vs. Invest Calculator',
    description:
      'Details on browser localStorage and third-party Google AdSense cookies used on Mortgage Payoff vs. Invest Calculator.',
    appName: 'Cookie Policy',
    routePath: '/en/cookies/',
    enAlternatePath: '/en/cookies/',
    esAlternatePath: '/es/cookies/',
    schemaType: 'WebPage',
    priority: '0.4',
  },
  {
    lang: 'es',
    title: 'Política de Cookies | Simulador Hipoteca vs. Invertir',
    description:
      'Información sobre el uso de cookies técnicas, almacenamiento local y cookies publicitarias de Google AdSense en nuestro simulador.',
    appName: 'Política de Cookies',
    routePath: '/es/cookies/',
    enAlternatePath: '/en/cookies/',
    esAlternatePath: '/es/cookies/',
    schemaType: 'WebPage',
    priority: '0.4',
  },
  {
    lang: 'en',
    title: 'Contact | Mortgage Payoff vs. Invest Calculator',
    description:
      'Contact the Mortgage Payoff vs. Invest Calculator team for feedback, formula questions, or inquiries.',
    appName: 'Contact',
    routePath: '/en/contact/',
    enAlternatePath: '/en/contact/',
    esAlternatePath: '/es/contacto/',
    schemaType: 'WebPage',
    priority: '0.4',
  },
  {
    lang: 'es',
    title: 'Contacto | Simulador Hipoteca vs. Invertir',
    description:
      'Ponte en contacto con el equipo del Simulador Hipoteca vs. Invertir para reportar errores, sugerir mejoras o consultas editoriales.',
    appName: 'Contacto',
    routePath: '/es/contacto/',
    enAlternatePath: '/en/contact/',
    esAlternatePath: '/es/contacto/',
    schemaType: 'WebPage',
    priority: '0.4',
  },
]

function buildJsonLd(variant: StaticSeoVariant, canonicalUrl: string): string {
  if (variant.schemaType === 'WebPage') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: variant.appName,
      description: variant.description,
      url: canonicalUrl,
      inLanguage: variant.lang,
    })
  }
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: variant.appName,
    description: variant.description,
    url: canonicalUrl,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    inLanguage: variant.lang,
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  })
}

function buildSitemapXml(siteUrl: string): string {
  const urls = SEO_VARIANTS.map((variant) => {
    const loc = `${siteUrl}${variant.routePath}`
    const enHref = `${siteUrl}${variant.enAlternatePath}`
    const esHref = `${siteUrl}${variant.esAlternatePath}`
    return `  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${enHref}" />
    <xhtml:link rel="alternate" hreflang="es" href="${esHref}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enHref}" />
    <changefreq>monthly</changefreq>
    <priority>${variant.priority}</priority>
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
}

function buildRobotsTxt(siteUrl: string): string {
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`
}

function staticSeoPagesPlugin(): Plugin {
  return {
    name: 'static-seo-pages',
    closeBundle() {
      const distDir = path.resolve(import.meta.dirname, 'dist')
      const indexPath = path.join(distDir, 'index.html')
      if (!fs.existsSync(indexPath)) return

      const siteUrl = getSiteUrl()
      let baseHtml = fs.readFileSync(indexPath, 'utf-8')

      // Ensure root index.html also carries full absolute SEO URLs
      baseHtml = baseHtml
        .replace(
          /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
          `<link rel="canonical" href="${siteUrl}/en/" />`,
        )
        .replace(
          /<link\s+rel="alternate"\s+hreflang="en"\s+href="[^"]*"\s*\/?>/,
          `<link rel="alternate" hreflang="en" href="${siteUrl}/en/" />`,
        )
        .replace(
          /<link\s+rel="alternate"\s+hreflang="es"\s+href="[^"]*"\s*\/?>/,
          `<link rel="alternate" hreflang="es" href="${siteUrl}/es/" />`,
        )
        .replace(
          /<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/?>/,
          `<link rel="alternate" hreflang="x-default" href="${siteUrl}/en/" />`,
        )
        .replace(
          /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
          `<meta property="og:url" content="${siteUrl}/en/" />`,
        )

      fs.writeFileSync(indexPath, baseHtml, 'utf-8')
      // GitHub Pages SPA fallback
      fs.writeFileSync(path.join(distDir, '404.html'), baseHtml, 'utf-8')

      // Generate dynamic sitemap.xml and robots.txt with VITE_SITE_URL
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), buildSitemapXml(siteUrl), 'utf-8')
      fs.writeFileSync(path.join(distDir, 'robots.txt'), buildRobotsTxt(siteUrl), 'utf-8')

      for (const variant of SEO_VARIANTS) {
        const canonicalUrl = `${siteUrl}${variant.routePath}`
        const enUrl = `${siteUrl}${variant.enAlternatePath}`
        const esUrl = `${siteUrl}${variant.esAlternatePath}`

        let html = baseHtml
        html = html.replace(/<html lang="[^"]*">/, `<html lang="${variant.lang}">`)
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${variant.title}</title>`)
        html = html.replace(
          /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
          `<meta name="description" content="${variant.description}" />`,
        )
        html = html.replace(
          /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
          `<link rel="canonical" href="${canonicalUrl}" />`,
        )
        html = html.replace(
          /<link\s+rel="alternate"\s+hreflang="en"\s+href="[^"]*"\s*\/?>/,
          `<link rel="alternate" hreflang="en" href="${enUrl}" />`,
        )
        html = html.replace(
          /<link\s+rel="alternate"\s+hreflang="es"\s+href="[^"]*"\s*\/?>/,
          `<link rel="alternate" hreflang="es" href="${esUrl}" />`,
        )
        html = html.replace(
          /<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/?>/,
          `<link rel="alternate" hreflang="x-default" href="${enUrl}" />`,
        )
        html = html.replace(
          /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
          `<meta property="og:url" content="${canonicalUrl}" />`,
        )
        html = html.replace(
          /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
          `<meta property="og:title" content="${variant.appName}" />`,
        )
        html = html.replace(
          /<meta\s+property="og:description"[\s\S]*?\/>/,
          `<meta property="og:description" content="${variant.description}" />`,
        )
        html = html.replace(
          /<script id="app-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/,
          `<script id="app-jsonld" type="application/ld+json">${buildJsonLd(variant, canonicalUrl)}</script>`,
        )

        const cleanRoute = variant.routePath.replace(/^\/+|\/+$/g, '')
        const targetDir = path.join(distDir, cleanRoute)
        fs.mkdirSync(targetDir, { recursive: true })
        fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8')
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), staticSeoPagesPlugin()],
})
