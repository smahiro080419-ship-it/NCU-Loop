import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoMark } from '../components/Brand'

function Market() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('ncu_token')
    if (!token) {
      navigate('/login')
      return
    }
    setEmail(localStorage.getItem('ncu_email') || '')
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('ncu_token')
    localStorage.removeItem('ncu_email')
    navigate('/')
  }

  return (
    <div className="welcome">
      <main className="welcome-card">
        <div className="logo-mark">
          <LogoMark />
        </div>

        <div className="status-icon status-icon-success">✓</div>
        <h1 className="page-title">ようこそ！</h1>
        <p className="description">
          {email} でログインしました。<br />
          マーケット機能は近日公開予定です。
        </p>

        <div className="market-placeholder">
          <p className="market-placeholder-text">🛒 教科書マーケット</p>
          <p className="market-placeholder-sub">出品・検索機能を準備中です</p>
        </div>

        <div className="actions">
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </main>
    </div>
  )
}

export default Market
