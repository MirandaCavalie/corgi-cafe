import { useState, useEffect, useRef } from 'react'
// App.css is intentionally blank — styles are in index.css
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
  "Woof! Welcome back to Corgi Cafe! ☕ What are we working on today?",
  "Hey there! I've been waiting for you. Tell me everything 🐾",
  "You're here! I was just thinking about you. What's the vibe today?",
  "Bark bark! (That means 'hi, I missed you') What can I get you?",
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
  }, [])

  // Close history on outside click
  useEffect(() => {
    const handler = (e) => {
      if (historyRef.current && !historyRef.current.contains(e.target)) {
        setShowHistory(false)
      }
    }
    if (showHistory) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showHistory])

  // Proactive nudge after inactivity
  useEffect(() => {
    if (messages.length === 0 || isLoading) return
    clearTimeout(nudgeTimerRef.current)
    nudgeTimerRef.current = setTimeout(() => {
      if (memory?.prospective?.items?.length > 0) {
        const item = memory.prospective.items[0]
        setSpeechText(`Hey, just checking — ${item.content} 🐾`)
        setCorgiState('listening')
      }
    }, 30000)
    return () => clearTimeout(nudgeTimerRef.current)
  }, [messages, isLoading, memory])

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
      setSpeechText("Woof... something went wrong. Give me a sec and try again? 🐾")
      setIsTyping(false)
      setIsThinking(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Woof... something went wrong. Try again?"
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (doc) => {
    setMessages(prev => [...prev, {
      role: 'user',
      content: `📎 Uploaded: ${doc.name}`
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
      setSpeechText("Hmm, I had trouble reading that doc. Try pasting the text directly?")
      setIsTyping(false)
      setIsThinking(false)
    } finally {
      setIsLoading(false)
    }
  }

  const memoryStats = getMemoryStats()
  const visitHistory = memory?.episodic ?? memory?.visitHistory ?? []

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="border-b-4 border-[#FF5C00] bg-white flex-shrink-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐾</span>
            <span className="font-pixel text-[#FF5C00] text-xs">CORGI MEMORY</span>
          </div>
          <div className="flex items-center gap-3" ref={historyRef} style={{ position: 'relative' }}>
            {meta?.tokenEstimate > 0 && (
              <span className="text-xs font-pixel text-[#FF5C00]">
                {meta.tokenEstimate >= 1000 ? `${Math.round(meta.tokenEstimate / 1000)}K` : meta.tokenEstimate} tokens
              </span>
            )}
            <button
              onClick={() => setShowHistory(h => !h)}
              className="text-xs text-[#666666] hover:text-[#FF5C00] px-2 py-1 rounded border-2 border-[#E8E8E8] hover:border-[#FF5C00] transition-all"
            >
              {visitHistory.length > 0 ? `${visitHistory.length} visits` : 'history'}
            </button>

            {/* History dropdown — floats over content */}
            {showHistory && (
              <div className="absolute top-full right-0 mt-1 w-72 pixel-border rounded bg-white p-4 animate-slide-up z-20">
                <div className="text-xs font-pixel text-[#FF5C00] mb-3">VISIT HISTORY</div>
                {visitHistory.length === 0 ? (
                  <div className="text-xs text-[#AAAAAA]">No visits yet — first time here!</div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto chat-scroll">
                    {[...visitHistory].reverse().slice(0, 8).map((v, i) => (
                      <div key={i} className="text-xs text-[#1A1A1A] border-b border-[#F0F0F0] pb-2 flex gap-3">
                        <span className="text-[#666666]">
                          {new Date(v.timestamp).toLocaleDateString()}
                        </span>
                        {v.drinkOrdered && <span className="text-[#D4748A]">☕ {v.drinkOrdered}</span>}
                        {v.mood && <span className="text-[#7DB87D]">{v.mood}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main — fills remaining height, no overflow */}
      <main className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col max-w-2xl mx-auto w-full px-4">

          {/* Corgi stage — compact, fixed */}
          <div className="flex flex-col items-center flex-shrink-0 pt-2" style={{ gap: '8px' }}>
            <CorgiSpeechBubble text={speechText} isTyping={isTyping && !speechText} />
            <PixelCorgi state={corgiState} size={128} />
          </div>

          {/* ThinkingDrawer */}
          <div className="flex-shrink-0 mt-2">
            <ThinkingDrawer
              isThinking={isThinking}
              toolsUsed={meta?.toolsUsed ?? []}
              tokenEstimate={meta?.tokenEstimate ?? 0}
              intent={meta?.intent}
              totalTimeMs={meta?.totalTimeMs}
            />
          </div>

          {/* Context Cards */}
          <div className="flex-shrink-0 mt-2">
            <ContextCards
              recommendation={recommendation}
              workContext={workContext}
              memoryStats={memoryStats}
              crossSessionReference={crossSessionReference}
            />
          </div>

          {/* Chat — fills all remaining space */}
          <div className="flex-1 min-h-0 flex flex-col mt-2">
            <ChatInterface
              messages={messages}
              onSend={handleSend}
              onUpload={handleUpload}
              isLoading={isLoading}
            />
          </div>

          <div className="text-center py-1 flex-shrink-0">
            <span className="text-xs text-[#CCCCCC]">☕ Corgi Cafe · Powered by long-context AI</span>
          </div>

        </div>
      </main>
    </div>
  )
}
