import { useState, useEffect } from 'react'
import { explainPrediction } from '../services/api'

export default function ExplanationPanel({ customer, prediction, onExplanationDone }) {
  const [displayText, setDisplayText] = useState('')
  const [isStreaming, setIsStreaming] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function stream() {
      try {
        const response = await explainPrediction(customer, prediction)
        if (!response.ok) throw new Error(`Server error: ${response.status}`)

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done || cancelled) break

          const raw = decoder.decode(value, { stream: true })
          for (const event of raw.split('\n\n')) {
            const line = event.trim()
            if (!line.startsWith('data:')) continue
            const data = line.slice(5).trim()
            if (data === '[DONE]') continue
            if (!cancelled) setDisplayText((prev) => prev + data)
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Streaming failed.')
      } finally {
        if (!cancelled) {
          setIsStreaming(false)
          onExplanationDone?.()
        }
      }
    }

    stream()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
    >
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .cursor-blink { animation: blink 1s step-start infinite; display: inline-block; color: #F59E0B; }
      `}</style>

      {/* Amber top accent */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="p-6">
        {/* Heading */}
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-display italic"
            style={{ fontSize: 18, color: 'var(--text-secondary)' }}
          >
            Why this prediction?
          </h2>
          {isStreaming && (
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Generating…</span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-lg px-4 py-3 text-sm"
            style={{
              background: 'var(--danger-muted)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--danger)',
            }}
          >
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {!error && isStreaming && displayText === '' && (
          <div className="space-y-2.5">
            {[1, 0.8, 0.6].map((w, i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded-full"
                style={{ width: `${w * 100}%`, background: 'var(--border-subtle)' }}
              />
            ))}
          </div>
        )}

        {/* Streamed text with left gold border */}
        {!error && displayText !== '' && (
          <div
            className="border-l-2 border-amber-400 pl-4 whitespace-pre-wrap"
            style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-primary)' }}
          >
            {displayText}
            {isStreaming && <span className="cursor-blink" aria-hidden="true">▋</span>}
          </div>
        )}
      </div>
    </div>
  )
}
