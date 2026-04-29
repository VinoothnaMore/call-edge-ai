import { Fragment, useState, useEffect } from 'react'
import { predictCustomer } from '../services/api'

const initialState = {
  job: 'admin.',
  marital: 'divorced',
  education: 'primary',
  contact: 'cellular',
  poutcome: 'failure',
  age: 35,
  balance: 0,
  day: 15,
  pdays: -1,
  default: false,
  housing: false,
  loan: false,
  has_contacted: false,
}

const SECTIONS = ['Demographics', 'Financial', 'Contact History']

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionDivider({ children }) {
  return (
    <div className="relative flex items-center my-7">
      <div className="flex-1" style={{ borderTop: '1px solid var(--border-subtle)' }} />
      <span
        className="px-3 text-[10px] font-medium uppercase tracking-widest"
        style={{ color: 'rgba(245, 158, 11, 0.55)' }}
      >
        {children}
      </span>
      <div className="flex-1" style={{ borderTop: '1px solid var(--border-subtle)' }} />
    </div>
  )
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-medium uppercase mb-2"
      style={{ fontSize: 11, letterSpacing: '0.05em', color: 'var(--text-secondary)' }}
    >
      {children}
    </label>
  )
}

const inputStyle = {
  height: 48,
  background: 'var(--bg-input)',
  border: '1px solid var(--border-default)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontSize: 14,
  width: '100%',
  padding: '0 14px',
  outline: 'none',
  transition: 'border-color 150ms ease',
}

function SelectField({ id, value, onChange, options }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="appearance-none w-full pr-10 cursor-pointer focus:outline-none"
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = 'var(--border-active)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ background: '#1A2942', color: 'var(--text-primary)' }}>
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="rgba(245,158,11,0.7)" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  )
}

function NumberField({ id, value, onChange, min, max }) {
  return (
    <input
      id={id}
      type="number"
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      style={inputStyle}
      className="focus:outline-none tabular"
      onFocus={(e) => (e.target.style.borderColor = 'var(--border-active)')}
      onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
    />
  )
}

