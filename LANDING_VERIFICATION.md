GATE: OPEN 21 (rounds used up)

# Public landing page verification

Verified locally on 19 November 2026. Nothing was pushed, published or deployed.

## Implementation and scope

- Public `/` route outside the operational AppLayout. Existing application routes and providers remain in place.
- Centred product hero, real dashboard/equipment/service imagery, engineering workflow, monitored/manual equipment distinction, compact stakeholder benefits and three guided demo links.
- Scoped navy/teal styling, self-hosted licensed Geist font, responsive image sources, keyboard navigation, visible focus and reduced-motion support. No additional dependency or duplicate application logic.
- Existing domain rules, state providers, storage schemas, simulation, operational styles, report generation and printing files are unchanged.

## Checks actually executed

| Check | Result |
| --- | --- |
| Baseline `npm test` | 111 passed, 0 failed |
| Baseline `npm run build` | Passed |
| Final `npm test` | 112 passed, 0 failed; added route integration coverage for the public demo destinations |
| Final `npm run build` | Passed; TypeScript and Vite production build |
| `git diff --check` | Passed |
| Actual browser review | Desktop 1440×1000, tablet 820×1180, plus overflow checks at 1024×768, 768×1024, 390×844 and 320×640 |
| Images and responsive sources | Loaded correctly after walking the page; dedicated mobile condition, evidence and quotation captures |
| Keyboard | Mobile menu opens with focus inside it; Tab wraps; Escape closes and returns focus; resizing to desktop dismisses the menu and restores scrolling |
| Landing/application isolation | Service summary retains its original Inter/system font after leaving the landing page; no landing typography leak |
| Console | No error or warning entries in the browser's final checks |
| Copy lint on rendered landing HTML | 0 FAIL, 0 WARN; informational triad/rhythm counts only |
| Taste full consistency review | Executed at 1440, 1024, 820, 768 and 390, with a 320 overflow walk. Used its findings to improve contrast, focus, type hierarchy and responsive imagery. Its full run passed reduced motion, collisions, overflow, links, image alternatives and control naming. It did not pass the skill's rigid template rules. |
| Final Taste gate | OPEN: 21 remaining findings, 5 explicitly documented waivers, 8 non-blocking warnings. It is not a PASS. Details below. |
| Standalone Taste layout script | Failed internally with `Cannot read properties of undefined (reading 'map')` / `r.sections is not iterable`. Not reported as passed. Actual browser review and the gate's layout/consistency results remain available. |

The first consistency attempt was interrupted when a task-created Chrome cache under the project triggered Vite's Windows file watcher (`EBUSY`). Subsequent checks used task-owned profiles in the OS temporary directory. Both preview servers were restored; the production preview is served at `http://127.0.0.1:5173/`.

### Final production performance sample

Taste `perf.mjs`, production root URL, three loads per viewport, CPU-rendered local Chrome:

| Measure | Desktop 1440 | Phone 390 |
| --- | --- | --- |
| Total transfer after page walk | 457.5 KiB | 313.1 KiB |
| Median LCP | 420 ms | 424 ms |
| Measured layout shift | 0.000 | 0.000 |
| Broken requests | 0 | 0 |
| Failures | 0 | 0 |

Two WARN rows refer to the same shared application bundle: approximately 500 KiB parsed JavaScript / 149 KiB compressed, once per viewport. The existing operational bundle is retained to keep this task out of an application refactor. Local timings are not field performance guarantees. An earlier file-based performance run reached the router's `/index.html` fallback rather than `/`; that sample was discarded and the actual production root was measured instead.

## Navigation and application regression review

- **Explore Live Demo**, dashboard preview and **Monitor Equipment** → `/dashboard`. The actual dashboard still shows the seeded 50 monitored assets and its condition/attention queue.
- Equipment evidence → `/assets?asset=MG-O2-01`. Actual oxygen manifold drawer, Critical condition and simulated 2.1 bar evidence verified.
- **Start an investigation** / **Investigate and Follow Up** → `/reviews/new?template=focused&subject=MG-O2-01`. Actual focused template and MG-O2-01 selection verified. No visitor-specific saved review ID is assumed.
- **Open the CT service case**, service preview and **Coordinate Service** → `/service/cases/SC-DEMO-CT-001`. Quotation DEMO-Q-CT-2026-01 verified; direct refresh works.
- Equipment rows resolve to actual AHU/MG monitoring drawers and `/service/equipment/CT-RAD-01` / `/service/equipment/MRI-RAD-01` lifecycle records.
- Existing `/alerts` and CT `/summary` rendered in the browser after visiting the landing page. The summary retains its print action and the visitor's previously saved service status/decision.
- Unit/integration coverage continues to check evaluation, uncertain/missing readings, simulations, storage, immutable reports, follow-ups, re-verification and service records. No browser records were reset or edited during this landing-page QA.

