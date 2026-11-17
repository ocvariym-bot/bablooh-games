/** Pure SVG markups (transparent bg) for canvas sprites. */

const S = 200

export const ninjaGuySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <defs>
    <radialGradient id="gSkin" cx="38%" cy="32%" r="62%">
      <stop offset="0%" stop-color="#f6d0b6"/><stop offset="100%" stop-color="#d49a78"/>
    </radialGradient>
    <linearGradient id="gShirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7a7e86"/><stop offset="100%" stop-color="#3a3e46"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="178" rx="70" ry="22" fill="#000" opacity=".18"/>
  <path d="M42 158 C48 128 68 118 100 118 C132 118 152 128 158 158 L150 190 L50 190 Z" fill="url(#gShirt)"/>
  <path d="M78 128 L100 188 L122 128" fill="none" stroke="#2c3038" stroke-width="10" stroke-linejoin="round"/>
  <path d="M78 128 L100 188 L122 128" fill="none" stroke="#5c6068" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="100" cy="92" rx="54" ry="60" fill="url(#gSkin)"/>
  <path d="M48 78 C52 36 78 28 100 28 C122 28 148 36 152 78 C146 52 128 44 100 44 C72 44 54 52 48 78 Z" fill="#1c1410"/>
  <path d="M55 70 C68 88 78 72 84 68 C92 86 100 64 108 68 C116 86 124 68 132 70 C140 86 148 70 145 68" fill="#1c1410"/>
  <path d="M66 84 Q80 76 94 84" stroke="#241810" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M106 84 Q120 76 134 84" stroke="#241810" stroke-width="5" fill="none" stroke-linecap="round"/>
  <ellipse cx="80" cy="100" rx="9" ry="10" fill="#fff"/>
  <ellipse cx="120" cy="100" rx="9" ry="10" fill="#fff"/>
  <ellipse cx="81" cy="101" rx="4.8" ry="5.4" fill="#3b2416"/>
  <ellipse cx="121" cy="101" rx="4.8" ry="5.4" fill="#3b2416"/>
  <circle cx="83" cy="99" r="1.8" fill="#fff"/>
  <circle cx="123" cy="99" r="1.8" fill="#fff"/>
  <path d="M96 110 Q100 116 104 110" stroke="#c48a6a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M78 124 Q88 128 94 124" stroke="#6a4a38" stroke-width="1.4" opacity=".45" fill="none"/>
  <path d="M106 124 Q112 128 122 124" stroke="#6a4a38" stroke-width="1.4" opacity=".45" fill="none"/>
  <ellipse cx="100" cy="130" rx="15" ry="7.5" fill="#d07a74"/>
  <path d="M88 129 Q100 136 112 129" stroke="#b05a56" stroke-width="1.6" fill="none"/>
  <ellipse cx="46" cy="108" rx="7" ry="11" fill="#d49a78"/>
  <ellipse cx="154" cy="108" rx="7" ry="11" fill="#d49a78"/>
