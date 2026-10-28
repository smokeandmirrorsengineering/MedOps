# Verification — Evidanor v0.3

Executed **29 October 2026 (Asia/Dhaka)** on `feature/v0.3-premium-ui`, branched from completed v0.2 report-improvement commit `1091b7f` with a clean working tree.

## v0.3 preservation and checkpoints

- Local checkpoints: `d4ccaaa` (design foundation/shared shell), `33a78d6` (operational dashboard), `68a8e4d` (inventory/alerts/drawer), `2f0d297` (review/report presentation). Final QA/documentation follows on the same local branch.
- Existing v0.2 report improvements remain in branch history. Repository/project directory, routes, hospital name and equipment identities are unchanged.
- Diff against `1091b7f` for `src/data`, `src/domain`, `src/simulation`, `DemoDataProvider`, review model/evidence/types/template/persistence is empty. No stored record migration or rewrite was performed.
- Package version is 0.3.0. No dependency or component framework was added. No push, merge or deployment was performed.

## Automated checks executed

- **`npm test`: 70 passed, 0 failed.** All 67 v0.2 domain/navigation/simulation/review/report tests remain intact. Three new tests verify that inventory readings belong to existing equipment points, prefer relevant abnormal evidence, preserve uncertainty/staleness/unavailability, and sort deterministically without mutation.
- **`npm run typecheck`: passed.**
- **`npm run build`: passed.** Static bundle is produced in `dist/`.
- **`git diff --check`: passed.** Ordinary Windows line-ending notices do not indicate whitespace errors.
- Calculated contrast for selected foreground/background token pairs: primary text 16.53:1, secondary text 7.67:1, muted text 5.49:1, white/action teal 5.97:1, Normal 5.81:1, Attention 7.24:1, Critical 6.48:1, Unknown 6.68:1. This is a palette check, not a comprehensive WCAG certification.

## Browser checks executed

Used the existing Codex in-app browser and the actual UI at `http://127.0.0.1:5173/`:

- Engineering Overview showed the unchanged 50-asset baseline: 43 Normal, 5 Attention, 1 Critical, 1 Unknown. Its seven abnormal-equipment queue entries were unique; affected-system counts came from the same register. No uptime, trend or reliability metric was introduced.
- Collapsed Demo Controls expanded and activated AHU-OT-01's fault. Dashboard showed 42 Normal / 2 Critical, the queue showed 450 Pa and the scenario survived reload. The Critical condition link opened the correct inventory filter.
- The AHU drawer showed Critical/450 Pa. Connection loss through its disclosure controls preserved Critical as last-confirmed/currently-unverified and displayed unavailable last-known readings. Alerts displayed the active fault separately from monitoring-unavailable Information, with active/resolved/history sections retained.
- Escape closed the drawer and restored focus to AHU-OT-01. A separate focus-trap check on MG-O2-01 wrapped Shift+Tab from Close to the final visible disclosure summary, Tab back to Close, and Escape back to the originating queue button. Closed disclosure content did not trap focus.
- Reset Demo restored the equipment baseline. The full historical detailed report text for `REV-af633d09-74c7-4305-8311-9fe0cbbb15cb` matched exactly before/after equipment changes; its frozen 450 Pa Critical evidence and seven exceptions remained. Existing draft and submission history survived.
- Inventory returned two distinct 25-row pages with no duplicate IDs across pages. ID sorting, search, category+condition filtering and canonical query parameters worked. Searching AHU-OT-01 returned one row; its drawer and selected asset recovered after reload. HVAC + Attention returned AHU-OT-02 and CHL-01.
- Observed normal alert row height approximately **80 px** with 12 px location captions. Longer descriptions may expand naturally. Table rows are compact, with extra height permitted for multi-line equipment/evidence context.
- Completed a new clearly synthetic nine-item review `REV-90046126-fcd5-4647-a12a-1662d2b5e966`: no preselected response; N/A owner rejected; first saved answer survived reload; all nine saves succeeded. Human-only inspection/panel/document items recorded Unable to Verify, with meaningful follow-up. Carried-issue acknowledgements were explicit.
- The submission confirmation explained the read-only result and six unresolved exceptions. Confirm submission opened the frozen report with nine responses/six open exceptions; it survived reload. Open Issues correctly showed 13 total (seven prior plus six new QA exceptions). These QA records belong to the in-app browser profile; Chrome's records were not edited.
- Both report view switches and the enabled Print Summary/Print Detailed Record controls were present. Current branding was Evidanor; frozen historical wording and the exact required MedOps operational-authorization statement remained intact.
- **40 responsive checks:** Dashboard, Assets, Alerts, Reviews home, Start, Open Issues, Runner and Report at **1440, 1280, 1024, 768 and 390 px**. No page-level horizontal overflow. Tables scroll inside their panel. Representative desktop and mobile views were visually inspected; the mobile header was refined afterward to show an accessible Synthetic data indicator without crowding the hospital context.
- Mobile menu opened, trapped navigation focus and closed with Escape, returning focus to Open navigation. Keyboard-focus outlines, readable form labels and restrained/reduced-motion styling are provided.
- Final clean development browser log contained no warnings/errors. Synthetic indication and timestamps remained visible.

