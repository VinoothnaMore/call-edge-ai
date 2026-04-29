import { useState, useEffect, useRef } from 'react'
import { chatWithAdvisor } from '../services/api'

const INITIAL_MESSAGES = [
  { role: 'user', content: 'What is the best approach for this customer?' },
]

export default function ChatAdvisor({ customer, prediction }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = inputValue.trim()
    if (!text || isStreaming) return

    setInputValue('')
    setError(null)

    const userMsg = { role: 'user', content: text }
    const historyForBackend = [...messages, userMsg]
    setMessages([...historyForBackend, { role: 'assistant', content: '' }])
    setIsStreaming(true)

    try {
      const response = await chatWithAdvisor(customer, prediction, historyForBackend)
      if (!response.ok) throw new Error(`Server error: ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const raw = decoder.decode(value, { stream: true })
        for (const event of raw.split('\n\n')) {
          const line = event.trim()
          if (!line.startsWith('data:')) continue
          const data = line.slice(5).trim()
          if (data === '[DONE]') continue
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: updated[updated.length - 1].content + data,
            }
            return updated
          })
        }
      }
    } catch (err) {
      setError(err.message ?? 'Chat request failed.')
    } finally {
      setIsStreaming(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        minHeight: 500,
      }}
    >
      <style>{`
        @keyframes chat-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .chat-cursor { animation: chat-blink 1s step-start infinite; display: inline-block; color: #F59E0B; }
        @keyframes dot-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
          40% { transform: scale(1); opacity: 1; }
        }
        .dot-1 { animation: dot-pulse 1.2s ease-in-out infinite 0s; }
        .dot-2 { animation: dot-pulse 1.2s ease-in-out infinite 0.2s; }
        .dot-3 { animation: dot-pulse 1.2s ease-in-out infinite 0.4s; }
      `}</style>

      {/* Amber top accent */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      {/* Header */}
      <div
        className="px-5 pt-4 pb-3.5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span
          className="text-[10px] font-medium uppercase tracking-[0.15em]"
          style={{ color: 'rgba(245, 158, 11, 0.7)' }}
        >
          Ask about this customer
        </span>
      </div>

      {/* Message area */}
      <div
        className="flex-1 overflow-y-auto flex flex-col gap-3 px-5 py-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--text-muted) transparent' }}
      >
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user'
          const isLastMsg = i === messages.length - 1
          const showDots = isStreaming && !isUser && isLastMsg && msg.content === ''
          const showCursor = isStreaming && !isUser && isLastMsg && msg.content !== ''

          return (
            <div key={i} className={`msg-enter flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[82%] text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  padding: '10px 14px',
                  borderRadius: isUser ? '12px 12px 12px 2px' : '2px 12px 12px 12px',
                  background: isUser ? 'var(--accent-gold-muted)' : 'var(--bg-elevated)',
                  border: `1px solid ${isUser ? 'var(--border-active)' : 'var(--border-subtle)'}`,
                  color: isUser ? 'rgba(245, 158, 11, 0.9)' : 'var(--text-primary)',
                }}
              >
                {showDots ? (
                  <span className="flex items-center gap-1 py-0.5">
                    <span className="dot-1 inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'currentColor' }} />
                    <span className="dot-2 inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'currentColor' }} />
                    <span className="dot-3 inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'currentColor' }} />
                  </span>
                ) : (
                  <>
                    {msg.content || (!isStreaming && <span className="italic opacity-40 text-xs">—</span>)}
                    {showCursor && <span className="chat-cursor" aria-hidden="true">▋</span>}
                  </>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div
          className="mx-5 mb-3 rounded-lg px-3 py-2 text-xs"
          style={{
            background: 'var(--danger-muted)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--danger)',
          }}
        >
          {error}
        </div>
      )}

      {/* Input bar */}
      <div
        className="px-5 pb-5 pt-3"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Ask about this customer…"
            className="flex-1 focus:outline-none transition-colors duration-150"
            style={{
              height: 44,
              background: 'var(--bg-input)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontSize: 14,
              padding: '0 14px',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--border-active)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
          />
          <button
            type="button"
            onClick={send}
            disabled={isStreaming || !inputValue.trim()}
            className="flex items-center justify-center shrink-0 transition-all duration-150"
            style={{
              height: 44,
              width: 44,
              borderRadius: 8,
              background: 'var(--accent-gold)',
              border: 'none',
              color: 'var(--bg-base)',
              cursor: isStreaming || !inputValue.trim() ? 'not-allowed' : 'pointer',
              opacity: isStreaming || !inputValue.trim() ? 0.45 : 1,
            }}
          >
            <svg
              width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth={2.2}
              strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
