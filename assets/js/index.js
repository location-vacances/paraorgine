let featuredProducts = [];

fetch('assets/data/products.json')
  .then(response => response.json())
  .then(data => {
    featuredProducts = data.slice(0, 3); // First 3 products as featured
    renderFeaturedProducts();
  })
  .catch(error => console.error('Error loading products:', error));

function starStr(n) {
  return '★'.repeat(n) + '☆'.repeat(5-n);
}

function renderFeaturedProducts() {
  const grid = document.getElementById('featured-products');
  grid.innerHTML = featuredProducts.map((p, index) => `
    <div class="product-card fade-up ${index > 0 ? 'fade-up-' + index : ''}">
      <img src="${p.image}" alt="${p.title}" class="product-image-placeholder">
      ${p.badge ? `<span class="product-badge ${p.badge==='Nouveau'?'new':''}">${p.badge}</span>` : ''}
      <button class="product-wish">♡</button>
      <div class="product-body">
        <div class="product-category">${catLabel(p.cat)}</div>
        <div class="product-stars">${starStr(p.stars)} <span style="color:var(--text-light);font-size:0.75rem;">(${p.reviews})</span></div>
        <div class="product-title">${p.title}</div>
        <div class="product-desc">${p.desc.split('. ')[0]}.</div>
        <div class="product-footer">
          <div>
            <span class="product-price">${formatPrice(p.price)}</span>
            ${p.oldPrice ? `<span class="product-price-old">${formatPrice(p.oldPrice)}</span>` : ''}
          </div>
          <button class="add-cart-btn" onclick="addToCart({id:${p.id},title:'${p.title.replace(/'/g,"\\'")}',price:${p.price}})">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function catLabel(c) {
  const map = { peau:'Soins de la peau', hygiene:'Hygiène', complements:'Compléments alimentaires', bienetre:'Bien-être', maternite:'Maternité' };
  return map[c] || c;
}