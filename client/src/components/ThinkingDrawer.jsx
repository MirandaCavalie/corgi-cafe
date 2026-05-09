import { useState, useEffect, useRef } from 'react'

const TOOL_LABELS = {
  retrieveSemanticMemory:    'Searching memory...',
  getEnergyContext:          'Analyzing energy patterns...',
  surfaceForgottenContext:   'Surfacing forgotten context...',
  searchThineContext:        'Checking personal context...',
  analyzeAndCrossReference:  'Cross-referencing document...',
  evaluateDrinkFit:          'Evaluating drink fit...',
}

const INTENT_LABELS = {
  casual:        'casual chat',
  work_help:     'work help',
  drink_request: 'drink request',
  memory_query:  'memory query',
  upload:        'document upload',
}

export default function ThinkingDrawer({ isThinking, toolsUsed = [], tokenEstimate = 0, intent, totalTimeMs }) {
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [displayCount, setDisplayCount] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const rafRef = useRef(null)
  const collapseTimerRef = useRef(null)

  // Reveal tool steps with stagger when thinking starts
  useEffect(() => {
    if (isThinking && toolsUsed.length > 0) {
      setCollapsed(false)
      setVisibleSteps(0)
      const total = toolsUsed.length + 2
      let step = 0
      const interval = setInterval(() => {
        step++
        setVisibleSteps(step)
        if (step >= total) clearInterval(interval)
      }, 350)
      return () => clearInterval(interval)
    }
    if (isThinking) {
      setCollapsed(false)
    }
  }, [isThinking, toolsUsed.length])

  // Animate token counter
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const target = isThinking
      ? Math.floor(200_000 + Math.random() * 400_000)
      : tokenEstimate

    if (target === 0) { setDisplayCount(0); return }

    const duration = 1200
    const start = performance.now()
    const from = displayCount

    function tick(now) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayCount(Math.round(from + (target - from) * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else setDisplayCount(target)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isThinking, tokenEstimate]) // eslint-disable-line react-hooks/exhaustive-deps

  // Collapse after response + 2s
  useEffect(() => {
    if (totalTimeMs && !isThinking) {
      collapseTimerRef.current = setTimeout(() => setCollapsed(true), 2000)
      return () => clearTimeout(collapseTimerRef.current)
    }
  }, [totalTimeMs, isThinking])

  const show = isThinking || (tokenEstimate > 0 && !collapsed)
  if (!show) return null

  const allSteps = [
    ...toolsUsed.map(t => TOOL_LABELS[t] ?? t),
    'Assembling context window...',
    'Synthesizing with long-context AI...',
  ]

  const hasSteps = toolsUsed.length > 0

  return (
    <div className="pixel-border-sm rounded bg-amber-50 border-amber-200 p-3 animate-slide-up">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-pixel text-[#4A3228]">
          {'⚡ '}{intent ? (INTENT_LABELS[intent] ?? intent) : 'thinking'}
        </span>
        {displayCount > 0 && (
          <span className="font-pixel text-xs text-[#7DB87D]">
            {formatTokens(displayCount)} tokens
          </span>
        )}
      </div>

      {!hasSteps && isThinking && (
        <div className="text-xs text-[#7A5A4A] flex items-center gap-2">
          <span className="animate-pulse">⏳</span>
          <span>Running tools...</span>
        </div>
      )}

      {hasSteps && (
        <div className="space-y-1">
          {allSteps.map((label, i) => {
            const done = !isThinking
            const active = isThinking && i < visibleSteps
            const pending = isThinking && i >= visibleSteps
            return (
              <div
                key={i}
                className={'flex items-center gap-2 text-xs transition-opacity duration-300 ' + (pending ? 'opacity-30' : 'opacity-100')}
              >
                <span>{done || active ? '✅' : '⏳'}</span>
                <span className={done ? 'text-[#4A3228]' : 'text-[#7A5A4A]'}>{label}</span>
              </div>
            )
          })}
        </div>
      )}

      {isThinking && displayCount > 0 && (
        <div className="mt-2 pt-2 border-t border-amber-200">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-amber-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-[#7DB87D] transition-all duration-300"
                style={{ width: Math.min(100, (displayCount / 1_000_000) * 100) + '%' }}
              />
            </div>
            <span className="font-pixel text-xs text-[#7DB87D] min-w-[70px] text-right">
              {formatTokens(displayCount)}
            </span>
          </div>
        </div>
      )}

      {!isThinking && totalTimeMs > 0 && (
        <div className="mt-1.5 text-xs text-[#C8A882]">
          {(totalTimeMs / 1000).toFixed(1)}s · {formatTokens(tokenEstimate)} tokens
        </div>
      )}
    </div>
  )
}

function formatTokens(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return Math.round(n / 1000) + 'K'
  return String(n)
}
