let products = {};
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'default';

const GITHUB_TOKEN = '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'; // Replace with your actual token
const GITHUB_OWNER = 'marouanbouchettoy';
const GITHUB_REPO = 'Parapharmacie';
const ORDERS_FILE_PATH = 'assets/data/orders.json';

fetch('assets/data/products.json')
  .then(response => response.json())
  .then(data => {
    products = data.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
    renderCart();
  })
  .catch(error => console.error('Error loading products:', error));

function renderCart() {
  const cart = getCart();
  const el = document.getElementById('cart-content');

  if (!cart.length) {
    el.innerHTML = `
      <div class="card empty-cart">
        <div class="empty-icon">🛒</div>
        <h2 style="color:var(--plum);margin-bottom:0.5rem;font-size:1.8rem;">Votre panier est vide</h2>
        <p style="color:var(--text-light);margin-bottom:1.5rem;">Découvrez nos produits et commencez vos achats.</p>
        <a href="boutique.html" class="btn btn-primary">Découvrir la boutique →</a>
      </div>`;
    return;
  }

  const subtotal = cart.reduce((s,i) => s + i.price * (i.qty||1), 0);
  const shipping = subtotal >= 49 ? 0 : 4.90;
  const total = subtotal + shipping;

        el.innerHTML = `
          <div style="display:grid;grid-template-columns:1fr 320px;gap:2rem;align-items:start;">
            <div class="card">
              <div id="cart-items">
                ${cart.map(item => `
                  <div class="cart-row" id="row-${item.id}">
                    <img src="${products[item.id]?.image || '📦'}" alt="${item.title}" class="cart-img">
                    <div>
                      <div class="cart-product-name">${item.title}</div>
                      <div class="cart-product-cat">€${item.price.toFixed(2).replace('.',',')} / unité</div>
                    </div>
                    <div class="qty-selector" style="transform:scale(0.9);">
                      <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
                      <span class="qty-value">${item.qty||1}</span>
                      <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
                    </div>
                    <div style="font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:600;color:var(--plum);white-space:nowrap;">
                      €${(item.price * (item.qty||1)).toFixed(2).replace('.',',')}
                    </div>
                    <button class="cart-remove" onclick="removeItem(${item.id})">✕</button>
                  </div>
                `).join('')}
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding-top:1rem;margin-top:0.5rem;">
                <a href="boutique.html" class="btn btn-outline btn-sm">← Continuer les achats</a>
                <button onclick="clearCart()" style="background:none;border:none;color:var(--text-light);font-size:0.8rem;cursor:pointer;text-decoration:underline;">Vider le panier</button>
              </div>
            </div>
            <div class="cart-summary">
              <h3 style="color:var(--plum);margin-bottom:1.2rem;">Informations de livraison</h3>
              <form id="order-form" style="margin-bottom:1.5rem;">
                <div style="margin-bottom:1rem;">
                  <label class="form-label" style="display:block;margin-bottom:0.5rem;font-size:0.85rem;color:var(--text-dark);">Nom complet *</label>
                  <input type="text" class="form-input" id="fullname" required style="width:100%;padding:10px 12px;">
                </div>
                <div style="margin-bottom:1rem;">
                  <label class="form-label" style="display:block;margin-bottom:0.5rem;font-size:0.85rem;color:var(--text-dark);">Téléphone *</label>
                  <input type="tel" class="form-input" id="phone" required style="width:100%;padding:10px 12px;">
                </div>
                <div style="margin-bottom:1rem;">
                  <label class="form-label" style="display:block;margin-bottom:0.5rem;font-size:0.85rem;color:var(--text-dark);">Email</label>
                  <input type="email" class="form-input" id="email" style="width:100%;padding:10px 12px;">
                </div>
                <div style="margin-bottom:1rem;">
                  <label class="form-label" style="display:block;margin-bottom:0.5rem;font-size:0.85rem;color:var(--text-dark);">Adresse de livraison *</label>
                  <textarea class="form-textarea" id="address" required style="width:100%;padding:10px 12px;min-height:80px;"></textarea>
                </div>
              </form>
              <h3 style="color:var(--plum);margin-bottom:1.2rem;">Récapitulatif</h3>
              <div class="summary-line"><span>Sous-total</span><span>€${subtotal.toFixed(2).replace('.',',')}</span></div>
              <div class="summary-line">
                <span>Livraison</span>
                <span>${shipping === 0 ? '<span style="color:#1a5c3a;font-weight:600;">Gratuite ✓</span>' : '€' + shipping.toFixed(2).replace('.',',')}</span>
              </div>
              ${shipping > 0 ? `<div style="background:var(--cream);border-radius:var(--radius);padding:10px 12px;margin:8px 0;font-size:0.8rem;color:var(--text-mid);">
                ℹ️ Plus que <strong>€${(49 - subtotal).toFixed(2).replace('.',',')}</strong> pour la livraison gratuite
              </div>` : ''}
              <div class="summary-total"><span>Total</span><span>€${total.toFixed(2).replace('.',',')}</span></div>
              <button class="btn btn-primary" style="width:100%;margin-top:1.2rem;justify-content:center;" onclick="checkout()">
                🔒 Commander (€${total.toFixed(2).replace('.',',')})
              </button>
              <div style="text-align:center;margin-top:0.8rem;">
                <span style="font-size:0.75rem;color:var(--text-light);">💳 CB · Visa · PayPal · Virement</span>
              </div>
            </div>
          </div>`;
}

function changeQty(id, delta) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) return;
  cart[idx].qty = Math.max(1, (cart[idx].qty||1) + delta);
  saveCart(cart);
  renderCart();
}

function removeItem(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
  showToast('Produit retiré du panier');
}

function clearCart() {
  if (confirm('Vider tout le panier ?')) { saveCart([]); renderCart(); }
}

async function checkout() {
  const form = document.getElementById('order-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const fullname = document.getElementById('fullname').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();

  const cart = getCart();
  const subtotal = cart.reduce((s,i) => s + i.price * (i.qty||1), 0);
  const shipping = subtotal >= 49 ? 0 : 4.90;
  const total = subtotal + shipping;

  const order = {
    id: Date.now(),
    customer: { fullname, phone, email, address },
    items: cart,
    subtotal,
    shipping,
    total,
    timestamp: new Date().toISOString()
  };

  try {
    // Get current orders content and SHA
    const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${ORDERS_FILE_PATH}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!getResponse.ok) throw new Error('Failed to fetch current orders file');

    const fileData = await getResponse.json();
    const currentContent = JSON.parse(atob(fileData.content));
    currentContent.push(order);
    const newContent = JSON.stringify(currentContent, null, 2);

    // Update file
    const updateResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${ORDERS_FILE_PATH}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Add new order',
        content: btoa(newContent),
        sha: fileData.sha
      })
    });
    if (!updateResponse.ok) throw new Error('Failed to update orders file');

    console.log('Order saved to GitHub');
    showToast('✅ Commande envoyée ! Merci pour votre achat.', 'success');
    saveCart([]);
    setTimeout(() => renderCart(), 1000);
  } catch (error) {
    console.error('Error saving order to GitHub:', error);
    showToast('❌ Erreur lors de la commande. Veuillez réessayer.');
  }
}