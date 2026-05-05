$(document).ready(function(){
  $('#header').load('assets/inc/header.html');
  $('#sidebar').load('assets/inc/sidebar.html');
  $('#footer').load('assets/inc/footer.html');
});

// ── Cart Utilities ──
function getCart() {
  return JSON.parse(localStorage.getItem('panier') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('panier', JSON.stringify(cart));
}
function addToCart(product) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx > -1) { cart[idx].qty = (cart[idx].qty || 1) + 1; }
  else { cart.push({ ...product, qty: 1 }); }
  saveCart(cart);
  showToast('🛒 ' + product.title + ' ajouté au panier!', 'gold-toast');
  updateCartBadge();
}
function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((s,i) => s + (i.qty||1), 0);
  const el = document.getElementById('cart-count');
  if (el) {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}
function showToast(msg, type = '') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
