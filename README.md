# MiTrack PNG Website

Static multi-page marketing site for MiTrack PNG.

## Project structure

- `index.html`, `about.html`, `service.html`, `contact.html`: Page templates
- `css/style.css`: Shared styling
- `js/main.js`: Shared navigation + contact form behavior
- `assets/images/logo.png`: Brand logo
- `scripts/`: Lightweight QA checks

## Contact form provider

The contact form is wired to [FormSubmit](https://formsubmit.co/) via:

- `https://formsubmit.co/ajax/mitrack@mitrack.com.au`

If you want to route messages to a different email provider/account:

1. Update the `action` URL in `contact.html`.
2. Keep `id="contact-form"` and `data-ajax="true"` for JS success/error UX.
3. Verify the destination inbox with your provider (required by most services).

## Local development

Run a local web server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## QA checks

Run all checks:

```bash
python scripts/validate_html.py
python scripts/lint_css.py
python scripts/check_links.py
```

## Deployment

This repository can be deployed as a static site on:

- GitHub Pages
- Netlify
- Cloudflare Pages
- Any Nginx/Apache static host

### GitHub Pages quick start

1. Push the repository to GitHub.
2. Go to **Settings → Pages**.
3. Set source to **Deploy from branch** and select the default branch.
4. Serve from the repository root (`/`).

## Optional CI

A GitHub Actions workflow is provided at `.github/workflows/ci.yml` to run QA checks on push/PR.
