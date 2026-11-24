import { useId } from 'react'

interface NumericInputFieldProps {
  label: string
  hint?: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  sliderMax?: number
  prefix?: string
  suffix?: string
  showSlider?: boolean
}

export function NumericInputField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  sliderMax,
  prefix,
  suffix,
  showSlider = true,
}: NumericInputFieldProps) {
  const inputId = useId()
  const effectiveSliderMax = sliderMax ?? max

  const handleNumberChange = (raw: string) => {
    if (raw === '') {
      onChange(min)
      return
    }
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) return
    onChange(Math.min(max, Math.max(min, parsed)))
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      </div>

      <div className="relative flex items-center">
        {prefix ? (
          <span className="pointer-events-none absolute left-3 text-sm font-semibold text-slate-400">
            {prefix}
          </span>
        ) : null}
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => handleNumberChange(e.target.value)}
          className={`w-full rounded-lg border border-slate-200 bg-white py-2 font-mono text-sm font-semibold text-slate-900 tabular-nums shadow-xs transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${
            prefix ? 'pl-8' : 'pl-3'
          } ${suffix ? 'pr-10' : 'pr-3'}`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 text-xs font-semibold text-slate-400">
            {suffix}
          </span>
        ) : null}
      </div>

      {showSlider ? (
        <input
          type="range"
          aria-label={label}
          min={min}
          max={effectiveSliderMax}
          step={step}
          value={Math.min(effectiveSliderMax, Math.max(min, value))}
          onChange={(e) => onChange(Number(e.target.value))}
          className="fin-slider"
        />
      ) : null}

      {hint ? <p className="text-xs leading-relaxed text-slate-500">{hint}</p> : null}
    </div>
  )
}
