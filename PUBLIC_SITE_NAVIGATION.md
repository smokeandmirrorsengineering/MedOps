# Public site navigation update — 20 November 2026

The public presentation now uses separate pages instead of one long page with section anchors. The existing visual direction, real product captures and synthetic-demo disclosures are retained.

| Public page | Route | Content |
| --- | --- | --- |
| Home | `/` | Product hero, genuine dashboard preview and three links to learn more |
| Engineering workflow | `/engineering-workflow` | Abnormal condition → investigation → documented follow-up → separate re-verification |
| Service coordination | `/service-coordination` | Fictional CT service/quotation example and link to the actual case |
| Equipment | `/equipment` | Monitored/manual equipment distinction and compact stakeholder benefits |
| Explore the demo | `/explore-demo` | Working dashboard, focused investigation and CT service entry points |

All public pages share the header, footer, home link and **Explore Live Demo** action. Navigation identifies the current page. The mobile menu includes Home, closes on navigation and restores scrolling; page changes move focus to the new main content and scroll to the top. Page titles change with the destination. Each public page has one H1 and sequential heading levels.

Public routes are declared in `src/landing/destinations.ts` and mounted outside AppLayout. Operational routes, providers, calculations, persistence, report/print code and styles remain intact. The landing styles load through a small lazy entry module; presentation components can be checked without loading CSS in the Node tests. No new dependency or project configuration change.

## Verification

- `npm test`: **118 passed, 0 failed**. Six additional checks cover all public page identities, page-specific content, heading hierarchy, navigation destinations/current-page state, and separation from operational paths. The existing operational regression suite remains included.
- `npm run build`: TypeScript and Vite production build passed.
- Actual browser review at desktop 1440×1000, tablet 1024×768, phone 390×844 and small phone 320×640. Public navigation opens distinct pages with the expected headings and active links. No horizontal overflow observed in the reviewed layouts.
- Workflow/service direct refresh, browser Back/Forward, mobile page navigation, menu dismissal and focus transfer checked in the actual application. Dashboard and CT case entry links open their original operational screens.
- The public homepage no longer renders the workflow steps, full CT quotation section, equipment coverage section or guided-demo section together. Those sections render only on their own routes.
- The original Taste visual review is historical in `LANDING_VERIFICATION.md`. This update reuses that design and focuses verification on routing, page composition, accessibility and responsive navigation; its old gate/performance results are not presented as newly executed checks.

Screenshots: [desktop workflow page](docs/landing/workflow-desktop.jpg), [mobile navigation](docs/landing/mobile-navigation.jpg), and refreshed [homepage desktop](docs/landing/desktop.jpg) / [homepage mobile](docs/landing/mobile.jpg).

This update is committed locally on `codex/evidanor-public-landing`. No push or deployment. Physical device and print-dialog tests were not repeated for this navigation-only change.
