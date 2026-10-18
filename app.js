// Brismart prototype — hash-routed single-page store.
const FREE_DELIVERY_MIN = 60;
const DELIVERY_FEE = 7.95;
const $app = document.getElementById("app");
const catById = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
const productById = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

// ---------- Cart state ----------
let cart = loadCart();

function loadCart() {
  try { return JSON.parse(localStorage.getItem("brismart-cart")) || {}; } catch { return {}; }
}
function saveCart() {
  try { localStorage.setItem("brismart-cart", JSON.stringify(cart)); } catch {}
  updateHeader();
}
function setQty(id, qty) {
  if (qty <= 0) delete cart[id]; else cart[id] = qty;
  saveCart();
}
function cartLines() {
  return Object.entries(cart).map(([id, qty]) => ({ p: productById[id], qty })).filter(l => l.p);
}
function cartSubtotal() { return cartLines().reduce((s, l) => s + l.p.price * l.qty, 0); }
function cartCount() { return cartLines().reduce((s, l) => s + l.qty, 0); }
function cartSavings() { return cartLines().reduce((s, l) => s + (l.p.was ? (l.p.was - l.p.price) * l.qty : 0), 0); }

const money = n => "$" + n.toFixed(2);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function updateHeader() {
  document.getElementById("cartCount").textContent = cartCount();
  document.getElementById("cartTotal").textContent = money(cartSubtotal());
}

let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

// ---------- Components ----------
function qtyControl(p, small = false) {
  const q = cart[p.id] || 0;
  if (!q) return `<button class="btn btn-primary btn-block" data-add="${p.id}">Add to cart</button>`;
  return `<div class="qty ${small ? "small" : ""}">
    <button data-dec="${p.id}" aria-label="Remove one">−</button>
    <span>${q}</span>
    <button data-inc="${p.id}" aria-label="Add one">+</button>
  </div>`;
}

function priceHtml(p) {
  return `<div class="price ${p.was ? "special" : ""}">${money(p.price)}${p.was ? `<span class="was">${money(p.was)}</span>` : ""}</div>`;
}

function productCard(p) {
  const c = catById[p.cat];
  return `<article class="card">
    ${p.was ? `<span class="badge">Save ${money(p.was - p.price)}</span>` : ""}
    <a href="#/product/${p.id}" class="card-img" style="background:${c.color}" aria-label="${esc(p.name)}">${p.icon}</a>
    <div class="card-body">
      ${priceHtml(p)}
      <a href="#/product/${p.id}" class="card-name">${esc(p.name)}</a>
      <div class="card-size">${esc(p.size)}</div>
      <div class="card-actions" data-actions="${p.id}">${qtyControl(p)}</div>
    </div>
  </article>`;
}

function renderCatNav(active) {
  document.getElementById("catNav").innerHTML =
    `<a href="#/specials" class="${active === "specials" ? "active" : ""}">🔥 Specials</a>` +
    CATEGORIES.map(c => `<a href="#/category/${c.id}" class="${active === c.id ? "active" : ""}">${c.name}</a>`).join("");
}

// ---------- Pages ----------
function homePage() {
  const featured = FEATURED_IDS.map(id => productById[id]);
  const specials = PRODUCTS.filter(p => p.was);
  return `
  <section class="hero">
    <div class="hero-main">
      <p class="bn" style="margin:0 0 6px;opacity:.9">স্বাগতম — Welcome</p>
      <h1>Your Bangladeshi grocer in the 'Gabba, now online</h1>
      <p>Rice, spices, hilsa, sweets and hot food — delivered across inner Brisbane or ready for pick-up at 80 Ipswich Rd.</p>
      <a href="#/category/rice" class="btn btn-light">Start shopping</a>
    </div>
    <div class="hero-side">
      <a href="#/specials" class="promo gold">
        <h3>🔥 This week's specials</h3>
        <p>${specials.length} items on sale — chinigura rice, atta, beef masala and more.</p>
      </a>
      <a href="#/category/hot" class="promo pink">
        <h3>🍛 Hot food, ready when you are</h3>
        <p>Order biryani, singara and chips ahead and collect in-store.</p>
      </a>
    </div>
  </section>

  <div class="section-head"><h2>Shop by category</h2></div>
  <div class="cat-grid">
    ${CATEGORIES.map(c => `<a href="#/category/${c.id}" class="cat-tile" style="background:${c.color}">
      <span class="ico">${c.icon}</span><span class="nm">${c.name}</span><span class="bn">${c.bn}</span></a>`).join("")}
  </div>

  <div class="section-head"><h2>Popular at Brismart</h2><a href="#/specials">See specials →</a></div>
  <div class="grid">${featured.map(productCard).join("")}</div>

  <div class="services">
    <div class="service"><span class="ico">🚚</span><div><b>Local delivery</b><span>Free over ${money(FREE_DELIVERY_MIN)} · inner Brisbane</span></div></div>
    <div class="service"><span class="ico">🏪</span><div><b>Click &amp; collect</b><span>Ready in 1 hour, 80 Ipswich Rd</span></div></div>
    <div class="service"><span class="ico">💸</span><div><b>Western Union</b><span>Send &amp; collect money in-store</span></div></div>
    <div class="service"><span class="ico">📦</span><div><b>Amazon returns</b><span>Drop off parcels while you shop</span></div></div>
  </div>`;
}

