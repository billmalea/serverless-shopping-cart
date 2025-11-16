export function showToast(message, { duration = 2000, type = 'info' } = {}) {
  try {
    const el = document.createElement('div')
    el.textContent = message
    el.className = 'app-toast ' + type
    el.style.cssText = 'position:fixed;right:20px;bottom:20px;padding:10px 14px;border-radius:8px;color:#fff;z-index:9999;font-weight:600'
    if (type === 'info') el.style.background = '#111'
    if (type === 'success') el.style.background = '#16a34a'
    if (type === 'error') el.style.background = '#ef4444'
    document.body.appendChild(el)
    setTimeout(() => el.remove(), duration)
  } catch (e) {
    // fallback
    try { window.alert(message) } catch (_) {}
  }
}
