let currentCurrency = 'MAD';
let currencySymbol = 'MAD';
let exchangeRate = 1; // MAD as base

async function setCurrency() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const country = data.country_name;
    if (country === 'Morocco') {
      currentCurrency = 'MAD';
      currencySymbol = 'MAD';
      exchangeRate = 1;
    } else {
      currentCurrency = 'EUR';
      currencySymbol = '€';
      exchangeRate = 0.1; // Approximate 1 MAD = 0.1 EUR
    }
  } catch (error) {
    // Default to MAD
    console.log('Error detecting location:', error);
  }
}

function formatPrice(price) {
  const converted = price * exchangeRate;
  return currencySymbol + converted.toFixed(2).replace('.', ',');
}

$(document).ready(function(){
  $('#header').load('assets/inc/header.html');
  $('#sidebar').load('assets/inc/sidebar.html');
  $('#footer').load('assets/inc/footer.html');
  setCurrency();
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
