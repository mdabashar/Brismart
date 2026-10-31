# Brismart

Clickable prototype of an online store for **Brismart Food & Grocery Store**, 80 Ipswich Rd, Woolloongabba, Brisbane.

**Live demo:** https://mdabashar.github.io/Brismart/
(open the Bangladeshi view directly with https://mdabashar.github.io/Brismart/?view=bd)

> Prototype only. No orders are sent and no payments are taken. Product photos, names and prices come from Brismart's existing [Hutbazar](https://www.hutbazar.com.au/) store, used with the owner's permission. Hot food items are placeholders.

## Two shop views
Brismart serves two customer groups, so a toggle in the header switches between two views of the same store. The cart is shared, and the choice is remembered on the device.

| | Everyday view | দেশি (Deshi) view |
|---|---|---|
| For | General Australian customers | Bangladeshi community |
| Language | English | Bengali first, with English |
| Category order | Essentials, hot food, drinks, snacks, curry kits, halal meat… | Fish, meat, rice & dal, spices, ready-mix masala, deshi veg, shutki… |
| Home page | Quick essentials, curry night, party & BBQ, "try something new", and a "Discover Bangladeshi food" section | Special of the week, fish bazar, pitha season, shutki & bhorta, Ramadan & Eid |
| Product cards | English name | English name plus Bengali name where available |

## What's included
- 273 real products with photos across 17 categories, plus 4 hot food placeholders
- Home pages, category pages with sorting, search (English and Bengali), and product pages
- Cart with a free-delivery progress bar, kept in the browser's localStorage
- Checkout mock-up: delivery or click-and-collect, time slots, details, payment choice and confirmation. Hot food is pick-up only.
- Responsive layout for phones and desktops

## Run locally
It's a static site with no build step:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Files
- `index.html`: page shell (header, view toggle, navigation, footer)
- `styles.css`: all styling, including the Deshi view theme
- `products.js`: generated product catalogue. Don't edit by hand.
- `data.js`: categories, the two views (category order, home sections, specials), UI text, and extra items (hot food, whole hilsa)
- `app.js`: hash-based router, view toggle, price ranges, cart and checkout logic, and live catalogue loading
- `admin.html`, `admin.js`, `admin.css`: staff dashboard (sign in, add, edit, hide, delete products, upload photos)
- `config.js`: Supabase project URL and public key
- `supabase/schema.sql`, `supabase/seed.sql`: database tables, security rules and the starting catalogue
- `tools/make_seed.py`: rebuilds `supabase/seed.sql` from `products.js` and `data.js`
- `assets/products/`: product photos (360×360 JPEG)
- `tools/build_catalogue.py`: rebuilds `products.js` and the photos from the Hutbazar product API

## Refresh the catalogue
```bash
curl -s "https://api.hutbazar.com.au/api/product?page=1&paginate=1000&status=1" -o products.json
python tools/build_catalogue.py products.json .
```
Category assignments, name fixes and price ranges are at the top of `tools/build_catalogue.py`.
Once the dashboard is live, edit products there instead.

## Price ranges
A product can have one price or a range (lowest to highest), and can be sold each or by weight (per kg, pack, dozen or litre).
For example, whole hilsa shows **$25.00 – $40.00 /kg** with "Price depends on size". In the cart, range-priced items give an
estimated total range, and checkout tells the customer the final price is confirmed when the order is packed.

## Staff dashboard setup (Supabase)
The shop works without this, from the built-in catalogue. To let staff edit products:

1. **Create a project.** Sign up at [supabase.com](https://supabase.com) (free plan) and create a project. Choose the Sydney region.
2. **Create the tables.** In the project, open **SQL Editor → New query**, paste all of `supabase/schema.sql` and click **Run**.
   Then do the same with `supabase/seed.sql` to load the 278 products.
3. **Turn off public sign-ups.** **Authentication → Sign In / Providers**: turn off **Allow new users to sign up**.
4. **Create the staff login.** **Authentication → Users → Add user → Create new user**. Enter the owner's email and a strong
   password, and tick **Auto Confirm User**.
5. **Give that login staff access.** In the SQL Editor run (with the real email):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'owner@example.com';
   ```
6. **Connect the site.** **Project Settings → API**: copy the **Project URL** and the **anon public** key into `config.js`,
   then commit and push. (The anon key is designed to be public. Never put the **service_role** key in the site.)

Staff then sign in at **/admin.html** (or the **Staff login** link in the footer). Changes appear on the shop for every customer
on their next page load. Unticking **Visible to customers** hides a product without deleting it.

Security: only users listed in `public.admins` can add, change or delete products or upload photos. This is enforced by the
database's row-level security rules, so it holds even if someone copies the page code.
