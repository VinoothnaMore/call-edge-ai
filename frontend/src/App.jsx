import { useState } from 'react'
import CustomerForm from './components/CustomerForm'
import PredictionResult from './components/PredictionResult'
import ExplanationPanel from './components/ExplanationPanel'
import ChatAdvisor from './components/ChatAdvisor'

export default function App() {
  const [prediction, setPrediction] = useState(null)
  const [customerData, setCustomerData] = useState(null)

  function handlePrediction(predictionResult, formData) {
    setPrediction(predictionResult)
    setCustomerData(formData)
  }

  function handleReset() {
    setPrediction(null)
    setCustomerData(null)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <header
        className="sticky top-0 z-10 bg-[var(--bg-base)]/95 backdrop-blur-md"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="w-full px-6 sm:px-10 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="h-4 w-4 rounded-sm shrink-0"
              style={{ background: 'var(--accent-gold)' }}
              aria-hidden="true"
            />
            <span
              className="font-display italic text-white"
              style={{ fontSize: 22, letterSpacing: '-0.01em' }}
            >
              Call<span style={{ color: 'var(--accent-gold)' }}>Edge</span>
            </span>
          </div>

          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{
              background: 'var(--success-muted)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <div
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: 'var(--success)' }}
            />
            <span
              className="text-[10px] font-medium uppercase tracking-[0.12em]"
              style={{ color: 'var(--success)' }}
            >
              Live Model
            </span>
          </div>
        </div>
      </header>

      {/* View 1: Form */}
      {!prediction && (
        <main className="max-w-[680px] mx-auto px-4 sm:px-5 py-10">
          <CustomerForm onPrediction={handlePrediction} />
        </main>
      )}

      {/* View 2: Results */}
      {prediction && (
        <main className="max-w-[1140px] mx-auto px-4 sm:px-6 py-8">
          {/* Top bar */}
          <div className="flex justify-end mb-6">
            <button
              onClick={handleReset}
              className="text-sm transition-all duration-150"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-default)',
                borderRadius: 8,
                color: 'var(--text-secondary)',
                padding: '8px 16px',
                cursor: 'pointer',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-gold)'
                e.currentTarget.style.color = 'var(--accent-gold)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              ← New Customer
            </button>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-5 items-start">
            {/* Left: prediction + explanation */}
            <div className="space-y-5">
              <PredictionResult prediction={prediction} />
              <ExplanationPanel customer={customerData} prediction={prediction} />
            </div>

            {/* Right: chat — sticky on desktop */}
            <div className="lg:sticky lg:top-20">
              <ChatAdvisor customer={customerData} prediction={prediction} />
            </div>
          </div>

          <div className="pb-8" />
        </main>
      )}
    </div>
  )
}
