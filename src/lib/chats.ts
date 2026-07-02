export type Message = {
  id: number
  sender: string
  text: string
  createdAt: number
  type?: 'text' | 'qr'
  data?: string
}

export type ChatRoom = {
  roomId: string
  bookTitle: string
  seller: string
  buyer: string
  messages: Message[]
}

export function getRoom(roomId: string): ChatRoom | null {
  const raw = localStorage.getItem(`ncu_chat_${roomId}`)
  return raw ? JSON.parse(raw) : null
}

export function initRoom(roomId: string, bookTitle: string, seller: string, buyer: string): ChatRoom {
  const existing = getRoom(roomId)
  if (existing) return existing
  const room: ChatRoom = {
    roomId,
    bookTitle,
    seller,
    buyer,
    messages: [
      {
        id: Date.now(),
        sender: seller,
        text: `こんにちは！「${bookTitle}」に興味を持っていただきありがとうございます。`,
        createdAt: Date.now(),
      },
    ],
  }
  localStorage.setItem(`ncu_chat_${roomId}`, JSON.stringify(room))
  return room
}

export function sendMessage(roomId: string, sender: string, text: string): Message {
  const room = getRoom(roomId)!
  const message: Message = { id: Date.now(), sender, text, createdAt: Date.now() }
  room.messages.push(message)
  localStorage.setItem(`ncu_chat_${roomId}`, JSON.stringify(room))
  return message
}

export function sendQR(roomId: string, sender: string, url: string): Message {
  const room = getRoom(roomId)!
  const message: Message = { id: Date.now(), sender, text: '取引用QRコード', type: 'qr', data: url, createdAt: Date.now() }
  room.messages.push(message)
  localStorage.setItem(`ncu_chat_${roomId}`, JSON.stringify(room))
  return message
}
