# Brismart

Clickable prototype of an online store for **Brismart**, a Bangladeshi grocery at 80 Ipswich Rd, Woolloongabba, Brisbane.

**Live demo:** https://mdabashar.github.io/Brismart/

> Prototype only. Product names, prices and images are placeholders. No orders are sent and no payments are taken.

## What's included
- **Home page:** hero banner, weekly specials, category tiles, popular products and in-store services (Western Union, Amazon returns)
- **Category pages:** 11 categories with sorting and a sidebar (rice, spices, lentils, frozen fish, sweets, hot food and more)
- **Search** across product names and descriptions
- **Product pages** with related items
- **Cart:** quantity controls, savings and a free-delivery progress bar. The cart is kept in the browser's localStorage.
- **Checkout mock-up:** delivery or click-and-collect, time slots, customer details, payment choice and an order confirmation page. Hot food is pick-up only.
- Responsive layout for phones and desktops

## Run locally
It's a static site with no build step. Serve the folder:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Files
- `index.html`: page shell (header, navigation, footer)
- `styles.css`: all styling
- `data.js`: sample categories and products. Edit this file to change the catalogue.
- `app.js`: hash-based router, cart and checkout logic
