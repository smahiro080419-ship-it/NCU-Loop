import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import { getRoom, sendMessage, sendQR, type ChatRoom } from '../lib/chats'
import { clearTrading, completeListing } from '../lib/listings'

function Chat() {
  const navigate = useNavigate()
  const location = useLocation()
  const roomId: string = location.state?.roomId
  const book = location.state?.book

  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [text, setText] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const detectedRef = useRef(false)
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

  // In-app QR scanner for buyer
  useEffect(() => {
    if (!scanning) return
    detectedRef.current = false
    const reader = new BrowserMultiFormatReader()

    const startReader = async () => {
      // Wait a tick so videoRef is mounted
      await new Promise(r => setTimeout(r, 50))
      if (!videoRef.current) return
      reader
        .decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (detectedRef.current) return
          if (err && !(err instanceof NotFoundException)) return
          if (!result) return
          const text = result.getText()
          if (text.startsWith('NCU-LOOP:')) {
            detectedRef.current = true
            const id = Number(text.split(':')[1])
            completeListing(id)
            setScanning(false)
            setCompleted(true)
          }
        })
        .then(controls => { controlsRef.current = controls })
        .catch(() => setScanning(false))
    }

    startReader()
    return () => { controlsRef.current?.stop() }
  }, [scanning])

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
    sendQR(roomId, myName, `NCU-LOOP:${book.id}`)
    setRoom(getRoom(roomId))
  }

  const handleCancelTrading = () => {
    if (book?.id != null) clearTrading(book.id)
    setShowCancelConfirm(false)
    navigate('/book', { state: { book } })
  }

  if (!room) return null

  const isSeller = myName === room.seller
  const hasQRMessage = room.messages.some(m => m.type === 'qr')

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
        <button className="chat-cancel-btn" onClick={() => setShowCancelConfirm(true)}>
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
                <div className="chat-bubble chat-bubble-qr">
                  <p className="chat-qr-label">取引用QRコード</p>
                  <div className="chat-qr-img">
                    <QRCodeSVG value={msg.data} size={180} />
                  </div>
                  <p className="chat-qr-hint">
                    {isMe
                      ? '購入者の方にこのQRをスキャンしてもらってください'
                      : '下のボタンでQRをスキャンして取引を完了してください'}
                  </p>
                  {!isMe && (
                    <button className="chat-scan-start-btn" onClick={() => setScanning(true)}>
                      QRコードをスキャン
                    </button>
                  )}
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
        {isSeller && !hasQRMessage && (
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
        <button className="chat-send-btn" onClick={handleSend} disabled={!text.trim()} aria-label="送信">
          ▶
        </button>
      </footer>

      {/* In-app QR scanner modal */}
      {scanning && (
        <div className="scan-backdrop" onClick={() => setScanning(false)}>
          <div className="scan-modal" onClick={e => e.stopPropagation()}>
            <div className="scan-modal-header">
              <h3 className="scan-modal-title">QRコードをスキャン</h3>
              <button className="scan-close" onClick={() => setScanning(false)}>✕</button>
            </div>
            <div className="scan-view">
              <video ref={videoRef} className="scan-video" />
              <div className="scan-frame">
                <span className="scan-corner scan-corner-tl" />
                <span className="scan-corner scan-corner-tr" />
                <span className="scan-corner scan-corner-bl" />
                <span className="scan-corner scan-corner-br" />
                <div className="scan-laser" />
              </div>
            </div>
            <p className="scan-hint">出品者のQRコードを枠内に合わせてください</p>
          </div>
        </div>
      )}

      {/* Transaction complete modal */}
      {completed && (
        <div className="notice-overlay">
          <div className="notice-card complete-modal">
            <div className="complete-icon-wrap">
              <span className="complete-check">✓</span>
            </div>
            <h2 className="notice-title">ありがとうございました！</h2>
            <p className="notice-text">
              取引が完了しました。<br />
              またのご利用をお待ちしております
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/campus')}>
              マーケットへ戻る
            </button>
          </div>
        </div>
      )}

      {/* Cancel confirm */}
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
