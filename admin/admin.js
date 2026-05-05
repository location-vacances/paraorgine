// Admin Panel JavaScript
let products = [];
let orders = [];

// Check authentication
function checkAuth() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
  localStorage.removeItem('adminToken');
  window.location.href = 'index.html';
});

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const section = this.getAttribute('data-section');

    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.remove('bg-gray-100');
      l.classList.add('text-gray-600');
    });
    this.classList.add('bg-gray-100');
    this.classList.remove('text-gray-600');

    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section + '-section').classList.remove('hidden');
  });
});

// Load data
async function loadData() {
  try {
    const productsResponse = await fetch('../assets/data/products.json');
    products = await productsResponse.json();

    const ordersResponse = await fetch('../assets/data/orders.json');
    orders = await ordersResponse.json();

    renderProducts();
    renderOrders();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Render products
function renderProducts() {
  const container = document.getElementById('products-list');
  container.innerHTML = '';

  products.forEach(product => {
    const productEl = document.createElement('div');
    productEl.className = 'bg-white p-4 rounded-lg shadow border';
    productEl.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <img src="../${product.image}" alt="${product.title}" class="w-16 h-16 object-cover rounded">
          <div>
            <h3 class="font-medium">${product.title}</h3>
            <p class="text-sm text-gray-600">${product.cat} - ${product.price}€</p>
          </div>
        </div>
        <div class="flex space-x-2">
          <button class="edit-btn bg-blue-500 text-white px-3 py-1 rounded text-sm" data-id="${product.id}">Modifier</button>
          <button class="delete-btn bg-red-500 text-white px-3 py-1 rounded text-sm" data-id="${product.id}">Supprimer</button>
        </div>
      </div>
    `;
    container.appendChild(productEl);
  });

  // Add event listeners
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      editProduct(id);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      deleteProduct(id);
    });
  });
}

// Render orders
function renderOrders() {
  const container = document.getElementById('orders-list');
  container.innerHTML = '';

  orders.forEach(order => {
    const status = order.status || 'pending';
    const statusColor = status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

    const orderEl = document.createElement('div');
    orderEl.className = 'bg-white p-4 rounded-lg shadow border';
    orderEl.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-medium">Commande #${order.id}</h3>
          <p class="text-sm text-gray-600">${order.customer ? order.customer.fullname : 'Client inconnu'}</p>
          <p class="text-sm text-gray-600">${order.items.length} article(s) - Total: ${order.total}€</p>
          <p class="text-sm text-gray-500">${new Date(order.timestamp).toLocaleString('fr-FR')}</p>
          <span class="inline-block px-2 py-1 text-xs rounded-full ${statusColor}">${status === 'completed' ? 'Traitée' : 'En attente'}</span>
        </div>
        <div class="flex space-x-2">
          <button class="view-order-btn bg-gray-500 text-white px-3 py-1 rounded text-sm" data-id="${order.id}">Voir détails</button>
          <button class="status-btn bg-blue-500 text-white px-3 py-1 rounded text-sm" data-id="${order.id}" data-status="${status === 'completed' ? 'pending' : 'completed'}">
            ${status === 'completed' ? 'Marquer en attente' : 'Marquer traitée'}
          </button>
        </div>
      </div>
    `;
    container.appendChild(orderEl);
  });

  // Add event listeners
  document.querySelectorAll('.view-order-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      viewOrder(id);
    });
  });

  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const newStatus = this.getAttribute('data-status');
      updateOrderStatus(id, newStatus);
    });
  });
}

// Product modal functions
function openProductModal(product = null) {
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');

  if (product) {
    document.getElementById('modalTitle').textContent = 'Modifier le produit';
    populateForm(product);
  } else {
    document.getElementById('modalTitle').textContent = 'Ajouter un produit';
    form.reset();
    document.getElementById('productId').value = '';
  }

  modal.classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('productModal').classList.add('hidden');
}

function populateForm(product) {
  document.getElementById('productId').value = product.id;
  document.getElementById('title').value = product.title;
  document.getElementById('cat').value = product.cat;
  document.getElementById('price').value = product.price;
  document.getElementById('oldPrice').value = product.oldPrice || '';
  document.getElementById('badge').value = product.badge || '';
  document.getElementById('stars').value = product.stars;
  document.getElementById('image').value = product.image;
  document.getElementById('desc').value = product.desc;
  document.getElementById('features').value = product.features ? product.features.join('\n') : '';
}

