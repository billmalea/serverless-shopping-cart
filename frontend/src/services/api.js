// By default use the Vite proxy path `/api/` in development to avoid CORS.
// To bypass the proxy and call a specific endpoint set `VITE_API_URL` in .env.local
const rawApiUrl = import.meta.env.VITE_API_URL
// Ensure API_URL always ends with a trailing slash so concatenation is safe
const API_URL = (rawApiUrl ? (rawApiUrl.endsWith('/') ? rawApiUrl : rawApiUrl + '/') : '/api/')

function authHeaders() {
  const id = localStorage.getItem('cognito_id_token')
  if (id) return { Authorization: 'Bearer ' + id }
  const a = localStorage.getItem('cognito_access_token')
  if (a) return { Authorization: 'Bearer ' + a }
  return {}
}

export default {
  async getProducts() {
    const res = await fetch(API_URL + 'products')
    if (!res.ok) throw new Error('Failed to fetch products')
    const data = await res.json()
    // API returns { products: [...] } — normalize to return the array directly
    return data && data.products ? data.products : data
  },
  async getProduct(productId) {
    const res = await fetch(API_URL + `products/${productId}`)
    if (!res.ok) throw new Error('Failed to fetch product')
    return res.json()
  },
  async addToCart(body) {
    const res = await fetch(API_URL + 'cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Add to cart failed (${res.status}): ${text}`)
    }
    return res.json()
  },
  async updateCart(body) {
    const res = await fetch(API_URL + 'cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) throw new Error('Update cart failed: ' + await res.text())
    return res.json()
  },
  async listCart(userId) {
    const res = await fetch(API_URL + `cart/${userId}`)
    if (!res.ok) throw new Error('List cart failed')
    return res.json()
  },
  async checkout(body) {
    const res = await fetch(API_URL + 'cart/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) })
    if (!res.ok) throw new Error('Checkout failed: ' + await res.text())
    return res.json()
  },
  async migrate(body) {
    const res = await fetch(API_URL + 'cart/migrate', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) })
    if (!res.ok) throw new Error('Migrate failed: ' + await res.text())
    return res.json()
  }
}
