import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { getRoom, sendMessage, sendQR, type ChatRoom } from '../lib/chats'
import { clearTrading } from '../lib/listings'

function Chat() {
  const navigate = useNavigate()
  const location = useLocation()
  const roomId: string = location.state?.roomId
  const book = location.state?.book

  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [text, setText] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const raw = localStorage.getItem('ncu_profile')
  const profile = raw ? JSON.parse(raw) : {}
  const myName: string = profile.username || '匿名'

  useEffect(() => {
    if (!roomId) { navigate('/market'); return }
    setRoom(getRoom(roomId))
  }, [roomId, navigate])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [room?.messages.length])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || !roomId) return
    sendMessage(roomId, myName, trimmed)
    setRoom(getRoom(roomId))
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleIssueQR = () => {
    if (!book?.id || !roomId) return
    const base = import.meta.env.BASE_URL
    const url = `${window.location.origin}${base}#/complete?listingId=${book.id}`
    sendQR(roomId, myName, url)
    setRoom(getRoom(roomId))
  }

  const handleCancelTrading = () => {
    if (book?.id != null) clearTrading(book.id)
    setShowCancelConfirm(false)
    navigate('/book', { state: { book } })
  }

  if (!room) return null

  const isSeller = myName === room.seller

  return (
    <div className="chat-layout">
      <header className="market-header">
        <button className="market-back-btn" onClick={() => navigate('/book', { state: { book } })} aria-label="戻る">
          ←
        </button>
        <div className="chat-header-info">
          <span className="market-header-title">{room.seller}</span>
          <span className="chat-header-sub">{room.bookTitle}</span>
        </div>
        <button
          className="chat-cancel-btn"
          onClick={() => setShowCancelConfirm(true)}
          aria-label="取引を中止する"
        >
          取引中止
        </button>
      </header>

      <main className="chat-messages">
        {room.messages.map((msg) => {
          const isMe = msg.sender === myName
          if (msg.type === 'qr' && msg.data) {
            return (
              <div key={msg.id} className={`chat-bubble-wrap ${isMe ? 'chat-bubble-wrap-me' : ''}`}>
                {!isMe && <span className="chat-sender">{msg.sender}</span>}
                <div className={`chat-bubble chat-bubble-qr ${isMe ? 'chat-bubble-me' : 'chat-bubble-other'}`}>
                  <p className="chat-qr-label">取引用QRコード</p>
                  <div className="chat-qr-img">
                    <QRCodeSVG value={msg.data} size={180} />
                  </div>
                  <p className="chat-qr-hint">購入者の方はこちらをスキャンしてください</p>
                </div>
              </div>
            )
          }
          return (
            <div key={msg.id} className={`chat-bubble-wrap ${isMe ? 'chat-bubble-wrap-me' : ''}`}>
              {!isMe && <span className="chat-sender">{msg.sender}</span>}
              <div className={`chat-bubble ${isMe ? 'chat-bubble-me' : 'chat-bubble-other'}`}>
                {msg.text}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </main>

      <footer className="chat-footer">
        {isSeller && (
          <button className="chat-qr-btn" onClick={handleIssueQR} title="取引完了QRを発行">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <path d="M14 14h2v2h-2zM18 14h3M14 18h1M17 18h4M14 21h3M19 21h2"/>
            </svg>
          </button>
        )}
        <textarea
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力..."
          rows={1}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!text.trim()}
          aria-label="送信"
        >
          ▶
        </button>
      </footer>

      {showCancelConfirm && (
        <div className="notice-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="notice-card" onClick={(e) => e.stopPropagation()}>
            <div className="notice-icon">⚠️</div>
            <h2 className="notice-title">取引を中止しますか？</h2>
            <p className="notice-text">商品は再び「購入可能」に戻ります</p>
            <button className="btn chat-cancel-confirm-btn" onClick={handleCancelTrading}>
              取引を中止する
            </button>
            <button className="btn btn-secondary notice-close" onClick={() => setShowCancelConfirm(false)}>
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat
