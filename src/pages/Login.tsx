import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogoMark } from '../components/Brand'
import { API_BASE } from '../lib/api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('ncu_token', data.token)
        localStorage.setItem('ncu_profile', JSON.stringify({
          email: data.email,
          username: data.username,
          gender: data.gender,
          faculty: data.faculty,
          grade: data.grade,
        }))
        navigate('/campus')
      } else {
        setError(data.message)
      }
    } catch {
      setError('通信エラーが発生しました。しばらくしてから再度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="welcome">
      <main className="welcome-card">
        <div className="logo-mark">
          <LogoMark />
        </div>

        <h1 className="page-title">ログイン</h1>
        <p className="description">名古屋市立大学発行のメールアドレスでログインしてください。</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>メールアドレス</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@ed.nagoya-cu.ac.jp"
            />
          </label>
          <label className="field">
            <span>パスワード</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'ログイン中...' : 'ログイン'}
            </button>
            <Link to="/" className="btn btn-secondary">
              戻る
            </Link>
          </div>
        </form>

        <p className="form-footer">
          アカウントをお持ちでない方は <Link to="/signup">新規登録</Link>
        </p>
      </main>
    </div>
  )
}

export default Login
