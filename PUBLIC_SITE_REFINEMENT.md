# Public presentation and return navigation — 20 November 2026

This update addresses repetitive demo calls to action, the missing return path from the operational workspace, and thin public-page content.

## Calls to action and navigation

- **Explore Live Demo appears once**, in the homepage hero. The repeated header/menu and closing-footer versions are removed.
- Context pages have a quiet **Open workspace** utility link on larger screens and specific links to investigations, equipment and cases. The **Demo guide** offers three purposeful entry points rather than another generic pitch.
- Every operational page now has a persistent **Back to website** link. It returns to `/`, where the public navigation is immediately available. The same link is visible on phones and while scrolling long cases.
- The public header stays visible while scrolling. Inner pages have a Home breadcrumb, and related-page links support continued browsing.
- Returning to the homepage through its logo also returns to the top. Mobile navigation resets before paint on page changes, fixing a fast-return/menu-opening race.

## More useful public pages

| Page | Added substance |
| --- | --- |
| Home | Two product-led examples: an actual pressure-reading record and CT quotation, with readable desktop/mobile crops |
| Engineering workflow | How frozen submitted evidence, separate action status and subsequent verification records differ |
| Service coordination | Coverage, ownership, decisions and handover context, plus the original CT case event history read directly from the deterministic project seed |
| Equipment | An accessible comparison of condition evidence, investigation context, service coordination and history for monitored versus manually managed equipment |
| Demo guide | A practical equipment-to-follow-up walkthrough and browser-local workspace guidance |

The CT timeline is explicitly labelled as the original seed. It does not present a visitor's edited browser-local case as current or invent a later service outcome. New product imagery is cropped from the previously verified actual application captures, without changing the depicted readings or quotation information.

## Verification

- **120 tests passed, 0 failed.** Coverage now checks the single homepage primary CTA, content/record boundaries, real seeded service entries and website return links across dashboard, inventory, alerts, reviews, CT case and case summary routes.
- **Production build passed**, including TypeScript.
- Browser review covered desktop 1440×1000, phone 390×844 and small phone 320×640. Public routes render their own content; no horizontal overflow observed in the reviewed layouts.
- Entered the dashboard from the homepage, returned using the new link, entered a CT case, scrolled to its notes and verified the return bar stayed at the top. The existing 16 open review issues in this browser remained present during the round trip. No demo records were reset or edited.
- Confirmed the mobile return link is visible, all public pages navigate through the mobile menu, inner pages have no repeated **Explore Live Demo** link, and the equipment comparison retains accessible column headings in the stacked phone layout.
- Public copy lint: **0 FAIL, 0 WARN** on all five pages after editing one repetitive heading.
- Performance sample on the expanded production homepage: **0 FAIL, 2 WARN**, three loads per viewport. Desktop transfer approximately 345 KiB; phone approximately 318 KiB; median LCP 424/416 ms; measured layout shift 0.000 and no broken requests. Both warnings concern the shared application JavaScript size. This local sample preceded the final small navigation refinements and a smaller phone image crop; timings are not field guarantees.
- The shared return bar has an explicit print-only hide rule. Existing report/domain/storage tests pass; physical print dialogs were not repeated. No domain rules, persistence schemas, service model, report generation or printing logic changed.
- No new dependency. Taste's original rigid-template gate report remains historical; no new gate PASS is claimed for this refinement.

Screenshots: [expanded homepage](docs/landing/refined-home-desktop.jpg), [mobile homepage](docs/landing/mobile.jpg), [desktop workspace return](docs/landing/workspace-return-desktop.jpg) and [mobile workspace return](docs/landing/workspace-return-mobile.jpg).

Work stays on `codex/evidanor-public-landing` and is committed locally only. Nothing is pushed or deployed.
