import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { addListing } from '../lib/listings'

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const raw = localStorage.getItem('ncu_profile')
    const profile = raw ? JSON.parse(raw) : {}
    addListing({
      title,
      price: Number(price),
      campus,
      condition,
      comment,
      photoUrl,
      seller: profile.username || '匿名',
    })
    navigate('/market')
  }

  return (
    <div className="market-layout">
      <header className="market-header">
        <button className="market-back-btn" onClick={() => navigate('/market')} aria-label="戻る">
          ←
        </button>
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="photo-input-hidden"
              onChange={handlePhoto}
            />
          </div>

          {photoUrl && (
            <button
              type="button"
              className="photo-remove-btn"
              onClick={() => { setPhotoUrl(''); if (fileInputRef.current) fileInputRef.current.value = '' }}
            >
              写真を削除
            </button>
          )}

          <label className="field">
            <span>教科書タイトル</span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：解剖学テキスト"
            />
          </label>

          <label className="field">
            <span>価格（円）</span>
            <input
              type="number"
              required
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="例：1000"
            />
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
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="書き込みあり、など"
              className="listing-textarea"
              rows={3}
            />
          </label>

          <button type="submit" className="btn btn-primary listing-submit" disabled={submitting}>
            {submitting ? '出品中...' : '出品する'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default Listing