// Product CRUD functions
async function saveProduct(formData) {
  let imagePath = formData.get('image');

  // Handle file upload
  const file = formData.get('imageFile');
  if (file && file.name) {
    // Generate path for uploaded file
    const fileName = `p${Date.now()}.${file.name.split('.').pop()}`;
    imagePath = `assets/imgs/products/${fileName}`;

    // In a real implementation, upload the file to server
    // For now, we'll assume it's uploaded and use the path
    console.log('File to upload:', file.name, '->', imagePath);
  }

  const productData = {
    id: formData.get('id') ? parseInt(formData.get('id')) : Date.now(),
    title: formData.get('title'),
    cat: formData.get('cat'),
    price: parseFloat(formData.get('price')),
    oldPrice: formData.get('oldPrice') ? parseFloat(formData.get('oldPrice')) : null,
    badge: formData.get('badge') || null,
    stars: parseInt(formData.get('stars')),
    reviews: 0,
    image: imagePath,
    desc: formData.get('desc'),
    features: formData.get('features').split('\n').filter(f => f.trim())
  };

  if (productData.id && products.find(p => p.id === productData.id)) {
    // Update existing
    const index = products.findIndex(p => p.id === productData.id);
    products[index] = productData;
  } else {
    // Add new
    products.push(productData);
  }

  await saveProductsToFile();
  renderProducts();
  closeProductModal();
}

async function deleteProduct(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
    products = products.filter(p => p.id !== id);
    await saveProductsToFile();
    renderProducts();
  }
}

function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (product) {
    openProductModal(product);
  }
}

// Save to file (in browser, we'll use localStorage as proxy, but for GitHub we'll commit)
async function saveProductsToFile() {
  // For now, save to localStorage
  localStorage.setItem('products', JSON.stringify(products, null, 2));
  console.log('Products saved locally');
}

async function saveOrdersToFile() {
  // For now, save to localStorage
  localStorage.setItem('orders', JSON.stringify(orders, null, 2));
  console.log('Orders saved locally');
}

// GitHub sync
async function syncToGitHub() {
  const token = "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";
  if (!token) return;

  const repo = "location-vacances/Parapharmacie"; // Replace with actual repo
  const branch = 'main';

  try {
    // Get current products.json SHA
    const productsSha = await getFileSha(repo, 'assets/data/products.json', token);
    const ordersSha = await getFileSha(repo, 'assets/data/orders.json', token);

    // Update products.json
    if (productsSha) {
      await updateFile(repo, 'assets/data/products.json', JSON.stringify(products, null, 2), productsSha, token, 'Update products via admin panel');
    }

    // Update orders.json
    if (ordersSha) {
      await updateFile(repo, 'assets/data/orders.json', JSON.stringify(orders, null, 2), ordersSha, token, 'Update orders via admin panel');
    }
  } catch (error) {
    console.error('Error syncing to GitHub:', error);
    alert('Erreur lors de la synchronisation: ' + error.message);
  }
}

async function getFileSha(repo, path, token) {
  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (response.ok) {
    const data = await response.json();
    return data.sha;
  }
  return null;
}

async function updateFile(repo, path, content, sha, token, message) {
  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message,
      content: btoa(unescape(encodeURIComponent(content))),
      sha: sha,
      branch: 'main'
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to update ${path}`);
  }
}

// Update order status
async function updateOrderStatus(orderId, status) {
  const order = orders.find(o => o.id == orderId);
  if (order) {
    order.status = status;
    await saveOrdersToFile();
    renderOrders();
  }
}

// View order details
function viewOrder(orderId) {
  const order = orders.find(o => o.id == orderId);
  if (!order) return;

  let details = `Commande #${order.id}\n\n`;
  details += `Client: ${order.customer ? order.customer.fullname : 'Inconnu'}\n`;
  details += `Email: ${order.customer ? order.customer.email : 'N/A'}\n`;
  details += `Téléphone: ${order.customer ? order.customer.phone : 'N/A'}\n`;
  details += `Adresse: ${order.customer ? order.customer.address : 'N/A'}\n\n`;
  details += `Articles:\n`;
  order.items.forEach(item => {
    details += `- ${item.title} (x${item.qty}) - ${item.price}€\n`;
  });
  details += `\nSous-total: ${order.subtotal}€\n`;
  details += `Livraison: ${order.shipping}€\n`;
  details += `Total: ${order.total}€\n`;
  details += `Date: ${new Date(order.timestamp).toLocaleString('fr-FR')}`;

  alert(details);
}

// Event listeners
document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
document.getElementById('closeModal').addEventListener('click', closeProductModal);
document.getElementById('cancelBtn').addEventListener('click', closeProductModal);
document.getElementById('syncBtn').addEventListener('click', syncToGitHub);

document.getElementById('productForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  saveProduct(formData);
});

// Initialize
if (checkAuth()) {
  loadData();
}