## Production smoke check

Served the production bundle locally on port 4173. Confirmed Evidanor title, 43 Normal baseline, working inventory search and UPS-02's genuine 71% battery-health reading. The pre-existing v0.2 production-origin draft (`Synthetic production smoke check`) remained recoverable without a storage-format change. Production console warning/error log was empty. The temporary preview server was stopped afterward; the development server remains available at **http://127.0.0.1:5173/dashboard**.

## Limits and handover state

- Actual browser print-preview pagination was **not independently verified in v0.3**. This milestone preserves both normal browser print actions and the existing compact print CSS; no one-page or detailed-record page count is claimed. No new PDF-generation dependency or external service was used, and no physical print job was sent.
- Accessibility was checked through palette contrast, labels, focus behavior and responsive UI. No formal assistive-technology/device lab audit or WCAG certification was performed.
- No authentication, backend, real equipment integration, new hospital criteria or clinical authorization is introduced. Evidanor is a provisional brand, not a trademark-cleared corporate identity.
- Baseline simulation is restored. Existing records and the explicitly synthetic v0.3 QA submission remain available in the in-app browser. Browser profiles/origins remain separate.
- Ignored screenshots: `.qa/evidanor-v03-dashboard.png`, `evidanor-v03-assets.png`, `evidanor-v03-alerts.png`, `evidanor-v03-mobile.png`. Temporary viewport overrides were reset.

---

# Previous milestone verification — MedOps v0.2

Executed 28 October 2026 against `feature/v0.2-engineering-reviews` in `C:\Projects\MedOps`.

## Report presentation follow-up — 28 October 2026

Focused scope: two immutable-data print formats, compact detailed pagination and follow-up-placeholder validation. Equipment datasets, simulation logic, dashboards and stored review records were not changed.

**Automated results:** `npm test` — **67 passed, 0 failed** (all previous 61 plus six reporting tests). `npm run typecheck` and `npm run build` both passed. `git diff --check` passed.

The new tests exercise a submitted nine-item record with nine human Pass responses and three open discrepancies (AHU-OT-02 in two items and UPS-02). They verify correct counts/findings, immutable source data, explicit missing-owner/action labels, preservation of legacy submitted records and drafts, verbatim "Full pass." notes without an overall verdict, all long finding/note/owner/action text, complete compact detailed evidence rendering, and rejection of N/A placeholders during new saves/submission.

**Actual browser inspection:** opened the user's existing Chrome record `REV-2ebc2bc6-5ef9-4eee-895f-50d6ec7170f0`. The updated UI showed Print Summary and Print Detailed Record, all nine Pass responses, three open discrepancies, unverified typed identity, separate actual/simulated dates, the unchanged "Full pass" note, and Unassigned/Not specified on all three legacy findings. No record was edited or submitted during this inspection.

**Print-preview limitation:** before opening Summary print preview, Windows Computer Use stopped because it could not confidently verify the browser URL for its policy checks. No further browser input was attempted. Therefore the current sample's **Summary page count and Detailed Record page count are not yet verified**; one page and approximately 4–6 pages are design targets, not reported measurements. Browser-generated PDFs were not created by the agent in this follow-up.

The user reported **"2 sheets"** during a manual check, without identifying which format, then asked to proceed without further print-check questions. Final summary spacing was tightened afterward by reducing repeated labels, card spacing and duplicate context while retaining 9 pt core text, every finding, owner/action, technician note and disclaimer. That final revision's page counts remain unmeasured.

