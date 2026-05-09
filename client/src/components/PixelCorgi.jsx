import corgiMascot from '../assets/corgi-mascot.png'

const VALID_STATES = new Set([
  'idle',
  'listening',
  'thinking',
  'excited',
  'serving',
  'sleepy',
  'reading',
])

export default function PixelCorgi({ state = 'idle', size = 256 }) {
  const corgiState = VALID_STATES.has(state) ? state : 'idle'

  return (
    <div
      className={`corgi-mascot corgi-mascot--${corgiState}`}
      style={{ '--corgi-size': `${size}px` }}
      aria-label={`Corgi mascot is ${corgiState}`}
      role="img"
    >
      <div className="corgi-mascot__figure">
        <img
          className="corgi-mascot__image"
          src={corgiMascot}
          alt=""
          draggable="false"
        />

        {corgiState === 'reading' && (
          <div className="corgi-mascot__glasses" aria-hidden="true" />
        )}
      </div>

      {corgiState === 'thinking' && (
        <div className="corgi-mascot__thought" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}

      {corgiState === 'excited' && (
        <div className="corgi-mascot__sparkles" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      )}

      {corgiState === 'sleepy' && (
        <div className="corgi-mascot__zzz" aria-hidden="true">
          <span>z</span>
          <span>z</span>
          <span>zz</span>
        </div>
      )}
    </div>
  )
}
