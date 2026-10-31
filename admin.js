// Brismart staff dashboard: sign in, then add, edit, hide or delete products in Supabase.
// Security is enforced by the database rules in supabase/schema.sql, not by this page.
const cfg = window.BRISMART_CONFIG || {};
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = n => "$" + Number(n).toFixed(2);
const catById = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
const BUCKET = "product-images";

let db = null;
let products = [];
let editing = null;      // product row being edited, or null when adding
let photoChange = null;  // undefined = keep, null = remove, File = upload

function show(panel) {
  for (const id of ["setupPanel", "loginPanel", "deniedPanel", "dashPanel"]) $(id).hidden = id !== panel;
}

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

function priceLabel(p) {
  const range = p.price_max != null && Number(p.price_max) > Number(p.price);
  const base = range ? `${money(p.price)} – ${money(p.price_max)}` : money(p.price);
  return base + (p.price_unit ? ` /${p.price_unit}` : "");
}

// ---------- Auth ----------
async function init() {
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) { show("setupPanel"); return; }
  db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  db.auth.onAuthStateChange((_event, session) => onSession(session));
  const { data } = await db.auth.getSession();
  await onSession(data.session);
}

let lastUserId;
async function onSession(session) {
  const user = session?.user;
  if (user?.id === lastUserId && products.length) return;
  lastUserId = user?.id;
  $("userBox").hidden = !user;
  $("userEmail").textContent = user?.email || "";
  if (!user) { products = []; show("loginPanel"); return; }

  const { data: isAdmin, error } = await db.rpc("is_admin");
  if (error || !isAdmin) { show("deniedPanel"); return; }
  show("dashPanel");
  await loadProducts();
}

function signInMessage(error) {
  switch (error.code) {
    case "invalid_credentials": return "Wrong email or password.";
    case "email_not_confirmed": return "This account isn't confirmed yet. In Supabase, confirm the user (or recreate it with “Auto Confirm User” ticked).";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit": return "Too many attempts. Please wait a minute and try again.";
    case "email_provider_disabled": return "Email sign-in is turned off in Supabase (Authentication → Sign In / Providers → Email).";
    default: return "Sign in failed: " + (error.message || "unknown error");
  }
}

$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  $("loginError").textContent = "";
  $("loginBtn").disabled = true;
  const { error } = await db.auth.signInWithPassword({ email: $("email").value.trim(), password: $("password").value });
  $("loginBtn").disabled = false;
  if (error) $("loginError").textContent = signInMessage(error);
  else $("password").value = "";
});

$("signOutBtn").addEventListener("click", async () => {
  await db.auth.signOut();
  toast("Signed out");
});

// ---------- Product list ----------
async function loadProducts() {
  $("rows").innerHTML = `<tr><td colspan="6" class="note">Loading…</td></tr>`;
  const { data, error } = await db.from("products").select("*").order("id", { ascending: false });
  if (error) { $("rows").innerHTML = `<tr><td colspan="6" class="form-error">Couldn't load products: ${esc(error.message)}</td></tr>`; return; }
  products = data;
  renderRows();
}

