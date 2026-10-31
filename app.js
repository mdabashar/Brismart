// Brismart prototype — hash-routed single-page store with two shop views:
// "au" (Everyday, for the general Australian customer) and "bd" (দেশি, for the Bangladeshi community).
const FREE_DELIVERY_MIN = 60;
const DELIVERY_FEE = 7.95;
const $app = document.getElementById("app");
const catById = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
let productById = {};
function indexProducts() {
  PRODUCTS = PRODUCTS.filter(p => catById[p.cat]);
  productById = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
}
indexProducts();

// ---------- Storage helpers ----------
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
}
function store(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ---------- View (Everyday / দেশি) ----------
let view = load("brismart-view", "au");
if (!VIEWS[view]) view = "au";
const V = () => VIEWS[view];
const T = key => TEXT[view][key];

function setView(v) {
  if (!VIEWS[v] || v === view) return;
  view = v;
  store("brismart-view", v);
  applyView();
  route();
  toast(v === "bd" ? "দেশি view — Bangladeshi favourites first" : "Everyday view — essentials first");
}

function applyView() {
  document.body.classList.toggle("view-bd", view === "bd");
  document.body.classList.toggle("view-au", view === "au");
  document.documentElement.lang = view === "bd" ? "bn-AU" : "en-AU";
  document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
  document.getElementById("searchInput").placeholder = T("search");
  document.getElementById("cartLabel").textContent = T("cart");
}

function catName(c) {
  return view === "bd" ? c.bn : c.en;
}
function catSub(c) {
  return view === "bd" ? c.en : "";
}
function catText(c) {
  return view === "bd" ? c.bdText : c.au;
}

// ---------- Cart state ----------
let cart = load("brismart-cart", {});

function saveCart() {
  store("brismart-cart", cart);
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
function cartSubtotalMax() { return cartLines().reduce((s, l) => s + maxPrice(l.p) * l.qty, 0); }
function cartHasRange() { return cartLines().some(l => isRange(l.p)); }
function cartCount() { return cartLines().reduce((s, l) => s + l.qty, 0); }

const money = n => "$" + n.toFixed(2);
// Price ranges: some items (e.g. fish sold by size) have a min price and a max price.
const isRange = p => p.max != null && p.max > p.price;
const maxPrice = p => (isRange(p) ? p.max : p.price);
const rangeText = (lo, hi) => (hi > lo ? `${money(lo)} – ${money(hi)}` : money(lo));
const priceText = p => rangeText(p.price, maxPrice(p));
const perText = p => (p.unit ? `per ${p.unit}` : "each");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function updateHeader() {
  document.getElementById("cartCount").textContent = cartCount();
  document.getElementById("cartTotal").textContent = (cartHasRange() ? "~" : "") + money(cartSubtotal());
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
function productImage(p, cls) {
  const c = catById[p.cat];
  if (p.img) return `<img class="${cls}" src="${p.img}" alt="${esc(p.name)}" loading="lazy" width="360" height="360">`;
  return `<span class="${cls} emoji" style="background:${c.color}" role="img" aria-label="${esc(p.name)}">${p.icon}</span>`;
}

function qtyControl(p, small = false) {
  const q = cart[p.id] || 0;
  if (!q) return `<button class="btn btn-primary btn-block" data-add="${p.id}">${T("add")}</button>`;
  return `<div class="qty ${small ? "small" : ""}">
    <button data-dec="${p.id}" aria-label="Remove one">−</button>
    <span>${q}${p.unit ? ` ${esc(p.unit)}` : ""}</span>
    <button data-inc="${p.id}" aria-label="Add one">+</button>
  </div>`;
}

function priceHtml(p) {
  return `<div class="price ${p.was ? "special" : ""} ${isRange(p) ? "range" : ""}">${priceText(p)}${p.unit ? `<span class="per"> /${esc(p.unit)}</span>` : ""}${p.was ? `<span class="was">${money(p.was)}</span>` : ""}</div>
    ${isRange(p) ? `<div class="range-note">Price depends on size</div>` : ""}`;
}

function productCard(p) {
  // The Bangladeshi view shows the Bengali name where the catalogue has one.
  const bn = view === "bd" && p.bn ? `<div class="card-bn bn">${esc(p.bn)}</div>` : "";
  return `<article class="card">
    ${p.was ? `<span class="badge">Save ${money(p.was - p.price)}</span>` : ""}
    <a href="#/product/${p.id}" class="card-img">${productImage(p, "pimg")}</a>
    <div class="card-body">
      ${priceHtml(p)}
      <a href="#/product/${p.id}" class="card-name">${esc(p.name)}</a>
      ${bn}
      <div class="card-size">${esc(p.size)}${p.brand ? ` · ${esc(p.brand)}` : ""}</div>
      <div class="card-actions" data-actions="${p.id}">${qtyControl(p)}</div>
    </div>
  </article>`;
}

function catTile(id) {
  const c = catById[id];
  return `<a href="#/category/${c.id}" class="cat-tile" style="background:${c.color}">
    <span class="ico">${c.icon}</span><span class="nm ${view === "bd" ? "bn" : ""}">${catName(c)}</span>
    ${catSub(c) ? `<span class="sub">${catSub(c)}</span>` : ""}</a>`;
}

function renderCatNav(active) {
  document.getElementById("catNav").innerHTML =
    `<a href="#/specials" class="${active === "specials" ? "active" : ""}">⭐ ${T("specials")}</a>` +
    V().nav.map(id => {
      const c = catById[id];
      return `<a href="#/category/${id}" class="${active === id ? "active" : ""} ${view === "bd" ? "bn" : ""}">${catName(c)}</a>`;
    }).join("");
}

// ---------- Pages ----------
function homePage() {
  const v = V();
  const sections = v.sections.map(s => `
    <div class="section-head"><h2 class="${view === "bd" ? "bn" : ""}">${s.title}${s.sub ? ` <small>${s.sub}</small>` : ""}</h2></div>
    <div class="grid">${s.ids.map(id => productById[id]).filter(Boolean).map(productCard).join("")}</div>`).join("");

  const discover = v.discover.length ? `
    <section class="discover">
      <div><h2>${T("discover")}</h2><p>${T("discoverText")}</p></div>
      <div class="cat-grid small">${v.discover.map(catTile).join("")}</div>
    </section>` : "";

  return `
  <section class="hero">
    <div class="hero-main">
      <p class="kicker bn">${v.hero.kicker}</p>
      <h1 class="${view === "bd" ? "bn" : ""}">${v.hero.title}</h1>
      <p>${v.hero.text}</p>
      <a href="${v.hero.cta[1]}" class="btn btn-light ${view === "bd" ? "bn" : ""}">${v.hero.cta[0]}</a>
    </div>
    <div class="hero-side">
      ${v.promos.map(p => `<a href="${p.href}" class="promo ${p.cls}"><h3 class="bn">${p.title}</h3><p>${p.text}</p></a>`).join("")}
    </div>
  </section>

  <button class="switch-hint" data-view="${view === "au" ? "bd" : "au"}">${T("switchHint")} →</button>

  <div class="section-head"><h2 class="${view === "bd" ? "bn" : ""}">${T("shopBy")}</h2></div>
  <div class="cat-grid">${v.tiles.map(catTile).join("")}</div>

  ${sections}
  ${discover}

  <div class="services">
    ${v.services.map(([i, b, s]) => `<div class="service"><span class="ico">${i}</span><div><b class="bn">${b}</b><span class="bn">${s}</span></div></div>`).join("")}
  </div>`;
}

function listingPage({ title, sub, intro, crumbs, items, activeCat }) {
  const sort = new URLSearchParams(location.hash.split("?")[1] || "").get("sort") || "popular";
  const sorted = [...items];
  if (sort === "low") sorted.sort((a, b) => a.price - b.price);
  if (sort === "high") sorted.sort((a, b) => b.price - a.price);
  if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  return `
  <div class="crumbs"><a href="#/">Home</a> › ${crumbs}</div>
  <div class="page-title"><h1 class="${view === "bd" ? "bn" : ""}">${esc(title)}</h1>${sub ? `<span class="sub">${esc(sub)}</span>` : ""}</div>
  ${intro ? `<p class="intro bn">${esc(intro)}</p>` : ""}
  <div class="layout">
    <aside class="sidebar">
      <h4>${T("shopBy")}</h4>
      <a href="#/specials" class="${activeCat === "specials" ? "active" : ""}">⭐ ${T("specials")}</a>
      ${V().nav.map(id => {
        const c = catById[id];
        return `<a href="#/category/${id}" class="${activeCat === id ? "active" : ""}"><span class="${view === "bd" ? "bn" : ""}">${c.icon} ${catName(c)}</span> <small>${PRODUCTS.filter(p => p.cat === id).length}</small></a>`;
      }).join("")}
    </aside>
    <section>
      <div class="toolbar">
        <span class="note bn">${T("items")(items.length)}</span>
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
        : `<div class="empty panel"><div class="big">🔎</div><p>No products found. Try “rice”, “fish” or “pickle”.</p></div>`}
    </section>
  </div>`;
}

function categoryPage(id) {
  const c = catById[id];
  if (!c) return notFound();
  return listingPage({ title: catName(c), sub: catSub(c), intro: catText(c), crumbs: esc(catName(c)),
    items: PRODUCTS.filter(p => p.cat === id), activeCat: id });
}

function specialsPage() {
  const title = view === "bd" ? "এই সপ্তাহের অফার" : "This week's specials";
  return listingPage({ title, sub: view === "bd" ? "Special of the week" : "", crumbs: T("specials"),
    items: V().specials.map(id => productById[id]).filter(Boolean), activeCat: "specials" });
}

function searchPage(q) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const items = PRODUCTS.filter(p => {
    const c = catById[p.cat];
    const hay = `${p.name} ${p.bn || ""} ${p.brand || ""} ${c.en} ${c.bn}`.toLowerCase();
    return terms.every(t => hay.includes(t));
  });
  return listingPage({ title: `“${q}”`, crumbs: "Search", items });
}

function productPage(id) {
  const p = productById[id];
  if (!p) return notFound();
  const c = catById[p.cat];
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  return `
  <div class="crumbs"><a href="#/">Home</a> › <a href="#/category/${c.id}" class="${view === "bd" ? "bn" : ""}">${catName(c)}</a> › ${esc(p.name)}</div>
  <div class="pdp">
    <div class="pdp-img">${productImage(p, "pimg")}</div>
    <div>
      <h1>${esc(p.name)}</h1>
      ${p.bn ? `<div class="pdp-bn bn">${esc(p.bn)}</div>` : ""}
      <div class="size">${esc(p.size)}${p.brand ? ` · ${esc(p.brand)}` : ""}</div>
      ${priceHtml(p)}
      <div class="unit">GST included where applicable</div>
      <div class="pdp-actions" data-actions="${p.id}">${qtyControl(p)}</div>
      <div class="pdp-info">
        <p class="bn">${esc(p.note || catText(c))}</p>
        <ul>
          <li>Category: <a href="#/category/${c.id}" style="color:var(--green)">${c.en} · <span class="bn">${c.bn}</span></a></li>
          <li>${p.cat === "hot" ? "Pick-up only — prepared fresh in store" : "Available for delivery or click &amp; collect"}</li>
        </ul>
      </div>
    </div>
  </div>
  ${related.length ? `<div class="section-head"><h2 class="${view === "bd" ? "bn" : ""}">${view === "bd" ? `আরও ${c.bn}` : `More in ${c.en}`}</h2></div><div class="grid">${related.map(productCard).join("")}</div>` : ""}`;
}

function cartPage() {
  const lines = cartLines();
  if (!lines.length) {
    return `<div class="empty panel"><div class="big">🛒</div><h2>Your cart is empty</h2>
      <p class="note">Browse our weekly specials and favourites.</p>
      <a href="#/" class="btn btn-primary">Start shopping</a></div>`;
  }
  const sub = cartSubtotal();
  const subMax = cartSubtotalMax();
  const ranged = cartHasRange();
  const toFree = Math.max(0, FREE_DELIVERY_MIN - sub);
  return `
  <div class="page-title"><h1>Your cart</h1><span class="sub">${cartCount()} items</span></div>
  <div class="cart-layout">
    <div class="panel">
      ${lines.map(({ p, qty }) => `
        <div class="cart-line">
          <a href="#/product/${p.id}" class="thumb">${productImage(p, "pimg")}</a>
          <div>
            <a href="#/product/${p.id}" class="nm">${esc(p.name)}</a>
            <div class="sz">${esc(p.size)} · ${priceText(p)} ${perText(p)}</div>
            <button class="remove" data-remove="${p.id}">Remove</button>
          </div>
          <div data-actions="${p.id}">${qtyControl(p, true)}</div>
          <div class="line-total">${rangeText(p.price * qty, maxPrice(p) * qty)}</div>
        </div>`).join("")}
    </div>
    <aside class="panel">
      <h3 style="margin-top:0">Order summary</h3>
      ${toFree > 0
        ? `<div class="note">Add <b>${money(toFree)}</b> more for free delivery</div>`
        : `<div class="note">✅ You've unlocked free delivery</div>`}
      <div class="progress"><div style="width:${Math.min(100, (sub / FREE_DELIVERY_MIN) * 100)}%"></div></div>
      <div class="summary-row"><span>Subtotal</span><span>${rangeText(sub, subMax)}</span></div>
      <div class="summary-row"><span>Delivery</span><span>Calculated at checkout</span></div>
      <div class="summary-row total"><span>${ranged ? "Estimated total" : "Total"}</span><span>${rangeText(sub, subMax)}</span></div>
      ${ranged ? `<p class="note">Some items are priced by size or weight. We confirm the final price when we pack your order.</p>` : ""}
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
      ${lines.map(({ p, qty }) => `<div class="summary-row note"><span>${qty}${p.unit ? ` ${esc(p.unit)}` : ""} × ${esc(p.name)}</span><span>${rangeText(p.price * qty, maxPrice(p) * qty)}</span></div>`).join("")}
      <div class="summary-row" style="margin-top:14px"><span>Subtotal</span><span>${rangeText(sub, cartSubtotalMax())}</span></div>
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
  const subMax = cartSubtotalMax();
  const refresh = () => {
    const delivery = form.method.value === "delivery";
    const fee = delivery && sub < FREE_DELIVERY_MIN ? DELIVERY_FEE : 0;
    document.getElementById("feeCell").textContent = delivery ? (fee ? money(fee) : "Free") : "Pick-up (free)";
    document.getElementById("totalCell").textContent = rangeText(sub + fee, subMax + fee);
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
function route(keepScroll = false) {
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
  if (!keepScroll) window.scrollTo(0, 0);
}

// ---------- Events ----------
document.addEventListener("click", e => {
  const vt = e.target.closest("[data-view]");
  if (vt) { setView(vt.dataset.view); return; }

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

// A shared link can pick the view, e.g. index.html?view=bd
const urlView = new URLSearchParams(location.search).get("view");
if (VIEWS[urlView]) { view = urlView; store("brismart-view", view); }

window.addEventListener("hashchange", () => route());
applyView();
updateHeader();
route();
loadLiveProducts();

// ---------- Live catalogue (Supabase) ----------
// The page renders straight away from the built-in catalogue, then swaps in the live one.
function productFromRow(r) {
  return {
    id: Number(r.id), cat: r.cat, name: r.name, bn: r.bn || undefined, brand: r.brand || undefined,
    size: r.size || "each", price: Number(r.price), max: r.price_max != null ? Number(r.price_max) : undefined,
    unit: r.price_unit || undefined, img: r.img || undefined, icon: r.icon || "🛒", note: r.note || undefined,
  };
}

async function loadLiveProducts() {
  const cfg = window.BRISMART_CONFIG || {};
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) return;
  try {
    const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    const { data, error } = await client.from("products").select("*").eq("active", true).order("id", { ascending: false });
    if (error) throw error;
    if (!data.length) return;
    PRODUCTS = data.map(productFromRow);
    indexProducts();
    updateHeader();
    // Don't wipe a checkout form the customer has started filling in.
    if (!location.hash.startsWith("#/checkout")) route(true);
  } catch (err) {
    console.warn("Live catalogue unavailable, using built-in products.", err);
  }
}
