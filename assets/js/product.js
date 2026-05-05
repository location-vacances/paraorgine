let products = {};

function catLabel(c) {
  const map = { peau:'Soins de la peau', hygiene:'Hygiène', complements:'Compléments alimentaires', bienetre:'Bien-être', maternite:'Maternité' };
  return map[c] || c;
}

function starStr(n) {
  return '★'.repeat(n) + '☆'.repeat(5-n);
}

fetch('assets/data/products.json')
  .then(response => response.json())
  .then(data => {
    products = data.reduce((acc, p) => {
      p.cat = catLabel(p.cat);
      acc[p.id] = p;
      return acc;
    }, {});

    const id = new URLSearchParams(location.search).get('id');
    const p = products[id];

    if (!p) {
      document.getElementById('product-detail').innerHTML = `
        <div class="card" style="text-align:center;padding:4rem 2rem;">
          <div style="font-size:4rem;margin-bottom:1rem;">😕</div>
          <h2 style="color:var(--plum);margin-bottom:0.5rem;">Produit introuvable</h2>
          <p style="color:var(--text-light);margin-bottom:1.5rem;">Ce produit n'existe pas ou a été retiré.</p>
          <a href="boutique.html" class="btn btn-primary">← Retour à la boutique</a>
        </div>`;
      return;
    }

    document.title = p.title + ' - Parapharmacie Origine';
    document.getElementById('breadcrumb-title').textContent = p.title;

    document.getElementById('product-detail').innerHTML = `
      <div class="product-detail-grid">
        <img src="${p.image}" alt="${p.title}" class="product-detail-image">
        <div class="product-detail-info">
          <div class="product-category">${p.cat}</div>
          ${p.badge ? `<span class="product-badge ${p.badge==='Nouveau'?'new':''}" style="position:static;display:inline-block;margin-bottom:0.8rem;">${p.badge}</span>` : ''}
          <h1>${p.title}</h1>
          <div class="product-stars">${starStr(p.stars)} <span style="color:var(--text-light);font-size:0.85rem;">${p.reviews} avis</span></div>
          <div style="display:flex;align-items:baseline;gap:12px;margin:0.8rem 0 1.2rem;">
            <span class="product-price" style="font-size:2.2rem;">€${p.price.toFixed(2).replace('.',',')}</span>
            ${p.oldPrice ? `<span class="product-price-old" style="font-size:1.1rem;">€${p.oldPrice.toFixed(2).replace('.',',')}</span>
            <span style="background:var(--rose-light);color:var(--rose);font-size:0.75rem;font-weight:600;padding:3px 8px;border-radius:100px;">-${Math.round(100-(p.price/p.oldPrice*100))}%</span>` : ''}
          </div>
          <p>${p.desc}</p>
          <div class="qty-selector" id="qty-wrap">
            <button class="qty-btn" id="qty-minus">−</button>
            <span class="qty-value" id="qty-value">1</span>
            <button class="qty-btn" id="qty-plus">+</button>
          </div>
          <div class="product-actions">
            <button class="btn btn-primary" style="flex:1;" onclick="addToCartFromDetail()">🛒 Ajouter au panier</button>
            <button class="btn btn-outline" onclick="showToast('❤️ Ajouté aux favoris')">♡</button>
          </div>
          <ul class="features-list">
            ${p.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      </div>`;

    // Qty logic
    let qty = 1;
    document.getElementById('qty-minus').onclick = () => { if(qty>1){qty--;document.getElementById('qty-value').textContent=qty;} };
    document.getElementById('qty-plus').onclick = () => { qty++;document.getElementById('qty-value').textContent=qty; };

    window.addToCartFromDetail = function() {
      for(let i=0;i<qty;i++) addToCart({id:p.id, title:p.title, price:p.price});
    };

    // Related
    const related = Object.values(products).filter(x => x.id !== p.id && (x.cat === p.cat)).slice(0,3);
    document.getElementById('related-products').innerHTML = related.map(r => `
      <div class="product-card">
        <a href="product.html?id=${r.id}"><img src="${r.image}" alt="${r.title}" class="product-image-placeholder"></a>
        <button class="product-wish">♡</button>
        <div class="product-body">
          <div class="product-category">${r.cat}</div>
          <div class="product-stars">${starStr(r.stars)}</div>
          <a href="product.html?id=${r.id}"><div class="product-title">${r.title}</div></a>
          <div class="product-desc">${r.desc}</div>
          <div class="product-footer">
            <span class="product-price">€${r.price.toFixed(2).replace('.',',')}</span>
            <button class="add-cart-btn" onclick="addToCart({id:${r.id},title:'${r.title.replace(/'/g,"\\'")}',price:${r.price}})">+</button>
          </div>
        </div>
      </div>`).join('');
  })
  .catch(error => console.error('Error loading products:', error));
