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

const DRINK_CLASSES = {
  coffee: 'drink-card--coffee',
  matcha: 'drink-card--matcha',
  smoothie: 'drink-card--smoothie',
}

export default function DrinkCard({ recommendation }) {
  if (!recommendation) {
    return (
      <div className="context-card drink-card pixel-panel pixel-panel--small">
        <div className="panel-title">DRINK</div>
        <div className="empty-copy centered">
          Ask for a pairing.
        </div>
      </div>
    )
  }

  const type = DRINK_TYPES[recommendation.name] || 'coffee'

  return (
    <div
      className={`context-card drink-card ${DRINK_CLASSES[type]} pixel-panel pixel-panel--small`}
      aria-label={`drink recommendation: ${recommendation.name}`}
    >
      <div className="panel-title">DRINK</div>

      <div className="drink-card__sprite">
        <PixelDrink name={recommendation.name} size={6} />
      </div>

      <div className="drink-card__copy">
        <strong>{recommendation.name}</strong>
        {recommendation.reason && (
          <span>{recommendation.reason}</span>
        )}
      </div>
    </div>
  )
}
