// ── STATE ──
let products = [];
let orders = [];
let pendingDeleteId = null;

// ── AUTH ──
function checkAuth() {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// ── TOAST ──
function toast(type, title, msg, duration = 3500) {
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.innerHTML = `<div class="toast-icon">${icons[type]}</div><div class="toast-text"><strong>${title}</strong><span>${msg}</span></div>`;
  document.getElementById("toastContainer").appendChild(el);
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 250);
  }, duration);
}

// ── NAVIGATION ──
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    const section = link.getAttribute("data-section");
    document
      .querySelectorAll(".nav-link")
      .forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    document
      .querySelectorAll(".section")
      .forEach((s) => s.classList.remove("active"));
    document.getElementById(section + "-section").classList.add("active");
  });
});

// ── LOAD DATA ──
async function loadData() {
  try {
    const [pr, or] = await Promise.all([
      fetch("https://raw.githubusercontent.com/location-vacances/paraorgine/main/assets/data/products.json").then((r) => r.json()),
      fetch("https://raw.githubusercontent.com/location-vacances/paraorgine/main/assets/data/orders.json").then((r) => r.json()),
    ]);
    products = pr;
    orders = or;
  } catch {
    // Fallback to localStorage
    products = JSON.parse(localStorage.getItem("products") || "[]");
    orders = JSON.parse(localStorage.getItem("orders") || "[]");
  }
  renderProducts();
  renderOrders();
  updateCounts();
}

function updateCounts() {
  document.getElementById("products-count").textContent = products.length;
  document.getElementById("orders-count").textContent = orders.length;
  document.getElementById("products-subtitle").textContent =
    `${products.length} produit${products.length !== 1 ? "s" : ""} au catalogue`;
  document.getElementById("orders-subtitle").textContent =
    `${orders.length} commande${orders.length !== 1 ? "s" : ""} reçue${orders.length !== 1 ? "s" : ""}`;
}

// ── PRODUCTS ──
function starsHtml(n) {
  return Array.from({ length: 5 }, (_, i) => (i < n ? "★" : "☆")).join("");
}
function catLabel(cat) {
  const map = {
    peau: "Soins peau",
    hygiene: "Hygiène",
    complements: "Compléments",
    maternite: "Maternité",
    bienetre: "Bien-être",
    solaire: "Solaire",
  };
  return map[cat] || cat;
}