</svg>`

export const ninjaGirlSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <defs>
    <radialGradient id="glSkin" cx="42%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#fbe0d0"/><stop offset="100%" stop-color="#e2ae94"/>
    </radialGradient>
    <linearGradient id="glHood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3f3f48"/><stop offset="100%" stop-color="#18181e"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="178" rx="72" ry="20" fill="#000" opacity=".18"/>
  <path d="M40 152 C48 124 70 116 100 116 C130 116 152 124 160 152 L154 192 L46 192 Z" fill="url(#glHood)"/>
  <path d="M92 126 L100 184 L108 126" stroke="#8a8a94" stroke-width="2.5" fill="none"/>
  <path d="M70 120 Q100 108 130 120" stroke="#c8c8d0" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="100" cy="90" rx="48" ry="54" fill="url(#glSkin)"/>
  <path d="M52 88 C48 40 74 26 100 26 C126 26 152 40 148 88 C144 56 126 44 100 44 C74 44 56 56 52 88 Z" fill="#4e3224"/>
  <path d="M48 92 C38 112 42 150 54 168" stroke="#4e3224" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M152 92 C162 112 158 150 146 168" stroke="#4e3224" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M62 70 C72 96 68 118 64 130" stroke="#3a2418" stroke-width="7" fill="none" stroke-linecap="round" opacity=".75"/>
  <path d="M138 70 C128 96 132 118 136 130" stroke="#3a2418" stroke-width="7" fill="none" stroke-linecap="round" opacity=".75"/>
  <path d="M78 58 C90 78 96 70 102 58 C108 70 114 78 126 58" fill="#3a2418"/>
  <path d="M70 84 Q82 76 94 84" stroke="#2a1a12" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <path d="M106 84 Q118 76 130 84" stroke="#2a1a12" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="82" cy="98" rx="10" ry="11" fill="#fff"/>
  <ellipse cx="118" cy="98" rx="10" ry="11" fill="#fff"/>
  <ellipse cx="83" cy="99" rx="5.2" ry="5.8" fill="#3a2218"/>
  <ellipse cx="119" cy="99" rx="5.2" ry="5.8" fill="#3a2218"/>
  <circle cx="85" cy="97" r="2" fill="#fff"/>
  <circle cx="121" cy="97" r="2" fill="#fff"/>
  <path d="M74 112 Q82 118 90 112" stroke="#9a6a5a" stroke-width="2" fill="none" opacity=".4"/>
  <path d="M110 112 Q118 118 126 112" stroke="#9a6a5a" stroke-width="2" fill="none" opacity=".4"/>
  <circle cx="88" cy="112" r="1.5" fill="#c47a5a"/><circle cx="96" cy="116" r="1.3" fill="#c47a5a"/>
  <circle cx="104" cy="114" r="1.4" fill="#c47a5a"/><circle cx="112" cy="112" r="1.3" fill="#c47a5a"/>
  <circle cx="80" cy="118" r="1.1" fill="#c47a5a" opacity=".7"/><circle cx="120" cy="118" r="1.1" fill="#c47a5a" opacity=".7"/>
  <ellipse cx="100" cy="126" rx="13" ry="6.5" fill="#d88884"/>
  <path d="M90 125 Q100 131 110 125" stroke="#c06060" stroke-width="1.5" fill="none"/>
</svg>`

export const babloohHeadSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <defs>
    <radialGradient id="bhSkin" cx="36%" cy="28%" r="66%">
      <stop offset="0%" stop-color="#ecc09a"/><stop offset="100%" stop-color="#c88864"/>
    </radialGradient>
  </defs>
  <ellipse cx="100" cy="178" rx="58" ry="16" fill="#000" opacity=".16"/>
  <ellipse cx="100" cy="110" rx="60" ry="68" fill="url(#bhSkin)"/>
  <ellipse cx="100" cy="56" rx="56" ry="30" fill="#1a1210"/>
  <path d="M46 72 C54 38 78 30 100 30 C122 30 146 38 154 72 C146 48 128 42 100 42 C72 42 54 48 46 72 Z" fill="#1a1210"/>
  <g fill="#1a1210">
    <circle cx="52" cy="78" r="3.2"/><circle cx="60" cy="66" r="2.6"/><circle cx="70" cy="58" r="2.2"/>
    <circle cx="148" cy="78" r="3.2"/><circle cx="140" cy="66" r="2.6"/><circle cx="130" cy="58" r="2.2"/>
  </g>
  <path d="M58 90 Q78 76 98 90" stroke="#14100c" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M102 90 Q122 76 142 90" stroke="#14100c" stroke-width="10" fill="none" stroke-linecap="round"/>
  <ellipse cx="78" cy="108" rx="10" ry="11" fill="#fff"/>
  <ellipse cx="122" cy="108" rx="10" ry="11" fill="#fff"/>
  <ellipse cx="79" cy="110" rx="5.2" ry="5.8" fill="#4a2a16"/>
  <ellipse cx="123" cy="110" rx="5.2" ry="5.8" fill="#4a2a16"/>
  <circle cx="81" cy="107" r="2" fill="#fff"/>
  <circle cx="125" cy="107" r="2" fill="#fff"/>
  <path d="M94 120 Q100 126 106 120" stroke="#b87858" stroke-width="2.4" fill="none"/>
  <path d="M74 138 Q86 132 94 138 Q100 132 106 138 Q114 132 126 138" stroke="#2a1810" stroke-width="3.6" fill="none" stroke-linecap="round"/>
  <ellipse cx="100" cy="152" rx="17" ry="8.5" fill="#c87070"/>
  <path d="M86 151 Q100 159 114 151" stroke="#a85050" stroke-width="1.7" fill="none"/>
  <ellipse cx="42" cy="116" rx="9" ry="13" fill="#c88864"/>
  <ellipse cx="158" cy="116" rx="9" ry="13" fill="#c88864"/>
