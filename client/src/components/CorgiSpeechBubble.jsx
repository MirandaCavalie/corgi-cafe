import { useEffect, useState, useRef } from 'react'

export default function CorgiSpeechBubble({ text, isTyping = false }) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const intervalRef = useRef(null)
  const cursorTimerRef = useRef(null)
  const resetTimerRef = useRef(null)

  useEffect(() => {
    clearInterval(intervalRef.current)
    clearTimeout(cursorTimerRef.current)
    clearTimeout(resetTimerRef.current)

    if (!text) {
      resetTimerRef.current = setTimeout(() => setDisplayed(''), 0)
      return () => clearTimeout(resetTimerRef.current)
    }

    resetTimerRef.current = setTimeout(() => {
      setDisplayed('')
      setShowCursor(true)
    }, 0)

    let i = 0
    intervalRef.current = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(intervalRef.current)
        cursorTimerRef.current = setTimeout(() => setShowCursor(false), 1500)
      }
    }, 22)

    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(cursorTimerRef.current)
      clearTimeout(resetTimerRef.current)
    }
  }, [text])

  if (!text && !isTyping) return null

  return (
    <div className="speech-bubble px-4 py-3 max-w-xs md:max-w-sm relative mb-4">
      {isTyping && !text ? (
        <div className="flex gap-1 items-center py-1">
          <span className="w-2 h-2 bg-[#4A3228] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-[#4A3228] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-[#4A3228] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      ) : (
        <p className="text-[#4A3228] text-sm leading-relaxed font-medium">
          {displayed}
          {showCursor && (
            <span className="cursor-blink inline-block w-0.5 h-4 bg-[#4A3228] ml-0.5 align-middle" />
          )}
        </p>
      )}
    </div>
  )
}