Repeatable manual check (for future reference): open the same submitted record; select each print button; choose A4 portrait, 100% scale, normal CSS margins, headers/footers off, and all pages. Confirm Summary includes all three discrepancies, missing-owner/action labels, technician notes and authorization statement. Inspect each Detailed Record page for complete readings/quality/timestamps/alarms/maintenance and no large whitespace or clipped content. For long notes/many findings, confirm continuation onto additional pages instead of truncation.

Implementation changes: removed whole-item `break-inside: avoid` printing and tall two-column evidence cards; added full-width compact historical evidence tables, natural section flow, small-card/row break avoidance, A4 typography and a dedicated summary. No forced page count, scaling transform, fixed page height or content omission is used. Actual pagination remains subject to the manual check above.

The sections below document the preceding v0.2 implementation checks and remain historical evidence of that milestone.

## Preservation and checkpoints

- Started from clean stable v0.1C commit `60d9e8e`; tagged it `v0.1c-reviewed` before implementation.
- Local implementation checkpoints: `23a64a5` (mapping/model), `bcab419` (routed UI/report views), `a2cb455` (evidence/exception hardening). Final documentation/checkpoints follow these commits on the same feature branch.
- `git diff v0.1c-reviewed --name-only -- src/data src/domain src/simulation` is empty. Existing equipment data, evaluator, simulation model and 39 tests are preserved.
- Baseline remains 50 assets, category totals 14/10/9/9/8, conditions 43 Normal / 5 Attention / 1 Critical / 1 Unknown and seven active seed alerts.
- Package version is 0.2.0. No runtime/testing dependency was added. No push, merge or deployment was performed.

## Automated checks executed for v0.2

Final `npm test`: **61 passed, 0 failed**, comprising all 39 existing tests and 22 review tests. The review tests cover:

- Exactly one nine-item versioned template, unique ordered IDs and supported OT-area asset mapping.
- Human-only fallbacks; no invented gas alarms, test documents or individual-theatre associations.
- Injected actual record clock, stable review creation, unverified typed identity and no automatic responses.
- Required choices/methods/observations, Other explanation, Unable/Not Applicable explanations and exception ownership/actions.
- Pass versus Critical/Unknown reconciliation without changing equipment evidence.
- Save-time captured evidence, separate clocks, preserved last-known quality and historical Critical evidence after fault clearance.
- Draft exception deduplication/reconciliation, including independently valid discrepancies.
- Scoped per-asset monitoring gaps excluding unrelated refrigeration; explicit retention of a newly appearing gap with an asset-linked exception.
- Meaningful numeric, quality, stale/availability and alarm changes; timestamp-only and within-tolerance changes ignored.
- Explicit refresh/retention requirements and revalidation at submission.
- Same-scope carried issues; acknowledgements do not close exceptions.
- Immutable submissions, frozen wording, open issues and responses.
- Separate storage round trips; Reset Demo does not remove review records.
- Malformed JSON, schema mismatch, missing fields, invalid/tampered structures, blocked storage and quota failures.

`npm run typecheck`: **passed**. `npm run build`: **passed**, producing the static bundle in `dist/`. `git diff --check`: **passed** (only ordinary Windows line-ending notices).

## Required acceptance scenario executed in the browser

Used the Codex in-app browser at `http://127.0.0.1:5173/` with the actual routed UI and browser localStorage:

1. Confirmed baseline 43/5/1/1, then injected the AHU-OT-01 Critical filter fault.
2. Started the sole OT review with a synthetic name/role. Its scope was the shared OT plant room.
3. Viewed AHU-OT-01 Critical evidence at 450 Pa. Selecting Pass without reconciliation was blocked; adding the explicit reconciliation allowed saving while leaving the equipment Critical and creating a discrepancy exception.
4. Reloaded the draft and verified the saved Pass, human observations and captured Critical evidence persisted.
5. Completed all nine responses using explicitly synthetic observations. Recorded Unable to Verify for inaccessible gas-panel and backup-power documentation; retained the existing UPS-02 warning without inventing a UPS fault. Entered responsible roles/actions. Individually acknowledged all three then-current scoped issues.
6. Submitted review **`REV-af633d09-74c7-4305-8311-9fe0cbbb15cb`**, containing nine responses and seven unresolved exceptions. Actual creation/submission were 28 Oct 2026, approximately 18:06/18:12 BDT; equipment evidence time remained 27 Oct 2026, 09:30 BDT.
7. Cleared the AHU fault and reset equipment simulation. The complete rendered historical report text was identical before/after equipment changes and after reload. Captured Critical/450 Pa evidence remained.
8. Open Issues still showed seven submitted exceptions, including AHU-OT-01 discrepancies. The asset drawer's related-review link reopened the same report.
9. **The user confirmed that printing works.** The Print Report action uses browser printing. The automation's initial print attempt blocked the in-app browser page until its temporary tab was reopened; native print-preview pagination was not independently certified by automation. No physical print job was sent by the agent.

