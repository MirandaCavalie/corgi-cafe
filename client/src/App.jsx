import { useState, useEffect, useRef } from 'react'
// App.css is intentionally blank - styles are in index.css
import PixelCorgi from './components/PixelCorgi'
import CorgiSpeechBubble from './components/CorgiSpeechBubble'
import ChatInterface from './components/ChatInterface'
import ContextCards from './components/ContextCards'
import ThinkingDrawer from './components/ThinkingDrawer'
import { useCorgiState } from './hooks/useCorgiState'
import { useMemory } from './hooks/useMemory'
import { api } from './utils/api'

const USER_ID = 'demo-user'

const GREETINGS = [
  'Welcome back to Corgi Cafe. What are we brewing today?',
  'Station online. Tell me what you are working on.',
  'You are here. The cafe memory log is ready.',
  'Corgi Cafe is open. What can I get started?',
]

export default function App() {
  const { corgiState, setState: setCorgiState } = useCorgiState('idle')
  const { memory, getMemoryStats, updateMemory } = useMemory(USER_ID)
  const [speechText, setSpeechText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [meta, setMeta] = useState(null)
  const [crossSessionReference, setCrossSessionReference] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [workContext, setWorkContext] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const nudgeTimerRef = useRef(null)
  const historyRef = useRef(null)

  useEffect(() => {
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
    setTimeout(() => {
      setSpeechText(greeting)
      setCorgiState('idle')
    }, 600)
  }, [setCorgiState])

  useEffect(() => {
    const handler = (e) => {
      if (historyRef.current && !historyRef.current.contains(e.target)) {
        setShowHistory(false)
      }
    }
    if (showHistory) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showHistory])

  useEffect(() => {
    if (messages.length === 0 || isLoading) return
    clearTimeout(nudgeTimerRef.current)
    nudgeTimerRef.current = setTimeout(() => {
      if (memory?.prospective?.items?.length > 0) {
        const item = memory.prospective.items[0]
        setSpeechText(`Quick check: ${item.content}`)
        setCorgiState('listening')
      }
    }, 30000)
    return () => clearTimeout(nudgeTimerRef.current)
  }, [messages, isLoading, memory, setCorgiState])

  const handleSend = async (text) => {
    if (isLoading) return

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setIsLoading(true)
    setIsTyping(true)
    setIsThinking(true)
    setMeta(null)
    setCrossSessionReference(null)
    setSpeechText('')
    setCorgiState('thinking')

    try {
      const result = await api.chat(USER_ID, text, {
        currentRecommendation: recommendation,
        workContext,
      })

      const newState = result.corgiState || 'idle'
      setCorgiState(newState)
      setSpeechText(result.message)
      setIsTyping(false)
      setIsThinking(false)
      if (result.meta) setMeta(result.meta)
      if (result.crossSessionReference) setCrossSessionReference(result.crossSessionReference)

      if (result.drinkRecommendation) {
        setRecommendation(result.drinkRecommendation)
        if (newState !== 'excited') {
          setCorgiState('excited')
          setTimeout(() => setCorgiState('serving'), 1200)
        }
      }

      if (result.contextInsights?.length > 0) {
        setWorkContext(prev => [...result.contextInsights, ...prev].slice(0, 6))
      }

      if (result.memoryUpdate) {
        updateMemory(result.memoryUpdate)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: result.message }])

      if (result.proactiveNudge) {
        setTimeout(() => {
          setSpeechText(result.proactiveNudge)
          setCorgiState('listening')
        }, 5000)
      }

    } catch {
      setCorgiState('idle')
      setSpeechText('Something jammed in the cafe console. Try again?')
      setIsTyping(false)
      setIsThinking(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something jammed in the cafe console. Try again?'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (doc) => {
    setMessages(prev => [...prev, {
      role: 'user',
      content: `Uploaded: ${doc.name}`
    }])
    setIsLoading(true)
    setIsTyping(true)
    setIsThinking(true)
    setMeta(null)
    setCrossSessionReference(null)
    setSpeechText('')
    setCorgiState('reading')

    try {
      const result = await api.upload(USER_ID, doc)

      setCorgiState(result.corgiState || 'idle')
      setSpeechText(result.message)
      setIsTyping(false)
      setIsThinking(false)
      if (result.meta) setMeta(result.meta)
      if (result.crossSessionReference) setCrossSessionReference(result.crossSessionReference)

      if (result.drinkRecommendation) setRecommendation(result.drinkRecommendation)
      if (result.contextInsights?.length > 0) {
        setWorkContext(prev => [...result.contextInsights, ...prev].slice(0, 6))
      }

      setMessages(prev => [...prev, { role: 'assistant', content: result.message }])

    } catch {
      setCorgiState('idle')
      setSpeechText('I had trouble reading that doc. Try pasting the text directly?')
      setIsTyping(false)
      setIsThinking(false)
    } finally {
      setIsLoading(false)
    }
  }

  const memoryStats = getMemoryStats()
  const visitHistory = memory?.episodic ?? memory?.visitHistory ?? []

  return (
    <div className="app-shell">
      <header className="game-header">
        <div className="game-header__inner">
          <div className="brand-lockup">
            <span className="brand-mark">◆</span>
            <span className="font-pixel">CORGI CAFE</span>
            <span className="header-subtitle">MEMORY OS</span>
          </div>

          <div className="header-controls" ref={historyRef}>
            {meta?.tokenEstimate > 0 && (
              <span className="hud-counter">
                TOKENS {meta.tokenEstimate >= 1000 ? `${Math.round(meta.tokenEstimate / 1000)}K` : meta.tokenEstimate}
              </span>
            )}
            <button
              onClick={() => setShowHistory(h => !h)}
              className="pixel-button pixel-button--small"
            >
              {visitHistory.length > 0 ? `LOG ${visitHistory.length}` : 'LOG'}
            </button>

            {showHistory && (
              <div className="history-popover pixel-panel animate-slide-up">
                <div className="panel-title">VISIT HISTORY</div>
                {visitHistory.length === 0 ? (
                  <div className="empty-copy">No visits yet. First run.</div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto chat-scroll">
                    {[...visitHistory].reverse().slice(0, 8).map((v, i) => (
                      <div key={i} className="history-row">
                        <span>{new Date(v.timestamp).toLocaleDateString()}</span>
                        {v.drinkOrdered && <span>{v.drinkOrdered}</span>}
                        {v.mood && <span>{v.mood}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="game-main">
        <section className="stage-column">
          <div className="stage-window pixel-panel">
            <CorgiSpeechBubble text={speechText} isTyping={isTyping && !speechText} />
            <PixelCorgi state={corgiState} size={244} />
          </div>

          <ThinkingDrawer
            isThinking={isThinking}
            toolsUsed={meta?.toolsUsed ?? []}
            tokenEstimate={meta?.tokenEstimate ?? 0}
            intent={meta?.intent}
            totalTimeMs={meta?.totalTimeMs}
          />

          <ContextCards
            recommendation={recommendation}
            workContext={workContext}
            memoryStats={memoryStats}
            crossSessionReference={crossSessionReference}
          />
        </section>

        <section className="chat-column pixel-panel">
          <div className="chat-column__title">
            <span>CAFE CHAT</span>
            <span>{isLoading ? 'RUNNING' : 'READY'}</span>
          </div>
          <ChatInterface
            messages={messages}
            onSend={handleSend}
            onUpload={handleUpload}
            isLoading={isLoading}
          />
        </section>
      </main>
    </div>
  )
}
