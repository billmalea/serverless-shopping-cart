<template>
  <div class="cart-page">
    <div class="cart-main">
      <h2>Cart (api-user-1)</h2>
      <div v-if="loading">Loading...</div>
      <div v-else>
        <div v-if="items.length === 0" class="empty">Cart is empty</div>
        <ul class="cart-list">
          <li v-for="it in items" :key="it.ItemId" class="cart-row">
            <div class="left">
              <div class="thumb">
                <img v-if="it.product && it.product.image" :src="it.product.image" :alt="it.product.name" />
                <div v-else class="emoji">🛍️</div>
              </div>
              <div>
                <div class="pname">{{ (it.product && it.product.name) || it.productId }}</div>
                <div class="meta">added: {{ new Date(it.addedAt).toLocaleString() }}</div>
              </div>
            </div>
            <div class="right">
              <div class="qty-group">
                <button class="qty-btn" :disabled="it.updating" @click="changeQty(it, -1)" aria-label="Decrease quantity" title="Decrease">−</button>
                <span class="qty-val">{{ it.quantity }}</span>
                <button class="qty-btn" :disabled="it.updating" @click="changeQty(it, 1)" aria-label="Increase quantity" title="Increase">+</button>
              </div>
              <button class="qty-remove" @click="removeItem(it)" title="Remove item">Remove</button>
            </div>
          </li>
        </ul>

        <div class="actions">
          <button class="btn-primary" @click="checkout">Checkout</button>
          <button class="btn-secondary" @click="migrate">Migrate to api-user-2</button>
        </div>

        <div v-if="result" class="result">{{ result }}</div>
      </div>
    </div>
    <aside class="cart-sidebar">
      <h4>Summary</h4>
      <div class="summary">Items: {{ items.length }}</div>
    </aside>
  </div>
</template>

<script>
import api from '../services/api'
import { showToast } from '../utils/toast'
import { ensureAuthOrRedirect } from '../utils/auth'
export default {
  data() {
    return { items: [], loading: true, result: '' }
  },
  async mounted() {
    await this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const res = await api.listCart('api-user-1')
        const raw = res.items || []
        // fetch product metadata in parallel and merge
        const enriched = await Promise.all(raw.map(async (it) => {
          try {
            const prod = await api.getProduct(it.productId)
            const product = prod && prod.id ? prod : (prod && prod.product ? prod.product : null)
            return { ...it, product }
          } catch (e) {
            return { ...it, product: null }
          }
        }))
        this.items = enriched
        this.updateCartCount()
      } catch (e) {
        console.error(e)
        showToast('Failed to load cart', { type: 'error' })
      } finally {
        this.loading = false
      }
    },
    async checkout() {
      // ensureAuthOrRedirect is async now — await it
      const ok = await ensureAuthOrRedirect()
      if (!ok) return

      // Simulate a checkout for authenticated users
      try {
        // Optionally call the real API: await api.checkout({ userId: 'api-user-1' })
        // For now, simulate success locally
        this.result = 'Checkout simulated: payment processed and order created.'
        this.items = []
        this.updateCartCount()
        showToast('Checkout successful (simulated)', { type: 'success' })
      } catch (e) {
        console.error(e)
        this.result = 'Checkout failed: ' + e.message
        showToast('Checkout failed', { type: 'error' })
      }
    },
    async migrate() {
      const ok = await ensureAuthOrRedirect()
      if (!ok) return
      try {
        const res = await api.migrate({ userId: 'api-user-1', targetUserId: 'api-user-2' })
        this.result = JSON.stringify(res, null, 2)
      } catch (e) {
        console.error(e)
        this.result = 'Migrate failed: ' + e.message
      }
    },

    async removeItem(item) {
      // optimistic remove
      const backup = { ...item }
      this.items = this.items.filter((i) => i.ItemId !== item.ItemId)
      this.updateCartCount()
      try {
        await api.updateCart({ userId: 'api-user-1', productId: item.productId, quantity: 0 })
        showToast('Item removed', { type: 'success' })
      } catch (err) {
        console.error('removeItem error', err)
        // rollback
        this.items.push(backup)
        this.updateCartCount()
        showToast('Failed to remove item', { type: 'error' })
      }
    },
    async changeQty(item, delta) {
      const oldQty = Number(item.quantity)
      const newQty = Math.max(0, oldQty + delta)
      if (newQty === oldQty) return
      // optimistic UI
      item.updating = true
      item.quantity = newQty
      // immediately update cart count
      this.updateCartCount()
      try {
        await api.updateCart({ userId: 'api-user-1', productId: item.productId, quantity: newQty })
        // if zero, remove from UI
        if (newQty === 0) {
          this.items = this.items.filter((i) => i.ItemId !== item.ItemId)
        }
      } catch (err) {
        console.error('changeQty error', err)
        // rollback
        item.quantity = oldQty
        this.updateCartCount()
        showToast('Failed to update quantity', { type: 'error' })
      } finally {
        item.updating = false
      }
    },
    updateCartCount() {
      try {
        const total = this.items.reduce((s, it) => s + Number(it.quantity || 0), 0)
        localStorage.setItem('cart_count', String(total))
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: total } }))
      } catch (_) {}
    }
  }
}
</script>

<style scoped>
.cart-page { display:flex; gap:18px }
.cart-main { flex:1 }
.cart-list { list-style:none; padding:0 }
.cart-row { display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px dashed #eee; align-items:center }
.left { display:flex; gap:12px; align-items:center }
.thumb { width:72px; height:72px; border-radius:10px; overflow:hidden; background:#fafafa; display:flex; align-items:center; justify-content:center; border:1px solid rgba(0,0,0,0.03) }
.thumb img { width:100%; height:100%; object-fit:cover }
.pname { font-weight:700; font-size:14px }
.meta { color:#777; font-size:12px }
.right { display:flex; align-items:center; gap:10px }
.qty-group { display:flex; align-items:center; gap:8px }
.qty-btn { width:36px; height:36px; border-radius:8px; border:1px solid rgba(0,0,0,0.06); background:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer; color:#222 }
.qty-btn:hover { background:#f3f4f6 }
.qty-btn:disabled { opacity:0.5; cursor:not-allowed }
.qty-val { min-width:36px; text-align:center; display:inline-block; font-weight:700; background:#f8fafc; padding:6px 8px; border-radius:6px }
.qty-remove { background:transparent; border:1px solid #eee; color:#d9230f; padding:6px 8px; border-radius:8px; cursor:pointer }
.qty-remove:hover { background:#fff4f4 }
.actions { margin-top:12px; display:flex; gap:8px }
.btn-primary { background:#0b65ff; color:white; border:none; padding:8px 10px; border-radius:6px }
.btn-secondary { background:#eee; color:#222; border:none; padding:8px 10px; border-radius:6px }
.result { margin-top:12px; background:#f6f6f6; padding:8px; border-radius:6px; white-space:pre-wrap }
.cart-sidebar { width:260px; padding:12px; border-left:1px solid #eee }
.summary { color:#333; font-weight:700; margin-top:8px }
.empty { color:#666 }
.qty-btn { border:none; background:#efefef; padding:6px 8px; border-radius:6px; cursor:pointer; font-size:16px }
.qty-val { display:inline-block; min-width:28px; text-align:center; margin:0 8px }
.qty-btn[disabled] { opacity:0.5; cursor:not-allowed }
.price { font-weight:700 }
.subtotal { color:#444 }
</style>
