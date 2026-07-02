import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getRoom, sendMessage, type ChatRoom } from '../lib/chats'
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

  const handleCancelTrading = () => {
    if (book?.id != null) clearTrading(book.id)
    setShowCancelConfirm(false)
    navigate('/book', { state: { book } })
  }

  if (!room) return null

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
