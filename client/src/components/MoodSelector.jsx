import { useState } from 'react'

const MOODS = [
  { emoji: '😤', label: 'Focused', value: 'focused' },
  { emoji: '😊', label: 'Good', value: 'good' },
  { emoji: '😩', label: 'Tired', value: 'tired' },
  { emoji: '😰', label: 'Stressed', value: 'stressed' },
  { emoji: '🎉', label: 'Excited', value: 'excited' },
  { emoji: '😴', label: 'Sleepy', value: 'sleepy' },
]

export default function MoodSelector({ onSelect, onClose }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (mood) => {
    setSelected(mood.value)
    onSelect(mood)
    setTimeout(onClose, 200)
  }

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white pixel-border rounded p-3 z-20 animate-slide-up">
      <div className="text-xs font-pixel text-[#4A3228] mb-2">HOW ARE YOU?</div>
      <div className="grid grid-cols-3 gap-2">
        {MOODS.map(mood => (
          <button
            key={mood.value}
            onClick={() => handleSelect(mood)}
            className={`flex flex-col items-center gap-1 p-2 rounded hover:bg-amber-50 transition-colors ${
              selected === mood.value ? 'bg-amber-100' : ''
            }`}
          >
            <span className="text-xl">{mood.emoji}</span>
            <span className="text-xs text-[#4A3228]">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
