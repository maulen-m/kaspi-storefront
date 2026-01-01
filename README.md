# ACMEWEAR Website (Static, Hostinger-friendly)

This is a premium minimal storefront template for **ACMEWEAR** (sportswear brand, Kazakhstan).
It is designed to look like a legitimate operating business website for **Meta / WhatsApp API verification**.

## Quick deploy (Hostinger)
1. Download and unzip the site.
2. In Hostinger **File Manager**, open `public_html/`
3. Upload all files/folders from this project into `public_html/`
4. Make sure `index.html` sits directly inside `public_html/`
5. Enable SSL (HTTPS) in Hostinger panel.

## Edit the most important placeholders (do this before verification)
Search/replace these across HTML files:
- `support@acmewear.kz`  → your real domain mailbox
- `+7 (7XX) XXX-XX-XX`  → your real phone
- `Almaty, Kazakhstan (replace)` → your real address or legal address
- Instagram/TikTok placeholder links

**Keep your domain and email aligned**:
- Website: `https://acmewear.kz`
- Email: `support@acmewear.kz`

## Update products (easy)
Edit:
- `assets/data/products.js`

Each product has:
- `sku`, `name`, `category`, `price_kzt`, `short_description`
- `sizes`, `colors`
- `images` (paths like `assets/img/product-1.jpg`)

## Replace images
Current placeholders:
- `assets/img/placeholder.svg`
- `assets/img/og-image.svg`

To add real images:
1. Put images into `assets/img/`
2. Update each product’s `images` array in `assets/data/products.js`

## Cart and checkout
- Cart works via `localStorage` (frontend-only).
- Checkout is UI-only (no payments). It encourages ordering via WhatsApp/email for now.

## Files
- `assets/css/styles.css` → site styles (premium minimal)
- `assets/js/main.js` → cart drawer + cart storage + home product rendering
- `assets/js/shop.js` → shop filters + product grid
- `assets/js/product.js` → product page rendering
- `assets/js/cart.js` → cart page rendering
- `assets/js/checkout.js` → checkout placeholder rendering
- `policies/*.html` → trust pages (privacy/terms/shipping/payment/faq)

## Domain note
This template uses `https://acmewear.kz` in `sitemap.xml`, `robots.txt`, and canonical tags.
After you buy your final domain, update:
- `robots.txt`
- `sitemap.xml`
- canonical URLs inside `<head>` tags (optional but recommended)
