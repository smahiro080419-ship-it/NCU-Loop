import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'

export type BookInfo = {
  title: string
  author: string
}

type Props = {
  onDetected: (book: BookInfo) => void
  onClose: () => void
}

async function fetchBook(isbn: string): Promise<BookInfo | null> {
  // ① OpenBD（日本語書籍に強い）
  try {
    const res = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`)
    const data = await res.json()
    const summary = data?.[0]?.summary
    if (summary?.title) {
      return { title: summary.title, author: summary.author ?? '' }
    }
  } catch { /* fall through */ }

  // ② Google Books（洋書・フォールバック）
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    )
    const data = await res.json()
    const info = data?.items?.[0]?.volumeInfo
    if (info?.title) {
      return { title: info.title, author: (info.authors ?? []).join('、') }
    }
  } catch { /* fall through */ }

  return null
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const [status, setStatus] = useState<'scanning' | 'fetching' | 'error'>('scanning')
  const [errorMsg, setErrorMsg] = useState('')
  const detectedRef = useRef(false)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, async (result, err) => {
        if (detectedRef.current) return
        if (err && !(err instanceof NotFoundException)) return

        if (result) {
          const text = result.getText()
          // ISBN-13 は 978 or 979 から始まる13桁
          if (!/^97[89]\d{10}$/.test(text)) return
          detectedRef.current = true
          setStatus('fetching')

          const book = await fetchBook(text)
          if (book) {
            onDetected(book)
          } else {
            setErrorMsg('書籍情報が見つかりませんでした。手動で入力してください。')
            setStatus('error')
            detectedRef.current = false
          }
        }
      })
      .then(controls => { controlsRef.current = controls })
      .catch(() => {
        setErrorMsg('カメラへのアクセスが許可されていません。')
        setStatus('error')
      })

    return () => { controlsRef.current?.stop() }
  }, [onDetected])

  return (
    <div className="scan-backdrop" onClick={onClose}>
      <div className="scan-modal" onClick={e => e.stopPropagation()}>

        <div className="scan-modal-header">
          <h3 className="scan-modal-title">バーコードをスキャン</h3>
          <button className="scan-close" onClick={onClose}>✕</button>
        </div>

        {/* camera view */}
        <div className="scan-view">
          <video ref={videoRef} className="scan-video" />

          {/* targeting frame */}
          <div className="scan-frame">
            <span className="scan-corner scan-corner-tl" />
            <span className="scan-corner scan-corner-tr" />
            <span className="scan-corner scan-corner-bl" />
            <span className="scan-corner scan-corner-br" />
            {status === 'scanning' && <div className="scan-laser" />}
          </div>

          {/* overlay states */}
          {status === 'fetching' && (
            <div className="scan-state-overlay">
              <div className="scan-spinner" />
              <p>書籍情報を取得中…</p>
            </div>
          )}
          {status === 'error' && (
            <div className="scan-state-overlay scan-state-error">
              <p className="scan-error-icon">⚠️</p>
              <p>{errorMsg}</p>
              <button className="scan-retry" onClick={() => { detectedRef.current = false; setStatus('scanning') }}>
                もう一度スキャン
              </button>
            </div>
          )}
        </div>

        <p className="scan-hint">本の裏表紙のバーコードを枠内に合わせてください</p>
      </div>
    </div>
  )
}
