export type WantedPost = {
  id: string
  campus: string
  bookTitle: string
  author: string
  faculty: string
  note: string
  username: string
  createdAt: number
}

const KEY = 'ncu_wanted'

export function getWanted(): WantedPost[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

export function addWanted(post: Omit<WantedPost, 'id' | 'createdAt'>): WantedPost {
  const posts = getWanted()
  const next: WantedPost = { ...post, id: crypto.randomUUID(), createdAt: Date.now() }
  localStorage.setItem(KEY, JSON.stringify([next, ...posts]))
  return next
}

export function deleteWanted(id: string) {
  localStorage.setItem('ncu_wanted', JSON.stringify(getWanted().filter(p => p.id !== id)))
}
