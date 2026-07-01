import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoMark } from '../components/Brand'

const CAMPUSES = [
  {
    key: '桜山キャンパス',
    label: '桜山',
    en: 'Sakurayama',
    img: '/images/sakurayama.png',
    fallback: 'linear-gradient(145deg,#6a3093,#a044ff)',
  },
  {
    key: '滝子キャンパス',
    label: '滝子',
    en: 'Takiko',
    img: '/images/takiko.jpg',
    fallback: 'linear-gradient(145deg,#1a6dff,#00d2ff)',
  },
  {
    key: '田辺通キャンパス',
    label: '田辺通',
    en: 'Tanabedori',
    img: '/images/tanabedori.jpg',
    fallback: 'linear-gradient(145deg,#11998e,#38ef7d)',
  },
  {
    key: '北千種キャンパス',
    label: '北千種',
    en: 'Kitachigusa',
    img: '/images/kitachigusa.jpg',
    fallback: 'linear-gradient(145deg,#f7971e,#ffd200)',
  },
]

function CampusSelect() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('ncu_token')
    if (!token) { navigate('/login'); return }
    const raw = localStorage.getItem('ncu_profile')
    if (raw) setUsername(JSON.parse(raw).username ?? '')
  }, [navigate])

  const handleSelect = (campusKey: string) => {
    navigate('/market', { state: { campus: campusKey } })
  }

  return (
    <div className="cs-layout">
      <header className="cs-header">
        <div className="cs-header-logo">
          <LogoMark />
        </div>
        <div className="cs-header-text">
          <p className="cs-header-greeting">こんにちは、{username} さん</p>
          <h1 className="cs-header-title">キャンパスを選んでください</h1>
        </div>
      </header>

      <div className="cs-grid">
        {CAMPUSES.map((c) => (
          <CampusCard key={c.key} campus={c} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  )
}

type Campus = typeof CAMPUSES[number]

function CampusCard({ campus, onSelect }: { campus: Campus; onSelect: (key: string) => void }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="cs-card" onClick={() => onSelect(campus.key)}>
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
      <div className="cs-card-overlay" />
      <div className="cs-card-body">
        <span className="cs-card-pill">CAMPUS</span>
        <p className="cs-card-name">{campus.label}</p>
        <p className="cs-card-en">{campus.en}</p>
      </div>
    </div>
  )
}

export default CampusSelect
