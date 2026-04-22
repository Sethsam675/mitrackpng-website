# MiTrack PNG Website

Static marketing website for MiTrack PNG tracking, CCTV, monitoring, and security response services.

## Structure

- `index.html` - Home page and primary service highlights.
- `about.html` - Company mission and expertise.
- `products.html` - Product capabilities and feature lists.
- `contact.html` - Contact form and contact details.
- `css/style.css` - Shared responsive styling.
- `js/main.js` - Menu toggle, reveal animations, and contact form AJAX fallback.
- `assets/images/` - Logo, background, and map imagery.
- `scripts/` - Lightweight validation checks.

## Preview

Open `index.html` directly in a browser, or serve the folder with a simple local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Validation

Run these checks before publishing changes:

```bash
python scripts/validate_html.py
python scripts/check_links.py
python scripts/lint_css.py
python scripts/check_shared_markup.py
```

## Contact Form

The contact form posts to FormSubmit using the public business address `mitrack@mitrack.com.au`. If the destination changes, update both the form `action` in `contact.html` and the visible email links in the page/footer.

## Shared Content

Navigation and footer markup are repeated across the static HTML pages. When changing phone numbers, email addresses, navigation links, stylesheets, scripts, or font links, update all pages and rerun the validation scripts.
