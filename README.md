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
- `data.js`: categories, the two views (category order, home sections, specials), UI text and hot food items
- `app.js`: hash-based router, view toggle, cart and checkout logic
- `assets/products/`: product photos (360×360 JPEG)
- `tools/build_catalogue.py`: rebuilds `products.js` and the photos from the Hutbazar product API

## Refresh the catalogue
```bash
curl -s "https://api.hutbazar.com.au/api/product?page=1&paginate=1000&status=1" -o products.json
python tools/build_catalogue.py products.json .
```
Category assignments and name fixes are at the top of `tools/build_catalogue.py`.
