import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { completeListing } from '../lib/listings'

export default function Complete() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [done, setDone] = useState(false)

  useEffect(() => {
    const id = Number(params.get('listingId'))
    if (id) completeListing(id)
    setDone(true)
  }, [params])

  if (!done) return null

  return (
    <div className="complete-layout">
      <div className="complete-card">
        <div className="complete-icon-wrap">
          <span className="complete-check">✓</span>
        </div>
        <h1 className="complete-title">ありがとうございました！</h1>
        <p className="complete-text">
          取引が完了しました。<br />
          またのご利用をお待ちしております
        </p>
        <button className="btn btn-primary complete-btn" onClick={() => navigate('/campus')}>
          マーケットへ戻る
        </button>
      </div>
    </div>
  )
}