function ToggleField({ id, checked, onChange, label, onSectionFocus }) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="font-medium uppercase"
        style={{ fontSize: 11, letterSpacing: '0.05em', color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => { onSectionFocus?.(); onChange(!checked) }}
        className="relative inline-flex shrink-0 cursor-pointer rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2"
        style={{
          width: 44,
          height: 24,
          background: checked ? 'var(--accent-gold)' : '#334155',
          '--tw-ring-offset-color': 'var(--bg-surface)',
        }}
      >
        <span
          className="inline-block rounded-full bg-white shadow-md transition-all duration-200 ease-in-out"
          style={{
            width: 18,
            height: 18,
            position: 'absolute',
            top: '50%',
            transform: `translateY(-50%) translateX(${checked ? 23 : 3}px)`,
          }}
        />
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CustomerForm({ onPrediction }) {
  const [formData, setFormData] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeSection, setActiveSection] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function sectionStyle(delayMs) {
    return {
      transition: 'opacity 300ms ease, transform 300ms ease',
      transitionDelay: `${delayMs}ms`,
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateY(0)' : 'translateY(16px)',
    }
  }

  function setField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSelect = (field) => (e) => setField(field, e.target.value)
  const handleNumber = (field) => (e) => setField(field, Number(e.target.value))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await predictCustomer(formData)
      onPrediction(result, formData)
    } catch (err) {
      setError(err?.response?.data?.detail ?? err?.message ?? 'Request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderTop: '3px solid var(--accent-gold)',
        borderRadius: 16,
      }}
      className="shadow-2xl shadow-black/50 px-6 py-6 sm:px-12 sm:py-12"
    >
      {/* Section stepper — animates with first section */}
      <div className="flex items-center justify-center mb-10" style={sectionStyle(0)}>
        {SECTIONS.map((s, i) => (
          <Fragment key={s}>
            {i > 0 && (
              <div
                className="w-8 shrink-0 mx-2"
                style={{ height: 1, background: 'var(--border-subtle)' }}
              />
            )}
            <span
              className="text-[10px] font-medium uppercase tracking-[0.15em] whitespace-nowrap transition-colors duration-150"
              style={{ color: activeSection === i ? 'var(--accent-gold)' : 'var(--text-muted)' }}
            >
              {s}
            </span>
          </Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Demographics ─────────────────────────────────── */}
        <div style={sectionStyle(0)}>
          <SectionDivider>Demographics</SectionDivider>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            onFocus={() => setActiveSection(0)}
          >
            <div>
              <FieldLabel htmlFor="age">Age</FieldLabel>
              <NumberField id="age" value={formData.age} onChange={handleNumber('age')} min={18} max={95} />
            </div>
            <div>
              <FieldLabel htmlFor="job">Occupation</FieldLabel>
              <SelectField
                id="job" value={formData.job} onChange={handleSelect('job')}
                options={['admin.', 'blue-collar', 'entrepreneur', 'housemaid', 'management', 'retired', 'self-employed', 'services', 'student', 'technician', 'unemployed', 'unknown']}
              />
            </div>
            <div>
              <FieldLabel htmlFor="marital">Marital Status</FieldLabel>
              <SelectField
                id="marital" value={formData.marital} onChange={handleSelect('marital')}
                options={['divorced', 'married', 'single']}
              />
            </div>
            <div>
              <FieldLabel htmlFor="education">Education Level</FieldLabel>
              <SelectField
                id="education" value={formData.education} onChange={handleSelect('education')}
                options={['primary', 'secondary', 'tertiary', 'unknown']}
              />
            </div>
          </div>
        </div>

        {/* ── Financial ────────────────────────────────────── */}
        <div style={sectionStyle(100)}>
          <SectionDivider>Financial</SectionDivider>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            onFocus={() => setActiveSection(1)}
          >
            <div>
              <FieldLabel htmlFor="balance">Account Balance (€)</FieldLabel>
              <NumberField id="balance" value={formData.balance} onChange={handleNumber('balance')} min={-10000} max={100000} />
            </div>
            <div
              className="flex flex-col justify-center gap-4 rounded-lg px-4 py-3.5"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <ToggleField
                id="default" checked={formData.default}
                onChange={(v) => setField('default', v)}
                label="Credit in default"
                onSectionFocus={() => setActiveSection(1)}
              />
              <ToggleField
                id="housing" checked={formData.housing}
                onChange={(v) => setField('housing', v)}
                label="Housing loan"
                onSectionFocus={() => setActiveSection(1)}
              />
              <ToggleField
                id="loan" checked={formData.loan}
                onChange={(v) => setField('loan', v)}
                label="Personal loan"
                onSectionFocus={() => setActiveSection(1)}
              />
            </div>
          </div>
        </div>

        {/* ── Contact History ───────────────────────────────── */}
        <div style={sectionStyle(200)}>
          <SectionDivider>Contact History</SectionDivider>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            onFocus={() => setActiveSection(2)}
          >
            <div>
              <FieldLabel htmlFor="contact">Contact Type</FieldLabel>
              <SelectField
                id="contact" value={formData.contact} onChange={handleSelect('contact')}
                options={['cellular', 'telephone', 'unknown']}
              />
            </div>
            <div>
              <FieldLabel htmlFor="day">Day Last Contacted</FieldLabel>
              <NumberField id="day" value={formData.day} onChange={handleNumber('day')} min={1} max={31} />
            </div>
            <div>
              <FieldLabel htmlFor="pdays">Days Since Last Contact</FieldLabel>
              <NumberField id="pdays" value={formData.pdays} onChange={handleNumber('pdays')} min={-1} max={999} />
            </div>
            <div>
              <FieldLabel htmlFor="poutcome">Previous Campaign Outcome</FieldLabel>
              <SelectField
                id="poutcome" value={formData.poutcome} onChange={handleSelect('poutcome')}
                options={['failure', 'other', 'success', 'unknown']}
              />
            </div>
            <div
              className="sm:col-span-2 rounded-lg px-4 py-3.5"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
            >
              <ToggleField
                id="has_contacted" checked={formData.has_contacted}
                onChange={(v) => setField('has_contacted', v)}
                label="Previously contacted in a prior campaign"
                onSectionFocus={() => setActiveSection(2)}
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mt-6 rounded-lg px-4 py-3 text-sm"
            style={{
              background: 'var(--danger-muted)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: 'var(--danger)',
            }}
          >
            <span className="font-semibold">Error — </span>{error}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8" style={sectionStyle(260)}>
          <button
            type="submit"
            className={`w-full flex items-center justify-center gap-3 text-[15px] font-semibold transition-all duration-200 ease-in-out ${loading ? 'cursor-wait' : 'cursor-pointer'}`}
            style={{
              height: 56,
              borderRadius: 12,
              background: 'var(--accent-gold)',
              color: 'var(--bg-base)',
              letterSpacing: '0.03em',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'var(--accent-gold-hover)'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent-gold)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Analyzing…</span>
              </>
            ) : (
              <span>Analyze Customer</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
