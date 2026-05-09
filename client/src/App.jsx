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

  useEffect(() => {
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
    setTimeout(() => {
      setSpeechText(greeting)
      setCorgiState('idle')
    }, 600)
  }, [])

  // Proactive nudge after inactivity
  useEffect(() => {
    if (messages.length === 0 || isLoading) return
    clearTimeout(nudgeTimerRef.current)
    nudgeTimerRef.current = setTimeout(() => {
      if (memory?.personalContext?.pendingTasks?.length > 0) {
        const task = memory.personalContext.pendingTasks[0]
        setSpeechText(`Hey, just checking — you mentioned "${task}". Still on your plate? 🐾`)
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
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <header className="border-b-4 border-[#4A3228] bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="font-pixel text-[#4A3228] text-xs">CORGI MEMORY</span>
          </div>
          <div className="flex items-center gap-3">
            {meta?.tokenEstimate > 0 && (
              <span className="text-xs font-pixel text-[#7DB87D]">
                {meta.tokenEstimate >= 1000 ? `${Math.round(meta.tokenEstimate / 1000)}K` : meta.tokenEstimate} tokens
              </span>
            )}
            <button
              onClick={() => setShowHistory(h => !h)}
              className="text-xs text-[#7A5A4A] hover:text-[#4A3228] px-2 py-1 rounded border-2 border-transparent hover:border-[#4A3228] transition-all font-medium"
            >
              {visitHistory.length > 0 ? `${visitHistory.length} visits` : 'history'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* History Panel */}
        {showHistory && (
          <div className="pixel-border rounded bg-white p-4 animate-slide-up">
            <div className="text-xs font-pixel text-[#4A3228] mb-3">VISIT HISTORY</div>
            {visitHistory.length === 0 ? (
              <div className="text-xs text-[#C8A882]">No visits yet — this is your first time here!</div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto chat-scroll">
                {[...visitHistory].reverse().slice(0, 8).map((v, i) => (
                  <div key={i} className="text-xs text-[#4A3228] border-b border-amber-100 pb-2 flex gap-3">
                    <span className="font-semibold text-[#7A5A4A]">
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

        {/* Corgi Stage */}
        <div className="flex flex-col items-center gap-1 py-2">
          <CorgiSpeechBubble text={speechText} isTyping={isTyping && !speechText} />
          <div className="relative mt-2">
            <PixelCorgi state={corgiState} size={224} />
          </div>
        </div>

        {/* Thinking Drawer */}
        <ThinkingDrawer
          isThinking={isThinking}
          toolsUsed={meta?.toolsUsed ?? []}
          tokenEstimate={meta?.tokenEstimate ?? 0}
          intent={meta?.intent}
          totalTimeMs={meta?.totalTimeMs}
        />

        {/* Context Cards */}
        <ContextCards
          recommendation={recommendation}
          workContext={workContext}
          memoryStats={memoryStats}
          crossSessionReference={crossSessionReference}
        />

        {/* Chat */}
        <ChatInterface
          messages={messages}
          onSend={handleSend}
          onUpload={handleUpload}
          isLoading={isLoading}
        />

        {/* Footer */}
        <div className="text-center pb-4">
          <span className="text-xs text-[#C8A882]">☕ Corgi Cafe · Powered by long-context AI</span>
        </div>
      </main>
    </div>
  )
}
