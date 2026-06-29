export function LogoMark() {
  return (
    <svg viewBox="0 0 120 120" className="logo-svg" aria-hidden="true">
      <defs>
        <marker
          id="arrow-green"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#4caf50" />
        </marker>
        <marker
          id="arrow-blue"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#2f6fc4" />
        </marker>
      </defs>

      <path
        d="M25.36,38 A40,40 0 0,1 94.64,78"
        fill="none"
        stroke="#4caf50"
        strokeWidth="6"
        strokeLinecap="round"
        markerEnd="url(#arrow-green)"
      />
      <path
        d="M94.64,78 A40,40 0 0,1 25.36,38"
        fill="none"
        stroke="#2f6fc4"
        strokeWidth="6"
        strokeLinecap="round"
        markerEnd="url(#arrow-blue)"
      />

      <path
        d="M60,40 C50,33 38,33 32,37 L32,72 C38,68 50,68 60,75 Z"
        fill="none"
        stroke="#4caf50"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M60,40 C70,33 82,33 88,37 L88,72 C82,68 70,68 60,75 Z"
        fill="none"
        stroke="#2f6fc4"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <text x="60" y="62" textAnchor="middle" className="logo-text">
        NCU
      </text>
    </svg>
  )
}

export function HopText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`hop-text ${className}`}>
      {text.split('').map((char, i) => (
        <span key={i} className="hop-char" style={{ animationDelay: `${i * 0.08}s` }}>
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  )
}

export function Wordmark() {
  return (
    <h1 className="brand">
      <HopText text="NCU" className="brand-navy" />
      <HopText text=" L" className="brand-navy" />
      <span className="hop-char brand-loop" style={{ animationDelay: '0.32s' }}>
        oo
      </span>
      <HopText text="p" className="brand-blue" />
    </h1>
  )
}
