<template>
  <div>
    <h2>Auth Callback</h2>
    <div v-if="message">{{ message }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return { message: 'Processing login response...' }
  },
  mounted() {
    // Use OIDC client to handle Authorization Code callback (PKCE)
    import('../services/oidc').then(async ({ default: oidc, handleCallback }) => {
      try {
        await handleCallback()
        this.message = 'Login successful. Redirecting...'
      } catch (err) {
        console.error('OIDC callback error', err)
        this.message = 'Login failed. See console for details.'
      }

      // Redirect back to root after a short delay
      setTimeout(() => (window.location.href = '/'), 800)
    })
  }
}
</script>
