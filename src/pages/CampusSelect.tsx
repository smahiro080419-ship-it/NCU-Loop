import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoMark, Wordmark } from '../components/Brand'

const base = import.meta.env.BASE_URL

const CAMPUSES = [
  {
    key: '桜山キャンパス',
    label: '桜山',
    en: 'Sakurayama',
    img: `${base}images/sakurayama.png`,
    fallback: 'linear-gradient(145deg,#6a3093,#a044ff)',
  },
  {
    key: '滝子キャンパス',
    label: '滝子',
    en: 'Takiko',
    img: `${base}images/takiko.jpg`,
    fallback: 'linear-gradient(145deg,#1a6dff,#00d2ff)',
  },
  {
    key: '田辺通キャンパス',
    label: '田辺通',
    en: 'Tanabedori',
    img: `${base}images/tanabedori.jpg`,
    fallback: 'linear-gradient(145deg,#11998e,#38ef7d)',
  },
  {
    key: '北千種キャンパス',
    label: '北千種',
    en: 'Kitachigusa',
    img: `${base}images/kitachigusa.jpg`,
    fallback: 'linear-gradient(145deg,#f7971e,#ffd200)',
  },
]

function CampusSelect() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('ncu_token')
    if (!token) { navigate('/login'); return }
    const raw = localStorage.getItem('ncu_profile')
    if (raw) setUsername(JSON.parse(raw).username ?? '')
    // slight delay so CSS transitions fire after first paint
    const t = setTimeout(() => setMounted(true), 30)
    return () => clearTimeout(t)
  }, [navigate])

  const handleSelect = (campusKey: string) => {
    navigate('/market', { state: { campus: campusKey } })
  }

  return (
    <div className="cs-layout">
      {/* ── background decoration ── */}
      <div className="cs-bg-blob cs-blob-1" />
      <div className="cs-bg-blob cs-blob-2" />

      {/* ── header ── */}
      <header className={`cs-header ${mounted ? 'cs-header--in' : ''}`}>
        <div className="cs-header-logo">
          <LogoMark />
        </div>
        <Wordmark />
        <div className="cs-header-divider" />
        <p className="cs-header-greeting">
          <span className="cs-greeting-hi">こんにちは、</span>
          <span className="cs-greeting-name">{username}</span>
          <span className="cs-greeting-hi"> さん</span>
        </p>
        <p className="cs-header-sub">どのキャンパスで注文しますか？</p>
      </header>

      {/* ── campus cards ── */}
      <div className="cs-grid">
        {CAMPUSES.map((c, i) => (
          <CampusCard
            key={c.key}
            campus={c}
            index={i}
            mounted={mounted}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  )
}

type Campus = typeof CAMPUSES[number]

function CampusCard({
  campus,
  index,
  mounted,
  onSelect,
}: {
  campus: Campus
  index: number
  mounted: boolean
  onSelect: (key: string) => void
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const [pressed, setPressed] = useState(false)

  return (
    <div
      className={`cs-card ${mounted ? 'cs-card--in' : ''} ${pressed ? 'cs-card--pressed' : ''}`}
      style={{ animationDelay: `${0.15 + index * 0.09}s`, transitionDelay: `${0.15 + index * 0.09}s` }}
      onClick={() => onSelect(campus.key)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      {imgFailed ? (
        <div className="cs-card-fallback" style={{ background: campus.fallback }} />
      ) : (
        <img
          className="cs-card-img"
          src={campus.img}
          alt={campus.label}
          onError={() => setImgFailed(true)}
        />
      )}

      {/* shimmer overlay on hover */}
      <div className="cs-card-shimmer" />
      <div className="cs-card-overlay" />

      <div className="cs-card-body">
        <span className="cs-card-pill">CAMPUS</span>
        <p className="cs-card-name">{campus.label}</p>
        <p className="cs-card-en">{campus.en}</p>
        <div className="cs-card-arrow">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default CampusSelect
