export type Locale = 'en' | 'es'

export interface FaqItem {
  question: string
  answer: string
}

export interface Translations {
  lang: Locale
  seo: {
    title: string
    description: string
    appName: string
  }
  header: {
    badge: string
    h1: string
    subtitle: string
    currencyLabel: string
    rateLiveLabel: string
    rateFallbackLabel: string
    convertToggle: string
    savedButton: string
  }
  inputs: {
    title: string
    reset: string
    saveScenario: string
    savedToast: string
    scenarioNamePlaceholder: string
    principalLabel: string
    principalHint: string
    mortgageRateLabel: string
    termLabel: string
    yearsUnit: string
    monthsUnit: string
    extraMonthlyLabel: string
    extraMonthlyHint: string
    investReturnLabel: string
    investReturnHint: string
    taxRateLabel: string
    taxRateHint: string
    inflationLabel: string
    inflationHint: string
    showRealPower: string
    basePaymentSummary: string
    totalBudgetSummary: string
  }
  verdict: {
    label: string
    investWinsTitle: string
    payoffWinsTitle: string
    tieTitle: string
    advantageLabel: string
    breakEvenLabel: string
    breakEvenUnreachable: string
    breakEvenHint: string
    yourReturnLabel: string
    realAdjustedBadge: string
    nominalBadge: string
    scalePayoffZone: string
    scaleInvestZone: string
  }
  scenarios: {
    scenarioABadge: string
    scenarioATitle: string
    scenarioASubtitle: string
    monthsSaved: string
    yearsMonthsFormat: (years: number, months: number) => string
    interestSaved: string
    payoffDate: string
    newPayoffTime: string
    postPayoffWealth: string
    scenarioBBadge: string
    scenarioBTitle: string
    scenarioBSubtitle: string
    netFutureValue: string
    netAccumulatedWealth: string
    totalContributed: string
    grossValue: string
    estimatedTax: string
  }
  charts: {
    title: string
    tabWealth: string
    tabBalance: string
    wealthSubtitle: string
    balanceSubtitle: string
    yearPrefix: string
    seriesScenarioAWealth: string
    seriesScenarioBWealth: string
    seriesBaselineBalance: string
    seriesAcceleratedBalance: string
  }
  schedule: {
    title: string
    subtitle: string
    annualTab: string
    monthlyTab: string
    exportCsv: string
    colYear: string
    colMonth: string
    colDate: string
    colBaseBalance: string
    colBaseInterest: string
    colABalance: string
    colAInterest: string
    colAWealth: string
    colBContrib: string
    colBWealth: string
    showAllRows: string
    showLessRows: string
  }
  savedDrawer: {
    title: string
    empty: string
    load: string
    delete: string
    winnerPayoff: string
    winnerInvest: string
    winnerTie: string
  }
  ads: {
    label: string
    topSlotTitle: string
    sidebarSlotTitle: string
  }
  methodology: {
    title: string
    subtitle: string
    expandLabel: string
    collapseLabel: string
    blocks: {
      title: string
      formula: string
      body: string
    }[]
  }
  faq: {
    title: string
    subtitle: string
    items: FaqItem[]
  }
  footer: {
    disclaimer: string
    privacyNote: string
    ratesAttribution: string
  }
}