function renderProducts(filter = "") {
  const container = document.getElementById("products-list");
  const filtered = products.filter(
    (p) =>
      !filter ||
      p.title.toLowerCase().includes(filter.toLowerCase()) ||
      (p.cat && catLabel(p.cat).toLowerCase().includes(filter.toLowerCase())),
  );
  if (!filtered.length) {
    container.innerHTML = `<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><p>Aucun produit trouvé.</p></div>`;
    return;
  }
  container.innerHTML = "";
  filtered.forEach((p) => {
    const el = document.createElement("div");
    el.className = "product-card";
    el.innerHTML = `
      ${p.image ? `<img class="product-img" src="../${p.image}" alt="${p.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ""}
      <div class="product-img-placeholder" ${p.image ? 'style="display:none"' : ""}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      </div>
      <div class="product-info">
        <div class="product-title">${p.title}${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}</div>
        <div class="product-meta">
          <span class="tag tag-cat">${catLabel(p.cat)}</span>
          <span class="stars" style="margin-left:8px">${starsHtml(p.stars)}</span>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <span class="product-price">${p.price.toFixed(2)}€</span>
        ${p.oldPrice ? `<span class="product-old-price">${p.oldPrice.toFixed(2)}€</span>` : ""}
      </div>
      <div class="product-actions">
        <button class="btn btn-ghost btn-sm edit-btn" data-id="${p.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Modifier
        </button>
        <button class="btn btn-sm delete-btn" data-id="${p.id}" style="background:var(--danger-light);color:var(--danger);border:1px solid #f5c6c3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
    `;
    container.appendChild(el);
  });

  container
    .querySelectorAll(".edit-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        editProduct(parseInt(btn.dataset.id)),
      ),
    );
  container
    .querySelectorAll(".delete-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        confirmDelete(parseInt(btn.dataset.id)),
      ),
    );
}

document
  .getElementById("product-search")
  .addEventListener("input", (e) => renderProducts(e.target.value));

// ── ORDERS ──
function renderOrders(filter = "") {
  const container = document.getElementById("orders-list");
  const filtered = orders.filter(
    (o) =>
      !filter ||
      String(o.id).includes(filter) ||
      (o.customer?.fullname || "").toLowerCase().includes(filter.toLowerCase()),
  );
  if (!filtered.length) {
    container.innerHTML = `<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg><p>Aucune commande trouvée.</p></div>`;
    return;
  }
  container.innerHTML = "";
  filtered.forEach((order) => {
    const status = order.status || "pending";
    const el = document.createElement("div");
    el.className = "order-card";
    el.innerHTML = `
      <div class="order-header">
        <div>
          <div class="order-id">Commande <span>#${order.id}</span></div>
          <div class="order-meta">Client : <strong>${order.customer?.fullname || "Inconnu"}</strong></div>
          <div class="order-meta">${order.items.length} article${order.items.length !== 1 ? "s" : ""}</div>
        </div>
        <div class="order-actions">
          <button class="btn btn-ghost btn-sm view-order-btn" data-id="${order.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Détails
          </button>
          <button class="btn btn-sm status-btn" data-id="${order.id}" data-status="${status === "completed" ? "pending" : "completed"}"
            style="${status === "completed" ? "background:var(--warn-light);color:var(--warn);border:1px solid #f3d28c" : "background:var(--accent-light);color:var(--accent);border:1px solid #a8d5bc"}">
            ${status === "completed" ? "Marquer en attente" : "Marquer traitée"}
          </button>
        </div>
      </div>
      <div class="order-footer">
        <span class="status-pill status-${status}">${status === "completed" ? "Traitée" : "En attente"}</span>
        <span class="order-date">${new Date(order.timestamp).toLocaleString("fr-FR")}</span>
        <span class="order-total">${order.total}€</span>
      </div>
    `;
    container.appendChild(el);
  });

  container
    .querySelectorAll(".view-order-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => openDrawer(btn.dataset.id)),
    );
  container
    .querySelectorAll(".status-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        updateOrderStatus(btn.dataset.id, btn.dataset.status),
      ),
    );
}

document
  .getElementById("order-search")
  .addEventListener("input", (e) => renderOrders(e.target.value));

// ── ORDER DRAWER ──
function openDrawer(orderId) {
  const order = orders.find((o) => o.id == orderId);
  if (!order) return;
  document.getElementById("drawerTitle").textContent = `Commande #${order.id}`;
  const status = order.status || "pending";
  document.getElementById("drawerContent").innerHTML = `
    <div class="drawer-section">
      <div class="drawer-section-title">Client</div>
      <div class="drawer-info-grid">
        <div class="drawer-field"><label>Nom</label><span>${order.customer?.fullname || "—"}</span></div>
        <div class="drawer-field"><label>Email</label><span>${order.customer?.email || "—"}</span></div>
        <div class="drawer-field"><label>Téléphone</label><span>${order.customer?.phone || "—"}</span></div>
        <div class="drawer-field full"><label>Adresse</label><span>${order.customer?.address || "—"}</span></div>
      </div>
    </div>
    <div class="drawer-section">
      <div class="drawer-section-title">Articles</div>
      ${order.items
        .map(
          (item) => `
        <div class="drawer-item">
          <div class="drawer-item-img" style="display:flex;align-items:center;justify-content:center;font-size:20px">🧴</div>
          <div class="drawer-item-name">${item.title}<br><span class="drawer-item-qty" style="font-size:12px;color:var(--text-2)">× ${item.qty}</span></div>
          <div class="drawer-item-price">${(item.price * item.qty).toFixed(2)}€</div>
        </div>
      `,
        )
        .join("")}
    </div>
    <div class="drawer-section">
      <div class="drawer-section-title">Récapitulatif</div>
      <div class="drawer-totals">
        <div class="drawer-total-row"><span>Sous-total</span><span>${order.subtotal || "—"}€</span></div>
        <div class="drawer-total-row"><span>Livraison</span><span>${order.shipping || "—"}€</span></div>
        <div class="drawer-total-row final"><span>Total</span><span>${order.total}€</span></div>
      </div>
    </div>
    <div class="drawer-section">
      <div class="drawer-section-title">Statut</div>
      <span class="status-pill status-${status}">${status === "completed" ? "Traitée" : "En attente"}</span>
      <span style="margin-left:10px;font-size:12px;color:var(--text-3)">${new Date(order.timestamp).toLocaleString("fr-FR")}</span>
    </div>
  `;
  document.getElementById("drawerOverlay").classList.add("open");
  document.getElementById("orderDrawer").classList.add("open");
}
function closeDrawer() {
  document.getElementById("drawerOverlay").classList.remove("open");
  document.getElementById("orderDrawer").classList.remove("open");
}
document.getElementById("drawerClose").addEventListener("click", closeDrawer);
document.getElementById("drawerOverlay").addEventListener("click", closeDrawer);

// ── PRODUCT MODAL ──
function openProductModal(product = null) {
  document.getElementById("productForm").reset();
  if (product) {
    document.getElementById("modalTitle").textContent = "Modifier le produit";
    document.getElementById("productId").value = product.id;
    document.getElementById("title").value = product.title;
    document.getElementById("cat").value = product.cat;
    document.getElementById("price").value = product.price;
    document.getElementById("oldPrice").value = product.oldPrice || "";
    document.getElementById("badge").value = product.badge || "";
    document.getElementById("stars").value = product.stars;
    document.getElementById("image").value = product.image || "";
    document.getElementById("desc").value = product.desc;
    document.getElementById("features").value = product.features
      ? product.features.join("\n")
      : "";
  } else {
    document.getElementById("modalTitle").textContent = "Ajouter un produit";
    document.getElementById("productId").value = "";
  }
  document.getElementById("productModal").classList.add("open");
}
function closeProductModal() {
  document.getElementById("productModal").classList.remove("open");
}
document
  .getElementById("addProductBtn")
  .addEventListener("click", () => openProductModal());
document
  .getElementById("closeModal")
  .addEventListener("click", closeProductModal);
document
  .getElementById("cancelBtn")
  .addEventListener("click", closeProductModal);
document.getElementById("productModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("productModal")) closeProductModal();
});

// ── SAVE PRODUCT ──
document
  .getElementById("productForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const fd = new FormData(this);
    let imagePath = fd.get("image");
    const file = fd.get("imageFile");
    if (file && file.name) {
      const token = "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";
      try {
        imagePath = await uploadImageToGitHub(file, token);
      } catch (error) {
        toast(
          "error",
          "Erreur upload",
          "Impossible d'uploader l'image: " + error.message,
        );
        return;
      }
    }
    const productData = {
      id: fd.get("id") ? parseInt(fd.get("id")) : Date.now(),
      title: fd.get("title"),
      cat: fd.get("cat"),
      price: parseFloat(fd.get("price")),
      oldPrice: fd.get("oldPrice") ? parseFloat(fd.get("oldPrice")) : null,
      badge: fd.get("badge") || null,
      stars: parseInt(fd.get("stars")),
      reviews: 0,
      image: imagePath,
      desc: fd.get("desc"),
      features: fd
        .get("features")
        .split("\n")
        .filter((f) => f.trim()),
    };
    const existing = products.findIndex((p) => p.id === productData.id);
    if (existing > -1) {
      products[existing] = productData;
      toast(
        "success",
        "Produit modifié",
        `"${productData.title}" a été mis à jour.`,
      );
    } else {
      products.push(productData);
      toast(
        "success",
        "Produit ajouté",
        `"${productData.title}" a été ajouté au catalogue.`,
      );
    }
    saveProductsLocal();
    renderProducts();
    updateCounts();
    closeProductModal();
  });