function listingPage({ title, bn, crumbs, items, activeCat }) {
  const sort = new URLSearchParams(location.hash.split("?")[1] || "").get("sort") || "popular";
  const sorted = [...items];
  if (sort === "low") sorted.sort((a, b) => a.price - b.price);
  if (sort === "high") sorted.sort((a, b) => b.price - a.price);
  if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  return `
  <div class="crumbs"><a href="#/">Home</a> › ${crumbs}</div>
  <div class="page-title"><h1>${esc(title)}</h1>${bn ? `<span class="bn">${bn}</span>` : ""}</div>
  <div class="layout">
    <aside class="sidebar">
      <h4>Categories</h4>
      <a href="#/specials" class="${activeCat === "specials" ? "active" : ""}">🔥 Specials <small>${PRODUCTS.filter(p => p.was).length}</small></a>
      ${CATEGORIES.map(c => `<a href="#/category/${c.id}" class="${activeCat === c.id ? "active" : ""}">${c.icon} ${c.name} <small>${PRODUCTS.filter(p => p.cat === c.id).length}</small></a>`).join("")}
    </aside>
    <section>
      <div class="toolbar">
        <span class="note">${items.length} product${items.length === 1 ? "" : "s"}</span>
        <label>Sort by
          <select id="sortSelect">
            <option value="popular" ${sort === "popular" ? "selected" : ""}>Popular</option>
            <option value="low" ${sort === "low" ? "selected" : ""}>Price: low to high</option>
            <option value="high" ${sort === "high" ? "selected" : ""}>Price: high to low</option>
            <option value="name" ${sort === "name" ? "selected" : ""}>Name A–Z</option>
          </select>
        </label>
      </div>
      ${sorted.length ? `<div class="grid">${sorted.map(productCard).join("")}</div>`
        : `<div class="empty panel"><div class="big">🔎</div><p>No products found. Try “rice”, “fish” or “achar”.</p></div>`}
    </section>
  </div>`;
}

function categoryPage(id) {
  const c = catById[id];
  if (!c) return notFound();
  return listingPage({ title: c.name, bn: c.bn, crumbs: esc(c.name), items: PRODUCTS.filter(p => p.cat === id), activeCat: id });
}

function specialsPage() {
  return listingPage({ title: "This week's specials", crumbs: "Specials", items: PRODUCTS.filter(p => p.was), activeCat: "specials" });
}

function searchPage(q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const items = PRODUCTS.filter(p => {
    const hay = `${p.name} ${p.desc} ${catById[p.cat].name}`.toLowerCase();
    return terms.every(t => hay.includes(t));
  });
  return listingPage({ title: `Results for “${q}”`, crumbs: "Search", items });
}

