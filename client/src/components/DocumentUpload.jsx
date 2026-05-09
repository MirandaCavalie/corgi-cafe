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
    <div className="popover-panel upload-popover pixel-panel animate-slide-up">
      <div className="popover-header">
        <div className="panel-title">ADD CONTEXT</div>
        <button onClick={onClose} className="close-button">X</button>
      </div>

      <div className="tab-row">
        <button
          onClick={() => setTab('paste')}
          className={tab === 'paste' ? 'active' : ''}
        >
          PASTE
        </button>
        <button
          onClick={() => setTab('file')}
          className={tab === 'file' ? 'active' : ''}
        >
          FILE
        </button>
      </div>

      {tab === 'paste' ? (
        <div>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder="Paste docs, code, notes, or context..."
            className="upload-textarea"
          />
          <button
            onClick={handlePaste}
            disabled={!pasteText.trim()}
            className="send-button send-button--wide"
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
          className={`drop-zone ${isDragging ? 'drop-zone--active' : ''}`}
        >
          <div className="drop-zone__icon">TXT</div>
          <div>Drop a file or click to browse</div>
          <small>.txt, .md, .py, .js, .pdf</small>
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
