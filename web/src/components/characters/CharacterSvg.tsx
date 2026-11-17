import { motion } from 'framer-motion'
import { useId, type CSSProperties } from 'react'

type Props = {
  variant: 'guy' | 'girl' | 'head' | 'sleep' | 'bomb'
  size?: number
  className?: string
  style?: CSSProperties
  animate?: boolean
}

export function CharacterSvg({
  variant,
  size = 96,
  className,
  style,
  animate = true,
}: Props) {
  const uid = useId().replace(/:/g, '')
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size, display: 'inline-grid', placeItems: 'center', ...style }}
      animate={animate ? { y: [0, -6, 0], rotate: [0, variant === 'girl' ? -2 : 2, 0] } : undefined}
      transition={
        animate
          ? { duration: 2.4 + (variant === 'girl' ? 0.3 : 0), repeat: Infinity, ease: 'easeInOut' }
          : undefined
      }
    >
      <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden>
        {variant === 'guy' && <GuyParts id={uid} />}
        {variant === 'girl' && <GirlParts id={uid} />}
        {variant === 'head' && <HeadParts id={uid} />}
        {variant === 'sleep' && <SleepParts id={uid} />}
        {variant === 'bomb' && <BombParts id={uid} />}
      </svg>
    </motion.div>
  )
}