function productPage(id) {
  const p = productById[id];
  if (!p) return notFound();
  const c = catById[p.cat];
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  return `
  <div class="crumbs"><a href="#/">Home</a> › <a href="#/category/${c.id}">${c.name}</a> › ${esc(p.name)}</div>
  <div class="pdp">
    <div class="pdp-img" style="background:${c.color}">${p.icon}</div>
    <div>
      ${p.was ? `<span class="badge" style="position:static;display:inline-block;margin-bottom:10px">Save ${money(p.was - p.price)}</span>` : ""}
      <h1>${esc(p.name)}</h1>
      <div class="size">${esc(p.size)}</div>
      ${priceHtml(p)}
      <div class="unit">Prototype price · GST included where applicable</div>
      <div class="pdp-actions" data-actions="${p.id}">${qtyControl(p)}</div>
      <div class="pdp-info">
        <p>${esc(p.desc)}</p>
        <ul>
          <li>Category: <a href="#/category/${c.id}" style="color:var(--green)">${c.name}</a></li>
          <li>${p.cat === "hot" ? "Pick-up only — prepared fresh in store" : "Available for delivery or click &amp; collect"}</li>
        </ul>
      </div>
    </div>
  </div>
  ${related.length ? `<div class="section-head"><h2>More in ${c.name}</h2></div><div class="grid">${related.map(productCard).join("")}</div>` : ""}`;
}

