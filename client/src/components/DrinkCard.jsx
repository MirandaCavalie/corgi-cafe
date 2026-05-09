import PixelDrink from './PixelDrink'

const DRINK_EMOJIS = {
  coffee: '☕',
  matcha: '🍵',
  smoothie: '🥤',
}

const DRINK_TYPES = {
  'Classic Drip Coffee': 'coffee',
  'Iced Americano': 'coffee',
  'Oat Milk Latte': 'coffee',
  'Iced Matcha Latte': 'matcha',
  'Hot Matcha': 'matcha',
  'Berry Smoothie': 'smoothie',
  'Mango Smoothie': 'smoothie',
  'Protein Smoothie': 'smoothie',
}

const DRINK_COLORS = {
  coffee: 'from-amber-50 to-orange-50 border-amber-200',
  matcha: 'from-green-50 to-emerald-50 border-green-200',
  smoothie: 'from-pink-50 to-rose-50 border-pink-200',
}

export default function DrinkCard({ recommendation }) {
  if (!recommendation) {
    return (
      <div className="context-card pixel-border-sm bg-gradient-to-br from-amber-50 to-orange-50 rounded p-4 min-w-[160px]">
        <div className="text-xs font-pixel text-[#4A3228] mb-2">☕ DRINK</div>
        <div className="text-center py-4 text-[#C8A882] text-sm">
          Chat to get your perfect drink pairing!
        </div>
      </div>
    )
  }

  const type = DRINK_TYPES[recommendation.name] || 'coffee'
  const colorClass = DRINK_COLORS[type]
  const emoji = DRINK_EMOJIS[type]

  return (
    <div
      className={`context-card pixel-border-sm bg-gradient-to-br ${colorClass} rounded p-4 min-w-[160px]`}
      aria-label={`${emoji} drink recommendation`}
    >
      <div className="text-xs font-pixel text-[#4A3228] mb-3">☕ DRINK</div>

      <div className="flex justify-center mb-3">
        <PixelDrink name={recommendation.name} size={8} />
      </div>

      <div className="text-center">
        <div className="font-bold text-[#4A3228] text-sm leading-tight mb-1">
          {recommendation.name}
        </div>
        {recommendation.reason && (
          <div className="text-xs text-[#7A5A4A] leading-relaxed">
            {recommendation.reason}
          </div>
        )}
      </div>
    </div>
  )
}
