import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { LogoMark } from '../components/Brand'
import { API_BASE } from '../lib/api'

export default function Login() {
  const [email,      setEmail]      = useState('')
  const [error,      setError]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const saveAndGo = (data: { token: string; email: string; username: string; gender: string; faculty: string; grade: string }) => {
    localStorage.setItem('ncu_token', data.token)
    localStorage.setItem('ncu_profile', JSON.stringify({
      email: data.email, username: data.username,
      gender: data.gender, faculty: data.faculty, grade: data.grade,
    }))
    navigate('/campus')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res  = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        saveAndGo(data)
      } else {
        setError(data.message)
      }
    } catch {
      setError('通信エラーが発生しました。')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return
    setSubmitting(true)
    setError('')
    try {
      const res  = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })
      const data = await res.json()
      if (res.ok) {
        saveAndGo(data)
      } else {
        setError(data.message)
      }
    } catch {
      setError('通信エラーが発生しました。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="welcome">
      <main className="welcome-card">
        <div className="logo-mark"><LogoMark /></div>
        <h1 className="page-title">ログイン</h1>
        <p className="description">
          大学メールアドレス（@ed.nagoya-cu.ac.jp）でログインしてください。
        </p>

        {/* Google Sign-In */}
        <div className="google-login-wrap">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Googleログインに失敗しました。')}
            text="signin_with"
            shape="rectangular"
            theme="outline"
            size="large"
            width="320"
          />
        </div>

        <div className="login-divider"><span>または</span></div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>大学メールアドレス</span>
            <input
              type="email"
              required
              placeholder="example@ed.nagoya-cu.ac.jp"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            <span className="signup-note">登録時に入力したアドレスを入力してください</span>
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'ログイン中...' : 'ログイン'}
            </button>
            <Link to="/" className="btn btn-secondary">戻る</Link>
          </div>
        </form>

        <p className="form-footer">
          アカウントをお持ちでない方は <Link to="/signup">新規登録</Link>
        </p>
      </main>
    </div>
  )
}
