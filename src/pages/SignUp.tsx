import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { LogoMark } from '../components/Brand'
import { API_BASE } from '../lib/api'

type Screen = 'form' | 'error' | 'sent'

function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [screen, setScreen] = useState<Screen>('form')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      setMessage(data.message)
      setScreen(res.ok ? 'sent' : 'error')
    } catch {
      setMessage('通信エラーが発生しました。しばらくしてから再度お試しください。')
      setScreen('error')
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

        {screen === 'form' && (
          <>
            <h1 className="page-title">新規登録</h1>
            <p className="description">名古屋市立大学発行のメールアドレスで登録してください。</p>

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
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8文字以上"
                />
              </label>

              <div className="actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '送信中...' : '登録する'}
                </button>
                <Link to="/" className="btn btn-secondary">
                  戻る
                </Link>
              </div>
            </form>
          </>
        )}

        {screen === 'error' && (
          <>
            <div className="status-icon status-icon-error">!</div>
            <h1 className="page-title">登録できませんでした</h1>
            <p className="description">{message}</p>
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={() => setScreen('form')}>
                もう一度入力する
              </button>
            </div>
          </>
        )}

        {screen === 'sent' && (
          <>
            <div className="status-icon status-icon-success">✓</div>
            <h1 className="page-title">確認メールを送信しました</h1>
            <p className="description">
              {email} 宛に確認メールを送信しました。メール内のリンクから登録を完了してください。
            </p>
            <div className="actions">
              <Link to="/" className="btn btn-secondary">
                ホームに戻る
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default SignUp
