export type Listing = {
  id: number
  title: string
  price: number
  campus: string
  condition: string
  comment: string
  photoUrl: string
  seller: string
  createdAt: number
}

export function getListings(): Listing[] {
  const raw = localStorage.getItem('ncu_listings')
  return raw ? JSON.parse(raw) : []
}

export function addListing(listing: Omit<Listing, 'id' | 'createdAt'>): Listing {
  const listings = getListings()
  const newListing: Listing = { ...listing, id: Date.now(), createdAt: Date.now() }
  listings.unshift(newListing)
  localStorage.setItem('ncu_listings', JSON.stringify(listings))
  return newListing
}
