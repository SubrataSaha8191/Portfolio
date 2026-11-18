// Graffiti taxi. TaxiTop is the scroll thumb (seen from above, nose pointing down the page).
// TaxiSide is the one that drives the road in the "Chapters so far" scene. Thick ink outlines, hard shadows,
// a checker stripe and a red "SS" tag on the door.
const INK = '#0d0c0b';

export function TaxiTop({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 44 84" aria-hidden="true" focusable="false">
      <rect x="11" y="9" width="28" height="68" rx="10" fill={INK} opacity=".45" />
      {[[0, 14], [0, 52], [34, 14], [34, 52]].map(([x, y]) => <rect key={`${x}${y}`} x={x + 1} y={y} width="8" height="16" rx="3" fill={INK} />)}
      <rect x="5" y="4" width="32" height="70" rx="11" fill="#ffd60a" stroke={INK} strokeWidth="3.2" />
      <path d="M9 50 H33 L31 62 H11 Z" fill="#11b5e4" stroke={INK} strokeWidth="2.4" />
      <path d="M10 16 H32 L31 25 H11 Z" fill="#11b5e4" stroke={INK} strokeWidth="2.4" />
      <rect x="10" y="28" width="22" height="19" rx="3" fill="#ffd60a" stroke={INK} strokeWidth="2.4" />
      <rect x="13" y="32" width="16" height="9" rx="1.5" fill="#efe8d6" stroke={INK} strokeWidth="1.6" />
      <text x="21" y="39.2" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="7" fill={INK}>TAXI</text>
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={i % 2 ? 5 : 8} y={64 + (i * 1.6)} width="3" height="1.6" fill={INK} display="none" />)}
      {[0, 1, 2, 3, 4].map((i) => (<g key={i}><rect x="5" y={30 + i * 6} width="3" height="3" fill={INK} /><rect x="34" y={33 + i * 6} width="3" height="3" fill={INK} /></g>))}
      <circle cx="12" cy="70" r="2.6" fill="#fff6c8" stroke={INK} strokeWidth="1.2" />
      <circle cx="30" cy="70" r="2.6" fill="#fff6c8" stroke={INK} strokeWidth="1.2" />
      <path d="M14 8 V2 M30 8 V1" stroke="#ff3b1d" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function TaxiSide({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 250 120" aria-hidden="true" focusable="false">
      <ellipse cx="125" cy="108" rx="108" ry="7" fill={INK} opacity=".45" />
      <path d="M12 78 Q12 62 30 58 L60 55 L80 30 Q85 25 94 25 H154 Q164 25 170 31 L190 55 L222 59 Q240 62 240 78 V88 H12Z" fill="#ffd60a" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M90 31 H122 V55 H70 Z" fill="#11b5e4" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M130 31 H156 L176 55 H130 Z" fill="#11b5e4" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <rect x="102" y="8" width="48" height="17" rx="3" fill="#efe8d6" stroke={INK} strokeWidth="3.5" />
      <text x="126" y="21.5" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="14" letterSpacing="1.5" fill={INK}>TAXI</text>
      {Array.from({ length: 17 }, (_, i) => <rect key={i} x={20 + i * 12.5} y={i % 2 ? 66 : 72} width="12.5" height="6" fill={INK} />)}
      <text x="62" y="86" fontFamily="Anton, Impact, sans-serif" fontSize="22" fill="#ff3b1d" stroke={INK} strokeWidth="1.6" paintOrder="stroke" transform="rotate(-6 62 86)">SS</text>
      <path d="M128 56 V86" stroke={INK} strokeWidth="3" />
      <rect x="112" y="64" width="12" height="4" rx="2" fill={INK} />
      <circle cx="238" cy="70" r="6" fill="#fff6c8" stroke={INK} strokeWidth="3" />
      <rect x="8" y="66" width="8" height="10" rx="2" fill="#ff3b1d" stroke={INK} strokeWidth="2.5" />
      {[[56, 0], [190, 0]].map(([x]) => (
        <g key={x} className="rt__wheel" data-cx={x}>
          <circle cx={x} cy="90" r="19" fill={INK} />
          <circle cx={x} cy="90" r="9" fill="#efe8d6" stroke={INK} strokeWidth="3" />
          <path d={`M${x} 71 V109 M${x - 19} 90 H${x + 19}`} stroke="#efe8d6" strokeWidth="3" />
        </g>
      ))}
      <path d="M40 100 V112 M96 98 V110 M170 100 V113" stroke="#ff3b1d" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
