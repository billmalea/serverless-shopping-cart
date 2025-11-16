<template>
  <div class="card">
    <div class="card-img">
      <img v-if="product.image" :src="product.image" :alt="product.name" />
      <div v-else class="emoji">🛍️</div>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ product.name }}</h3>
      <p class="card-desc">{{ product.description }}</p>
      <div class="card-footer">
        <div>
          <div class="price" v-if="product.price">${{ product.price.toFixed(2) }}</div>
        </div>
        <div class="actions">
          <div v-if="quantity > 0" class="qty-controls">
            <button class="qty-btn" :disabled="loading" @click="$emit('qty-change', product.id, -1)" aria-label="Decrease quantity" title="Decrease quantity">−</button>
            <span class="qty-val" aria-live="polite">{{ quantity }}</span>
            <button class="qty-btn" :disabled="loading" @click="$emit('qty-change', product.id, 1)" aria-label="Increase quantity" title="Increase quantity">+</button>
          </div>
          <button v-else class="btn" @click="$emit('add', product.id)" :disabled="loading">
            <span v-if="loading" class="spinner" aria-hidden="true"></span>
            <span v-if="!loading">Add to cart</span>
            <span v-else class="sr">Adding</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: { type: Object, required: true },
    quantity: { type: Number, default: 0 },
    loading: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.card { display:flex; flex-direction:column; gap:8px; padding:0; border-radius:10px; background:white; box-shadow:0 6px 18px rgba(13,38,59,0.06); overflow:hidden; border:1px solid rgba(0,0,0,0.04) }
.card-img { width:100%; height:180px; background:#fafafa; display:flex; align-items:center; justify-content:center; overflow:hidden }
.card-img img { width:100%; height:100%; object-fit:cover; display:block }
.card-img .emoji { font-size:48px }
.card-body { padding:12px 14px }
.card-title { margin:0 0 6px 0; font-size:16px; font-weight:600 }
.card-desc { margin:0 0 10px 0; color:#666; font-size:13px; min-height:36px }
.card-footer { display:flex; align-items:center; justify-content:space-between }
.price { font-weight:700; color:#111; font-size:15px }
.btn { background:#ff6b00; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:600; display:inline-flex; align-items:center; gap:8px }
.btn:hover { background:#e85b00 }
.actions { display:flex; align-items:center }
.qty-controls { display:flex; align-items:center; gap:6px }
.qty-btn { width:34px; height:34px; border-radius:8px; border:1px solid rgba(0,0,0,0.06); background:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer; color:#222 }
.qty-btn:hover { background:#f3f4f6 }
.qty-btn:disabled { opacity:0.5; cursor:not-allowed }
.qty-val { min-width:36px; text-align:center; display:inline-block; font-weight:600; background:#f8fafc; padding:6px 8px; border-radius:6px }
.spinner { width:14px; height:14px; border-radius:50%; border:2px solid rgba(255,255,255,0.35); border-top-color:#fff; animation:spin 800ms linear infinite }
.sr { position:absolute; left:-9999px }

@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
</style>