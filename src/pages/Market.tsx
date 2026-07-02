import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogoMark } from '../components/Brand'
import { getListings, type Listing } from '../lib/listings'

type Profile = {
  email: string
  username: string
  gender: string
  faculty: string
  grade: string
}

const CATEGORIES = ['すべて', '医学部', '経済学部', '総合生命理学部', '芸術工学部', '人文社会学部', 'データサイエンス学部']

const SAMPLE_BOOKS = [
  { id: 1, title: '解剖学テキスト',      faculty: '医学部',           grade: '2年', price: 1200, seller: 'K.T', campus: '桜山キャンパス' },
  { id: 2, title: 'ミクロ経済学入門',    faculty: '経済学部',         grade: '1年', price: 800,  seller: 'A.M', campus: '滝子キャンパス' },
  { id: 3, title: '細胞生物学',          faculty: '総合生命理学部',   grade: '2年', price: 1500, seller: 'S.H', campus: '北千種キャンパス' },
  { id: 4, title: 'デザイン史概論',      faculty: '芸術工学部',       grade: '1年', price: 600,  seller: 'R.Y', campus: '田辺通キャンパス' },
  { id: 5, title: '社会学入門',          faculty: '人文社会学部',     grade: '1年', price: 700,  seller: 'N.K', campus: '田辺通キャンパス' },
  { id: 6, title: 'Pythonで学ぶ統計学', faculty: 'データサイエンス学部', grade: '1年', price: 1100, seller: 'T.S', campus: '北千種キャンパス' },
  { id: 7, title: '内科学テキスト',      faculty: '医学部',           grade: '3年', price: 2000, seller: 'Y.O', campus: '桜山キャンパス' },
  { id: 8, title: 'マクロ経済学',        faculty: '経済学部',         grade: '2年', price: 900,  seller: 'M.I', campus: '滝子キャンパス' },
]

function Market() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('すべて')
  const [userListings, setUserListings] = useState<Listing[]>([])
  const navigate = useNavigate()
  const location = useLocation()
  const campus = (location.state as { campus?: string } | null)?.campus ?? 'すべて'

  useEffect(() => {
    const token = localStorage.getItem('ncu_token')
    if (!token) { navigate('/login'); return }
    const raw = localStorage.getItem('ncu_profile')
    if (raw) setProfile(JSON.parse(raw))
    setUserListings(getListings())
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('ncu_token')
    localStorage.removeItem('ncu_profile')
    navigate('/')
  }

  if (!profile) return null

  const initials = profile.username.slice(0, 2).toUpperCase()

  const filteredUser = userListings.filter((b) =>
    campus === 'すべて' || b.campus === campus
  )
  const filteredSample = SAMPLE_BOOKS.filter((b) => {
    const campusMatch = campus === 'すべて' || b.campus === campus
    const categoryMatch = activeCategory === 'すべて' || b.faculty === activeCategory
    return campusMatch && categoryMatch
  })
  const totalCount = filteredUser.length + filteredSample.length

  return (
    <div className="market-layout">
      <header className="market-header">
        <button className="market-back-btn" onClick={() => navigate('/campus')} aria-label="キャンパス選択に戻る">
          ←
        </button>
        <div className="market-header-logo">
          <LogoMark />
        </div>
        <span className="market-header-title">{campus !== 'すべて' ? campus : 'NCU Loop'}</span>
        <button
          className="user-icon-btn"
          onClick={() => setProfileOpen(true)}
          aria-label="プロフィールを開く"
        >
          <span className="user-icon-initials">{initials}</span>
        </button>
      </header>

      <div className="category-scroll-wrap">
        <div className="category-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-chip ${activeCategory === cat ? 'category-chip-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="market-main">
        {totalCount === 0 ? (
          <div className="market-empty">
            <p className="market-empty-icon">📚</p>
            <p className="market-empty-title">出品がありません</p>
            <p className="market-empty-sub">条件に合う教科書はまだ登録されていません</p>
          </div>
        ) : (
          <div className="book-grid-wrap">
            <p className="book-grid-label">出品中の教科書（{totalCount}件）</p>
            <div className="book-grid">
              {filteredUser.map((book) => (
                <div key={book.id} className="book-card" onClick={() => navigate('/book', { state: { book } })}>
                  {book.photoUrl
                    ? <img src={book.photoUrl} alt={book.title} className="book-card-photo" />
                    : <div className="book-card-cover">📖</div>
                  }
                  <p className="book-card-title">{book.title}</p>
                  <p className="book-card-meta">{book.condition} · {book.campus}</p>
                  <p className="book-card-price">¥{book.price.toLocaleString()}</p>
                  <p className="book-card-seller">{book.seller}</p>
                </div>
              ))}
              {filteredSample.map((book) => (
                <div key={book.id} className="book-card" onClick={() => navigate('/book', { state: { book } })}>
                  <div className="book-card-cover">📖</div>
                  <p className="book-card-title">{book.title}</p>
                  <p className="book-card-meta">{book.faculty} · {book.grade}</p>
                  <p className="book-card-campus">{book.campus}</p>
                  <p className="book-card-price">¥{book.price.toLocaleString()}</p>
                  <p className="book-card-seller">{book.seller}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <button className="fab" onClick={() => navigate('/listing')} aria-label="出品する">
        ＋
      </button>

      {profileOpen && (
        <div className="profile-overlay" onClick={() => setProfileOpen(false)}>
          <aside className="profile-panel" onClick={(e) => e.stopPropagation()}>
            <button className="profile-close" onClick={() => setProfileOpen(false)}>✕</button>

            <div className="profile-avatar">
              <span className="profile-avatar-initials">{initials}</span>
            </div>

            <h2 className="profile-username">{profile.username}</h2>

            <ul className="profile-list">
              <li>
                <span className="profile-label">メールアドレス</span>
                <span className="profile-value">{profile.email}</span>
              </li>
              <li>
                <span className="profile-label">学部</span>
                <span className="profile-value">{profile.faculty}</span>
              </li>
              <li>
                <span className="profile-label">学年</span>
                <span className="profile-value">{profile.grade}</span>
              </li>
              <li>
                <span className="profile-label">性別</span>
                <span className="profile-value">{profile.gender}</span>
              </li>
            </ul>

            <button className="btn btn-secondary profile-logout" onClick={handleLogout}>
              ログアウト
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}

export default Market