## Screenshot provenance and deliverables

Product images in `public/landing/` are genuine application captures from a separate fresh local origin on port 5190. They show deterministic synthetic seed records, not a live connection. Screenshots were cropped only for composition; no equipment data or UI was fabricated. A visitor who has already edited their browser-local demo can see different current case statuses or decisions.

- [Desktop landing screenshot](docs/landing/desktop.jpg), actual 1440×1000 browser viewport.
- [Mobile landing screenshot](docs/landing/mobile.jpg), actual 390×844 browser viewport.
- Full-page desktop/mobile captures and intermediate inspection crops remain local in `.qa/`.
- Licensed font: `public/landing/fonts/geist-latin-variable.woff2`; SIL OFL text beside it.

## Limitations and design-check interpretation

The brief's existing brand, restrained motion, concise narrative, real product imagery and protection of operational screens take precedence over the skill's optional template prescription. The remaining checks mostly demand exact full-screen section heights, particular class names/DOM wrappers and fixed split-column lines. The page uses normal content-driven sections and scoped `landing-*` classes instead. The demo-entry cards intentionally use icons and working links rather than a fourth unrelated product image.

No contact destination, customer claim, regulatory claim or equipment integration was invented. No canonical hostname was assumed. The share-image path should become an absolute URL when the public hostname is confirmed for a later deployment. Physical print dialogs and real devices were not retested; print code/styles are unchanged and existing report tests pass. Browser responsiveness was checked with viewport emulation, not physical phones.

The exact gate findings, warnings and waiver reasons follow so the automated design check's open status remains reviewable.

## Exact remaining gate findings

1. **hero-screen** (1440): main#main-content > section.landing-hero "Synthetic product demoHospital engineeri"

   the hero ends at 1109px on a 900px screen, 209px below the fold: it ends at the fold, 1px either way (SR-1)

   Decision: Content-driven hero and readable product preview retained; the brief does not require an exact viewport-height hero.

2. **section-height** (1440): div#top > footer.landing-footer "See Evidanor in operation.Explore Live D"

   the section is 396px tall (0.4 screens), 504px short of one screen (900px): every section after the hero is one screen or two, 2px either way (SR-2)

   Decision: Natural content heights retained instead of mandatory multiples of the viewport.

3. **section-height** (1440): section#demo "Explore the working demo.Choose a starti"

   the section is 617px tall (0.7 screens), 283px short of one screen (900px): every section after the hero is one screen or two, 2px either way (SR-2)

   Decision: Natural content heights retained instead of mandatory multiples of the viewport.

4. **section-height** (1440): section#workflow "From an equipment issueto a documented n"

   the section is 1004px tall (1.1 screens), 104px over one screen (900px): every section after the hero is one screen or two, 2px either way (and 2 more like it: "Service OperationsServic", "Equipment contextfor eve") (SR-2)

   Decision: Natural content heights retained instead of mandatory multiples of the viewport.

5. **section-height** (1440): section#service "Service OperationsService decisions,with"

   the section starts at 2113px, 313px below the screen grid (2 x 900px): sections start on whole screens (SR-2)

   Decision: Natural content heights retained instead of mandatory multiples of the viewport.

6. **section-height** (1440): section#equipment "Equipment contextfor every team.See simu"

   the section starts at 2910px, 210px below the screen grid (3 x 900px): sections start on whole screens (and 3 more like it: "From an equipment issuet", "Synthetic product demoHo", "See Evidanor in operatio") (SR-2)

   Decision: Natural content heights retained instead of mandatory multiples of the viewport.

