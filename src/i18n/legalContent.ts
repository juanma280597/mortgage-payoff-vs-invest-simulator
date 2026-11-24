import type { Locale } from './translations'

export type PageKey = 'home' | 'privacy' | 'terms' | 'cookies' | 'contact'

export interface LegalSection {
  heading: string
  paragraphs: string[]
}

export interface LegalPageContent {
  title: string
  metaTitle: string
  metaDescription: string
  lastUpdated: string
  intro: string
  sections: LegalSection[]
}

const DEFAULT_CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL || 'contact@mortgage-vs-invest.pages.dev'

export const ROUTE_SLUGS: Record<Locale, Record<PageKey, string>> = {
  en: {
    home: '/en/',
    privacy: '/en/privacy/',
    terms: '/en/terms/',
    cookies: '/en/cookies/',
    contact: '/en/contact/',
  },
  es: {
    home: '/es/',
    privacy: '/es/privacidad/',
    terms: '/es/terminos/',
    cookies: '/es/cookies/',
    contact: '/es/contacto/',
  },
}

export const LEGAL_NAV_LABELS: Record<
  Locale,
  {
    backToCalculator: string
    privacy: string
    terms: string
    cookies: string
    contact: string
    contactEmailLabel: string
  }
> = {
  en: {
    backToCalculator: 'Back to Simulator',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    cookies: 'Cookie Policy',
    contact: 'Contact',
    contactEmailLabel: 'Direct Contact Email',
  },
  es: {
    backToCalculator: 'Volver al Simulador',
    privacy: 'Política de Privacidad',
    terms: 'Términos de Uso',
    cookies: 'Política de Cookies',
    contact: 'Contacto',
    contactEmailLabel: 'Correo de Contacto Directo',
  },
}

