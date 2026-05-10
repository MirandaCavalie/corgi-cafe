import PixelDrink from './PixelDrink'

// Maps each menu drink to a visual category for the card's color theme.
const DRINK_TYPES = {
  // Coffees
  'Mocha':         'coffee',
  'Americano':     'coffee',
  'Latte':         'coffee',
  'Cappuccino':    'coffee',
  'Drip Coffee':   'coffee',
  'Cafe au Lait':  'coffee',
  'Espresso':      'coffee',
  'Cold Brew':     'coffee',
  // Drinks
  'Tea':           'matcha',
  'Hot Chocolate': 'coffee',
  'Chai Latte':    'matcha',
  'Milk':          'smoothie',
  // Exclusive drinks
  'Brexspresso':    'coffee',
  'Qodo Code Brew': 'coffee',
  'Brew Daytona':   'coffee',
  'Hello World':    'smoothie',
  'Deel Speed':     'matcha',
  // Signature smoothies
  'The FiDi — Chocolate Peanut Butter': 'smoothie',
  'The Ocean Beach — Blue Power Blend': 'smoothie',
  'The Sunset — Berry Glow':            'smoothie',
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
