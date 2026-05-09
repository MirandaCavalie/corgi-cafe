import { useState, useEffect, useRef } from 'react'

const TOOL_LABELS = {
  retrieveSemanticMemory: 'Search memory',
  getEnergyContext: 'Read energy',
  surfaceForgottenContext: 'Surface context',
  searchThineContext: 'Check personal log',
  analyzeAndCrossReference: 'Cross-reference doc',
  evaluateDrinkFit: 'Evaluate drink fit',
}

const INTENT_LABELS = {
  casual: 'casual chat',
  work_help: 'work help',
  drink_request: 'drink request',
  memory_query: 'memory query',
  upload: 'document upload',
}

export default function ThinkingDrawer({ isThinking, toolsUsed = [], tokenEstimate = 0, intent, totalTimeMs }) {
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [displayCount, setDisplayCount] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const rafRef = useRef(null)
  const collapseTimerRef = useRef(null)

  useEffect(() => {
    let resetTimer
    if (isThinking && toolsUsed.length > 0) {
      resetTimer = setTimeout(() => {
        setCollapsed(false)
        setVisibleSteps(0)
      }, 0)
      const total = toolsUsed.length + 2
      let step = 0
      const interval = setInterval(() => {
        step++
        setVisibleSteps(step)
        if (step >= total) clearInterval(interval)
      }, 350)
      return () => {
        clearTimeout(resetTimer)
        clearInterval(interval)
      }
    }
    if (isThinking) {
      resetTimer = setTimeout(() => setCollapsed(false), 0)
      return () => clearTimeout(resetTimer)
    }
  }, [isThinking, toolsUsed.length])

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const target = isThinking
      ? Math.floor(200_000 + Math.random() * 400_000)
      : tokenEstimate

    if (target === 0) {
      const resetTimer = setTimeout(() => setDisplayCount(0), 0)
      return () => clearTimeout(resetTimer)
    }

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
    'Assemble context',
    'Synthesize reply',
  ]

  const hasSteps = toolsUsed.length > 0

  return (
    <div className="thinking-drawer pixel-panel pixel-panel--small animate-slide-up">
      <div className="thinking-drawer__header">
        <span className="panel-title">
          {intent ? (INTENT_LABELS[intent] ?? intent) : 'thinking'}
        </span>
        {displayCount > 0 && (
          <span className="hud-counter">
            {formatTokens(displayCount)}
          </span>
        )}
      </div>

      {!hasSteps && isThinking && (
        <div className="tool-row pending">
          <span className="tool-pip" />
          <span>Running tools...</span>
        </div>
      )}

      {hasSteps && (
        <div className="tool-stack">
          {allSteps.map((label, i) => {
            const done = !isThinking
            const active = isThinking && i < visibleSteps
            const pending = isThinking && i >= visibleSteps
            return (
              <div
                key={i}
                className={`tool-row ${pending ? 'pending' : ''}`}
              >
                <span className={`tool-pip ${done || active ? 'tool-pip--on' : ''}`} />
                <span>{label}</span>
              </div>
            )
          })}
        </div>
      )}

      {isThinking && displayCount > 0 && (
        <div className="token-meter">
          <div>
            <span style={{ width: Math.min(100, (displayCount / 1_000_000) * 100) + '%' }} />
          </div>
          <strong>{formatTokens(displayCount)}</strong>
        </div>
      )}

      {!isThinking && totalTimeMs > 0 && (
        <div className="muted-line">
          {(totalTimeMs / 1000).toFixed(1)}s // {formatTokens(tokenEstimate)} tokens
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