export function getLegalContent(locale: Locale): Record<Exclude<PageKey, 'home'>, LegalPageContent> {
  if (locale === 'es') {
    return {
      privacy: {
        title: 'Política de Privacidad',
        metaTitle: 'Política de Privacidad | Simulador Hipoteca vs. Invertir',
        metaDescription:
          'Conoce cómo protegemos tu privacidad: cálculos 100% locales en tu navegador, uso de localStorage, consultas a Frankfurter API y cookies publicitarias.',
        lastUpdated: 'Última actualización: noviembre de 2026',
        intro:
          'En el Simulador: ¿Abonar a Hipoteca o Invertir? valoramos tu privacidad. Esta herramienta funciona completamente en tu navegador sin cuentas de usuario ni servidores propios.',
        sections: [
          {
            heading: '1. Procesamiento 100% local en el navegador',
            paragraphs: [
              'Todos los montos, tasas de interés, plazos y resultados financieros que introduces se procesan exclusivamente en la memoria de tu dispositivo mediante JavaScript. No enviamos, almacenamos ni vendemos tus datos financieros en ninguna base de datos externa.',
            ],
          },
          {
            heading: '2. Uso de localStorage',
            paragraphs: [
              'Utilizamos el almacenamiento local de tu navegador (localStorage) únicamente para guardar tus escenarios recientes, conservar tus últimos parámetros ingresados y almacenar temporalmente los tipos de cambio en caché (hasta 12 horas) para ofrecer una experiencia rápida.',
              'Puedes borrar esta información en cualquier momento desde la configuración de tu navegador o eliminando tus escenarios guardados dentro de la aplicación.',
            ],
          },
          {
            heading: '3. Tipos de cambio mediante Frankfurter API',
            paragraphs: [
              'Cuando eliges consultar divisas (USD, MXN, EUR), la aplicación realiza una petición pública de solo lectura a Frankfurter API (api.frankfurter.app), un servicio gratuito basado en datos del Banco Central Europeo. No se envían datos personales ni parámetros financieros en dicha consulta.',
            ],
          },
          {
            heading: '4. Publicidad de terceros y Google AdSense',
            paragraphs: [
              'Para mantener este simulador gratuito, podemos mostrar anuncios mediante Google AdSense. Google y sus socios publicitarios pueden utilizar cookies o identificadores de dispositivo para mostrar anuncios relevantes basados en visitas previas a este u otros sitios web.',
              'Puedes gestionar o desactivar la publicidad personalizada en cualquier momento visitando la Configuración de Anuncios de Google (adssettings.google.com) o mediante las opciones de privacidad de tu navegador.',
            ],
          },
          {
            heading: '5. Contacto sobre privacidad',
            paragraphs: [
              `Si tienes preguntas sobre esta Política de Privacidad, puedes escribirnos a ${DEFAULT_CONTACT_EMAIL}.`,
            ],
          },
        ],
      },
      terms: {
        title: 'Términos de Uso',
        metaTitle: 'Términos de Uso | Simulador Hipoteca vs. Invertir',
        metaDescription:
          'Términos y condiciones de uso del Simulador Hipoteca vs. Invertir. Herramienta educativa y matemática sin asesoría financiera personalizada.',
        lastUpdated: 'Última actualización: noviembre de 2026',
        intro:
          'Al acceder y utilizar este simulador financiero gratuito, aceptas los siguientes términos y condiciones de uso.',
        sections: [
          {
            heading: '1. Propósito exclusivamente educativo',
            paragraphs: [
              'Esta aplicación web es una herramienta matemática y educativa diseñada para modelar escenarios hipotéticos entre adelantar pagos a capital hipotecario e invertir excedentes mensuales.',
              'Los resultados, tasas de equilibrio y proyecciones no constituyen asesoría financiera, fiscal, legal ni de inversión personalizada. Consulta siempre con un asesor financiero o fiscal certificado antes de tomar decisiones patrimoniales.',
            ],
          },
          {
            heading: '2. Exactitud de las estimaciones',
            paragraphs: [
              'Aunque el motor financiero realiza cálculos exactos a nivel de centavos para amortización a tasa fija e interés compuesto, los mercados financieros reales presentan volatilidad, comisiones, deducciones fiscales específicas de cada país y cambios normativos que ningún simulador puede predecir con certeza.',
            ],
          },
          {
            heading: '3. Disponibilidad del servicio y enlaces externos',
            paragraphs: [
              'El sitio se ofrece "tal cual" (as-is) sin garantías de disponibilidad ininterrumpida. Las tasas de cambio referenciales provienen de Frankfurter API y pueden diferir del tipo de cambio comercial ofrecido por tu banco.',
            ],
          },
          {
            heading: '4. Propiedad intelectual',
            paragraphs: [
              'El diseño, código fuente y contenido editorial del simulador pertenecen a sus respectivos autores. Puedes exportar las tablas en formato CSV para tu uso personal o análisis financiero.',
            ],
          },
        ],
      },
      cookies: {
        title: 'Política de Cookies',
        metaTitle: 'Política de Cookies | Simulador Hipoteca vs. Invertir',
        metaDescription:
          'Información sobre el uso de cookies técnicas, almacenamiento local y cookies publicitarias de Google AdSense en nuestro simulador.',
        lastUpdated: 'Última actualización: noviembre de 2026',
        intro:
          'Esta Política de Cookies explica qué tecnologías de almacenamiento utiliza nuestro sitio web y cómo puedes controlarlas.',
        sections: [
          {
            heading: '1. ¿Qué tecnologías utilizamos?',
            paragraphs: [
              'Nuestro simulador no instala cookies propias de rastreo o perfiles de usuario. Utilizamos almacenamiento local del navegador (localStorage) estrictamente funcional para recordar tus últimos parámetros y escenarios guardados.',
            ],
          },
          {
            heading: '2. Cookies de terceros (Google AdSense)',
            paragraphs: [
              'Cuando los espacios publicitarios están activos, Google AdSense puede utilizar cookies (como la cookie DoubleClick) para limitar la frecuencia de los anuncios, medir su rendimiento y mostrar publicidad acorde a tus intereses.',
              'Puedes obtener más información sobre cómo Google utiliza las cookies en policies.google.com/technologies/ads.',
            ],
          },
          {
            heading: '3. Cómo desactivar o eliminar cookies',
            paragraphs: [
              'Puedes bloquear o eliminar las cookies en cualquier momento desde la configuración de privacidad de tu navegador (Chrome, Firefox, Safari, Edge). Ten en cuenta que bloquear cookies publicitarias seguirá permitiendo el funcionamiento completo de la calculadora.',
            ],
          },
        ],
      },
      contact: {
        title: 'Contacto',
        metaTitle: 'Contacto | Simulador Hipoteca vs. Invertir',
        metaDescription:
          'Ponte en contacto con el equipo del Simulador Hipoteca vs. Invertir para reportar errores, sugerir mejoras o consultas editoriales.',
        lastUpdated: 'Actualizado: noviembre de 2026',
        intro:
          'El Simulador: ¿Abonar a Hipoteca o Invertir? es un proyecto web independiente enfocado en brindar herramientas de educación financiera rápidas, transparentes y gratuitas.',
        sections: [
          {
            heading: '¿Cómo podemos ayudarte?',
            paragraphs: [
              'Si encontraste algún detalle en una fórmula, deseas sugerir soporte para una nueva divisa, o tienes alguna consulta relacionada con privacidad, publicidad o colaboraciones, puedes escribirnos directamente por correo electrónico.',
            ],
          },
          {
            heading: 'Canal de contacto',
            paragraphs: [
              `Correo electrónico: ${DEFAULT_CONTACT_EMAIL}`,
              'Tiempo habitual de respuesta: 24 a 72 horas hábiles.',
            ],
          },
        ],
      },
    }
  }

  return {
    privacy: {
      title: 'Privacy Policy',
      metaTitle: 'Privacy Policy | Mortgage Payoff vs. Invest Calculator',
      metaDescription:
        'Learn how we protect your privacy: 100% local browser calculations, localStorage usage, Frankfurter API currency lookups, and Google AdSense cookies.',
      lastUpdated: 'Last updated: November 2026',
      intro:
        'At Mortgage Payoff vs. Invest Calculator, your financial privacy comes first. This application runs entirely in your browser with no user accounts or backend databases.',
      sections: [
        {
          heading: '1. 100% Client-Side Financial Processing',
          paragraphs: [
            'All mortgage balances, interest rates, extra payment amounts, and investment assumptions you enter are calculated exclusively on your device via JavaScript. We never transmit, store, or sell your personal financial inputs to any external server.',
          ],
        },
        {
          heading: '2. Browser localStorage Usage',
          paragraphs: [
            'We use browser localStorage strictly for functional convenience: saving your recent simulation scenarios, preserving your latest inputs between refreshes, and caching reference currency exchange rates for up to 12 hours.',
            'You can clear this data at any time via your browser settings or by deleting individual scenarios in the app.',
          ],
        },
        {
          heading: '3. Exchange Rates via Frankfurter API',
          paragraphs: [
            'To support USD, MXN, and EUR conversions, the app makes a read-only request to the public Frankfurter API (api.frankfurter.app), which publishes European Central Bank reference rates. No personal identifiers or financial inputs are included in that request.',
          ],
        },
        {
          heading: '4. Third-Party Advertising & Google AdSense',
          paragraphs: [
            'To keep this calculator free for everyone, we may display advertisements served by Google AdSense. Google and its advertising partners may use cookies or similar technologies to serve ads based on your prior visits to this or other websites.',
            'You may opt out of personalized advertising at any time by visiting Google Ads Settings (adssettings.google.com) or adjusting your browser privacy controls.',
          ],
        },
        {
          heading: '5. Privacy Contact',
          paragraphs: [
            `If you have any questions about this Privacy Policy, please contact us at ${DEFAULT_CONTACT_EMAIL}.`,
          ],
        },
      ],
    },
    terms: {
      title: 'Terms of Use',
      metaTitle: 'Terms of Use | Mortgage Payoff vs. Invest Calculator',
      metaDescription:
        'Terms of Use for Mortgage Payoff vs. Invest Calculator. Educational simulation tool provided as-is without personalized financial advice.',
      lastUpdated: 'Last updated: November 2026',
      intro:
        'By accessing and using this free financial simulator, you agree to the following Terms of Use.',
      sections: [
        {
          heading: '1. Educational & Informational Purpose Only',
          paragraphs: [
            'This web application is a mathematical and educational tool designed to model hypothetical comparisons between accelerating mortgage principal payments and investing monthly cash flow.',
            'Nothing on this site constitutes personalized financial, tax, legal, or investment advice. Always consult a qualified fiduciary advisor or tax professional before making major financial decisions.',
          ],
        },
        {
          heading: '2. Simulation Assumptions & Accuracy',
          paragraphs: [
            'While our calculation engine uses cent-accurate fixed-rate amortization and compounding formulas, real-world investment returns fluctuate, tax rules vary by jurisdiction, and lender prepayment policies may differ.',
          ],
        },
        {
          heading: '3. Availability & External Reference Data',
          paragraphs: [
            'This tool is provided on an "as-is" basis without warranties of uninterrupted availability. Currency reference rates are sourced from Frankfurter API and may differ from commercial bank rates.',
          ],
        },
        {
          heading: '4. Permitted Use',
          paragraphs: [
            'You are welcome to use the calculator and export generated CSV schedules for personal financial planning or educational review.',
          ],
        },
      ],
    },
    cookies: {
      title: 'Cookie Policy',
      metaTitle: 'Cookie Policy | Mortgage Payoff vs. Invest Calculator',
      metaDescription:
        'Details on browser localStorage and third-party Google AdSense cookies used on Mortgage Payoff vs. Invest Calculator.',
      lastUpdated: 'Last updated: November 2026',
      intro:
        'This Cookie Policy explains how browser storage and third-party advertising cookies operate on our website.',
      sections: [
        {
          heading: '1. First-Party Storage',
          paragraphs: [
            'Our simulator does not set first-party tracking or analytics cookies. We rely solely on browser localStorage to remember your saved scenarios and currency rate cache locally on your device.',
          ],
        },
        {
          heading: '2. Third-Party Advertising Cookies (Google AdSense)',
          paragraphs: [
            'When Google AdSense is active, Google may place and read cookies on your browser to deliver relevant ads, cap ad frequency, and measure ad performance.',
            'Learn more about how Google uses cookies in advertising at policies.google.com/technologies/ads.',
          ],
        },
        {
          heading: '3. Managing Cookies in Your Browser',
          paragraphs: [
            'You can block or delete cookies anytime through your browser settings. Disabling advertising cookies will not affect the core functionality of the mortgage and investment calculator.',
          ],
        },
      ],
    },
    contact: {
      title: 'Contact',
      metaTitle: 'Contact | Mortgage Payoff vs. Invest Calculator',
      metaDescription:
        'Contact the Mortgage Payoff vs. Invest Calculator team for feedback, formula questions, or inquiries.',
      lastUpdated: 'Updated: November 2026',
      intro:
        'Mortgage Payoff vs. Invest Calculator is an independent, zero-cost web project focused on transparent, fast, and accessible personal finance math.',
      sections: [
        {
          heading: 'Get in Touch',
          paragraphs: [
            'Have feedback on a calculation, a suggestion for additional currencies, or an inquiry regarding privacy or advertising? Reach out anytime via email.',
          ],
        },
        {
          heading: 'Direct Contact',
          paragraphs: [
            `Email: ${DEFAULT_CONTACT_EMAIL}`,
            'Typical response time: 1–3 business days.',
          ],
        },
      ],
    },
  }
}

export function getContactEmail(): string {
  return DEFAULT_CONTACT_EMAIL
}
