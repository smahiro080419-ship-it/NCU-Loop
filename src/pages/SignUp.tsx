import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { LogoMark } from '../components/Brand'
import { API_BASE } from '../lib/api'

const FACULTIES = ['医学部', '経済学部', '総合生命理学部', '芸術工学部', '人文社会学部', 'データサイエンス学部']
const GRADES = ['1年', '2年', '3年', '4年', '院1年', '院2年']
const GENDERS = ['男性', '女性', 'その他', '回答しない']

type Screen = 'form' | 'error' | 'sent'

function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [gender, setGender] = useState('')
  const [faculty, setFaculty] = useState('')
  const [grade, setGrade] = useState('')
  const [screen, setScreen] = useState<Screen>('form')
  const [message, setMessage] = useState('')
  const [continueUrl, setContinueUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username, gender, faculty, grade }),
      })
      const data = await res.json()
      setMessage(data.message)
      if (res.ok && data.continueUrl) setContinueUrl(data.continueUrl)
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
                <span>ユーザーネーム</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="表示名"
                />
              </label>

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

              <label className="field">
                <span>性別</span>
                <select required value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">選択してください</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>学部</span>
                <select required value={faculty} onChange={(e) => setFaculty(e.target.value)}>
                  <option value="">選択してください</option>
                  {FACULTIES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>学年</span>
                <select required value={grade} onChange={(e) => setGrade(e.target.value)}>
                  <option value="">選択してください</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
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
              {email} 宛に確認メールを送信しました。メールが届かない場合は下のボタンから直接続けることもできます。
            </p>
            <div className="actions">
              {continueUrl && (
                <a href={continueUrl} className="btn btn-primary">
                  登録を続ける
                </a>
              )}
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
