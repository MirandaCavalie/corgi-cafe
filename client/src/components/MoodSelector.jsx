import { useState } from 'react'

const MOODS = [
  { icon: 'FOC', label: 'Focused', value: 'focused' },
  { icon: 'OK', label: 'Good', value: 'good' },
  { icon: 'LOW', label: 'Tired', value: 'tired' },
  { icon: '!!!', label: 'Stressed', value: 'stressed' },
  { icon: 'UP', label: 'Excited', value: 'excited' },
  { icon: 'ZZZ', label: 'Sleepy', value: 'sleepy' },
]

export default function MoodSelector({ onSelect, onClose }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (mood) => {
    setSelected(mood.value)
    onSelect(mood)
    setTimeout(onClose, 200)
  }

  return (
    <div className="popover-panel mood-popover pixel-panel animate-slide-up">
      <div className="panel-title">MOOD SELECT</div>
      <div className="mood-grid">
        {MOODS.map(mood => (
          <button
            key={mood.value}
            onClick={() => handleSelect(mood)}
            className={`mood-tile ${selected === mood.value ? 'mood-tile--active' : ''}`}
          >
            <span>{mood.icon}</span>
            <strong>{mood.label}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}