</svg>`

export const gameOverSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <defs>
    <radialGradient id="goSkin" cx="40%" cy="34%" r="60%">
      <stop offset="0%" stop-color="#f2c8ae"/><stop offset="100%" stop-color="#d49a7a"/>
    </radialGradient>
    <linearGradient id="goHood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2c2c34"/><stop offset="100%" stop-color="#0e0e12"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="180" rx="72" ry="18" fill="#000" opacity=".18"/>
  <path d="M38 150 C48 122 70 114 100 114 C130 114 152 122 162 150 L156 194 L44 194 Z" fill="url(#goHood)"/>
  <path d="M94 128 L100 186 L106 128" stroke="#ececf2" stroke-width="2.8" fill="none"/>
  <path d="M68 120 Q100 108 132 120" stroke="#ececf2" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <g transform="rotate(-8 100 92)">
    <ellipse cx="100" cy="92" rx="52" ry="58" fill="url(#goSkin)"/>
    <path d="M52 76 C58 34 78 28 100 28 C122 28 142 34 148 76 C140 50 124 44 100 44 C76 44 60 50 52 76 Z" fill="#1a1410"/>
    <path d="M66 86 Q80 76 94 86" stroke="#1a1410" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M106 86 Q120 76 134 86" stroke="#1a1410" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M70 104 Q82 98 94 104" stroke="#2a1a12" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M106 104 Q118 98 130 104" stroke="#2a1a12" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M88 128 Q100 142 112 128 Q106 146 100 148 Q94 146 88 128 Z" fill="#c87870"/>
    <rect x="93" y="133" width="5.5" height="7" rx="1" fill="#fff" opacity=".9"/>
    <rect x="101.5" y="133" width="5.5" height="7" rx="1" fill="#fff" opacity=".9"/>
  </g>
</svg>`

export const bombSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <defs>
    <radialGradient id="bombBody" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#6a6e7a"/><stop offset="55%" stop-color="#2e313c"/><stop offset="100%" stop-color="#0e1016"/>
    </radialGradient>
  </defs>
  <path d="M100 48 Q118 28 132 42" stroke="#ffbf68" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="136" cy="40" r="7" fill="#ffd66b"/>
  <circle cx="138" cy="37" r="2.5" fill="#fff6c8"/>
  ${Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5
    const x1 = 100 + Math.cos(a) * 58
    const y1 = 100 + Math.sin(a) * 58
    const x2 = 100 + Math.cos(a) * 78
    const y2 = 100 + Math.sin(a) * 78
    const x3 = 100 + Math.cos(a + 0.28) * 58
    const y3 = 100 + Math.sin(a + 0.28) * 58
    return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y3.toFixed(1)} Z" fill="#1a1a24"/>`
  }).join('')}
  <circle cx="100" cy="100" r="58" fill="url(#bombBody)" stroke="#9295a5" stroke-width="3"/>
  <text x="100" y="118" text-anchor="middle" font-family="system-ui,sans-serif" font-size="56" font-weight="900" fill="#fff">!</text>
</svg>`

export const targetSvgs = [ninjaGuySvg, ninjaGirlSvg, babloohHeadSvg] as const
