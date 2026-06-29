import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LogoMark } from '../components/Brand'
import { API_BASE } from '../lib/api'

type Status = 'loading' | 'success' | 'error'

function Verify() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('リンクが無効です。')
      return
    }

    fetch(`${API_BASE}/api/verify?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setEmail(data.email)
          setStatus('success')
        } else {
          setStatus('error')
          setMessage(data.message)
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('通信エラーが発生しました。')
      })
  }, [searchParams])

  return (
    <div className="welcome">
      <main className="welcome-card">
        <div className="logo-mark">
          <LogoMark />
        </div>

        {status === 'loading' && <p className="description">確認中です...</p>}

        {status === 'success' && (
          <>
            <div className="status-icon status-icon-success">✓</div>
            <h1 className="page-title">登録が完了しました</h1>
            <p className="description">{email} での登録が確認されました。ログインしてご利用ください。</p>
            <div className="actions">
              <Link to="/" className="btn btn-primary">
                ホームに戻る
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="status-icon status-icon-error">!</div>
            <h1 className="page-title">確認できませんでした</h1>
            <p className="description">{message}</p>
            <div className="actions">
              <Link to="/signup" className="btn btn-secondary">
                もう一度登録する
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Verify
