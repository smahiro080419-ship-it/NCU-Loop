import { Link, useNavigate } from 'react-router-dom'
import { LogoMark, Wordmark } from '../components/Brand'

function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="welcome">
      <main className="welcome-card">
        <div className="logo-mark">
          <LogoMark />
        </div>
        <Wordmark />
        <p className="tagline">
          <span className="tagline-line" />
          <span>つなげる本、つながる学生。</span>
          <span className="tagline-line" />
        </p>
        <p className="description">
          学内の学生同士で教科書を売ったり譲ったりできる、NCU生のためのフリマアプリです。
        </p>

        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/login')}>
            学校用メールでログイン
          </button>
          <Link to="/signup" className="btn btn-secondary">
            新規登録
          </Link>
        </div>

        <ul className="features">
          <li>
            <span className="feature-icon">🔍</span>
            <span>授業・学部から教科書を検索</span>
          </li>
          <li>
            <span className="feature-icon">💬</span>
            <span>出品者と学内チャットで直接やりとり</span>
          </li>
          <li>
            <span className="feature-icon">♻️</span>
            <span>使い終わったらまた次の人へ循環</span>
          </li>
        </ul>
      </main>
    </div>
  )
}

export default Welcome