function editProduct(id) {
  const p = products.find((p) => p.id === id);
  if (p) openProductModal(p);
}

// ── CONFIRM DELETE ──
function confirmDelete(id) {
  pendingDeleteId = id;
  const p = products.find((p) => p.id === id);
  document.getElementById("confirmText").textContent =
    `Supprimer "${p?.title || "ce produit"}" ? Cette action est irréversible.`;
  document.getElementById("confirmOverlay").classList.add("open");
}
document.getElementById("confirmCancel").addEventListener("click", () => {
  pendingDeleteId = null;
  document.getElementById("confirmOverlay").classList.remove("open");
});
document.getElementById("confirmOk").addEventListener("click", () => {
  if (pendingDeleteId !== null) {
    const p = products.find((p) => p.id === pendingDeleteId);
    products = products.filter((p) => p.id !== pendingDeleteId);
    saveProductsLocal();
    renderProducts();
    updateCounts();
    toast(
      "error",
      "Produit supprimé",
      `"${p?.title || "Produit"}" a été supprimé.`,
    );
    pendingDeleteId = null;
    document.getElementById("confirmOverlay").classList.remove("open");
  }
});

// ── ORDER STATUS ──
async function updateOrderStatus(orderId, status) {
  const order = orders.find((o) => o.id == orderId);
  if (order) {
    order.status = status;
    saveOrdersLocal();
    renderOrders(document.getElementById("order-search").value);
    toast(
      "success",
      "Statut mis à jour",
      `Commande #${orderId} : ${status === "completed" ? "Traitée" : "En attente"}.`,
    );
  }
}

