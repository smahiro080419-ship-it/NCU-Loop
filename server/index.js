import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

const PORT = process.env.PORT || 4000
const APP_URL = process.env.APP_URL || 'http://localhost:5173'
const GMAIL_USER = process.env.GMAIL_USER
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const REQUIRED_DOMAIN = '@ed.nagoya-cu.ac.jp'
const INVALID_DOMAIN_MESSAGE =
  '申し訳ございません。このアプリは名古屋市立大学発行のメールアドレスでなければログインできません。もう一度メールアドレスをお確かめになるか、別のアドレスを入力してください。'

const GOOGLE_SIGNIN_CLIENT_ID = process.env.GOOGLE_SIGNIN_CLIENT_ID
const gmailReady = Boolean(GMAIL_USER && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN)
const googleSignInClient = GOOGLE_SIGNIN_CLIENT_ID ? new OAuth2Client(GOOGLE_SIGNIN_CLIENT_ID) : null

const oauth2Client = gmailReady
  ? new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 'https://developers.google.com/oauthplayground')
  : null
if (oauth2Client) {
  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN })
}
const gmail = oauth2Client ? google.gmail({ version: 'v1', auth: oauth2Client }) : null

function buildRawMessage({ to, subject, html }) {
  const message = [
    `From: NCU Loop <${GMAIL_USER}>`,
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    html,
  ].join('\r\n')

  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())

// In-memory stores — data is lost on server restart (demo only).
const pendingSignups = new Map() // token -> { email, passwordHash, username, gender, faculty, grade, createdAt }
const users = new Map() // email -> { passwordHash, username, gender, faculty, grade }

const app = express()
app.use(cors({ origin: ALLOWED_ORIGINS }))
app.use(express.json())

app.post('/api/signup', async (req, res) => {
  const { email, password, username, gender, faculty, grade } = req.body || {}

  if (!email || !password || !username || !gender || !faculty || !grade) {
    return res.status(400).json({ ok: false, message: 'すべての項目を入力してください。' })
  }

  if (!email.includes(REQUIRED_DOMAIN)) {
    return res.status(400).json({ ok: false, message: INVALID_DOMAIN_MESSAGE })
  }

  const token = crypto.randomBytes(24).toString('hex')
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
  pendingSignups.set(token, { email, passwordHash, username, gender, faculty, grade, createdAt: Date.now() })

  const continueUrl = `${APP_URL}/#/verify?token=${token}`
  console.log(`[dev] verification link for ${email}: ${continueUrl}`)

  if (!gmail) {
    console.error('Gmail API credentials are not set — cannot send email')
    return res.status(500).json({ ok: false, message: 'メール送信が設定されていません。サーバー管理者にお問い合わせください。' })
  }

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: buildRawMessage({
          to: email,
          subject: 'NCU Loop 登録の確認',
          html: `
            <div style="font-family: sans-serif; color: #16284a;">
              <h2>NCU Loopへのご登録ありがとうございます</h2>
              <p>以下のリンクをクリックして、登録を完了してください。</p>
              <p>
                <a href="${continueUrl}" style="display:inline-block; padding:12px 20px; background:#2f6fc4; color:#fff; border-radius:8px; text-decoration:none;">
                  登録を続ける
                </a>
              </p>
              <p>このリンクに心当たりがない場合は、本メールを破棄してください。</p>
            </div>
          `,
        }),
      },
    })
  } catch (err) {
    console.error('Failed to send signup email', err)
    return res.status(502).json({ ok: false, message: 'メールの送信に失敗しました。しばらくしてから再度お試しください。' })
  }

  return res.status(200).json({ ok: true, message: '確認メールを送信しました。メールをご確認ください。', continueUrl })
})

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'メールアドレスとパスワードを入力してください。' })
  }

  const user = users.get(email)
  if (!user) {
    return res.status(401).json({ ok: false, message: 'メールアドレスまたはパスワードが違います。' })
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex')
  if (hash !== user.passwordHash) {
    return res.status(401).json({ ok: false, message: 'メールアドレスまたはパスワードが違います。' })
  }

  const sessionToken = crypto.randomBytes(24).toString('hex')
  const { passwordHash: _omit, ...profile } = user
  return res.status(200).json({ ok: true, token: sessionToken, email, ...profile })
})

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
      users.set(email, { username: name, gender: '未設定', faculty: '未設定', grade: '未設定' })
    }

    const user = users.get(email)
    const sessionToken = crypto.randomBytes(24).toString('hex')
    const { passwordHash: _omit, ...profile } = user
    return res.status(200).json({ ok: true, token: sessionToken, email, ...profile })
  } catch (err) {
    console.error('Google auth error', err)
    return res.status(401).json({ ok: false, message: 'Google認証に失敗しました。もう一度お試しください。' })
  }
})

app.get('/api/health', (req, res) => {
  res.json({
    gmailReady,
    commit: process.env.RENDER_GIT_COMMIT || null,
  })
})

app.get('/api/verify', (req, res) => {
  const { token } = req.query

  if (!token || !pendingSignups.has(token)) {
    return res.status(400).json({ ok: false, message: 'リンクが無効、または期限切れです。' })
  }

  const { email, passwordHash, username, gender, faculty, grade } = pendingSignups.get(token)
  pendingSignups.delete(token)
  users.set(email, { passwordHash, username, gender, faculty, grade })

  return res.status(200).json({ ok: true, email })
})

app.listen(PORT, () => {
  console.log(`NCU Loop API listening on http://localhost:${PORT}`)
})