7. **one-section** (1440): section#workflow "From an equipment issueto a documented n"

   the screen at scroll 1800px (stride 2) shows 313px of section 2 and the content of 2 sections, over 24px each beside section 3: a screen shows one section (another may peek 8px, 24px WARN) (SR-4)

   Decision: Normal continuous scrolling intentionally allows adjacent sections to appear in the viewport.

8. **one-section** (1440): div.landing-wrap > div.landing-closing > div > h2 "See Evidanor in operation."

   the screen at scroll 3820px (the top of section 5) shows 282px of section 6 and the heading of section 6 whole and the content of 2 sections, over 24px each beside section 5: a screen shows one section (another may peek 8px, 24px WARN) (SR-4)

   Decision: Normal continuous scrolling intentionally allows adjacent sections to appear in the viewport.

9. **one-section** (1440): section#equipment "Equipment contextfor every team.See simu"

   the screen at scroll 3600px (stride 4) shows 220px of section 4 and the content of 2 sections, over 24px each beside section 5: a screen shows one section (another may peek 8px, 24px WARN) (and 3 more like it: scroll 2700px, scroll 900px, scroll 2113px) (SR-4)

   Decision: Normal continuous scrolling intentionally allows adjacent sections to appear in the viewport.

10. **one-heading** (1440): h2#equipment-title "Equipment contextfor every team."

   headings of two sections show whole on one screen at 7 of 79 scroll positions (8.9%; at scroll 2250, 3650, 3700, 3750px), here with "Service decisions,with the full ": at most 3% on a desktop (SR-5)

   Decision: Normal content flow retained; headings are not spaced by artificial screen-sized gaps.

11. **container-edges** (1440): div#root "Skip to contentEvidanorEngineering workf"

   a <div> at the top of the page, outside header.nav, main, footer.closing and nav.actionbar (SR-6)

   Decision: The existing React root and scoped landing-wrap container are retained. Ordered workflow markers and the closing icon intentionally indent their text.

12. **container-edges** (1440): main#main-content > section.landing-hero "Synthetic product demoHospital engineeri"

   the section needs exactly one in-flow child .wrap (it has 1 in-flow child, 0 .wrap) (SR-6)

   Decision: The existing React root and scoped landing-wrap container are retained. Ordered workflow markers and the closing icon intentionally indent their text.

13. **container-edges** (1440): section#workflow "From an equipment issueto a documented n"

   the section needs exactly one in-flow child .wrap (it has 1 in-flow child, 0 .wrap) (and 4 more like it: "Service OperationsServic", "Equipment contextfor eve", "Explore the working demo") (SR-6)

   Decision: The existing React root and scoped landing-wrap container are retained. Ordered workflow markers and the closing icon intentionally indent their text.

14. **container-edges** (1440): ol.landing-workflow-list > li:nth-of-type(1) > div:nth-of-type(2) > h3 "Abnormal condition"

   8 text blocks start on a left line at x 146, 66px from the container's left: text starts on the container's left, or on one split line (x 623, 732, 841) (also "Review the condition, readings, ", "Investigation", "Record an engineering assessment") (SR-6)

   Decision: The existing React root and scoped landing-wrap container are retained. Ordered workflow markers and the closing icon intentionally indent their text.

15. **container-edges** (1440): div.landing-wrap > div.landing-closing > div > h2 "See Evidanor in operation."

   1 text block starts on a left line at x 123, 43px from the container's left: text starts on the container's left, or on one split line (x 623, 732, 841) (SR-6)

   Decision: The existing React root and scoped landing-wrap container are retained. Ordered workflow markers and the closing icon intentionally indent their text.

16. **split-pair** (1440): section#service > div.landing-wrap.landing-service-grid "Service OperationsService decisions,with"

   the two columns of the split start 35px apart at the top (centred on each other): a split's columns are top-aligned, 8px either way (SR-8)

   Decision: Section-specific product proportions and the footer brand are intentional; they do not use the template's single split-column formula.

17. **split-pair** (1440): div#top > footer.landing-footer > div.landing-wrap > div.landing-footer-bottom "EvidanorInfrastructure intelligence, gro"

   the split's left column starts with a picture or a box, not text: text left, the visual right, on every split (SR-8)

   Decision: Section-specific product proportions and the footer brand are intentional; they do not use the template's single split-column formula.

