import CONFIG from './config.js';

export function getPizzaSVG(size = 140) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="16" fill="#faf7f3" rx="1"/>
    <rect x="3" y="2" width="10" height="1" fill="#d4903c"/>
    <rect x="3" y="3" width="10" height="1" fill="#c47a2a"/>
    <rect x="4" y="4" width="8" height="1" fill="#f5d04e"/>
    <rect x="4" y="5" width="8" height="1" fill="#f7dc6f"/>
    <rect x="5" y="6" width="7" height="1" fill="#f5d04e"/>
    <rect x="5" y="7" width="6" height="1" fill="#f7dc6f"/>
    <rect x="6" y="8" width="5" height="1" fill="#f5d04e"/>
    <rect x="6" y="9" width="4" height="1" fill="#f7dc6f"/>
    <rect x="7" y="10" width="3" height="1" fill="#f5d04e"/>
    <rect x="7" y="11" width="2" height="1" fill="#f7dc6f"/>
    <rect x="8" y="12" width="1" height="1" fill="#f5d04e"/>
    <rect x="5" y="5" width="2" height="2" fill="#c0392b"/>
    <rect x="9" y="4" width="2" height="2" fill="#c0392b"/>
    <rect x="7" y="7" width="2" height="2" fill="#c0392b"/>
    <rect x="5" y="5" width="1" height="1" fill="#e74c3c"/>
    <rect x="9" y="4" width="1" height="1" fill="#e74c3c"/>
    <rect x="7" y="7" width="1" height="1" fill="#e74c3c"/>
    <rect x="10" y="7" width="1" height="1" fill="#2c3e50"/>
    <rect x="6" y="10" width="1" height="1" fill="#27ae60"/>
    <rect x="4" y="6" width="1" height="1" fill="#f9e67a"/>
    <rect x="11" y="5" width="1" height="1" fill="#f9e67a"/>
    <rect x="5" y="1" width="1" height="1" fill="#d4c5b0" opacity="0.3"/>
    <rect x="8" y="0" width="1" height="1" fill="#d4c5b0" opacity="0.25"/>
    <rect x="11" y="1" width="1" height="1" fill="#d4c5b0" opacity="0.3"/>
  </svg>`;
}

export function getPizzaVariant(index, size = 100) {
  const toppings = [
    { pepperoni: '#c0392b', olive: '#2c3e50', basil: '#27ae60' },
    { pepperoni: '#8e44ad', olive: '#2c3e50', basil: '#27ae60' },
    { pepperoni: '#e67e22', olive: '#1abc9c', basil: '#27ae60' },
    { pepperoni: '#3498db', olive: '#e74c3c', basil: '#2ecc71' },
    { pepperoni: '#e84393', olive: '#636e72', basil: '#00b894' },
    { pepperoni: '#fdcb6e', olive: '#6c5ce7', basil: '#00cec9' },
  ];
  const t = toppings[index % toppings.length];
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="16" fill="#faf7f3" rx="1"/>
    <rect x="3" y="2" width="10" height="1" fill="#d4903c"/>
    <rect x="3" y="3" width="10" height="1" fill="#c47a2a"/>
    <rect x="4" y="4" width="8" height="1" fill="#f5d04e"/>
    <rect x="4" y="5" width="8" height="1" fill="#f7dc6f"/>
    <rect x="5" y="6" width="7" height="1" fill="#f5d04e"/>
    <rect x="5" y="7" width="6" height="1" fill="#f7dc6f"/>
    <rect x="6" y="8" width="5" height="1" fill="#f5d04e"/>
    <rect x="6" y="9" width="4" height="1" fill="#f7dc6f"/>
    <rect x="7" y="10" width="3" height="1" fill="#f5d04e"/>
    <rect x="7" y="11" width="2" height="1" fill="#f7dc6f"/>
    <rect x="8" y="12" width="1" height="1" fill="#f5d04e"/>
    <rect x="5" y="5" width="2" height="2" fill="${t.pepperoni}"/>
    <rect x="9" y="4" width="2" height="2" fill="${t.pepperoni}"/>
    <rect x="7" y="7" width="2" height="2" fill="${t.pepperoni}"/>
    <rect x="10" y="7" width="1" height="1" fill="${t.olive}"/>
    <rect x="6" y="10" width="1" height="1" fill="${t.basil}"/>
  </svg>`;
}

// Pick a rarity tier deterministically from a hex hash (e.g. tx hash).
export function rarityFromHash(hexHash) {
  if (!hexHash || typeof hexHash !== 'string') {
    return CONFIG.rarities[0];
  }
  const clean = hexHash.startsWith('0x') ? hexHash.slice(2) : hexHash;
  const slice = clean.slice(0, 8) || '0';
  const n = parseInt(slice, 16) % 10000;
  let acc = 0;
  for (const r of CONFIG.rarities) {
    acc += r.weight;
    if (n < acc) return r;
  }
  return CONFIG.rarities[CONFIG.rarities.length - 1];
}

// Render a pizza tinted by rarity palette + variant seeded from hash.
export function getPizzaForReveal(hexHash, size = 220) {
  const rarity = rarityFromHash(hexHash);
  const p = rarity.palette;
  const clean = (hexHash || '').replace(/^0x/, '').padEnd(8, '0');
  const seed = parseInt(clean.slice(8, 16) || '0', 16) || 0;
  // Use seed to nudge sprinkle positions (deterministic per tx).
  const sx1 = 4 + (seed % 5);
  const sx2 = 8 + ((seed >> 4) % 5);
  const sx3 = 5 + ((seed >> 8) % 5);
  const glow = rarity.tier >= 4
    ? `<defs><filter id="g${seed}"><feGaussianBlur stdDeviation="0.3"/></filter></defs>`
    : '';
  const halo = rarity.tier === 5
    ? `<rect x="0" y="0" width="16" height="16" fill="none" stroke="${p.accent}" stroke-width="0.4" opacity="0.6"/>`
    : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    ${glow}
    <rect width="16" height="16" fill="#faf7f3" rx="1"/>
    ${halo}
    <rect x="3" y="2" width="10" height="1" fill="${p.crust}"/>
    <rect x="3" y="3" width="10" height="1" fill="${p.crust}" opacity="0.85"/>
    <rect x="4" y="4" width="8" height="1" fill="${p.cheese}"/>
    <rect x="4" y="5" width="8" height="1" fill="${p.cheese}" opacity="0.9"/>
    <rect x="5" y="6" width="7" height="1" fill="${p.cheese}"/>
    <rect x="5" y="7" width="6" height="1" fill="${p.cheese}" opacity="0.9"/>
    <rect x="6" y="8" width="5" height="1" fill="${p.cheese}"/>
    <rect x="6" y="9" width="4" height="1" fill="${p.cheese}" opacity="0.9"/>
    <rect x="7" y="10" width="3" height="1" fill="${p.cheese}"/>
    <rect x="7" y="11" width="2" height="1" fill="${p.cheese}" opacity="0.9"/>
    <rect x="8" y="12" width="1" height="1" fill="${p.cheese}"/>
    <rect x="${sx1}" y="5" width="2" height="2" fill="${p.accent}"/>
    <rect x="${sx2}" y="4" width="2" height="2" fill="${p.accent}"/>
    <rect x="${sx3}" y="7" width="2" height="2" fill="${p.accent}"/>
    <rect x="10" y="7" width="1" height="1" fill="${p.extra}"/>
    <rect x="6" y="10" width="1" height="1" fill="${p.extra}"/>
  </svg>`;
}
