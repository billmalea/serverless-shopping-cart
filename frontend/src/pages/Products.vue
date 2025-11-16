<template>
  <div>
    <h2>Products</h2>
    <div v-if="loading">Loading...</div>

    <div v-else class="grid">
      <ProductCard
        v-for="p in products"
        :key="p.id"
        :product="p"
        :quantity="productQuantities[p.id] || 0"
        :loading="productLoading[p.id] === true"
        @add="addToCart"
        @qty-change="changeQty"
      />
    </div>
  </div>
</template>

<script>
import api from '../services/api'
import ProductCard from '../components/ProductCard.vue'
import { showToast } from '../utils/toast'

export default {
  components: { ProductCard },
  data() {
    return { products: [], loading: true, productQuantities: {}, productLoading: {} }
  },
  async mounted() {
    try {
      this.products = await api.getProducts()
      // populate quantities from existing cart
      try {
        const cart = await api.listCart('api-user-1')
        const items = cart.items || []
        items.forEach((it) => { this.productQuantities[it.productId] = Number(it.quantity || 0) })
        // initialize cart_count if not set
        if (!localStorage.getItem('cart_count')) {
          const total = items.reduce((s, it) => s + Number(it.quantity || 0), 0)
          localStorage.setItem('cart_count', String(total))
          window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: total } }))
        }
      } catch (e) {
        // non-fatal
        console.warn('Could not prefill cart quantities', e)
      }
    } catch (e) {
      console.error(e)
      showToast('Failed to load products', { type: 'error' })
    } finally {
      this.loading = false
    }
  },
  methods: {
    async addToCart(productId) {
      try {
        console.debug('addToCart start', productId)
        this.productLoading[productId] = true
        const body = { userId: 'api-user-1', productId, quantity: 1 }
        const res = await api.addToCart(body)
        console.debug('addToCart response', res)
        // prefer server-returned quantity if present
        const serverQty = res && res.item && (res.item.quantity || res.item.Quantity || res.item.qty)
        const qty = serverQty ? Number(serverQty) : 1
        this.productQuantities[productId] = qty
        // update cart count based on current map
        try {
          const total = Object.values(this.productQuantities).reduce((s, v) => s + Number(v || 0), 0)
          localStorage.setItem('cart_count', String(total))
          window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: total } }))
        } catch (_) {}
        showToast('Added to cart', { type: 'success' })
      } catch (e) {
        console.error('addToCart error', e)
        const msg = (e && e.message) ? e.message : 'Add to cart failed (network or CORS)'
        showToast(msg, { type: 'error' })
      } finally {
        try { this.productLoading[productId] = false } catch (_) {}
      }
    },
    async changeQty(productId, delta) {
      const oldQty = Number(this.productQuantities[productId] || 0)
      const newQty = Math.max(0, oldQty + delta)
      if (newQty === oldQty) return
        this.productLoading[productId] = true
        // optimistic update
        this.productQuantities[productId] = newQty
      // update cart count immediately
      try {
        const total = Object.values(this.productQuantities).reduce((s, v) => s + Number(v || 0), 0)
        localStorage.setItem('cart_count', String(total))
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: total } }))
      } catch (_) {}
      try {
        await api.updateCart({ userId: 'api-user-1', productId, quantity: newQty })
      } catch (err) {
        console.error('changeQty error', err)
        // rollback
        this.productQuantities[productId] = oldQty
        try {
          const total = Object.values(this.productQuantities).reduce((s, v) => s + Number(v || 0), 0)
          localStorage.setItem('cart_count', String(total))
          window.dispatchEvent(new CustomEvent('cart-updated', { detail: { count: total } }))
        } catch (_) {}
        showToast('Failed to update quantity', { type: 'error' })
      } finally {
        this.productLoading[productId] = false
      }
    }
  }
}
</script>

<style scoped>
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:18px }
h2 { margin:0 0 12px 0; font-size:20px }
</style>
