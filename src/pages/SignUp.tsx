import { useState, useRef, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogoMark } from '../components/Brand'
import { API_BASE } from '../lib/api'

const FACULTIES = ['医学部', '経済学部', '総合生命理学部', '芸術工学部', '人文社会学部', 'データサイエンス学部', '看護学部', '薬学部']
const GRADES   = ['1年', '2年', '3年', '4年', '院1年', '院2年']
const GENDERS  = ['男性', '女性', 'その他', '回答しない']

type Screen = 'form' | 'otp' | 'error'

export default function SignUp() {
  const navigate = useNavigate()

  // form fields
  const [username, setUsername] = useState('')
  const [gender,   setGender]   = useState('')
  const [faculty,  setFaculty]  = useState('')
  const [grade,    setGrade]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [email,    setEmail]    = useState('')

  // OTP
  const [otp,     setOtp]     = useState(['', '', '', '', '', ''])
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const [screen,     setScreen]     = useState<Screen>('form')
  const [errorMsg,   setErrorMsg]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [devOtp,     setDevOtp]     = useState('')

  // ── Step 1: send OTP ────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.endsWith('@ed.nagoya-cu.ac.jp')) {
      setErrorMsg('メールアドレスは @ed.nagoya-cu.ac.jp で終わる必要があります。')
      return
    }
    setErrorMsg('')
    setSubmitting(true)
    try {
      const res  = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email, username, gender, faculty, grade }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.message); return }
      if (data.devOtp) setDevOtp(data.devOtp)
      setScreen('otp')
    } catch {
      setErrorMsg('通信エラーが発生しました。')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step 2: verify OTP ──────────────────────────────────
  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setErrorMsg('6桁のコードを入力してください。'); return }
    setErrorMsg('')
    setSubmitting(true)
    try {
      const res  = await fetch(`${API_BASE}/api/signup/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.message)
        if (data.message.includes('最初から')) setScreen('form')
        return
      }
      localStorage.setItem('ncu_token', data.token)
      localStorage.setItem('ncu_profile', JSON.stringify({
        email: data.email, username: data.username,
        gender: data.gender, faculty: data.faculty, grade: data.grade,
      }))
      navigate('/campus')
    } catch {
      setErrorMsg('通信エラーが発生しました。')
    } finally {
      setSubmitting(false)
    }
  }

  // OTP box input handler
  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[i] = digit
    setOtp(next)
    if (digit && i < 5) otpRefs[i + 1].current?.focus()
  }

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    e.preventDefault()
    const next = [...otp]
    text.split('').forEach((d, i) => { if (i < 6) next[i] = d })
    setOtp(next)
    otpRefs[Math.min(text.length, 5)].current?.focus()
  }

  return (
    <div className="welcome">
      <main className="welcome-card">
        <div className="logo-mark"><LogoMark /></div>

        {/* ── Step 1: registration form ── */}
        {screen === 'form' && (
          <>
            <h1 className="page-title">新規登録</h1>
            <p className="description">電話番号にSMSで認証コードを送ります。</p>

            <form className="signup-form" onSubmit={handleSubmit}>
              <label className="field">
                <span>ユーザーネーム</span>
                <input type="text" required placeholder="表示名"
                  value={username} onChange={e => setUsername(e.target.value)} />
              </label>

              <label className="field">
                <span>性別</span>
                <select required value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">選択してください</option>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </label>

              <label className="field">
                <span>学部</span>
                <select required value={faculty} onChange={e => setFaculty(e.target.value)}>
                  <option value="">選択してください</option>
                  {FACULTIES.map(f => <option key={f}>{f}</option>)}
                </select>
              </label>

              <label className="field">
                <span>学年</span>
                <select required value={grade} onChange={e => setGrade(e.target.value)}>
                  <option value="">選択してください</option>
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </label>

              <label className="field">
                <span>電話番号</span>
                <input type="tel" required placeholder="09012345678"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </label>

              <label className="field">
                <span>大学メールアドレス <span className="signup-hint">（ログイン用）</span></span>
                <input type="email" required placeholder="example@ed.nagoya-cu.ac.jp"
                  value={email} onChange={e => setEmail(e.target.value)} />
                <span className="signup-note">このアドレスがログインのパスワードになります</span>
              </label>

              {errorMsg && <p className="form-error">{errorMsg}</p>}

              <div className="actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'SMS送信中...' : 'SMSで認証する'}
                </button>
                <Link to="/" className="btn btn-secondary">戻る</Link>
              </div>
            </form>
          </>
        )}

        {/* ── Step 2: OTP verification ── */}
        {screen === 'otp' && (
          <>
            <div className="otp-phone-icon">📱</div>
            <h1 className="page-title">認証コードを入力</h1>
            <p className="description">
              <strong>{phone}</strong> に送信した<br />6桁のコードを入力してください
            </p>

            {devOtp && (
              <p className="dev-otp-badge">開発用コード: {devOtp}</p>
            )}

            <form className="signup-form" onSubmit={handleVerify}>
              <div className="otp-boxes" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    className="otp-box"
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {errorMsg && <p className="form-error">{errorMsg}</p>}

              <div className="actions">
                <button type="submit" className="btn btn-primary" disabled={submitting || otp.join('').length < 6}>
                  {submitting ? '確認中...' : '登録を完了する'}
                </button>
                <button type="button" className="btn btn-secondary"
                  onClick={() => { setScreen('form'); setOtp(['','','','','','']); setErrorMsg('') }}>
                  戻る
                </button>
              </div>
            </form>
          </>
        )}

        {screen === 'error' && (
          <>
            <div className="status-icon status-icon-error">!</div>
            <h1 className="page-title">エラー</h1>
            <p className="description">{errorMsg}</p>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => setScreen('form')}>
                もう一度試す
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
