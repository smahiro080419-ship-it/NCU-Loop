import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { initRoom } from '../lib/chats'
import { isTrading, setTrading } from '../lib/listings'

type Book = {
  id: number
  title: string
  price: number
  campus: string
  seller: string
  photoUrl?: string
  condition?: string
  comment?: string
  faculty?: string
  grade?: string
}

function BookDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const book = location.state?.book as Book | undefined
  const [showNotice, setShowNotice] = useState(false)
  const [trading, setTradingState] = useState(() => book ? isTrading(book.id) : false)

  if (!book) {
    navigate('/market')
    return null
  }

  const raw = localStorage.getItem('ncu_profile')
  const profile = raw ? JSON.parse(raw) : {}
  const buyer: string = profile.username || '匿名'

  const roomId = `${book.id}-${buyer}`

  const handleBuy = () => {
    initRoom(roomId, book.title, book.seller, buyer)
    setTrading(book.id)
    setTradingState(true)
    setShowNotice(true)
  }

  const handleOpenChat = () => {
    navigate('/chat', { state: { roomId, book } })
  }

  return (
    <div className="market-layout">
      <header className="market-header">
        <button className="market-back-btn" onClick={() => navigate(-1)} aria-label="戻る">
          ←
        </button>
        <span className="market-header-title">商品詳細</span>
        {trading && (
          <span className="detail-trading-badge">取引中</span>
        )}
      </header>

      <main className="detail-main">
        <div className="detail-photo-wrap">
          {book.photoUrl
            ? <img src={book.photoUrl} alt={book.title} className="detail-photo" />
            : <div className="detail-photo-placeholder">📖</div>
          }
          {trading && <div className="detail-trading-overlay">取引中</div>}
        </div>

        <div className="detail-body">
          <h2 className="detail-title">{book.title}</h2>
          <p className="detail-price">¥{book.price.toLocaleString()}</p>

          <ul className="detail-meta-list">
            {book.condition && (
              <li><span className="detail-meta-label">状態</span><span>{book.condition}</span></li>
            )}
            {book.faculty && (
              <li><span className="detail-meta-label">学部</span><span>{book.faculty}</span></li>
            )}
            {book.grade && (
              <li><span className="detail-meta-label">学年</span><span>{book.grade}</span></li>
            )}
            <li><span className="detail-meta-label">キャンパス</span><span>{book.campus}</span></li>
            <li><span className="detail-meta-label">出品者</span><span>{book.seller}</span></li>
          </ul>

          {book.comment && (
            <div className="detail-comment">
              <p className="detail-comment-label">コメント</p>
              <p className="detail-comment-text">{book.comment}</p>
            </div>
          )}

          {trading ? (
            <button className="btn detail-buy-btn detail-buy-btn-trading" disabled>
              取引中
            </button>
          ) : (
            <button className="btn btn-primary detail-buy-btn" onClick={handleBuy}>
              購入する
            </button>
          )}

          {trading && (
            <button className="btn btn-secondary detail-chat-btn" onClick={handleOpenChat}>
              チャットを開く
            </button>
          )}
        </div>
      </main>

      {showNotice && (
        <div className="notice-overlay" onClick={() => setShowNotice(false)}>
          <div className="notice-card" onClick={(e) => e.stopPropagation()}>
            <div className="notice-icon">🎉</div>
            <h2 className="notice-title">出品者に通知が届きました！</h2>
            <p className="notice-text">早速出品者の方とチャットしてみましょう</p>
            <button className="btn btn-primary" onClick={handleOpenChat}>
              チャットを開く
            </button>
            <button className="btn btn-secondary notice-close" onClick={() => setShowNotice(false)}>
              あとで
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookDetail
