import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogoMark } from '../components/Brand'
import { getWanted, addWanted, deleteWanted, type WantedPost } from '../lib/wanted'

const base = import.meta.env.BASE_URL

const CAMPUS_IMAGES: Record<string, string> = {
  '桜山キャンパス':  `${base}images/sakurayama.png`,
  '滝子キャンパス':  `${base}images/takiko.jpg`,
  '田辺通キャンパス': `${base}images/tanabedori.jpg`,
  '北千種キャンパス': `${base}images/kitachigusa.jpg`,
}

const FACULTIES = ['未選択', '医学部', '経済学部', '総合生命理学部', '芸術工学部', '人文社会学部', 'データサイエンス学部', '看護学部', '薬学部']

function timeAgo(ts: number) {
  const d = Math.floor((Date.now() - ts) / 1000)
  if (d < 60)   return `${d}秒前`
  if (d < 3600)  return `${Math.floor(d / 60)}分前`
  if (d < 86400) return `${Math.floor(d / 3600)}時間前`
  return `${Math.floor(d / 86400)}日前`
}

export default function WantedBoard() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const campus    = (location.state as { campus?: string } | null)?.campus ?? 'すべて'
  const imgUrl    = CAMPUS_IMAGES[campus] ?? ''

  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [posts, setPosts] = useState<WantedPost[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // form
  const [bookTitle, setBookTitle] = useState('')
  const [author,    setAuthor]    = useState('')
  const [faculty,   setFaculty]   = useState('未選択')
  const [note,      setNote]      = useState('')

  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('ncu_token')
    if (!token) { navigate('/login'); return }
    const raw = localStorage.getItem('ncu_profile')
    if (raw) setUsername(JSON.parse(raw).username ?? '')
    setAvatarUrl(localStorage.getItem('ncu_avatar') ?? '')
    setPosts(getWanted().filter(p => p.campus === campus))
    setTimeout(() => setMounted(true), 30)
  }, [navigate, campus])

  const initials = username.slice(0, 2).toUpperCase()

  const handlePost = () => {
    if (!bookTitle.trim()) return
    const post = addWanted({
      campus,
      bookTitle: bookTitle.trim(),
      author: author.trim(),
      faculty: faculty === '未選択' ? '' : faculty,
      note: note.trim(),
      username,
    })
    setPosts(prev => [post, ...prev])
    setBookTitle(''); setAuthor(''); setFaculty('未選択'); setNote('')
    setSheetOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteWanted(id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="wb-layout">
      {/* ── blurred background ── */}
      {imgUrl && <img src={imgUrl} className="wb-bg-img" alt="" aria-hidden />}
      <div className="wb-bg-overlay" />

      {/* ── sticky header (same as Market) ── */}
      <header className="market-header">
        <button className="market-back-btn" onClick={() => navigate('/campus')} aria-label="キャンパス選択に戻る">
          ←
        </button>
        <div className="market-header-logo">
          <LogoMark />
        </div>
        <span className="market-header-title">{campus !== 'すべて' ? campus : 'NCU Loop'}</span>
        <button className="user-icon-btn" onClick={() => navigate('/market', { state: { campus } })} aria-label="マーケットへ">
          {avatarUrl
            ? <img src={avatarUrl} alt="avatar" className="user-icon-avatar" />
            : <span className="user-icon-initials">{initials}</span>
          }
        </button>
      </header>

      {/* ── tab bar ── */}
      <div className="wb-tabs">
        <button className="wb-tab" onClick={() => navigate('/market', { state: { campus } })}>
          📚 マーケット
        </button>
        <button className="wb-tab wb-tab-active">
          📋 求む掲示板
        </button>
      </div>

      {/* ── content ── */}
      <main className="wb-main">
        {posts.length === 0 ? (
          <div className={`wb-empty ${mounted ? 'wb-empty--in' : ''}`}>
            <p className="wb-empty-icon">📖</p>
            <p className="wb-empty-title">まだ投稿がありません</p>
            <p className="wb-empty-sub">欲しい教科書を投稿してみましょう！</p>
          </div>
        ) : (
          <div className="wb-grid">
            {posts.map((post, i) => (
              <div
                key={post.id}
                className={`wb-card ${mounted ? 'wb-card--in' : ''}`}
                style={{ animationDelay: `${i * 0.06}s`, transitionDelay: `${i * 0.06}s` }}
              >
                <div className="wb-card-header">
                  <div className="wb-card-avatar">
                    {post.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="wb-card-meta">
                    <span className="wb-card-user">{post.username}</span>
                    <span className="wb-card-time">{timeAgo(post.createdAt)}</span>
                  </div>
                  {post.username === username && (
                    <button className="wb-card-delete" onClick={() => handleDelete(post.id)}>
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>

                <p className="wb-card-title">{post.bookTitle}</p>
                {post.author  && <p className="wb-card-author">著者：{post.author}</p>}
                {post.faculty && <span className="wb-card-faculty">{post.faculty}</span>}
                {post.note    && <p className="wb-card-note">{post.note}</p>}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── FAB ── */}
      <button className="wb-fab" onClick={() => setSheetOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        投稿する
      </button>

      {/* ── bottom sheet ── */}
      {sheetOpen && (
        <div className="wb-sheet-backdrop" onClick={() => setSheetOpen(false)}>
          <div className="wb-sheet" ref={sheetRef} onClick={e => e.stopPropagation()}>
            <div className="wb-sheet-handle" />
            <h3 className="wb-sheet-title">欲しい教科書を投稿</h3>

            <label className="wb-field">
              <span>書名 <span className="wb-required">必須</span></span>
              <input
                type="text"
                placeholder="例：解剖学テキスト"
                value={bookTitle}
                onChange={e => setBookTitle(e.target.value)}
                autoFocus
              />
            </label>
            <label className="wb-field">
              <span>著者名</span>
              <input
                type="text"
                placeholder="例：田中 太郎"
                value={author}
                onChange={e => setAuthor(e.target.value)}
              />
            </label>
            <label className="wb-field">
              <span>学部</span>
              <select value={faculty} onChange={e => setFaculty(e.target.value)}>
                {FACULTIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </label>
            <label className="wb-field">
              <span>メモ・条件など</span>
              <textarea
                placeholder="例：第3版以降でお願いします"
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </label>

            <button
              className="wb-submit"
              disabled={!bookTitle.trim()}
              onClick={handlePost}
            >
              投稿する
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