function filtered() {
  const q = $("q").value.trim().toLowerCase();
  const cat = $("catFilter").value;
  const status = $("statusFilter").value;
  return products.filter(p => {
    if (cat && p.cat !== cat) return false;
    if (status === "visible" && !p.active) return false;
    if (status === "hidden" && p.active) return false;
    if (status === "range" && !(p.price_max != null && Number(p.price_max) > Number(p.price))) return false;
    if (q && !`${p.name} ${p.bn || ""} ${p.brand || ""}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderRows() {
  const list = filtered();
  const hidden = products.filter(p => !p.active).length;
  $("stats").textContent = `${products.length} products · ${hidden} hidden · showing ${list.length}`;
  $("rows").innerHTML = list.map(p => {
    const c = catById[p.cat];
    const thumb = p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : `<span>${esc(p.icon || "🛒")}</span>`;
    return `<tr class="${p.active ? "" : "is-hidden"}">
      <td class="t-thumb">${thumb}</td>
      <td><b>${esc(p.name)}</b>${p.bn ? `<div class="bn note">${esc(p.bn)}</div>` : ""}<div class="note">${esc(p.size || "")}${p.brand ? ` · ${esc(p.brand)}` : ""}</div></td>
      <td>${c ? `${esc(c.en)}` : `<span class="form-error">${esc(p.cat)}</span>`}</td>
      <td class="t-price">${priceLabel(p)}</td>
      <td><label class="switch"><input type="checkbox" data-toggle="${p.id}" ${p.active ? "checked" : ""} aria-label="Visible to customers"><span></span></label></td>
      <td><button class="btn btn-outline btn-sm" data-edit="${p.id}" type="button">Edit</button></td>
    </tr>`;
  }).join("") || `<tr><td colspan="6" class="note">No products match.</td></tr>`;
}

$("catFilter").innerHTML = `<option value="">All categories</option>` + CATEGORIES.map(c => `<option value="${c.id}">${esc(c.en)}</option>`).join("");
$("f_cat").innerHTML = CATEGORIES.map(c => `<option value="${c.id}">${esc(c.en)} · ${esc(c.bn)}</option>`).join("");
for (const id of ["q", "catFilter", "statusFilter"]) $(id).addEventListener("input", renderRows);

$("rows").addEventListener("click", e => {
  const b = e.target.closest("[data-edit]");
  if (b) openEditor(products.find(p => p.id === Number(b.dataset.edit)));
});

$("rows").addEventListener("change", async e => {
  const t = e.target.closest("[data-toggle]");
  if (!t) return;
  const p = products.find(x => x.id === Number(t.dataset.toggle));
  const { data, error } = await db.from("products").update({ active: t.checked }).eq("id", p.id).select().single();
  if (error) { t.checked = !t.checked; toast("Couldn't update: " + error.message); return; }
  Object.assign(p, data);
  renderRows();
  toast(`${p.name} is now ${p.active ? "visible" : "hidden"}`);
});

// ---------- Editor ----------
const dlg = $("editDialog");
const form = $("editForm");

function setPhotoPreview(src, icon) {
  $("photoPreview").innerHTML = src ? `<img src="${esc(src)}" alt="">` : `<span>${esc(icon || "🛒")}</span>`;
}

function syncPriceUi() {
  const range = form.ptype.value === "range";
  $("maxField").hidden = !range;
  $("priceLabel").textContent = range ? "Lowest price ($) *" : "Price ($) *";
  const lo = parseFloat(form.price.value), hi = parseFloat(form.max.value);
  const unit = form.unit.value;
  let text = "";
  if (!isNaN(lo)) {
    text = range && !isNaN(hi) ? `${money(lo)} – ${money(hi)}` : money(lo);
    text = "Customers see: " + text + (unit ? ` /${unit}` : "") + (range ? " · “Price depends on size”" : "");
  }
  $("pricePreview").textContent = text;
}
form.addEventListener("input", e => { if (e.target.name !== "photo") syncPriceUi(); });

function openEditor(p) {
  editing = p || null;
  photoChange = undefined;
  form.reset();
  $("editError").textContent = "";
  $("dlgTitle").textContent = p ? "Edit product" : "Add product";
  $("deleteBtn").hidden = !p;
  form.name.value = p?.name || "";
  form.bn.value = p?.bn || "";
  form.brand.value = p?.brand || "";
  form.cat.value = p?.cat || $("catFilter").value || CATEGORIES[0].id;
  form.size.value = p?.size || "";
  form.price.value = p ? Number(p.price) : "";
  const range = p && p.price_max != null && Number(p.price_max) > Number(p.price);
  form.ptype.value = range ? "range" : "fixed";
  form.max.value = range ? Number(p.price_max) : "";
  form.unit.value = p?.price_unit || "";
  form.icon.value = p?.icon || "";
  form.note.value = p?.note || "";
  form.active.checked = p ? p.active : true;
  setPhotoPreview(p?.img, p?.icon);
  syncPriceUi();
  dlg.showModal();
  form.name.focus();
}

$("addBtn").addEventListener("click", () => openEditor(null));
dlg.addEventListener("click", e => { if (e.target.closest("[data-close]")) dlg.close(); });

$("f_photo").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { $("editError").textContent = "That photo is over 5 MB. Please choose a smaller one."; e.target.value = ""; return; }
  photoChange = file;
  setPhotoPreview(URL.createObjectURL(file));
});
$("removePhoto").addEventListener("click", () => {
  photoChange = null;
  $("f_photo").value = "";
  setPhotoPreview(null, form.icon.value);
});

async function uploadPhoto(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const slug = form.name.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "product";
  const path = `${Date.now()}-${slug}.${ext}`;
  const { error } = await db.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  const err = msg => { $("editError").textContent = msg; };
  const name = form.name.value.trim();
  const price = parseFloat(form.price.value);
  const range = form.ptype.value === "range";
  const max = parseFloat(form.max.value);
  if (!name) return err("Please enter a product name.");
  if (isNaN(price) || price < 0) return err("Please enter a valid price.");
  if (range && (isNaN(max) || max <= price)) return err("For a price range, the highest price must be more than the lowest price.");

  const row = {
    name, cat: form.cat.value,
    bn: form.bn.value.trim() || null, brand: form.brand.value.trim() || null,
    size: form.size.value.trim() || "each",
    price: Math.round(price * 100) / 100,
    price_max: range ? Math.round(max * 100) / 100 : null,
    price_unit: form.unit.value || null,
    icon: form.icon.value.trim() || null,
    note: form.note.value.trim() || null,
    active: form.active.checked,
  };

  $("saveBtn").disabled = true;
  try {
    if (photoChange instanceof File) row.img = await uploadPhoto(photoChange);
    else if (photoChange === null) row.img = null;

    const q = editing
      ? db.from("products").update(row).eq("id", editing.id).select().single()
      : db.from("products").insert(row).select().single();
    const { data, error } = await q;
    if (error) throw error;
    if (editing) Object.assign(editing, data); else products.unshift(data);
    dlg.close();
    renderRows();
    toast(`Saved ${data.name}`);
  } catch (ex) {
    err("Couldn't save: " + (ex.message || ex));
  } finally {
    $("saveBtn").disabled = false;
  }
});

$("deleteBtn").addEventListener("click", async () => {
  if (!editing) return;
  const ok = confirm(`Delete “${editing.name}” permanently?\n\nTip: to take it off the shop for now, untick “Visible to customers” instead.`);
  if (!ok) return;
  const { error } = await db.from("products").delete().eq("id", editing.id);
  if (error) { $("editError").textContent = "Couldn't delete: " + error.message; return; }
  products = products.filter(p => p.id !== editing.id);
  dlg.close();
  renderRows();
  toast("Product deleted");
});

init();
