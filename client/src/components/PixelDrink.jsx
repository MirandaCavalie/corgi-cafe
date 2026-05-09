// Pixel art drink illustrations
const DRINKS = {
  'Classic Drip Coffee': {
    rows: [
      '..BBBB..',
      '.BWWWWB.',
      '.BDDWWB.',
      '.BDDWWB.',
      '.BBBBBB.',
      '..BBBB..',
      '...BB...',
      '..BBBB..',
    ],
    color: '#4A3228',
  },
  'Iced Americano': {
    rows: [
      '..BBBB..',
      '.BWWWWB.',
      '.BIWIWB.',
      '.BWIWWB.',
      '.BBBBB..',
      '...BBB..',
      '..BBBBB.',
    ],
    color: '#2A1A10',
  },
  'Oat Milk Latte': {
    rows: [
      '..BBBB..',
      '.BCCCCB.',
      '.BDDCCB.',
      '.BDDCCB.',
      '.BBBBBB.',
      '..BBBB..',
      '...BB...',
    ],
    color: '#C8A882',
  },
  'Iced Matcha Latte': {
    rows: [
      '..BBBB..',
      '.BGWGWB.',
      '.BGWGWB.',
      '.BWGWGB.',
      '.BBBBB..',
      '...BBB..',
      '..BBBBB.',
    ],
    color: '#7DB87D',
  },
  'Hot Matcha': {
    rows: [
      '..BBBB..',
      '.BGGGGB.',
      '.BGWWGB.',
      '.BGGWGB.',
      '.BBBBBB.',
      '..BBBB..',
      '...BB...',
    ],
    color: '#5A9A5A',
  },
  'Berry Smoothie': {
    rows: [
      '..BBBB..',
      '.BPPPPB.',
      '.BPWWPB.',
      '.BPPWPB.',
      '.BBBBB..',
      '...BBB..',
      '...BB...',
    ],
    color: '#D4748A',
  },
  'Mango Smoothie': {
    rows: [
      '..BBBB..',
      '.BYYYYYB.',
      '.BYWWYB.',
      '.BYYWWB.',
      '.BBBBB..',
      '...BBB..',
      '...BB...',
    ],
    color: '#F5A623',
  },
  'Protein Smoothie': {
    rows: [
      '..BBBB..',
      '.BWWWWB.',
      '.BWCWWB.',
      '.BWWWWB.',
      '.BBBBB..',
      '...BBB..',
      '...BB...',
    ],
    color: '#B8D4E8',
  },
}

const PALETTE = {
  B: '#3D2B1F',
  W: '#FFFFFF',
  D: '#6B3A2A',
  C: '#E8D5B8',
  G: '#7DB87D',
  P: '#D4748A',
  I: '#B8E4FF',
  Y: '#F5C842',
  '.': null,
}

function PixelDrinkBlock({ color, size = 6 }) {
  const bg = PALETTE[color]
  if (!bg) return <div style={{ width: size, height: size }} />
  return <div style={{ width: size, height: size, backgroundColor: bg, display: 'inline-block' }} />
}

function PixelDrinkRow({ row, size }) {
  return (
    <div style={{ display: 'flex', lineHeight: 0 }}>
      {row.split('').map((c, i) => (
        <PixelDrinkBlock key={i} color={c} size={size} />
      ))}
    </div>
  )
}

export default function PixelDrink({ name, size = 8 }) {
  const drink = DRINKS[name]
  if (!drink) {
    // Generic cup fallback
    return (
      <div className="text-3xl">☕</div>
    )
  }

  return (
    <div style={{ display: 'inline-block', lineHeight: 0 }}>
      {drink.rows.map((row, i) => (
        <PixelDrinkRow key={i} row={row} size={size} />
      ))}
    </div>
  )
}
