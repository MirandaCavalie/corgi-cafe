import { useState, useRef, useEffect } from 'react'
import MoodSelector from './MoodSelector'
import DocumentUpload from './DocumentUpload'

export default function ChatInterface({ messages, onSend, onUpload, isLoading }) {
  const [input, setInput] = useState('')
  const [showMood, setShowMood] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    onSend(text)
    setInput('')
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleMoodSelect = (mood) => {
    onSend(`My mood right now: ${mood.label}`)
    setShowMood(false)
  }

  const handleUpload = (doc) => {
    onUpload(doc)
    setShowUpload(false)
  }

  return (
    <div className="chat-shell">
      <div className="chat-thread chat-scroll">
        {messages.length === 0 && (
          <div className="empty-state">
            <span>INSERT PROMPT</span>
            <span>Start a session with your cafe companion.</span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message-row animate-slide-up ${msg.role === 'user' ? 'message-row--user' : 'message-row--assistant'}`}
          >
            {msg.role === 'assistant' && (
              <div className="npc-avatar" aria-hidden="true">C</div>
            )}
            <div className={`message-bubble ${msg.role === 'user' ? 'message-bubble--user' : 'message-bubble--assistant'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-row message-row--assistant">
            <div className="npc-avatar" aria-hidden="true">C</div>
            <div className="message-bubble message-bubble--assistant loading-bubble">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-compose">
        {showMood && (
          <MoodSelector onSelect={handleMoodSelect} onClose={() => setShowMood(false)} />
        )}
        {showUpload && (
          <DocumentUpload onUpload={handleUpload} onClose={() => setShowUpload(false)} />
        )}

        <div className="composer-panel">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Chat with Corgi..."
            rows={3}
            className="compose-input"
          />
          <div className="compose-toolbar">
            <div className="compose-actions">
              <button
                onClick={() => { setShowUpload(!showUpload); setShowMood(false) }}
                title="Add document"
                className={`icon-button ${showUpload ? 'icon-button--active' : ''}`}
              >
                DOC
              </button>
              <button
                onClick={() => { setShowMood(!showMood); setShowUpload(false) }}
                title="Set mood"
                className={`icon-button ${showMood ? 'icon-button--active' : ''}`}
              >
                MOOD
              </button>
              <button
                onClick={() => onSend("What's on the menu?")}
                title="See menu"
                className="icon-button"
              >
                MENU
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="send-button"
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
