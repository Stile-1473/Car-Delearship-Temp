/** Paint, wheel, and interior options for the 3D configurator (prices in USD). */

export const PAINTS = [
  { name: 'Glacier White', hex: '#f2f3f5' },
  { name: 'Lunar Silver', hex: '#b9bec6' },
  { name: 'Graphite Grey', hex: '#4a4f57' },
  { name: 'Midnight Black', hex: '#0d0e10' },
  { name: 'Racing Red', hex: '#b3141b' },
  { name: 'Ocean Blue', hex: '#1d4fa3' },
  { name: 'Savanna Orange', hex: '#d9631e' },
  { name: 'Forest Green', hex: '#24493a' },
  { name: 'Sunset Gold', hex: '#b88a3b' },
];

export const FINISHES = [
  { id: 'gloss', name: 'Gloss', price: 0 },
  { id: 'metallic', name: 'Metallic', price: 650 },
  { id: 'matte', name: 'Satin Matte', price: 1400 },
];

export const RIMS = [
  { id: 'alloy', name: 'Silver Alloy', price: 0, color: '#c8ccd2', metalness: 0.9, roughness: 0.3 },
  { id: 'black', name: 'Gloss Black', price: 450, color: '#16171a', metalness: 0.6, roughness: 0.25 },
  { id: 'chrome', name: 'Chrome', price: 900, color: '#f4f6f8', metalness: 1, roughness: 0.05 },
  { id: 'bronze', name: 'Bronze', price: 600, color: '#8a6a3c', metalness: 0.85, roughness: 0.3 },
];

export const INTERIORS = [
  { id: 'onyx', name: 'Onyx Black', price: 0, seat: '#1c1c1f', trim: '#2a2b2f' },
  { id: 'tan', name: 'Saddle Tan', price: 750, seat: '#8b5a2b', trim: '#2a2421' },
  { id: 'ivory', name: 'Ivory', price: 750, seat: '#d9cfbd', trim: '#3a3733' },
  { id: 'red', name: 'Sport Red', price: 950, seat: '#7a1518', trim: '#1e1e21' },
];

// Map the plain colour names in the inventory to a starting paint.
const COLOR_MAP = {
  white: '#f2f3f5',
  silver: '#b9bec6',
  grey: '#5b6069',
  gray: '#5b6069',
  'metallic grey': '#5b6069',
  black: '#0d0e10',
  red: '#b3141b',
  blue: '#1d4fa3',
  orange: '#d9631e',
  green: '#24493a',
  gold: '#b88a3b',
};

export function paintForColor(colorName = '') {
  return COLOR_MAP[colorName.toLowerCase()] || '#b9bec6';
}

export function finishForColor(colorName = '') {
  const c = colorName.toLowerCase();
  return c.includes('metallic') || c === 'silver' ? 'metallic' : 'gloss';
}
