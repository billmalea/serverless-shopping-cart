<template>
  <aside class="cart">
    <h3>Your Cart</h3>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-if="items.length === 0" class="empty">No items</div>
      <ul class="cart-list">
        <li v-for="it in items" :key="it.ItemId" class="cart-item">
          <div>
            <div class="pname">{{ it.productId }}</div>
            <div class="meta">qty: {{ it.quantity }} • {{ new Date(it.addedAt).toLocaleString() }}</div>
          </div>
          <div class="qty">{{ it.quantity }}</div>
        </li>
      </ul>

      <div class="actions">
        <button class="btn-primary" @click="$emit('checkout')">Checkout</button>
        <button class="btn-secondary" @click="$emit('migrate')">Migrate</button>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'CartSidebar',
  props: { items: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } }
}
</script>

<style scoped>
.cart { width:300px; padding:12px; border-left:1px solid #eee; }
.cart h3 { margin-top:0 }
.cart-list { list-style:none; padding:0; margin:0 }
.cart-item { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #eee }
.empty { color:#666 }
.pname { font-weight:600 }
.meta { color:#777; font-size:12px }
.actions { margin-top:12px; display:flex; gap:8px }
.btn-primary { background:#0b65ff; color:white; border:none; padding:8px 10px; border-radius:6px }
.btn-secondary { background:#eee; color:#222; border:none; padding:8px 10px; border-radius:6px }
</style>