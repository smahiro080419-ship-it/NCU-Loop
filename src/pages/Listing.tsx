import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { addListing } from '../lib/listings'
import BarcodeScanner, { type BookInfo } from '../components/BarcodeScanner'

const CAMPUSES = ['桜山キャンパス', '滝子キャンパス', '田辺通キャンパス', '北千種キャンパス']
const CONDITIONS = ['良好', '普通', '傷あり']

function Listing() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [campus, setCampus] = useState('')
  const [condition, setCondition] = useState('')
  const [comment, setComment] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanFlash, setScanFlash] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleScanned = (book: BookInfo) => {
    setScanning(false)
    setTitle(book.title)
    if (book.author && !comment) setComment(`著者：${book.author}`)
    // flash effect to show the field was filled
    setScanFlash(true)
    setTimeout(() => setScanFlash(false), 1200)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const raw = localStorage.getItem('ncu_profile')
    const profile = raw ? JSON.parse(raw) : {}
    addListing({ title, price: Number(price), campus, condition, comment, photoUrl, seller: profile.username || '匿名' })
    navigate('/market')
  }

  return (
    <div className="market-layout">
      <header className="market-header">
        <button className="market-back-btn" onClick={() => navigate(-1)} aria-label="戻る">←</button>
        <span className="market-header-title">教科書を出品する</span>
      </header>

      <main className="listing-main">
        <form className="listing-form" onSubmit={handleSubmit}>

          <div className="photo-upload-area" onClick={() => fileInputRef.current?.click()}>
            {photoUrl ? (
              <img src={photoUrl} alt="プレビュー" className="photo-preview" />
            ) : (
              <div className="photo-placeholder">
                <span className="photo-placeholder-icon">📷</span>
                <span className="photo-placeholder-text">写真を追加</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="photo-input-hidden" onChange={handlePhoto} />
          </div>

          {photoUrl && (
            <button type="button" className="photo-remove-btn"
              onClick={() => { setPhotoUrl(''); if (fileInputRef.current) fileInputRef.current.value = '' }}>
              写真を削除
            </button>
          )}

          {/* ── title field with barcode button ── */}
          <div className="field">
            <span>教科書タイトル</span>
            <div className="title-input-row">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：解剖学テキスト"
                className={scanFlash ? 'scan-flash' : ''}
              />
              <button type="button" className="barcode-btn" onClick={() => setScanning(true)} title="バーコードをスキャン">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 9V6a1 1 0 011-1h3M3 15v3a1 1 0 001 1h3M15 4h3a1 1 0 011 1v3M15 20h3a1 1 0 001-1v-3"/>
                  <line x1="7" y1="8" x2="7" y2="16"/><line x1="10" y1="8" x2="10" y2="16"/>
                  <line x1="13" y1="8" x2="13" y2="16"/><line x1="16" y1="8" x2="16" y2="11"/>
                  <line x1="16" y1="13" x2="16" y2="16"/>
                </svg>
              </button>
            </div>
          </div>

          <label className="field">
            <span>価格（円）</span>
            <input type="number" required min={0} value={price}
              onChange={(e) => setPrice(e.target.value)} placeholder="例：1000" />
          </label>

          <label className="field">
            <span>キャンパス</span>
            <select required value={campus} onChange={(e) => setCampus(e.target.value)}>
              <option value="">選択してください</option>
              {CAMPUSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="field">
            <span>状態</span>
            <select required value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option value="">選択してください</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="field">
            <span>コメント（任意）</span>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="書き込みあり、など" className="listing-textarea" rows={3} />
          </label>

          <button type="submit" className="btn btn-primary listing-submit" disabled={submitting}>
            {submitting ? '出品中...' : '出品する'}
          </button>
        </form>
      </main>

      {scanning && (
        <BarcodeScanner
          onDetected={handleScanned}
          onClose={() => setScanning(false)}
        />
      )}
    </div>
  )
}

export default Listing
