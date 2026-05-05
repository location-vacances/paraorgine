let allProducts = [];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'default';

fetch('assets/data/products.json')
  .then(response => response.json())
  .then(data => {
    allProducts = data;

    // Check URL param
    const urlCat = new URLSearchParams(location.search).get('cat');
    if (urlCat) {
      currentFilter = urlCat;
      document.querySelectorAll('.filter-chip').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === urlCat);
      });
    }

    renderProducts();
  })
  .catch(error => console.error('Error loading products:', error));

function starStr(n) {
  return '★'.repeat(n) + '☆'.repeat(5-n);
}

function renderProducts() {
  let filtered = allProducts.filter(p => {
    const matchCat = currentFilter === 'all' || p.cat === currentFilter;
    const matchSearch = p.title.toLowerCase().includes(currentSearch.toLowerCase()) || p.desc.toLowerCase().includes(currentSearch.toLowerCase());
    return matchCat && matchSearch;
  });
  if (currentSort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
  else if (currentSort === 'price-desc') filtered.sort((a,b) => b.price - a.price);
  else if (currentSort === 'name') filtered.sort((a,b) => a.title.localeCompare(b.title));

  document.getElementById('results-count').textContent = filtered.length + ' produit' + (filtered.length !== 1 ? 's' : '');

  const grid = document.getElementById('products-grid');
  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <a href="product.html?id=${p.id}" style="display:block;">
        <img src="${p.image}" alt="${p.title}" class="product-image-placeholder">
      </a>
      ${p.badge ? `<span class="product-badge ${p.badge==='Nouveau'?'new':''}">${p.badge}</span>` : ''}
      <button class="product-wish" onclick="showToast('❤️ Ajouté aux favoris')">♡</button>
      <div class="product-body">
        <div class="product-category">${catLabel(p.cat)}</div>
        <div class="product-stars">${starStr(p.stars)} <span style="color:var(--text-light);font-size:0.75rem;">(${p.reviews})</span></div>
        <a href="product.html?id=${p.id}"><div class="product-title">${p.title}</div></a>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div>
            <span class="product-price">€${p.price.toFixed(2).replace('.',',')}</span>
            ${p.oldPrice ? `<span class="product-price-old">€${p.oldPrice.toFixed(2).replace('.',',')}</span>` : ''}
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

document.getElementById('filter-bar').addEventListener('click', e => {
  if (e.target.classList.contains('filter-chip')) {
    document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    renderProducts();
  }
});

document.getElementById('search-input').addEventListener('input', e => {
  currentSearch = e.target.value;
  renderProducts();
});

document.getElementById('sort-select').addEventListener('change', e => {
  currentSort = e.target.value;
  renderProducts();
});