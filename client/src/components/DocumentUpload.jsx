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
        <div className="text-xs font-pixel text-[#4A3228]">ADD CONTEXT</div>
        <button onClick={onClose} className="text-[#C8A882] hover:text-[#4A3228] text-lg leading-none">×</button>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setTab('paste')}
          className={`text-xs px-2 py-1 rounded ${tab === 'paste' ? 'bg-[#4A3228] text-white' : 'bg-amber-50 text-[#4A3228]'}`}
        >
          Paste Text
        </button>
        <button
          onClick={() => setTab('file')}
          className={`text-xs px-2 py-1 rounded ${tab === 'file' ? 'bg-[#4A3228] text-white' : 'bg-amber-50 text-[#4A3228]'}`}
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
            className="w-full h-28 text-sm p-2 border-2 border-[#D4C4B0] rounded resize-none focus:outline-none focus:border-[#4A3228] text-[#4A3228]"
          />
          <button
            onClick={handlePaste}
            disabled={!pasteText.trim()}
            className="mt-2 w-full py-2 bg-[#4A3228] text-white text-xs font-pixel rounded hover:bg-[#6B3A2A] disabled:opacity-40 transition-colors"
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
            isDragging ? 'border-[#4A3228] bg-amber-50' : 'border-[#D4C4B0] hover:border-[#4A3228]'
          }`}
        >
          <div className="text-2xl mb-2">📎</div>
          <div className="text-xs text-[#7A5A4A]">Drop a file or click to browse</div>
          <div className="text-xs text-[#C8A882] mt-1">.txt, .md, .py, .js, .pdf</div>
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
