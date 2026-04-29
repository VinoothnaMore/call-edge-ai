import { useState, useEffect } from 'react'

export default function PredictionResult({ prediction }) {
  const [barVisible, setBarVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setBarVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const { label, confidence } = prediction
  const positive = label === 'yes'
  const pct = confidence.toFixed(1)

  return (
    <div
      className="prediction-enter rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${positive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
        boxShadow: positive
          ? '0 0 0 1px var(--success), 0 0 24px rgba(16, 185, 129, 0.07)'
          : '0 0 0 1px var(--danger), 0 0 24px rgba(244, 63, 94, 0.07)',
      }}
    >
      {/* Color-coded top accent */}
      <div
        className={
          positive
            ? 'h-0.5 bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent'
            : 'h-0.5 bg-gradient-to-r from-transparent via-rose-500/70 to-transparent'
        }
      />

      <div className="p-6">
        {/* Verdict */}
        <div className="mb-5">
          <p
            className="text-[10px] font-medium uppercase tracking-widest mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Prediction
          </p>
          <h2
            className="font-display italic leading-tight"
            style={{
              fontSize: 28,
              color: positive ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {positive ? 'Likely to Subscribe' : 'Unlikely to Subscribe'}
          </h2>
        </div>

        {/* Confidence */}
        <div
          className="rounded-xl px-4 py-3.5"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <span
              className="text-[10px] font-medium uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Model Confidence
            </span>
            <span
              className="tabular font-bold"
              style={{
                fontSize: 28,
                color: positive ? 'var(--success)' : 'var(--danger)',
              }}
            >
              {pct}%
            </span>
          </div>

          {/* Animated bar */}
          <div
            className="w-full overflow-hidden"
            style={{ height: 6, borderRadius: 4, background: 'var(--border-subtle)' }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 4,
                background: positive ? 'var(--success)' : 'var(--danger)',
                width: barVisible ? `${pct}%` : '0%',
                transition: 'width 600ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          <div className="flex justify-between mt-1.5">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>0%</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>100%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