// ── PERSIST ──
function saveProductsLocal() {
  localStorage.setItem("products", JSON.stringify(products, null, 2));
}
function saveOrdersLocal() {
  localStorage.setItem("orders", JSON.stringify(orders, null, 2));
}

// ── GITHUB SYNC ──
async function syncToGitHub() {
  const token = "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";
  const repo = "location-vacances/paraorgine";
  toast("info", "Synchronisation…", "Envoi des données vers GitHub.");
  try {
    const [pSha, oSha] = await Promise.all([
      getFileSha(repo, "assets/data/products.json", token),
      getFileSha(repo, "assets/data/orders.json", token),
    ]);
    if (pSha)
      await updateFile(
        repo,
        "assets/data/products.json",
        JSON.stringify(products, null, 2),
        pSha,
        token,
        "Update products via admin panel",
      );
    if (oSha)
      await updateFile(
        repo,
        "assets/data/orders.json",
        JSON.stringify(orders, null, 2),
        oSha,
        token,
        "Update orders via admin panel",
      );
    toast(
      "success",
      "Synchronisé !",
      "Les données ont été envoyées vers GitHub.",
    );
  } catch (err) {
    toast("error", "Erreur de synchronisation", err.message);
  }
}
async function getFileSha(repo, path, token) {
  const r = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );
  if (r.ok) {
    const d = await r.json();
    return d.sha;
  }
  return null;
}
async function updateFile(repo, path, content, sha, token, message) {
  const r = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        sha,
        branch: "main",
      }),
    },
  );
  if (!r.ok) throw new Error(`Échec de mise à jour : ${path}`);
}
async function uploadImageToGitHub(file, token) {
  const repo = "location-vacances/Parapharmacie"; // Update with your actual repo: username/repo
  const fileName = `p${Date.now()}.${file.name.split(".").pop()}`;
  const path = `assets/imgs/products/${fileName}`;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function (e) {
      const base64 = e.target.result.split(",")[1]; // Remove data:image/jpeg;base64,

      try {
        const response = await fetch(
          `https://api.github.com/repos/${repo}/contents/${path}`,
          {
            method: "PUT",
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: `Upload product image ${fileName}`,
              content: base64,
              branch: "main",
            }),
          },
        );

        if (response.ok) {
          resolve(path);
        } else {
          const error = await response.json();
          reject(new Error(error.message || "Upload failed"));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ── EVENTS ──
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  window.location.href = "index.html";
});
document.getElementById("syncBtn").addEventListener("click", syncToGitHub);

// ── INIT ──
if (checkAuth()) loadData();