## Additional browser checks executed

- A second draft (`REV-befbda03-9b61-44a2-a66c-1e94a4ced9c0`) exercised saved evidence changes. A changed condition/alarm/reading blocked an ordinary save. Explicit retention with an explanation kept the original capture and survived reload. Explicit refresh captured new Critical evidence and required reconciliation. A later clearance was deliberately retained as a historical Critical capture with a discrepancy note.
- A fresh unanswered carried-issues item included the seven prior submitted exceptions plus two scoped active seed alarms. All nine acknowledgement boxes and response choices started unchecked. Draft exceptions were excluded.
- Losing AHU-OT-01 communication showed Unknown, unavailable last-known values and an individual AHU-OT-01 monitoring-gap form. No FRG-BB-01 or unrelated freezer was included. Connection was restored afterward.
- Checked Reviews home, Start, Runner, Report and Open Issues at **390, 768, 1024 and 1280 px**: no page-level horizontal overflow. Visually inspected mobile home and desktop home/report. Temporary viewport overrides were reset.
- Verified sidebar/route integration, existing drawer actions, related-review history and the separate synthetic/actual timestamps.
- Final Reset Demo restored baseline, removed generated simulation history and left the submitted review, saved draft and seven submitted open issues intact.
- Local QA screenshots are ignored artifacts under `.qa/`, including `v02-reviews-desktop.png`.

## Production bundle smoke check executed

Served the final production build at `http://127.0.0.1:4173/`:

- Direct `/reviews` loaded its one template and empty saved/submitted states on the separate origin.
- Created a synthetic draft, opened the human-only physical-inspection item and saved Unable to Verify with observations, owner and action.
- Reload retained the item URL, answer, evidence timestamps and one draft exception.
- Browser console warning/error log for that production check was empty.

The temporary preview server was stopped after QA. The development server remains available at **http://127.0.0.1:5173/reviews**. The automated walkthrough's records belong to the in-app browser profile; Chrome has separate storage and will initially show its own records/empty state.

## Manual repeat checklist and limits

To repeat the full demonstration, follow the eight steps in README's Engineering Review demonstration. Check the AHU's 450 Pa Critical capture, required reconciliation, human-only Unable response, exception owner/action, all nine saved responses, Submitted report, browser Print Report and persistence of the original evidence/Open Issues after fault clearance.

- Saved item responses and summary changes are durable when storage succeeds; unsaved form edits are explicitly discarded on leaving an item.
- Storage error/corruption cases were tested against the actual persistence functions with an in-memory adapter, rather than changing browser security settings or corrupting the user's site storage.
- Submitted immutability is enforced by application operations; browser-local records are not an authenticated, tamper-proof archive. No review deletion or exception closure is implemented.
- Print page breaks and repeated banners depend on the browser; an item taller than a page can span pages. Printing is user-confirmed; no exported PDF is delivered by this implementation.
- No real equipment, hospital criteria, clinical readiness, authenticated signatures or production safety controls are validated. No external hosting/publication was performed.

---

# Historical regression reference — MedOps v0.1C

The following checks were executed on 27 October 2026 for the preceding milestone. They are retained as historical regression evidence, not a claim that every old browser interaction was repeated for v0.2.

## Baseline and preservation

- Working v0.1B checkpoint `38aa058` existed before implementation; the initial working tree was clean.
- All **17 existing tests** passed before changes and remain passing.
- Existing data/domain modules, asset identities, seed readings, monitoring limits, maintenance and seed events are unchanged.
- Baseline remains **50 assets**, category totals **14/10/9/9/8**, conditions **43 Normal / 5 Attention / 1 Critical / 1 Unknown** and seven active seed alerts.
- Local checkpoints were created for the pure simulation model and the working persistent UI. No new repository, remote push or external deployment was performed.

## Automated checks executed

`npm test`: **39 passed, 0 failed** — the original 17 tests plus 22 simulation/persistence tests.

The new tests cover:

- Fault activation: **42/5/2/1**, one current simulated alarm and one activation log.
- Standard FRG-BB-01 communication loss: Unknown, retained numeric value/timestamp and Unavailable quality.
- Both scenarios on separate assets: **41/5/2/2**.
- Independent fault clearance and connection restoration.
- Active alarm versus historical-log separation: resolved Critical history cannot keep the asset Critical.
- Critical followed by loss: still Critical, explicitly last confirmed/unverified, with unavailable readings.
- Restoring communication leaves an unresolved fault active.
- Clearing while disconnected yields Unknown and retains the previous 450 Pa last-known reading.
- A new fault cannot be established from unavailable monitoring evidence.
- Repeated actions are idempotent and do not duplicate transitions.
- Same-time events have monotonic sequence numbers and deterministic ordering.
- Repeated cycles retain distinct resolved alerts and only the latest activation is active.
- Seed data and prior overlay states remain unchanged by later actions.
- Reset restores the entire original snapshot, connectivity, seven seed alerts, clock and sequence.
- Overlay serialization round-trip restores active scenarios without storing full assets or KPIs.
- Malformed JSON, incompatible schema/time, invalid required fields, impossible flags, forged caches, duplicate transitions and counters fall back safely.
- Reset removes only the MedOps simulation key, preserving an unrelated storage key.
- Blocked storage and quota exceptions cannot crash the model/load/save helpers.
- Reloaded cycles remain idempotent and continue sequence numbering.

`npm run typecheck`: **passed**.

`npm run build`: **passed**, producing the static bundle in `dist/`.

No dependency was added for this milestone. Package version is 0.1.2; visible milestone labels are v0.1C.

## Browser interaction checks executed

Used the available Codex in-app browser. These are actual interaction/inspection checks, separate from the Node tests.

- Dashboard Simulate Fault changes Normal to 42 and Critical to 2; AHU health summary changes to 11/14 Normal.
- Standard Simulate Connection Loss produces 41 Normal, 2 Critical and 2 Unknown across shared views.
- Unknown-filtered inventory includes FRG-BB-01 with its simulation badge.
- Refrigerator drawer shows 4.2 °C as a **last-known value, not currently verified**, with Unavailable quality and its preserved 09:28 BDT report time.
- Refresh preserves active scenarios, selected drawer, unavailable readings and generated history.
- Restore Connection immediately updates an open drawer. If the asset leaves its Unknown filter, closing the drawer recovers focus to the page heading.
- Alerts displays current seed/scenario alarms, resolved simulated alerts and separately recorded transition history.
- Restored/cleared alerts remain resolved after refresh; old Critical history does not reactivate a cleared fault.
- In the AHU drawer: activate fault, lose connection, restore connection, lose connection again, clear fault while offline, and restore connection. Verified Critical/unverified versus Unknown behavior and retained 450 Pa values.
- New fault activation is disabled while the AHU source is unavailable.
- Reset restores baseline, removes generated history, survives refresh and restarts generated event numbering at #1 on the next action.
- Mobile controls work at 390 pixels; mobile navigation, inventory search, drawer labels, event history and Reset work without page-level overflow.
- Additional responsive checks cover 768, 1024 and 1280 pixels.
- URL filtering, direct asset links and Back/Forward drawer behavior remain intact with scenarios active.
- Fixed BDT timestamps, SIMULATION MODE, synthetic-data disclaimers and placeholder documents remain visible.

## Production bundle checks executed

Served the production build locally on port 4173:

- Original baseline loaded correctly.
- Both scenarios produced 41/5/2/2 and survived refresh using real browser localStorage.
- KPI navigation opened the Critical filter; AHU details showed 450 Pa.
- Browser Back/Forward closed/reopened the selected drawer without undoing simulation state.
- Reset restored baseline and remained reset after refresh.
- Stable production loads/interactions and a clean development reload reported no new console warnings/errors. Earlier bulk source edits produced temporary hot-refresh context errors; these were absent after clean loads and in the production bundle.

The temporary preview server is stopped after verification. Development remains running at http://127.0.0.1:5173/dashboard. The demo is reset to its original baseline for handoff.

## Verification limits

- Direct Chrome and physical-phone checks remain manual; browser QA used the in-app browser with responsive viewport sizes.
- Corrupt/blocked/quota storage cases were executed against the actual validation/persistence functions with an in-memory storage adapter, not by changing browser security settings or manually corrupting browser storage.
- No real hospital limits, clinical safety or production alarm behavior is validated. No real equipment/network is connected.
- Cloudflare hosting and GitHub publication were not performed.