export const TRANSLATIONS: Record<Locale, Translations> = {
  en: {
    lang: 'en',
    seo: {
      title: 'Mortgage Payoff vs. Invest Calculator | Free Simulator',
      description:
        'Compare paying off your mortgage early vs. investing extra cash. Real-time break-even rate, capital gains tax, inflation adjustment, and CSV amortization schedule.',
      appName: 'Mortgage Payoff vs. Invest Calculator',
    },
    header: {
      badge: '100% Client-Side • Free Financial Simulator',
      h1: 'Mortgage Payoff vs. Invest Calculator',
      subtitle:
        'Should you make extra mortgage principal payments or invest your monthly surplus? Compare guaranteed interest savings against after-tax market compounding.',
      currencyLabel: 'Currency',
      rateLiveLabel: 'Live ECB rate',
      rateFallbackLabel: 'Offline ref. rate',
      convertToggle: 'Convert amounts on switch',
      savedButton: 'Recent',
    },
    inputs: {
      title: 'Simulation Parameters',
      reset: 'Reset',
      saveScenario: 'Save Scenario',
      savedToast: 'Scenario saved locally',
      scenarioNamePlaceholder: 'e.g. 6.5% Loan + S&P 500',
      principalLabel: 'Remaining Mortgage Balance',
      principalHint: 'Current unpaid principal on your home loan.',
      mortgageRateLabel: 'Annual Mortgage Rate',
      termLabel: 'Remaining Loan Term',
      yearsUnit: 'yrs',
      monthsUnit: 'mo',
      extraMonthlyLabel: 'Extra Monthly Cash Available',
      extraMonthlyHint: 'Monthly surplus to either prepay principal or invest.',
      investReturnLabel: 'Expected Annual Investment Return',
      investReturnHint: 'Pre-tax annualized portfolio return (e.g. index ETFs).',
      taxRateLabel: 'Capital Gains Tax Rate',
      taxRateHint: 'Tax applied to investment profits upon realization.',
      inflationLabel: 'Annual Inflation (Optional)',
      inflationHint: 'Deflates future wealth into today’s purchasing power.',
      showRealPower: 'Display inflation-adjusted values',
      basePaymentSummary: 'Required monthly P&I payment',
      totalBudgetSummary: 'Total monthly cash flow modeled',
    },
    verdict: {
      label: 'Simulation Verdict',
      investWinsTitle: 'Investing your surplus wins',
      payoffWinsTitle: 'Paying down your mortgage wins',
      tieTitle: 'Both strategies break even',
      advantageLabel: 'Net wealth advantage at end of term',
      breakEvenLabel: 'Break-Even Investment Return',
      breakEvenUnreachable: 'Unreachable (100% tax)',
      breakEvenHint:
        'Minimum pre-tax annual investment return needed for investing to match extra mortgage payments after taxes.',
      yourReturnLabel: 'Your expected return',
      realAdjustedBadge: "Today's purchasing power",
      nominalBadge: 'Nominal end-of-term value',
      scalePayoffZone: 'Payoff wins',
      scaleInvestZone: 'Invest wins',
    },
    scenarios: {
      scenarioABadge: 'Scenario A',
      scenarioATitle: 'Pay Extra to Mortgage Principal',
      scenarioASubtitle: 'Guaranteed debt elimination + reinvest freed payments after payoff',
      monthsSaved: 'Time Saved',
      yearsMonthsFormat: (years, months) => {
        if (years === 0) return `${months} mo`
        if (months === 0) return `${years} yr`
        return `${years} yr ${months} mo`
      },
      interestSaved: 'Total Interest Saved',
      payoffDate: 'Estimated Payoff Date',
      newPayoffTime: 'Paid off in',
      postPayoffWealth: 'End-of-Term Net Wealth (Reinvested)',
      scenarioBBadge: 'Scenario B',
      scenarioBTitle: 'Invest Monthly Surplus',
      scenarioBSubtitle: 'Keep standard mortgage schedule + compound extra cash in market',
      netFutureValue: 'Net Future Value (After Tax)',
      netAccumulatedWealth: 'Net Accumulated Wealth',
      totalContributed: 'Total Principal Invested',
      grossValue: 'Gross Pre-Tax Value',
      estimatedTax: 'Est. Capital Gains Tax',
    },
    charts: {
      title: 'Interactive Wealth & Debt Trajectory',
      tabWealth: 'Net Wealth Comparison',
      tabBalance: 'Mortgage Balance Payoff',
      wealthSubtitle:
        'Tracks Scenario A (reinvesting freed-up mortgage payments after early payoff) vs. Scenario B (investing from Month 1), after capital gains taxes.',
      balanceSubtitle:
        'Remaining loan balance under standard payments vs. accelerated extra principal payments.',
      yearPrefix: 'Year',
      seriesScenarioAWealth: 'Scenario A: Payoff + Reinvest (Net)',
      seriesScenarioBWealth: 'Scenario B: Invest Surplus (Net)',
      seriesBaselineBalance: 'Baseline Loan Balance',
      seriesAcceleratedBalance: 'Scenario A Loan Balance',
    },
    schedule: {
      title: 'Amortization & Wealth Schedule',
      subtitle: 'Inspect every period or download a spreadsheet-ready CSV.',
      annualTab: 'Year-by-Year',
      monthlyTab: 'Month-by-Month',
      exportCsv: 'Export CSV',
      colYear: 'Year',
      colMonth: 'Mo',
      colDate: 'Date',
      colBaseBalance: 'Base Balance',
      colBaseInterest: 'Base Interest',
      colABalance: 'A: Balance',
      colAInterest: 'A: Interest',
      colAWealth: 'A: Net Wealth',
      colBContrib: 'B: Invested',
      colBWealth: 'B: Net Value',
      showAllRows: 'Show all rows',
      showLessRows: 'Show first 120 rows',
    },
    savedDrawer: {
      title: 'Recent Scenarios (Local)',
      empty: 'No saved scenarios yet. Save your current parameters to compare alternatives quickly.',
      load: 'Load',
      delete: 'Delete',
      winnerPayoff: 'Payoff wins',
      winnerInvest: 'Invest wins',
      winnerTie: 'Break-even',
    },
    ads: {
      label: 'Sponsored',
      topSlotTitle: 'Partner Financial Resources',
      sidebarSlotTitle: 'Featured Financial Offer',
    },
    methodology: {
      title: 'How the Financial Math Works',
      subtitle: 'Transparent formulas behind the simulation and break-even calculation.',
      expandLabel: 'Read formula breakdown',
      collapseLabel: 'Hide formula breakdown',
      blocks: [
        {
          title: '1. Fixed-Rate Mortgage Amortization (Scenario A)',
          formula: 'M = P · [r(1 + r)^n] / [(1 + r)^n - 1]',
          body: 'Your baseline monthly principal & interest payment (M) is computed from remaining balance (P), monthly rate (r = annualRate / 12), and remaining months (n). Adding extra monthly principal directly reduces P each month, compounding interest savings and eliminating the loan earlier.',
        },
        {
          title: '2. Apples-to-Apples Reinvestment Equivalence',
          formula: 'Monthly Budget = M + ExtraPayment (Constant across 1…n)',
          body: 'To avoid comparing an early payoff date against a full-term investment horizon, both scenarios commit the exact same monthly cash flow across all n months. Once Scenario A pays off the house early, the freed-up (M + Extra) payment is invested for the remaining months until month n.',
        },
        {
          title: '3. After-Tax Investment Compounding (Scenario B) & Break-Even Rate',
          formula: 'Net FV = Gross FV - max(0, Gross FV - Contributions) × TaxRate',
          body: 'Scenario B invests your extra surplus monthly at (expectedReturn / 12). Capital gains tax applies only to investment profits at the end of the horizon. The break-even rate is solved numerically to find the exact pre-tax return where Scenario B matches Scenario A after tax.',
        },
        {
          title: '4. Optional Inflation Adjustment',
          formula: 'Real Value(t) = Nominal Value(t) / (1 + inflation)^(t / 12)',
          body: 'When an annual inflation rate is provided, future portfolio balances and net wealth differences can be viewed in constant today’s purchasing power alongside nominal figures.',
        },
      ],
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Key financial considerations before deciding between debt payoff and investing.',
      items: [
        {
          question: 'Why does the break-even rate exceed my mortgage interest rate?',
          answer:
            'Every dollar of mortgage interest you avoid is effectively a guaranteed, tax-free return equal to your mortgage rate. Investment returns, by contrast, are typically subject to capital gains taxes. If your mortgage is 6% and your capital gains tax is 15%, an investment generally needs to earn around 7% pre-tax just to match paying down the loan.',
        },
        {
          question: 'Does this calculator assume I invest my mortgage payment after paying off the house?',
          answer:
            'Yes. That ensures a fair apples-to-apples comparison over the exact same time horizon. Both Scenario A and Scenario B keep your total monthly out-of-pocket cash flow identical from month 1 through the original loan end date, and both end with a 100% debt-free home.',
        },
        {
          question: 'Is paying off a mortgage risk-free compared to investing in stocks?',
          answer:
            'Yes. Paying extra toward mortgage principal delivers a deterministic, volatility-free return equal to your loan rate. Market investments carry sequence-of-returns risk and volatility—even if expected average returns are higher over 15–30 years.',
        },
        {
          question: 'What should I prioritize before making extra mortgage payments?',
          answer:
            'Most financial planners recommend keeping a liquid emergency fund (3–6 months of expenses), capturing any employer retirement match, and eliminating high-interest consumer debt (like credit cards) before locking extra cash into illiquid home equity.',
        },
        {
          question: 'How does inflation affect a fixed-rate mortgage?',
          answer:
            'Moderate inflation erodes the real purchasing power of fixed monthly mortgage payments over time—you repay the bank with future dollars that are worth less. Meanwhile, productive assets like equities historically adjust upward with nominal economic growth.',
        },
      ],
    },
    footer: {
      disclaimer:
        'Educational simulator only — not personalized financial, tax, or investment advice. Consult a qualified fiduciary advisor before making major financial decisions.',
      privacyNote: 'Zero tracking • Scenarios stay in your browser localStorage.',
      ratesAttribution: 'Currency reference rates via Frankfurter (European Central Bank).',
    },
  },
  es: {
    lang: 'es',
    seo: {
      title: 'Simulador: ¿Abonar a Hipoteca o Invertir? | Calculadora Gratuita',
      description:
        'Compara abonar a capital de tu hipoteca contra invertir el excedente. Tasa de equilibrio en tiempo real, impuestos, inflación y tabla de amortización exportable a CSV.',
      appName: 'Simulador: ¿Abonar a Hipoteca o Invertir?',
    },
    header: {
      badge: '100% En tu Navegador • Simulador Financiero Gratuito',
      h1: 'Simulador: ¿Abonar a Hipoteca o Invertir?',
      subtitle:
        '¿Conviene hacer abonos a capital para liquidar tu deuda antes o invertir tu excedente mensual? Compara el ahorro garantizado en intereses frente al rendimiento compuesto después de impuestos.',
      currencyLabel: 'Moneda',
      rateLiveLabel: 'Tipo de cambio BCE',
      rateFallbackLabel: 'Tasa ref. local',
      convertToggle: 'Convertir montos al cambiar',
      savedButton: 'Recientes',
    },
    inputs: {
      title: 'Parámetros de Simulación',
      reset: 'Restablecer',
      saveScenario: 'Guardar Escenario',
      savedToast: 'Escenario guardado localmente',
      scenarioNamePlaceholder: 'Ej. Hipoteca 10.5% vs ETFs',
      principalLabel: 'Saldo Restante de la Hipoteca',
      principalHint: 'Capital pendiente por liquidar de tu crédito hipotecario.',
      mortgageRateLabel: 'Tasa de Interés Anual',
      termLabel: 'Plazo Restante',
      yearsUnit: 'años',
      monthsUnit: 'meses',
      extraMonthlyLabel: 'Abono Extra Mensual Disponible',
      extraMonthlyHint: 'Excedente mensual para adelantar a capital o invertir.',
      investReturnLabel: 'Rendimiento Anual Esperado',
      investReturnHint: 'Retorno anualizado bruto esperado de tu inversión.',
      taxRateLabel: 'Impuesto sobre Ganancias de Capital',
      taxRateHint: 'Tasa fiscal aplicada únicamente sobre las utilidades generadas.',
      inflationLabel: 'Inflación Anual (Opcional)',
      inflationHint: 'Ajusta el patrimonio futuro a poder adquisitivo de hoy.',
      showRealPower: 'Mostrar valores ajustados por inflación',
      basePaymentSummary: 'Mensualidad base (capital + interés)',
      totalBudgetSummary: 'Flujo mensual total modelado',
    },
    verdict: {
      label: 'Veredicto del Simulador',
      investWinsTitle: 'Conviene más invertir el excedente',
      payoffWinsTitle: 'Conviene más abonar a tu hipoteca',
      tieTitle: 'Ambos escenarios están en equilibrio',
      advantageLabel: 'Diferencia neta a favor al final del plazo',
      breakEvenLabel: 'Tasa de Equilibrio (Break-Even)',
      breakEvenUnreachable: 'Inalcanzable (impuesto 100%)',
      breakEvenHint:
        'Rendimiento bruto anual mínimo que necesita tu inversión para igualar el beneficio libre de impuestos de abonar a tu hipoteca.',
      yourReturnLabel: 'Tu rendimiento esperado',
      realAdjustedBadge: 'Poder adquisitivo actual',
      nominalBadge: 'Valor nominal al final del plazo',
      scalePayoffZone: 'Gana Abonar',
      scaleInvestZone: 'Gana Invertir',
    },
    scenarios: {
      scenarioABadge: 'Escenario A',
      scenarioATitle: 'Abonar a Capital de la Hipoteca',
      scenarioASubtitle: 'Ahorro garantizado en intereses + reinversión tras liquidar deuda',
      monthsSaved: 'Meses Ahorrados',
      yearsMonthsFormat: (years, months) => {
        if (years === 0) return `${months} meses`
        if (months === 0) return `${years} años`
        return `${years} a ${months} m`
      },
      interestSaved: 'Intereses Totales Ahorrados',
      payoffDate: 'Fecha Estimada de Liquidación',
      newPayoffTime: 'Se liquida en',
      postPayoffWealth: 'Patrimonio Neto al Final (Reinvertido)',
      scenarioBBadge: 'Escenario B',
      scenarioBTitle: 'Invertir el Excedente Mensual',
      scenarioBSubtitle: 'Mantener plazo original + interés compuesto del excedente',
      netFutureValue: 'Valor Futuro Neto (Después de Impuestos)',
      netAccumulatedWealth: 'Patrimonio Neto Acumulado',
      totalContributed: 'Capital Total Invertido',
      grossValue: 'Valor Bruto Antes de Impuestos',
      estimatedTax: 'Impuesto Est. sobre Ganancias',
    },
    charts: {
      title: 'Trayectoria Interactiva de Patrimonio y Deuda',
      tabWealth: 'Comparativa de Patrimonio Neto',
      tabBalance: 'Liquidación de Deuda Hipotecaria',
      wealthSubtitle:
        'Compara el Escenario A (reinvirtiendo la mensualidad liberada tras liquidar antes) vs. Escenario B (invirtiendo desde el mes 1), neto de impuestos.',
      balanceSubtitle:
        'Saldo insoluto de la hipoteca con pagos normales frente a abonos acelerados a capital.',
      yearPrefix: 'Año',
      seriesScenarioAWealth: 'Escenario A: Abonar + Reinvertir (Neto)',
      seriesScenarioBWealth: 'Escenario B: Invertir Excedente (Neto)',
      seriesBaselineBalance: 'Saldo Base Sin Abonos',
      seriesAcceleratedBalance: 'Saldo Escenario A (Con Abonos)',
    },
    schedule: {
      title: 'Tabla de Amortización y Patrimonio',
      subtitle: 'Consulta el desglose año por año o mes a mes y descárgalo en CSV.',
      annualTab: 'Año por Año',
      monthlyTab: 'Mes a Mes',
      exportCsv: 'Exportar CSV',
      colYear: 'Año',
      colMonth: 'Mes',
      colDate: 'Fecha',
      colBaseBalance: 'Saldo Base',
      colBaseInterest: 'Interés Base',
      colABalance: 'A: Saldo',
      colAInterest: 'A: Interés',
      colAWealth: 'A: Patrimonio Neto',
      colBContrib: 'B: Invertido',
      colBWealth: 'B: Valor Neto',
      showAllRows: 'Ver todas las filas',
      showLessRows: 'Ver primeros 120 meses',
    },
    savedDrawer: {
      title: 'Escenarios Recientes (Local)',
      empty:
        'Aún no tienes escenarios guardados. Guarda tus parámetros actuales para comparar alternativas fácilmente.',
      load: 'Cargar',
      delete: 'Eliminar',
      winnerPayoff: 'Gana Abonar',
      winnerInvest: 'Gana Invertir',
      winnerTie: 'Equilibrio',
    },
    ads: {
      label: 'Publicidad',
      topSlotTitle: 'Recursos Financieros Patrocinados',
      sidebarSlotTitle: 'Espacio Patrocinado',
    },
    methodology: {
      title: 'Cómo Funciona la Fórmula Financiera',
      subtitle: 'Metodología transparente de amortización, impuestos y tasa de equilibrio.',
      expandLabel: 'Ver explicación de la fórmula',
      collapseLabel: 'Ocultar explicación',
      blocks: [
        {
          title: '1. Amortización de Hipoteca a Tasa Fija (Escenario A)',
          formula: 'M = P · [r(1 + r)^n] / [(1 + r)^n - 1]',
          body: 'La mensualidad base (M) se calcula a partir del saldo restante (P), tasa mensual (r = tasaAnual / 12) y meses restantes (n). Cada abono extra va directo a capital, reduciendo el saldo sobre el que se calculan intereses en los meses siguientes.',
        },
        {
          title: '2. Equivalencia Justa mediante Reinversión Post-Liquidación',
          formula: 'Presupuesto Mensual = M + AbonoExtra (Constante de 1 a n)',
          body: 'Para no comparar una liquidación anticipada contra un horizonte completo de inversión, ambos escenarios destinan exactamente el mismo flujo mensual durante todos los n meses. Cuando el Escenario A liquida la hipoteca antes, la mensualidad liberada (M + Extra) se invierte hasta completar el plazo n.',
        },
        {
          title: '3. Capitalización Neta (Escenario B) y Tasa de Equilibrio',
          formula: 'Valor Neto = Valor Bruto - max(0, Valor Bruto - Aportes) × TasaImpuesto',
          body: 'El Escenario B invierte tu excedente cada mes a (rendimientoEsperado / 12). El impuesto sobre ganancias de capital solo grava la utilidad al final del plazo. La tasa de equilibrio se calcula numéricamente para hallar el rendimiento bruto exacto donde ambas estrategias empatan después de impuestos.',
        },
        {
          title: '4. Ajuste Opcional por Inflación',
          formula: 'Valor Real(t) = Valor Nominal(t) / (1 + inflación)^(t / 12)',
          body: 'Si ingresas una inflación anual estimada, puedes visualizar tu patrimonio futuro y la ventaja neta en términos de poder adquisitivo constante del día de hoy.',
        },
      ],
    },
    faq: {
      title: 'Preguntas Frecuentes (FAQ)',
      subtitle: 'Dudas clave al decidir entre adelantar capital a tu crédito hipotecario o invertir.',
      items: [
        {
          question: '¿Por qué la tasa de equilibrio es mayor que la tasa de mi hipoteca?',
          answer:
            'Cada peso o dólar que ahorras en intereses hipotecarios equivale a un rendimiento garantizado y libre de impuestos igual a la tasa de tu crédito. En cambio, las ganancias por inversiones suelen pagar impuestos. Por ejemplo, con una hipoteca al 9% y un impuesto del 10% sobre ganancias, necesitas alrededor de 10% anual bruto en inversiones para empatar.',
        },
        {
          question: '¿El simulador asume que invierto mi mensualidad después de liquidar la hipoteca?',
          answer:
            'Sí. De lo contrario, estaríamos comparando horizontes de tiempo distintos. Al mantener el mismo presupuesto mensual en ambos escenarios hasta el mes final del plazo original, ambos terminan con la vivienda 100% pagada y podemos medir con precisión cuál genera mayor patrimonio líquido.',
        },
        {
          question: '¿Es más seguro abonar a la hipoteca que invertir en bolsa o ETFs?',
          answer:
            'Abonar a capital ofrece un retorno 100% garantizado y sin volatilidad igual a la tasa de interés de tu deuda. Invertir en renta variable o fondos indexados puede ofrecer mayores retornos históricos, pero conlleva volatilidad y riesgo de mercado.',
        },
        {
          question: '¿Qué debo cubrir antes de hacer abonos extra a mi hipoteca?',
          answer:
            'Antes de inmovilizar liquidez en el valor de tu vivienda, conviene contar con un fondo de emergencia líquido (3 a 6 meses de gastos), aprovechar aportaciones patronales de retiro si existen y liquidar deudas caras como tarjetas de crédito.',
        },
        {
          question: '¿Cómo influye la inflación en una hipoteca a tasa fija?',
          answer:
            'En un crédito a tasa fija, la inflación reduce con el tiempo el peso real de la mensualidad que pagas al banco, ya que pagas con dinero futuro de menor poder adquisitivo. Sin embargo, si tu tasa hipotecaria es muy alta frente a la inflación, liquidarla rápido sigue siendo sumamente rentable.',
        },
      ],
    },
    footer: {
      disclaimer:
        'Simulador exclusivamente educativo; no constituye asesoría financiera, fiscal ni de inversión personalizada. Consulta a un asesor certificado antes de tomar decisiones patrimoniales.',
      privacyNote: 'Sin rastreo • Tus escenarios se guardan únicamente en tu navegador.',
      ratesAttribution: 'Tipos de cambio referenciales vía Frankfurter (Banco Central Europeo).',
    },
  },
}
