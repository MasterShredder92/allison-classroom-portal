'use client'

import { useEffect, useState } from 'react'

const WOLF_MESSAGES = [
  'Woof! Have a great school day!',
  'Thanks for checking in!',
  'You are doing great, families!',
  'Homework hero mode!',
  'Keep learning fun!',
  'Classroom updates are right here!',
  'Go Wolves!',
  'Reading time is the best time!',
  'Small steps, big progress!',
  'Thanks for supporting your student!',
  'A+ parent teamwork!',
  'See what is new today!'
]

export default function AnimatedWolfMascot() {
  const [progress, setProgress] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const [tapCount, setTapCount] = useState(0)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches)
    updateMotionPreference()
    mediaQuery.addEventListener('change', updateMotionPreference)

    let frame = 0
    const updateScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        setProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)))
        frame = 0
      })
    }

    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', updateScroll)

    return () => {
      mediaQuery.removeEventListener('change', updateMotionPreference)
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', updateScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const hop = reducedMotion ? 0 : Math.sin(progress * Math.PI * 5) * 16
  const drift = reducedMotion ? 0 : Math.sin(progress * Math.PI * 2) * 22
  const rotate = reducedMotion ? -3 : Math.sin(progress * Math.PI * 4) * 8 - 3
  const tailWag = reducedMotion ? 0 : Math.sin(progress * Math.PI * 10 + tapCount) * 10
  const pawWave = reducedMotion ? -8 : Math.sin(progress * Math.PI * 8 + tapCount) * 12 - 8
  const tapBounce = reducedMotion ? 0 : tapCount % 2 === 0 ? 0 : -5
  const currentMessage = WOLF_MESSAGES[messageIndex]

  const handleMascotTap = () => {
    setMessageIndex((current) => (current + 1) % WOLF_MESSAGES.length)
    setTapCount((current) => current + 1)
  }

  return (
    <button
      type="button"
      className="wolf-mascot"
      aria-label={`Classroom wolf says: ${currentMessage}. Tap for another message.`}
      onClick={handleMascotTap}
      style={{
        transform: `translate3d(${drift}px, ${-hop + tapBounce}px, 0) rotate(${rotate}deg)`,
      }}
    >
      <span className="wolf-mascot__bubble" aria-live="polite">{currentMessage}</span>
      <svg className="wolf-mascot__svg" viewBox="0 0 190 190" role="img" aria-label="Friendly classroom wolf mascot">
        <defs>
          <linearGradient id="wolf-fur" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#8d96a8" />
            <stop offset="58%" stopColor="#667085" />
            <stop offset="100%" stopColor="#4b5565" />
          </linearGradient>
          <linearGradient id="wolf-cream" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fff7ec" />
            <stop offset="100%" stopColor="#ffe7c6" />
          </linearGradient>
          <filter id="wolf-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#412f19" floodOpacity="0.20" />
          </filter>
        </defs>

        <ellipse cx="96" cy="166" rx="54" ry="10" fill="#2f2a24" opacity="0.14" />

        <g filter="url(#wolf-shadow)">
          <path
            d="M135 104 C165 93 168 66 150 45 C147 68 133 77 115 82 Z"
            fill="url(#wolf-fur)"
            style={{ transformOrigin: '122px 92px', transform: `rotate(${tailWag}deg)` }}
          />
          <path d="M74 82 C59 90 48 112 51 133 C55 160 79 169 103 166 C128 163 146 146 143 121 C140 95 115 75 91 75 C85 75 79 77 74 82 Z" fill="url(#wolf-fur)" />
          <path d="M73 108 C66 125 70 150 91 156 C116 164 134 146 132 124 C121 138 94 140 73 108 Z" fill="url(#wolf-cream)" opacity="0.96" />

          <path d="M58 65 L49 28 L81 50 Z" fill="#667085" />
          <path d="M54 65 L52 39 L73 54 Z" fill="#ffbed2" />
          <path d="M124 64 L144 29 L147 72 Z" fill="#667085" />
          <path d="M128 62 L141 41 L142 67 Z" fill="#ffbed2" />

          <path d="M54 63 C65 41 91 34 113 43 C135 52 148 77 141 101 C135 124 109 135 84 130 C61 125 45 107 46 87 C46 78 49 70 54 63 Z" fill="url(#wolf-fur)" />
          <path d="M69 89 C78 76 111 74 124 90 C122 112 109 123 93 124 C78 124 67 111 69 89 Z" fill="url(#wolf-cream)" />
          <path d="M79 66 C85 61 95 60 101 67 C94 70 86 70 79 66 Z" fill="#f7fbff" opacity="0.82" />
          <path d="M104 67 C111 61 120 62 126 69 C119 72 111 72 104 67 Z" fill="#f7fbff" opacity="0.82" />
          <circle cx="85" cy="82" r="5" fill="#2f2a24" />
          <circle cx="115" cy="83" r="5" fill="#2f2a24" />
          <circle cx="87" cy="80" r="1.6" fill="white" />
          <circle cx="117" cy="81" r="1.6" fill="white" />
          <path d="M97 93 C102 89 110 91 113 96 C110 101 101 102 96 97 C95 96 95 95 97 93 Z" fill="#2f2a24" />
          <path d="M104 100 C103 108 95 111 89 106" fill="none" stroke="#2f2a24" strokeWidth="3" strokeLinecap="round" />
          <path d="M104 100 C107 108 116 110 121 104" fill="none" stroke="#2f2a24" strokeWidth="3" strokeLinecap="round" />
          <circle cx="70" cy="100" r="6" fill="#ff89c6" opacity="0.55" />
          <circle cx="128" cy="101" r="6" fill="#ff89c6" opacity="0.55" />

          <path d="M60 137 C49 138 43 147 47 156 C57 158 66 154 69 145 Z" fill="#4b5565" />
          <path d="M121 136 C132 137 139 146 135 155 C124 159 116 154 113 144 Z" fill="#4b5565" />
          <path
            d="M54 118 C43 113 34 119 32 130 C40 137 53 135 60 127 Z"
            fill="#667085"
            style={{ transformOrigin: '58px 122px', transform: `rotate(${pawWave}deg)` }}
          />
        </g>
      </svg>
    </button>
  )
}