function cartPage() {
  const lines = cartLines();
  if (!lines.length) {
    return `<div class="empty panel"><div class="big">🛒</div><h2>Your cart is empty</h2>
      <p class="note">Browse our Bangladeshi staples and weekly specials.</p>
      <a href="#/" class="btn btn-primary">Start shopping</a></div>`;
  }
  const sub = cartSubtotal();
  const toFree = Math.max(0, FREE_DELIVERY_MIN - sub);
  return `
  <div class="page-title"><h1>Your cart</h1><span class="note">${cartCount()} items</span></div>
  <div class="cart-layout">
    <div class="panel">
      ${lines.map(({ p, qty }) => `
        <div class="cart-line">
          <a href="#/product/${p.id}" class="thumb" style="background:${catById[p.cat].color}">${p.icon}</a>
          <div>
            <a href="#/product/${p.id}" class="nm">${esc(p.name)}</a>
            <div class="sz">${esc(p.size)} · ${money(p.price)} each</div>
            <button class="remove" data-remove="${p.id}">Remove</button>
          </div>
          <div data-actions="${p.id}">${qtyControl(p, true)}</div>
          <div class="line-total">${money(p.price * qty)}</div>
        </div>`).join("")}
    </div>
    <aside class="panel">
      <h3 style="margin-top:0">Order summary</h3>
      ${toFree > 0
        ? `<div class="note">Add <b>${money(toFree)}</b> more for free delivery</div>`
        : `<div class="note">✅ You've unlocked free delivery</div>`}
      <div class="progress"><div style="width:${Math.min(100, (sub / FREE_DELIVERY_MIN) * 100)}%"></div></div>
      <div class="summary-row"><span>Subtotal</span><span>${money(sub)}</span></div>
      ${cartSavings() > 0 ? `<div class="summary-row" style="color:var(--red)"><span>Specials savings</span><span>−${money(cartSavings())}</span></div>` : ""}
      <div class="summary-row"><span>Delivery</span><span>Calculated at checkout</span></div>
      <div class="summary-row total"><span>Total</span><span>${money(sub)}</span></div>
      <a href="#/checkout" class="btn btn-primary btn-block" style="text-align:center;margin-top:8px">Checkout</a>
      <a href="#/" class="btn btn-outline btn-block" style="text-align:center;margin-top:8px">Continue shopping</a>
    </aside>
  </div>`;
}

function slotDays() {
  const days = [];
  const d = new Date();
  for (let i = 0; i < 3; i++) {
    const x = new Date(d); x.setDate(d.getDate() + i);
    days.push(i === 0 ? "Today" : i === 1 ? "Tomorrow" : x.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }));
  }
  return days;
}

function checkoutPage() {
  const lines = cartLines();
  if (!lines.length) { location.hash = "#/cart"; return ""; }
  const sub = cartSubtotal();
  const hasHot = lines.some(l => l.p.cat === "hot");
  const times = ["8–10am", "10am–12pm", "12–2pm", "2–4pm", "4–6pm", "6–8pm"];
  const days = slotDays();
  return `
  <div class="crumbs"><a href="#/cart">Cart</a> › Checkout</div>
  <div class="steps"><span class="on">1 Delivery</span><span class="on">2 Details</span><span class="on">3 Payment</span></div>
  <form id="checkoutForm" class="cart-layout" novalidate>
    <div class="panel">
      <fieldset>
        <legend>How would you like your order?</legend>
        <div class="choice-row">
          <label class="choice"><input type="radio" name="method" value="delivery" ${hasHot ? "disabled" : "checked"}>
            <span><b>🚚 Delivery</b><small>${hasHot ? "Not available — cart has hot food" : `${money(DELIVERY_FEE)}, free over ${money(FREE_DELIVERY_MIN)}`}</small></span></label>
          <label class="choice"><input type="radio" name="method" value="pickup" ${hasHot ? "checked" : ""}>
            <span><b>🏪 Click &amp; collect</b><small>Free · 80 Ipswich Rd, Woolloongabba</small></span></label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Choose a time</legend>
        <div class="field" style="margin-bottom:10px">
          <select id="daySel" name="day">${days.map(d => `<option>${d}</option>`).join("")}</select>
        </div>
        <div class="slots">
          ${times.map((t, i) => `<label class="slot ${i === 0 ? "full" : ""}"><input type="radio" name="slot" value="${t}" ${i === 2 ? "checked" : ""}>${t}${i === 0 ? "<br><small>Full</small>" : ""}</label>`).join("")}
        </div>
      </fieldset>

      <fieldset>
        <legend>Your details</legend>
        <div class="form-grid">
          <div class="field"><label for="fName">First name</label><input id="fName" name="first" autocomplete="off" required></div>
          <div class="field"><label for="lName">Last name</label><input id="lName" name="last" autocomplete="off" required></div>
          <div class="field"><label for="phone">Mobile</label><input id="phone" name="phone" type="tel" autocomplete="off" placeholder="04xx xxx xxx" required></div>
          <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="off" required></div>
          <div class="field full" id="addrField"><label for="addr">Delivery address</label><input id="addr" name="addr" autocomplete="off" placeholder="Street, suburb, postcode"></div>
          <div class="field full"><label for="notes">Order notes (optional)</label><textarea id="notes" name="notes" rows="2" placeholder="e.g. Please call when outside; substitute similar brand if out of stock"></textarea></div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Payment</legend>
        <div class="choice-row" style="margin-bottom:10px">
          <label class="choice"><input type="radio" name="pay" value="card" checked><span><b>💳 Card / Apple Pay / Google Pay</b><small>Pay online securely</small></span></label>
          <label class="choice"><input type="radio" name="pay" value="store"><span><b>🏪 Pay in store</b><small>Card or cash on collection</small></span></label>
        </div>
        <div class="demo-pay">🧪 <b>Demo checkout.</b> In the real store this step would open a secure payment provider (e.g. Stripe or Square). No card details are collected and no payment is taken here.</div>
      </fieldset>
    </div>

    <aside class="panel">
      <h3 style="margin-top:0">Order summary</h3>
      ${lines.map(({ p, qty }) => `<div class="summary-row note"><span>${qty} × ${esc(p.name)}</span><span>${money(p.price * qty)}</span></div>`).join("")}
      <div class="summary-row" style="margin-top:14px"><span>Subtotal</span><span>${money(sub)}</span></div>
      <div class="summary-row"><span>Delivery</span><span id="feeCell"></span></div>
      <div class="summary-row total"><span>Total</span><span id="totalCell"></span></div>
      <button type="submit" class="btn btn-primary btn-block" style="margin-top:8px">Place order (demo)</button>
      <p class="note">By placing an order you agree this is a prototype and no order will be sent.</p>
    </aside>
  </form>`;
}

function bindCheckout() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;
  const sub = cartSubtotal();
  const refresh = () => {
    const delivery = form.method.value === "delivery";
    const fee = delivery && sub < FREE_DELIVERY_MIN ? DELIVERY_FEE : 0;
    document.getElementById("feeCell").textContent = delivery ? (fee ? money(fee) : "Free") : "Pick-up (free)";
    document.getElementById("totalCell").textContent = money(sub + fee);
    document.getElementById("addrField").style.display = delivery ? "" : "none";
  };
  form.addEventListener("change", refresh);
  refresh();
  form.addEventListener("submit", e => {
    e.preventDefault();
    const needed = ["first", "last", "phone", "email"].concat(form.method.value === "delivery" ? ["addr"] : []);
    const missing = needed.filter(n => !form[n].value.trim());
    form.querySelectorAll("input").forEach(i => i.style.borderColor = "");
    if (missing.length) {
      missing.forEach(n => form[n].style.borderColor = "var(--red)");
      form[missing[0]].focus();
      toast("Please fill in the highlighted fields");
      return;
    }
    const order = {
      no: "BM" + Math.floor(100000 + Math.random() * 900000),
      name: form.first.value.trim(),
      method: form.method.value,
      when: `${form.day.value}, ${form.slot.value}`,
      total: document.getElementById("totalCell").textContent,
      items: cartCount(),
    };
    try { sessionStorage.setItem("brismart-last-order", JSON.stringify(order)); } catch {}
    lastOrder = order;
    cart = {};
    saveCart();
    location.hash = "#/confirmation";
  });
}

let lastOrder = null;
function confirmationPage() {
  let o = lastOrder;
  if (!o) { try { o = JSON.parse(sessionStorage.getItem("brismart-last-order")); } catch {} }
  if (!o) return homePage();
  return `<div class="confirm panel">
    <div class="tick">✓</div>
    <h1>Thank you, ${esc(o.name)}!</h1>
    <p class="bn">ধন্যবাদ</p>
    <p>Your demo order <span class="order-no">${o.no}</span> has been placed.</p>
    <p>${o.items} items · ${o.total}<br>
    ${o.method === "delivery" ? "🚚 Delivery" : "🏪 Click &amp; collect at 80 Ipswich Rd"} — ${esc(o.when)}</p>
    <p class="note">This is a prototype: no order was sent and no payment was taken.</p>
    <a href="#/" class="btn btn-primary">Back to shop</a>
  </div>`;
}

function notFound() {
  return `<div class="empty panel"><div class="big">🤔</div><h2>Page not found</h2><a href="#/" class="btn btn-primary">Go home</a></div>`;
}

// ---------- Router ----------
function route() {
  const [path, query] = location.hash.replace(/^#/, "").split("?");
  const parts = (path || "/").split("/").filter(Boolean);
  let html, active = null;
  if (parts[0] !== "search") document.getElementById("searchInput").value = "";
  switch (parts[0]) {
    case undefined: html = homePage(); break;
    case "category": html = categoryPage(parts[1]); active = parts[1]; break;
    case "specials": html = specialsPage(); active = "specials"; break;
    case "search": {
      const q = new URLSearchParams(query || "").get("q") || "";
      document.getElementById("searchInput").value = q;
      html = searchPage(q); break;
    }
    case "product": html = productPage(Number(parts[1])); active = productById[parts[1]]?.cat; break;
    case "cart": html = cartPage(); break;
    case "checkout": html = checkoutPage(); break;
    case "confirmation": html = confirmationPage(); break;
    default: html = notFound();
  }
  renderCatNav(active);
  $app.innerHTML = html;
  bindCheckout();
  window.scrollTo(0, 0);
}

// ---------- Events ----------
document.addEventListener("click", e => {
  const t = e.target.closest("[data-add],[data-inc],[data-dec],[data-remove]");
  if (!t) return;
  const id = Number(t.dataset.add || t.dataset.inc || t.dataset.dec || t.dataset.remove);
  const p = productById[id];
  if (t.dataset.add) { setQty(id, 1); toast(`Added ${p.name} to cart`); }
  else if (t.dataset.inc) setQty(id, (cart[id] || 0) + 1);
  else if (t.dataset.dec) setQty(id, (cart[id] || 0) - 1);
  else if (t.dataset.remove) setQty(id, 0);

  // On the cart page totals change, so re-render it; elsewhere just swap the control.
  if (location.hash.startsWith("#/cart")) { route(); return; }
  document.querySelectorAll(`[data-actions="${id}"]`).forEach(el => el.innerHTML = qtyControl(p, el.closest(".cart-line") != null));
});

document.addEventListener("change", e => {
  if (e.target.id === "sortSelect") {
    const [path, query] = location.hash.split("?");
    const params = new URLSearchParams(query || "");
    params.set("sort", e.target.value);
    location.hash = `${path}?${params}`;
  }
});

document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  const q = document.getElementById("searchInput").value.trim();
  if (q) location.hash = `#/search?q=${encodeURIComponent(q)}`;
});

window.addEventListener("hashchange", route);
updateHeader();
route();
