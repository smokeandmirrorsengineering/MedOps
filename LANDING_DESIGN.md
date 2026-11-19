# Evidanor public site

20 November update: the approved presentation is now divided into five public pages. `/` contains the product hero and three concise links to learn more; `/engineering-workflow`, `/service-coordination`, `/equipment` and `/explore-demo` contain the corresponding existing sections. Shared public navigation uses real routes, current-page indicators and a home link. Operational `/service` remains separate from public `/service-coordination`. See [PUBLIC_SITE_NAVIGATION.md](PUBLIC_SITE_NAVIGATION.md) for the current checks. The initial design rationale follows.

Kind: software. Audience: hospital engineering leadership, biomedical engineers, facilities managers. Primary action: Explore Live Demo → `/dashboard`.

Taste Skill 2.5.1 dealt a centred hero and Geist typography. Its brand command generated the navy/teal palette from existing Evidanor colours. Product screenshots provide the visual detail. The brief's restrained motion, concise sections, existing brand and genuine screens take precedence over the skill's optional effects, random palettes and full-screen section requirements. Its global starter/styles are adapted into scoped React/CSS to preserve the operational application's layout.

Voice: direct engineering language. Name the equipment, evidence, responsible action and record. Claims come from v0.4 source and actual rendered screens. No assumed customers, performance metrics, integrations, contact addresses or prices. The CT quotation is a documented fictional example. Existing product name retained.

Page narrative:

1. Hero — hospital engineering in view, product-wide dashboard screenshot, primary demo action. Centred composition, neutral canvas, navy headings and teal actions. Mobile has a dedicated actual mobile capture.
2. Product / workflow — relevant equipment evidence beside the ordered condition → investigation → follow-up → re-verification sequence. Link to the existing focused investigation entry point. Explicit separate verification records and frozen history.
3. Service coordination — genuine CT case screenshot, actual source reference, provider quotation and pending administrative decision, with a direct case link.
4. Equipment / audience — monitored infrastructure and manually managed CT/MRI service records. Compact stakeholder benefits grounded in working features.
5. Explore the demo / close — three routes into Dashboard, Reviews and the CT case. Closing action and restrained footer disclosure.

Assets are actual captures from a separate fresh local origin on port 5190, using deterministic data without editing existing browser records. Sources: `/dashboard`, dashboard equipment drawer MG-O2-01, `/service/cases/SC-DEMO-CT-001`. Dates and amounts inside the captures are synthetic source data. Images are links to the corresponding current app screens, whose state may change as a visitor uses the demo. No independent mock application or duplicate domain logic.

Fonts: locally served Geist Latin variable font, Google Fonts, SIL Open Font License in `public/landing/fonts/OFL.txt`. Operational screens keep their existing typography. Existing Evidanor BrandMark and Lucide icons reused. No additional application dependency.

Routing: `/` is a public page outside AppLayout. All existing operational paths keep AppLayout. Landing assets/styles are lazy-loaded with the page. Metadata describes the public product demonstration. Canonical URL omitted pending confirmation of the intended public hostname.

Verification and any Taste checker exceptions are recorded after implementation in `LANDING_VERIFICATION.md`.