function GuyParts({ id }: { id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-skin`} cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#f6d0b6" />
          <stop offset="100%" stopColor="#d49a78" />
        </radialGradient>
        <linearGradient id={`${id}-shirt`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a7e86" />
          <stop offset="100%" stopColor="#3a3e46" />
        </linearGradient>
      </defs>
      <path d="M42 158 C48 128 68 118 100 118 C132 118 152 128 158 158 L150 190 L50 190 Z" fill={`url(#${id}-shirt)`} />
      <path d="M78 128 L100 188 L122 128" fill="none" stroke="#2c3038" strokeWidth="10" strokeLinejoin="round" />
      <path d="M78 128 L100 188 L122 128" fill="none" stroke="#5c6068" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="100" cy="92" rx="54" ry="60" fill={`url(#${id}-skin)`} />
      <path d="M48 78 C52 36 78 28 100 28 C122 28 148 36 152 78 C146 52 128 44 100 44 C72 44 54 52 48 78 Z" fill="#1c1410" />
      <path d="M55 70 C68 88 78 72 84 68 C92 86 100 64 108 68 C116 86 124 68 132 70 C140 86 148 70 145 68" fill="#1c1410" />
      <path d="M66 84 Q80 76 94 84" stroke="#241810" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M106 84 Q120 76 134 84" stroke="#241810" strokeWidth="5" fill="none" strokeLinecap="round" />
      <BlinkEyes cx1={80} cx2={120} cy={100} />
      <path d="M96 110 Q100 116 104 110" stroke="#c48a6a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="100" cy="130" rx="15" ry="7.5" fill="#d07a74" />
    </>
  )
}

function GirlParts({ id }: { id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-skin`} cx="42%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fbe0d0" />
          <stop offset="100%" stopColor="#e2ae94" />
        </radialGradient>
        <linearGradient id={`${id}-hood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f3f48" />
          <stop offset="100%" stopColor="#18181e" />
        </linearGradient>
      </defs>
      <path d="M40 152 C48 124 70 116 100 116 C130 116 152 124 160 152 L154 192 L46 192 Z" fill={`url(#${id}-hood)`} />
      <path d="M92 126 L100 184 L108 126" stroke="#8a8a94" strokeWidth="2.5" fill="none" />
      <ellipse cx="100" cy="90" rx="48" ry="54" fill={`url(#${id}-skin)`} />
      <motion.path
        d="M52 88 C48 40 74 26 100 26 C126 26 152 40 148 88 C144 56 126 44 100 44 C74 44 56 56 52 88 Z"
        fill="#4e3224"
        animate={{
          d: [
            'M52 88 C48 40 74 26 100 26 C126 26 152 40 148 88 C144 56 126 44 100 44 C74 44 56 56 52 88 Z',
            'M52 90 C46 38 74 24 100 24 C126 24 154 38 148 90 C144 54 126 42 100 42 C74 42 56 54 52 90 Z',
            'M52 88 C48 40 74 26 100 26 C126 26 152 40 148 88 C144 56 126 44 100 44 C74 44 56 56 52 88 Z',
          ],
        }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <path d="M48 92 C38 112 42 150 54 168" stroke="#4e3224" strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d="M152 92 C162 112 158 150 146 168" stroke="#4e3224" strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d="M70 84 Q82 76 94 84" stroke="#2a1a12" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M106 84 Q118 76 130 84" stroke="#2a1a12" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <BlinkEyes cx1={82} cx2={118} cy={98} scale={1.15} />
      <circle cx="88" cy="112" r="1.5" fill="#c47a5a" />
      <circle cx="96" cy="116" r="1.3" fill="#c47a5a" />
      <circle cx="104" cy="114" r="1.4" fill="#c47a5a" />
      <circle cx="112" cy="112" r="1.3" fill="#c47a5a" />
      <ellipse cx="100" cy="126" rx="13" ry="6.5" fill="#d88884" />
    </>
  )
}

function HeadParts({ id }: { id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-skin`} cx="36%" cy="28%" r="66%">
          <stop offset="0%" stopColor="#ecc09a" />
          <stop offset="100%" stopColor="#c88864" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="110" rx="60" ry="68" fill={`url(#${id}-skin)`} />
      <ellipse cx="100" cy="56" rx="56" ry="30" fill="#1a1210" />
      <path d="M46 72 C54 38 78 30 100 30 C122 30 146 38 154 72 C146 48 128 42 100 42 C72 42 54 48 46 72 Z" fill="#1a1210" />
      <path d="M58 90 Q78 76 98 90" stroke="#14100c" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M102 90 Q122 76 142 90" stroke="#14100c" strokeWidth="10" fill="none" strokeLinecap="round" />
      <BlinkEyes cx1={78} cx2={122} cy={108} scale={1.1} />
      <path d="M74 138 Q86 132 94 138 Q100 132 106 138 Q114 132 126 138" stroke="#2a1810" strokeWidth="3.6" fill="none" strokeLinecap="round" />
      <ellipse cx="100" cy="152" rx="17" ry="8.5" fill="#c87070" />
      <ellipse cx="42" cy="116" rx="9" ry="13" fill="#c88864" />
      <ellipse cx="158" cy="116" rx="9" ry="13" fill="#c88864" />
    </>
  )
}

function SleepParts({ id }: { id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-skin`} cx="40%" cy="34%" r="60%">
          <stop offset="0%" stopColor="#f2c8ae" />
          <stop offset="100%" stopColor="#d49a7a" />
        </radialGradient>
        <linearGradient id={`${id}-hood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c2c34" />
          <stop offset="100%" stopColor="#0e0e12" />
        </linearGradient>
      </defs>
      <path d="M38 150 C48 122 70 114 100 114 C130 114 152 122 162 150 L156 194 L44 194 Z" fill={`url(#${id}-hood)`} />
      <path d="M94 128 L100 186 L106 128" stroke="#ececf2" strokeWidth="2.8" fill="none" />
      <g transform="rotate(-8 100 92)">
        <ellipse cx="100" cy="92" rx="52" ry="58" fill={`url(#${id}-skin)`} />
        <path d="M52 76 C58 34 78 28 100 28 C122 28 142 34 148 76 C140 50 124 44 100 44 C76 44 60 50 52 76 Z" fill="#1a1410" />
        <path d="M66 86 Q80 76 94 86" stroke="#1a1410" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M106 86 Q120 76 134 86" stroke="#1a1410" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M70 104 Q82 98 94 104" stroke="#2a1a12" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M106 104 Q118 98 130 104" stroke="#2a1a12" strokeWidth="4" fill="none" strokeLinecap="round" />
        <motion.path
          d="M88 128 Q100 142 112 128 Q106 146 100 148 Q94 146 88 128 Z"
          fill="#c87870"
          animate={{ scaleY: [1, 1.08, 1] }}
          style={{ transformOrigin: '100px 136px' }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </g>
      <motion.text
        x="150"
        y="50"
        fontSize="22"
        fill="#ffe0f6"
        animate={{ opacity: [0.2, 1, 0.2], y: [50, 40, 50] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        z
      </motion.text>
    </>
  )
}

function BombParts({ id }: { id: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-bomb`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#6a6e7a" />
          <stop offset="55%" stopColor="#2e313c" />
          <stop offset="100%" stopColor="#0e1016" />
        </radialGradient>
      </defs>
      <path d="M100 48 Q118 28 132 42" stroke="#ffbf68" strokeWidth="5" fill="none" strokeLinecap="round" />
      <motion.circle
        cx="136"
        cy="40"
        r="7"
        fill="#ffd66b"
        animate={{ scale: [1, 1.35, 1], opacity: [1, 0.7, 1] }}
        style={{ transformOrigin: '136px 40px' }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * Math.PI) / 5
        const x1 = 100 + Math.cos(a) * 58
        const y1 = 100 + Math.sin(a) * 58
        const x2 = 100 + Math.cos(a) * 78
        const y2 = 100 + Math.sin(a) * 78
        const x3 = 100 + Math.cos(a + 0.28) * 58
        const y3 = 100 + Math.sin(a + 0.28) * 58
        return <path key={i} d={`M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} Z`} fill="#1a1a24" />
      })}
      <circle cx="100" cy="100" r="58" fill={`url(#${id}-bomb)`} stroke="#9295a5" strokeWidth="3" />
      <text x="100" y="118" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="56" fontWeight="900" fill="#fff">
        !
      </text>
    </>
  )
}

function BlinkEyes({
  cx1,
  cx2,
  cy,
  scale = 1,
}: {
  cx1: number
  cx2: number
  cy: number
  scale?: number
}) {
  const rx = 8 * scale
  const ry = 9 * scale
  return (
    <motion.g
      animate={{ scaleY: [1, 1, 1, 0.08, 1] }}
      transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.72, 0.85, 0.9, 1] }}
      style={{ transformOrigin: `100px ${cy}px` }}
    >
      <ellipse cx={cx1} cy={cy} rx={rx} ry={ry} fill="#fff" />
      <ellipse cx={cx2} cy={cy} rx={rx} ry={ry} fill="#fff" />
      <ellipse cx={cx1 + 1} cy={cy + 1} rx={rx * 0.55} ry={ry * 0.55} fill="#3a2418" />
      <ellipse cx={cx2 + 1} cy={cy + 1} rx={rx * 0.55} ry={ry * 0.55} fill="#3a2418" />
      <circle cx={cx1 + 2.5} cy={cy - 0.5} r={1.6 * scale} fill="#fff" />
      <circle cx={cx2 + 2.5} cy={cy - 0.5} r={1.6 * scale} fill="#fff" />
    </motion.g>
  )
}
