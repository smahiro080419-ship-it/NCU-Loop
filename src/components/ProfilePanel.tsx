import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

type Profile = {
  email: string
  username: string
  gender: string
  faculty: string
  grade: string
}

const FACULTIES = ['医学部', '経済学部', '総合生命理学部', '芸術工学部', '人文社会学部', 'データサイエンス学部', '看護学部', '薬学部', '未設定']
const GRADES   = ['1年', '2年', '3年', '4年', '5年', '6年', '修士1年', '修士2年', '博士', '未設定']
const GENDERS  = ['男性', '女性', 'その他', '未設定']

type Props = {
  profile: Profile
  onClose: () => void
  onProfileUpdate: (p: Profile) => void
}

export default function ProfilePanel({ profile, onClose, onProfileUpdate }: Props) {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [avatarUrl, setAvatarUrl] = useState<string>(() => localStorage.getItem('ncu_avatar') ?? '')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Profile>(profile)

  const initials = profile.username.slice(0, 2).toUpperCase()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setAvatarUrl(url)
      localStorage.setItem('ncu_avatar', url)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    const updated = { ...draft }
    localStorage.setItem('ncu_profile', JSON.stringify(updated))
    onProfileUpdate(updated)
    setEditing(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('ncu_token')
    localStorage.removeItem('ncu_profile')
    localStorage.removeItem('ncu_avatar')
    navigate('/')
  }

  return (
    <div className="profile-overlay" onClick={onClose}>
      <aside className="profile-panel" onClick={(e) => e.stopPropagation()}>
        <button className="profile-close" onClick={onClose}>✕</button>

        {/* ── Avatar ── */}
        <div className="profile-avatar-wrap" onClick={() => fileRef.current?.click()}>
          {avatarUrl
            ? <img src={avatarUrl} alt="アバター" className="profile-avatar-img" />
            : (
              <div className="profile-avatar">
                <span className="profile-avatar-initials">{initials}</span>
              </div>
            )
          }
          <div className="profile-avatar-edit-badge">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M13 3l4 4-9 9H4v-4L13 3z" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="photo-input-hidden" onChange={handleAvatarChange} />

        {/* ── Name ── */}
        {editing
          ? <input className="profile-name-input" value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} />
          : <h2 className="profile-username">{profile.username}</h2>
        }

        {/* ── Edit / Save buttons ── */}
        {!editing
          ? <button className="profile-edit-btn" onClick={() => { setDraft(profile); setEditing(true) }}>プロフィールを編集</button>
          : (
            <div className="profile-edit-actions">
              <button className="profile-save-btn" onClick={handleSave}>保存</button>
              <button className="profile-cancel-btn" onClick={() => setEditing(false)}>キャンセル</button>
            </div>
          )
        }

        {/* ── Fields ── */}
        <ul className="profile-list">
          <li>
            <span className="profile-label">メールアドレス</span>
            <span className="profile-value">{profile.email}</span>
          </li>
          <li>
            <span className="profile-label">学部</span>
            {editing
              ? <select className="profile-select" value={draft.faculty} onChange={(e) => setDraft({ ...draft, faculty: e.target.value })}>
                  {FACULTIES.map((f) => <option key={f}>{f}</option>)}
                </select>
              : <span className="profile-value">{profile.faculty}</span>
            }
          </li>
          <li>
            <span className="profile-label">学年</span>
            {editing
              ? <select className="profile-select" value={draft.grade} onChange={(e) => setDraft({ ...draft, grade: e.target.value })}>
                  {GRADES.map((g) => <option key={g}>{g}</option>)}
                </select>
              : <span className="profile-value">{profile.grade}</span>
            }
          </li>
          <li>
            <span className="profile-label">性別</span>
            {editing
              ? <select className="profile-select" value={draft.gender} onChange={(e) => setDraft({ ...draft, gender: e.target.value })}>
                  {GENDERS.map((g) => <option key={g}>{g}</option>)}
                </select>
              : <span className="profile-value">{profile.gender}</span>
            }
          </li>
        </ul>

        <button className="btn btn-secondary profile-logout" onClick={handleLogout}>
          ログアウト
        </button>
      </aside>
    </div>
  )
}
