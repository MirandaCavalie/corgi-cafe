import { useState, useRef } from 'react'

export default function DocumentUpload({ onUpload, onClose }) {
  const [isDragging, setIsDragging] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [tab, setTab] = useState('paste')
  const fileRef = useRef()

  const handleFile = async (file) => {
    const text = await file.text()
    onUpload({ type: 'file', name: file.name, content: text })
    onClose()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handlePaste = () => {
    if (!pasteText.trim()) return
    onUpload({ type: 'paste', name: 'Pasted Content', content: pasteText })
    setPasteText('')
    onClose()
  }

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white pixel-border rounded p-4 w-72 z-20 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-pixel text-[#FF5C00]">ADD CONTEXT</div>
        <button onClick={onClose} className="text-[#AAAAAA] hover:text-[#FF5C00] text-lg leading-none transition-colors">×</button>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setTab('paste')}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            tab === 'paste'
              ? 'bg-[#FF5C00] text-white'
              : 'bg-[#F5F5F5] text-[#666666] hover:text-[#1A1A1A]'
          }`}
        >
          Paste Text
        </button>
        <button
          onClick={() => setTab('file')}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            tab === 'file'
              ? 'bg-[#FF5C00] text-white'
              : 'bg-[#F5F5F5] text-[#666666] hover:text-[#1A1A1A]'
          }`}
        >
          Upload File
        </button>
      </div>

      {tab === 'paste' ? (
        <div>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder="Paste your doc, code, notes, or anything..."
            className="w-full h-28 text-sm p-2 border-2 border-[#E8E8E8] rounded resize-none focus:outline-none focus:border-[#FF5C00] bg-white text-[#1A1A1A] placeholder-[#AAAAAA] transition-colors"
          />
          <button
            onClick={handlePaste}
            disabled={!pasteText.trim()}
            className="mt-2 w-full py-2 bg-[#FF5C00] text-white text-xs font-pixel rounded hover:bg-[#CC4A00] disabled:opacity-40 transition-colors pixel-border-sm"
          >
            ANALYZE
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#FF5C00] bg-[#FFF5F0]'
              : 'border-[#E8E8E8] hover:border-[#FF5C00]'
          }`}
        >
          <div className="text-2xl mb-2">📎</div>
          <div className="text-xs text-[#666666]">Drop a file or click to browse</div>
          <div className="text-xs text-[#AAAAAA] mt-1">.txt, .md, .py, .js, .pdf</div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".txt,.md,.py,.js,.ts,.jsx,.tsx,.json,.pdf,.csv"
            onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}
    </div>
  )
}
