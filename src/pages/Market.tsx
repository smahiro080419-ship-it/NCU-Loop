import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Profile = {
  email: string
  username: string
  gender: string
  faculty: string
  grade: string
}

function Market() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('ncu_token')
    if (!token) {
      navigate('/login')
      return
    }
    const raw = localStorage.getItem('ncu_profile')
    if (raw) setProfile(JSON.parse(raw))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('ncu_token')
    localStorage.removeItem('ncu_profile')
    navigate('/')
  }

  if (!profile) return null

  const initials = profile.username.slice(0, 2).toUpperCase()

  return (
    <div className="market-layout">
      <header className="market-header">
        <button
          className="user-icon-btn"
          onClick={() => setProfileOpen(true)}
          aria-label="プロフィールを開く"
        >
          <span className="user-icon-initials">{initials}</span>
        </button>
        <span className="market-header-title">NCU Loop</span>
      </header>

      <main className="market-main">
        <div className="market-empty">
          <p className="market-empty-icon">🛒</p>
          <p className="market-empty-title">教科書マーケット</p>
          <p className="market-empty-sub">出品・検索機能を準備中です</p>
        </div>
      </main>

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
