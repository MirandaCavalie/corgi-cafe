import PixelDrink from './PixelDrink'

const DRINK_TYPES = {
  'Classic Drip Coffee': 'coffee',
  'Iced Americano': 'coffee',
  'Oat Milk Latte': 'coffee',
  'Iced Oat Milk Latte': 'coffee',
  'Iced Matcha Latte': 'matcha',
  'Hot Matcha': 'matcha',
  'Berry Smoothie': 'smoothie',
  'Mango Smoothie': 'smoothie',
  'Protein Smoothie': 'smoothie',
}

const DRINK_BORDERS = {
  coffee:   'border-[#FF5C00]',
  matcha:   'border-[#7DB87D]',
  smoothie: 'border-[#D4748A]',
}

export default function DrinkCard({ recommendation }) {
  if (!recommendation) {
    return (
      <div className="context-card pixel-border-sm bg-white border-[#E8E8E8] rounded p-3 flex flex-col overflow-hidden">
        <div className="text-xs font-pixel text-[#FF5C00] mb-2">☕ DRINK</div>
        <div className="flex-1 flex items-center justify-center text-xs text-[#AAAAAA] text-center">
          Chat to get your perfect drink!
        </div>
      </div>
    )
  }

  const type = DRINK_TYPES[recommendation.name] || 'coffee'
  const borderClass = DRINK_BORDERS[type]

  return (
    <div
      className={`context-card pixel-border-sm bg-white ${borderClass} rounded p-3 flex flex-col overflow-hidden`}
      aria-label={`drink recommendation: ${recommendation.name}`}
    >
      <div className="text-xs font-pixel text-[#FF5C00] mb-2">☕ DRINK</div>

      <div className="flex justify-center mb-1">
        <PixelDrink name={recommendation.name} size={6} />
      </div>

      <div className="text-center flex-1 overflow-hidden">
        <div className="font-bold text-[#1A1A1A] text-xs leading-tight mb-1">
          {recommendation.name}
        </div>
        {recommendation.reason && (
          <div className="text-xs text-[#666666] leading-relaxed line-clamp-2">
            {recommendation.reason}
          </div>
        )}
      </div>
    </div>
  )
}
