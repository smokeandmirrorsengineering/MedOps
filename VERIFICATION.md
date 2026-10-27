# Verification — MedOps v0.1B

Executed 27 October 2026 against the completed local implementation.

## Baseline protection

- Existing v0.1A checkpoint: `9384450` (with the earlier data checkpoint `7e39a0b`).
- Initial baseline: all 10 original domain tests passed.
- The unrelated, untracked `codecheck.zip` was left untouched and excluded from the implementation checkpoint.
- `.gitignore` already excludes dependencies, `dist`, TypeScript build artifacts, logs, `.env*` secrets and `.qa/` captures.
- No changes were made under `src/domain/` or `src/data/`; their original tests and implementation remain intact.
- Original CSS rules were retained; new navigation/page styles were appended.

## Automated checks executed

- `npm test`: **17 tests passed, 0 failed** (10 unchanged domain tests and 7 new navigation-helper tests).
- Inventory remains exactly **50 unique assets**, category totals **14/10/9/9/8**, calculated conditions **43 Normal / 5 Attention / 1 Critical / 1 Unknown**.
- Original coverage includes data-reference integrity, four-point AHU identity, independent operating state, evidence-based conditions, unavailable/stale evidence, critical priority, maintenance and filtering.
- New coverage includes category slug mapping, combined query parsing, malformed/unsafe page values, page clamping, invalid-filter normalization, query preservation during drawer selection, engineering-priority asset ordering and severity-first event ordering.
- `npm run typecheck`: **passed**.
- `npm run build`: **passed**, producing the static application in `dist/`.
- Package installation reported **0 audit vulnerabilities** at installation time.
- React Router **8.5.0** is installed and compatible with the installed React 19.3.1 and Node 24.22.1.

The existing 10 tests, type checking and a production build also passed after initial page extraction, before the later presentation and validation work.

## Interactive browser checks executed

Used the available Codex in-app browser. These are browser interaction/inspection checks, distinct from the 17 Node tests. Chrome is running locally but is not exposed as an automated browser surface in this session.

- `/` redirects to `/dashboard`; an unknown path shows Not Found and its return link works.
- Dashboard renders the original KPIs and system summaries, five highest-priority alerts and a compact priority equipment preview.
- Engineering follow-up includes Unknown: **7 assets**, with wording that does not claim seven physical faults.
- Assets renders the full equipment register in Critical, Unknown, Attention, Normal order, with stable ID ordering within each group.
- Critical KPI opens `/assets?condition=Critical`; Normal KPI also navigates correctly in the production bundle.
- HVAC health row opens `/assets?system=hvac`.
- Combined name search `centrifuge`, system `lab` and condition `Attention` retains all three URL parameters and matches LAB-CEN-02, including consecutive fast selections.
- Search resets pagination and replaces history; a single Back returns to the preceding Dashboard rather than stepping through typed characters.
- Page selection is reflected in the URL; Back/Forward restores page one/page two.
- Explicit filter history works; a removed system chip is restored by Back. Reset filters restores the full register.
- Refresh preserves combined filters and `/assets?condition=Critical`.
- In-app drawer opening preserves all existing query parameters; Back closes it and Forward reopens it.
- Direct `/assets?condition=Critical&asset=MG-O2-01` opens the correct asset. Refresh retains the selected equipment and evidence.
- Close, Escape and desktop backdrop dismissal remove only `asset` and retain the current page and filters.
- Keyboard focus is trapped in the drawer and returns to the triggering control after an in-app opening. A direct/refresh load may have no originating control.
- Alerts renders all **seven active events**, ordered by severity and timestamp, including equipment, inspection, maintenance and unavailable-monitoring labels.
- Alert selection opens the associated equipment; the unavailable freezer shows Unknown and Unavailable reading quality.
- Refreshing `/alerts` preserves the correct page.
- Invalid system/condition values are removed, an out-of-range page is clamped, and an unknown asset ID displays a dismissible notice.
- Browser titles and active sidebar links follow the route. Primary page changes scroll to the top.
- SIMULATION MODE, synthetic-data labeling, placeholder documents and shared safety/footer labels remain visible. Timestamps use BDT and Asia/Dhaka formatting.
- Mobile navigation switches pages and closes correctly. At 390 pixels, Assets and Alerts have no page-level horizontal overflow; the inventory scrolls inside its panel, and the drawer fits the viewport.
- Desktop and mobile layouts were visually inspected; additional width checks cover 768, 1024 and 1280 pixels.
- Browser runtime console checks found no warnings or errors in the stable development and production application.

## Production route smoke test

Served `dist/` locally using `npm run preview` on port 4173:

- Direct selected-asset URL loaded and opened its drawer.
- Refresh of the Critical Assets view preserved its filter.
- Alerts loaded/refreshed and displayed seven events.
- Dashboard-to-Normal KPI navigation matched 43 assets.
- No browser console warnings/errors were reported.

The build contains `index.html`, `favicon.svg` and bundled assets. No top-level `404.html` or `_redirects` file was added. Standard Cloudflare Pages SPA fallback compatibility was retained; actual Cloudflare hosting was not tested or deployed.

## Remaining manual checks

- Direct Chrome check on the stakeholder demonstration computer.
- Physical-phone/touch-device testing if the presentation will use one; mobile checks here use browser viewport sizes.
- Engineering review of the fictional demonstration wording before stakeholder use. No simulated limit is validated as a hospital operating criterion.

The development server is left running at http://127.0.0.1:5173/dashboard. The temporary production-preview server is stopped after verification. No external deployment, GitHub push, data mutation, localStorage persistence or equipment integration was performed.
