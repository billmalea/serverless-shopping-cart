<template>
  <div class="page">
    <header class="site-header">
      <div class="brand">
        <h1>Serverless Shopping Cart</h1>
        <small class="tag">Demo</small>
      </div>
      <div class="header-actions">
        <nav class="site-nav-inline">
          <router-link to="/">Products</router-link>
          <router-link to="/cart" style="margin-left:12px">Cart <span class="cart-badge" v-if="cartCount">{{ cartCount }}</span></router-link>
        </nav>
        <div style="margin-left:12px">
          <button v-if="!isAuthenticated" class="link-btn" @click="login">Login</button>
          <button v-else class="link-btn" @click="logout">Logout</button>
        </div>
      </div>
    </header>

    <main class="content">
      <router-view />
    </main>

    <footer class="site-footer">
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      apiUrl: import.meta.env.VITE_API_URL || 'https://<api-url>',
      cartCount: 0
    }
  },
  mounted() {
    // initialize cart count from localStorage
    try {
      const c = parseInt(localStorage.getItem('cart_count') || '0', 10)
      this.cartCount = isNaN(c) ? 0 : c
    } catch (_) { this.cartCount = 0 }
    // listen for updates
    this._onCartUpdated = (e) => { this.cartCount = e && e.detail && e.detail.count ? e.detail.count : parseInt(localStorage.getItem('cart_count')||'0',10) }
    window.addEventListener('cart-updated', this._onCartUpdated)
  },
  beforeUnmount() {
    window.removeEventListener('cart-updated', this._onCartUpdated)
  },
  computed: {
    isAuthenticated() {
      return !!localStorage.getItem('cognito_id_token')
    }
  },
  methods: {
    login() {
      // Redirect to Cognito Hosted UI
      const domain = import.meta.env.VITE_COGNITO_DOMAIN
      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID
      const redirect = import.meta.env.VITE_COGNITO_REDIRECT || window.location.origin + '/callback'
      const scope = 'openid email' // adjust scopes if needed
      const url = `https://${domain}/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&scope=${encodeURIComponent(scope)}`
      window.location.href = url
    },
    logout() {
      localStorage.removeItem('cognito_id_token')
      localStorage.removeItem('cognito_access_token')
      localStorage.removeItem('cognito_refresh_token')
      window.location.reload()
    }
  }
}
</script>

<style>
:root { --max-width:1100px }
body { font-family: Inter, Arial, sans-serif; background:#f7f8fb; }
.page { max-width: var(--max-width); margin: 18px auto; padding: 18px; background: transparent }
.site-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px }
.site-header h1 { margin:0; font-size:20px }
.brand { display:flex; align-items:baseline; gap:8px }
.brand .tag { color:#666; font-size:12px }
.header-actions .link-btn { background:transparent; border:1px solid #007acc; color:#007acc; padding:6px 10px; border-radius:6px; cursor:pointer }
.site-nav { margin-bottom:16px }
.site-nav-inline a { color:#007acc; text-decoration:none; margin-right:10px }
.cart-badge { background:#ff6b00; color:#fff; padding:2px 8px; border-radius:999px; font-size:12px; margin-left:6px }
.content { min-height:60vh; display:block }
.site-footer { margin-top:28px; color:#666; font-size:13px }
.muted { margin-top:6px }
</style>
