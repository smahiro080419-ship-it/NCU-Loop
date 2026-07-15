import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import twilio from 'twilio'

const PORT = process.env.PORT || 4000
const REQUIRED_DOMAIN = '@ed.nagoya-cu.ac.jp'
const INVALID_DOMAIN_MESSAGE =
  'このアプリは名古屋市立大学発行のメールアドレス（@ed.nagoya-cu.ac.jp）が必要です。'

const GOOGLE_SIGNIN_CLIENT_ID = process.env.GOOGLE_SIGNIN_CLIENT_ID
const googleSignInClient = GOOGLE_SIGNIN_CLIENT_ID ? new OAuth2Client(GOOGLE_SIGNIN_CLIENT_ID) : null

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM        = process.env.TWILIO_FROM  // e.g. +12345678901
const twilioClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN)
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',').map(o => o.trim())

// In-memory stores (demo — reset on restart)
const pendingSignups = new Map() // phone -> { email, passwordHash, username, gender, faculty, grade, otp, createdAt }
const users = new Map()          // email -> { passwordHash, username, gender, faculty, grade }

const app = express()
app.use(cors({ origin: ALLOWED_ORIGINS }))
app.use(express.json())

// ── helpers ──────────────────────────────────────────────
function normalizePhone(raw) {
  const digits = String(raw).replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 11) return '+81' + digits.slice(1)
  if (digits.startsWith('81') && digits.length === 12)  return '+' + digits
  return null
}

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// ── Signup step 1: send OTP ───────────────────────────────
app.post('/api/signup', async (req, res) => {
  const { phone, email, username, gender, faculty, grade } = req.body || {}

  if (!phone || !email || !username || !gender || !faculty || !grade) {
    return res.status(400).json({ ok: false, message: 'すべての項目を入力してください。' })
  }

  if (!email.endsWith(REQUIRED_DOMAIN)) {
    return res.status(400).json({ ok: false, message: INVALID_DOMAIN_MESSAGE })
  }

  if (users.has(email)) {
    return res.status(409).json({ ok: false, message: 'このメールアドレスはすでに登録されています。' })
  }

  const normalized = normalizePhone(phone)
  if (!normalized) {
    return res.status(400).json({ ok: false, message: '電話番号の形式が正しくありません（例: 09012345678）。' })
  }

  const otp = generateOTP()
  const passwordHash = crypto.createHash('sha256').update(email).digest('hex')
  pendingSignups.set(normalized, { email, passwordHash, username, gender, faculty, grade, otp, createdAt: Date.now() })

  console.log(`[OTP] ${normalized} → ${otp}`)

  if (!twilioClient || !TWILIO_FROM) {
    // Dev fallback: return OTP in response (remove in production)
    return res.status(200).json({ ok: true, devOtp: otp, message: 'SMS送信は未設定です（開発用）。' })
  }

  try {
    await twilioClient.messages.create({
      body: `【NCU Loop】認証コード: ${otp}\n5分以内に入力してください。`,
      from: TWILIO_FROM,
      to: normalized,
    })
    return res.status(200).json({ ok: true, message: `${phone} にSMSを送信しました。` })
  } catch (err) {
    console.error('Twilio error', err)
    pendingSignups.delete(normalized)
    return res.status(502).json({ ok: false, message: 'SMSの送信に失敗しました。電話番号をご確認ください。' })
  }
})

// ── Signup step 2: verify OTP ─────────────────────────────
app.post('/api/signup/verify', (req, res) => {
  const { phone, otp } = req.body || {}
  if (!phone || !otp) {
    return res.status(400).json({ ok: false, message: '電話番号と認証コードを入力してください。' })
  }

  const normalized = normalizePhone(phone)
  const pending = normalized ? pendingSignups.get(normalized) : null

  if (!pending) {
    return res.status(400).json({ ok: false, message: '認証情報が見つかりません。最初からやり直してください。' })
  }

  const expiredMs = 5 * 60 * 1000
  if (Date.now() - pending.createdAt > expiredMs) {
    pendingSignups.delete(normalized)
    return res.status(400).json({ ok: false, message: '認証コードの有効期限が切れました。もう一度登録してください。' })
  }

  if (pending.otp !== String(otp).trim()) {
    return res.status(400).json({ ok: false, message: '認証コードが正しくありません。' })
  }

  const { email, passwordHash, username, gender, faculty, grade } = pending
  pendingSignups.delete(normalized)
  users.set(email, { passwordHash, username, gender, faculty, grade })

  const sessionToken = crypto.randomBytes(24).toString('hex')
  return res.status(200).json({ ok: true, token: sessionToken, email, username, gender, faculty, grade })
})

// ── Login: university email = password ────────────────────
app.post('/api/login', (req, res) => {
  const { email } = req.body || {}

  if (!email) {
    return res.status(400).json({ ok: false, message: 'メールアドレスを入力してください。' })
  }

  if (!email.endsWith(REQUIRED_DOMAIN)) {
    return res.status(400).json({ ok: false, message: INVALID_DOMAIN_MESSAGE })
  }

  const user = users.get(email)
  if (!user) {
    return res.status(401).json({ ok: false, message: 'このメールアドレスは登録されていません。まず新規登録してください。' })
  }

  // email itself is the password — verify hash
  const hash = crypto.createHash('sha256').update(email).digest('hex')
  if (hash !== user.passwordHash) {
    return res.status(401).json({ ok: false, message: 'ログインできませんでした。' })
  }

  const sessionToken = crypto.randomBytes(24).toString('hex')
  const { passwordHash: _omit, ...profile } = user
  return res.status(200).json({ ok: true, token: sessionToken, email, ...profile })
})

// ── Google Sign-In ────────────────────────────────────────
app.post('/api/auth/google', async (req, res) => {
  if (!googleSignInClient) {
    return res.status(503).json({ ok: false, message: 'Google認証が設定されていません。' })
  }

  const { credential } = req.body || {}
  if (!credential) return res.status(400).json({ ok: false, message: 'トークンがありません。' })

  try {
    const ticket = await googleSignInClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_SIGNIN_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    const email = payload.email
    const name = payload.name || email.split('@')[0]

    if (!email.endsWith(REQUIRED_DOMAIN)) {
      return res.status(403).json({ ok: false, message: INVALID_DOMAIN_MESSAGE })
    }

    if (!users.has(email)) {
      const passwordHash = crypto.createHash('sha256').update(email).digest('hex')
      users.set(email, { passwordHash, username: name, gender: '未設定', faculty: '未設定', grade: '未設定' })
    }

    const user = users.get(email)
    const sessionToken = crypto.randomBytes(24).toString('hex')
    const { passwordHash: _omit, ...profile } = user
    return res.status(200).json({ ok: true, token: sessionToken, email, ...profile })
  } catch (err) {
    console.error('Google auth error', err)
    return res.status(401).json({ ok: false, message: 'Google認証に失敗しました。' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ twilioReady: Boolean(twilioClient), commit: process.env.RENDER_GIT_COMMIT || null })
})

app.listen(PORT, () => console.log(`NCU Loop API on http://localhost:${PORT}`))
