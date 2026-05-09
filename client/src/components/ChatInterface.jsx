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
    onSend(`My mood right now: ${mood.label} ${mood.emoji}`)
    setShowMood(false)
  }

  const handleUpload = (doc) => {
    onUpload(doc)
    setShowUpload(false)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Message Thread — scrollable, fills available space */}
      <div className="chat-scroll flex-1 overflow-y-auto min-h-0 space-y-3 px-3 py-2">
        {messages.length === 0 && (
          <div className="text-center text-sm text-[#AAAAAA] py-4">
            Say hi to start your session ☕
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 animate-slide-up ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-[#E8A85F] border-2 border-[#FF5C00] flex-shrink-0 flex items-center justify-center text-xs">
                🐾
              </div>
            )}
            <div
              className={`max-w-[75%] px-3 py-2 rounded text-sm leading-relaxed pixel-border-sm ${
                msg.role === 'user'
                  ? 'bg-[#FF5C00] text-white'
                  : 'bg-[#F5F5F5] text-[#1A1A1A]'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E8A85F] border-2 border-[#FF5C00] flex-shrink-0 flex items-center justify-center text-xs">
              🐾
            </div>
            <div className="bg-[#F5F5F5] pixel-border-sm px-3 py-2 rounded">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-[#FF5C00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#FF5C00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#FF5C00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area — fixed at bottom */}
      <div className="relative px-3 pb-2 flex-shrink-0">
        {showMood && (
          <MoodSelector onSelect={handleMoodSelect} onClose={() => setShowMood(false)} />
        )}
        {showUpload && (
          <DocumentUpload onUpload={handleUpload} onClose={() => setShowUpload(false)} />
        )}

        <div className="pixel-border rounded bg-white p-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Chat with Corgi..."
            rows={2}
            className="w-full resize-none text-sm text-[#1A1A1A] placeholder-[#AAAAAA] focus:outline-none bg-transparent leading-relaxed"
          />
          <div className="flex items-center justify-between mt-1">
            <div className="flex gap-2">
              <button
                onClick={() => { setShowUpload(!showUpload); setShowMood(false) }}
                title="Add document"
                className={`text-lg hover:scale-110 transition-transform ${showUpload ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
              >
                📎
              </button>
              <button
                onClick={() => { setShowMood(!showMood); setShowUpload(false) }}
                title="Set mood"
                className={`text-lg hover:scale-110 transition-transform ${showMood ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
              >
                😊
              </button>
              <button
                onClick={() => onSend("What's on the menu?")}
                title="See menu"
                className="text-lg opacity-50 hover:opacity-100 hover:scale-110 transition-transform"
              >
                ☕
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-3 py-1.5 bg-[#FF5C00] text-white text-xs font-pixel rounded hover:bg-[#CC4A00] disabled:opacity-40 transition-colors pixel-border-sm"
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
