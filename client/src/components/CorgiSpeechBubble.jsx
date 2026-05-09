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
    }, 18)

    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(cursorTimerRef.current)
      clearTimeout(resetTimerRef.current)
    }
  }, [text])

  if (!text && !isTyping) return null

  return (
    <div className="speech-bubble">
      {isTyping && !text ? (
        <div className="typing-dots">
          <span />
          <span />
          <span />
        </div>
      ) : (
        <p>
          {displayed}
          {showCursor && (
            <span className="cursor-blink bubble-cursor" />
          )}
        </p>
      )}
    </div>
  )
}