18. **split-pair** (1440): section#workflow > div.landing-wrap > div.landing-workflow-grid "Step 1Abnormal conditionReview the condi"

   the split's columns are off the page's one pair of lines: its right column starts at x 880, on none of the split lines 623 (k=5), 732 (k=6), 841 (k=7) (SR-8)

   Decision: Section-specific product proportions and the footer brand are intentional; they do not use the template's single split-column formula.

19. **no-visual** (390): section#demo "Explore the working demo."

   no picture, effect or mock in this section; a feature section needs a visual

   Decision: Three purposeful icon-led navigation cards retained in the concise guided-demo section; they are working links, not a feature mockup.

20. **hero-fill** (768): section#workflow "From an equipment issue to a documented "

   the next section shows on the first screen: it starts at 916px on a 1024px screen (the hero ends at 916px)

   Decision: At this tablet height a natural preview of the next section is retained; padding solely to fill the screen would undermine the concise brief.

21. **container** (1440, 390): page

   no .wrap

   Decision: The real shared container is landing-wrap; a generic global wrap class is not required by the application architecture.

## Explicit waivers

- **no-visual** — section#equipment "Equipment context for every team.": This concise coverage section uses real Lucide equipment icons and links derived from the actual equipment registry. The user requests concise monitored/manual distinctions, not another large decorative image or mock application.

- **cta** — section#demo "Explore the working demo.": All three demo cards are functional application entry links. The immediately following closing footer contains the exact requested Explore Live Demo primary button. The checker does not recognise that footer closing composition.

- **copy-headings** — ol.landing-workflow-list > li:nth-of-type(2) > div:nth-of-type(2) > h3 "Investigation": Investigation, Documented follow-up, Re-verification and Facilities managers are the user's explicitly requested workflow and audience terminology. They name real implemented concepts; retaining these terms improves product accuracy.

- **focus-ring** — .search-box input:focus-visible: This selector belongs to the unchanged operational application CSS. No search-box input exists on the public page. The brief requires preserving operational styling; landing controls have their own visible focus rings, verified with the keyboard.

- **moment-none** — (the page): The user explicitly requests restrained motion and no unnecessary animations or elaborate graphics. The implemented one-time hero entrance, visible hover responses and reduced-motion support fit that brief without adding an ornamental looping effect.

## Retained consistency warnings

- **copy-headings**: the card title "Monitored infrastructure" names no product, part, place or section (3 card titles like it) (and 2 more like it: "Manually managed equipme", "Investigate and Follow U") Retained because: These are the user's actual monitored/manual equipment and workflow terms.

- **copy-actions**: the main action "Explore Live Demo" does not read word for word the same in the closing section Retained because: The exact primary label is present in the closing footer; the checker looks for a final section button.

- **col-edge**: the second column starts at 3 places: 575px (section#service), 732px (section#equipment), 880px (section#workflow) Retained because: Two product screenshot proportions and the equal coverage cards have different intentional column widths.

- **centre-axis**: centred text 7px right of the middle of its page (727px against 720px) Retained because: The shared container excludes the browser scrollbar; normal scrollbar geometry accounts for the reported 7px difference.

- **nav-labels**: "Engineering workflow" opens a section headed "From an equipment issue to a documented next step." Retained because: The concise navigation label names the workflow rather than repeating its full sentence headline.

- **copy-length**: 1 section over 90 words a screen outside the UI mocks ("Equipment context for ev" 107); 68 words a screen across the page (355 words in 5.2 screens): a tech page says it in about 80 or fewer Retained because: The combined coverage/audience section intentionally explains both equipment contexts and three requested stakeholders in one compact section.

- **font-load**: "Inter" is asked for by the body text but never loaded (no font link or @font-face loads it): it shows in its fallback Retained because: The unused inherited body declaration names Inter; the landing actually uses loaded Geist, while operational screens retain their existing fallback stack.

- **nav**: the nav is lopsided: its last item ends 10px inside the content's edge (366px), while its first starts on the other edge Retained because: The icon sits within a 44px menu target; the visual glyph is inset from the target edge.

Copy-lint itself retained no WARN or FAIL. No assumed business facts, invented brand name, external photographs, contact form, client placeholder slots or `.example` addresses were introduced.
