# Cloudflare Pages preflight — Evidanor v0.3.1

Checked locally on 29 October 2026. **Nothing was deployed, pushed or merged.**

| Setting | Intended value / inspected state |
| --- | --- |
| Install | `npm ci` using the committed lockfile |
| Build | `npm run build` (TypeScript + Vite) |
| Output | `dist` |
| Base | Vite default `/`; application intended at the site root |
| Router | React Router `BrowserRouter`; normal pathname routes and query-based equipment/follow-up panels |
| Static output | `index.html`, `favicon.svg`, hashed `assets/` |
| Custom 404 | None in `public/` or generated top-level `dist/` |
| Redirect fallback | No `_redirects` file added; no redundant catch-all rule |

Cloudflare's [official Serving Pages documentation](https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering), checked during this preflight, states that Pages serves the SPA root for unmatched paths when no top-level custom `404.html` exists. The current output fits that documented routing behavior. The application's own Not Found component remains a client route, not a custom static `404.html`.

Production bundle was served locally on port 4173. Direct navigation and refresh worked for `/assets?asset=AHU-OT-01`, the asset-bound focused Start Review route, and a newly created focused draft. An existing OT draft and the new focused draft restored together. Deep report/follow-up links from a different origin correctly showed clear missing-record states rather than reconstructing history from seed telemetry. Console warnings/errors were absent in the production check.

This is **local preflight**, not a test of an actual Cloudflare deployment. Cloudflare project/domain/build-environment settings have not been configured here. After an authorized deployment, verify direct route refreshes on the deployed hostname and both print modes in the intended browser.

## Data and access boundaries

- localStorage belongs to a browser profile and origin. Development, preview and deployed origins have different records; local reviews/actions are not automatically uploaded or copied to a deployed site.
- Different visitors have independent synthetic equipment scenarios, reviews, follow-ups and guide sessions. No shared database or account synchronization exists.
- A private GitHub repository does not authenticate visitors to a deployed website. This prototype has no application authentication or production access controls.
- Use only fictional/synthetic information. No real hospital, patient or confidential operational data should be entered.
- No authentication, cloud storage, equipment integration or deployment service was added in this task.
