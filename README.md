# MedOps v0.2 — Engineering Reviews

**Prevent failures before they interrupt care.**

A local React + TypeScript application for MedOps Demo Hospital, a fictional 250-bed facility in Dhaka. Dashboard, Assets and Alerts share one immutable seed dataset plus an interactive simulation overlay. Engineering Reviews adds human inspection records, captured evidence, follow-up exceptions and printable historical reports. All equipment, readings, limits, alerts, manufacturers and service records are synthetic. They are demonstration material, not hospital operating criteria. Simulation actions never command real equipment.

## Start locally

Open PowerShell in `C:\Projects\MedOps`:

```powershell
npm install
npm run dev
```

Open **http://127.0.0.1:5173/** in Chrome. The development server binds to your computer only. It uses port 5173 and will report an error rather than silently change ports if the port is occupied. Keep the terminal running; press **Ctrl+C** in that terminal to stop it. Restarting does not require another installation.

If PowerShell cannot find npm, use the installed Windows launcher:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' install
& 'C:\Program Files\nodejs\npm.cmd' run dev
```

The project was built using Node 24.22.1. Exact installed dependency versions are recorded in `package-lock.json`; use `npm ci` for a clean, repeatable installation.

## Explore the application

| Address          | Purpose                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `/`              | Redirects to Dashboard                                                                                       |
| `/dashboard`     | KPI cards, equipment status, system health, five priority alerts and a compact engineering follow-up preview |
| `/assets`        | Full 50-asset inventory with search, filters, pagination and equipment details                               |
| `/alerts`        | Active seed/scenario alerts, resolved simulated alerts and recorded simulation history                       |
| `/reviews` | One available OT template, saved drafts, submitted history and Open Issues |
| `/reviews/new` | Start a draft with an unverified typed name and role |
| `/reviews/:reviewId/run` | Nine-item review with separate system evidence and human verification |
| `/reviews/:reviewId/report` | Read-only submitted historical report and browser printing |
| `/reviews/issues` | Open exceptions from submitted reviews; search and originating-report links |
| Any unknown path | Not Found page with a return link to Dashboard                                                               |

The sidebar highlights the current page. Browser Back/Forward and direct route refreshes work. Switching primary pages scrolls to the top. Engineering Reviews replaces Prechecks; other future modules remain explicitly marked **Coming soon**.

## Run the Engineering Review demonstration

1. On Dashboard, use **Reset Demo** to restore 43 Normal / 5 Attention / 1 Critical / 1 Unknown. Activate **Simulate Fault** for AHU-OT-01.
2. Open **Engineering Reviews → Start New Review**. The only template is **Operating Theatre — Engineering Review**, scoped to the shared fictional OT plant room. Enter a synthetic technician name and role, then start the draft.
3. On the air-handling item, inspect AHU-OT-01's Critical condition and 450 Pa reading. Equipment-ID buttons open the existing drawer. Choose **Pass**, a verification method, observations, responsible role and follow-up. Saving requires a reconciliation note; it retains an open discrepancy and leaves the equipment alarm unchanged.
4. Complete all nine items. For the human-only gas-panel or backup-power-documentation item, choose **Unable to Verify** and explain that the fictional panel/logbook was inaccessible. Add a responsible role and suggested action. Do not claim that placeholder documents prove a test or that a new UPS fault exists.
5. On monitoring gaps, address each affected in-scope asset separately. On previous issues, explicitly acknowledge every listed issue; acknowledgement does not close it. No answer or method starts preselected.
6. Use **Save response** or **Save & next item**. Saved draft responses survive refresh. Unsaved field edits are discarded when leaving an item. Add summary observations and **Submit Review**. Open exceptions are allowed; missing required information is explained beside the form.
7. Open the submitted report and use **Print Report** for normal browser printing or Save as PDF. The report distinguishes human observations from synthetic evidence and actual record timestamps from simulated monitoring time.
8. Clear the AHU fault or Reset Demo, then reopen the submitted report from review history. Its Critical evidence and wording remain unchanged. **Open Issues** still lists the outstanding exceptions.

The nine items cover air handling, available supply-air readings, physical filter/gauge inspection, gas-alarm indications, UPS indicators, backup-power test documents, monitoring gaps, previous issues and handover observations. Individual **Pass** is a technician assessment; there is no overall Pass/Fail, score or readiness status.

**Operational authorization is not recorded in MedOps and remains the responsibility of authorized personnel.**

### Verified equipment relationships

The six assets actually located in the shared OT plant room are **AHU-OT-01/02/03, EF-OT-01, MG-AVSU-01 and UPS-02**. AHUs provide four existing tags; the extract fan has only a supply-temperature tag; the AVSU has an inspection score; UPS-02 has output voltage and battery health. These do not establish individual-theatre or electrical-circuit service relationships.

Physical gauges, gas alarms and backup-power test documentation remain human-only. The AVSU inspection score is not gas-alarm telemetry. No central gas plant, central UPS or blood-bank refrigerator is linked to this review. See [REVIEW_MAPPING.md](REVIEW_MAPPING.md) for the complete item-by-item mapping and limitations.

### Saved reviews and changing evidence

Each response saves a copy of the relevant evidence at that moment. Reopening an answered item compares its copy with current conditions, quality, active alarms and readings using explicit demonstration tolerances. Timestamp changes alone do not trigger warnings. A meaningful change requires **Review Again / Refresh Evidence**, or an explanation for retaining the original evidence. Retention records the discrepancy and follow-up; it never silently replaces the original capture. Submission repeats this check.

Submitted records freeze responses, evidence, template wording and exceptions. They have no edit or closure action. Open Issues shows submitted exceptions only; draft exceptions are previewed within the runner and reconciled when saved answers change.

Review records use a separate versioned localStorage key, **`medops.engineering-reviews.v1`**. **Reset Demo never removes reviews.** Malformed/incompatible saved data is rejected with a recovery notice. Blocked/full storage displays a warning: work can continue in memory, but persistence is not claimed. There is no review-data deletion control in v0.2.

Records belong to the browser profile and origin/port. They are not uploaded, synchronized, authenticated, encrypted archives or tamper-proof records. Clearing browser site data can remove them. The automated walkthrough's synthetic records are in the Codex in-app browser; they do not automatically appear in Chrome.

- Dashboard condition cards open Assets with the chosen condition. Total Assets opens the complete inventory. System rows open a system-filtered inventory.
- Assets orders equipment by Critical, Unknown, Attention, Normal, then asset ID. Search and filters apply before pagination.
- Filter summaries show both matching and total assets. Remove individual filter chips or use **Reset filters**.
- Alerts distinguish equipment conditions, inspections, maintenance requirements and unavailable monitoring. Active alarms and historical logs have separate sections; no acknowledgement or notification workflow is implemented.
- Click equipment or an alert to open the same shared drawer. Close using Escape, the close button, or the shaded backdrop.
- On mobile, use the menu button to switch pages. The wide equipment table scrolls within its panel.

## Try the interactive demo

Use **Demo Controls** on the Dashboard:

1. Start from the original **43 Normal / 5 Attention / 1 Critical / 1 Unknown** distribution.
2. Click **Simulate Fault** for AHU-OT-01. Its fictional filter pressure becomes 450 Pa and its evaluated condition becomes Critical: **42/5/2/1**.
3. Leave Monitoring source set to **FRG-BB-01**, then click **Simulate Connection Loss**. The refrigerator becomes Unknown and retains its last-known temperature: **41/5/2/2**.
4. Inspect Assets, Alerts or either equipment drawer. All use the same derived data. Refresh to verify that scenarios and history survive.
5. Use **Clear Fault** and **Restore Connection** independently. Resolved alerts and transition history remain visible on Alerts.
6. Click **Reset Demo** to restore the original evidence, seven seed alerts, condition counts and sequence counter. Generated history is removed.

For the fault-plus-monitoring-loss edge case, activate the AHU fault first, then choose **AHU-OT-01** in Monitoring source and simulate connection loss. The AHU stays **Critical — last confirmed, currently unverified**. Numeric readings remain visible with **Unavailable** quality and explicit **last-known** labels. Restoring communication leaves the fault active. Clearing the fault while disconnected yields Unknown until communication is restored. Establishing a new fault from unavailable readings is disabled.

The two eligible equipment drawers also contain the same scenario actions, allowing you to watch details update without closing the drawer. If restoring an asset removes it from the current filter, the drawer remains open and closing it returns keyboard focus to the page heading.

These controls change synthetic evidence only. Clearing a simulated alarm does not certify equipment safety; restored telemetry does not prove a physical fault is resolved.

## Saved demo state

The equipment simulation saves only its lightweight overlay in localStorage under **`medops.demo.simulation.v1`**. It contains scenario state, generated transitions, event sequence/time metadata and a few targeted last-known readings—not copies of the 50 assets or calculated KPIs. Engineering Reviews uses its own separate key described above.

Startup validates saved JSON, schema, current scenarios, captured readings and sequence consistency. Invalid or incompatible state is discarded and the original seed is restored. If browser storage is blocked/full, the demo continues in memory and displays a persistence message. **Reset Demo removes only this MedOps key**, leaving unrelated browser data alone.

Persistence belongs to the browser profile and origin, including its port. Chrome and the in-app browser have separate storage; development port 5173 and preview port 4173 also have separate storage. There is no multi-tab/user synchronization. Browser Back/Forward changes views and drawer selection; it does not undo simulation actions. Use Clear Fault, Restore Connection or Reset Demo for that.

## Bookmarkable filters and equipment details

The part after `?` in an address stores the current view. These links can be refreshed or bookmarked:

```text
http://127.0.0.1:5173/assets?condition=Critical
http://127.0.0.1:5173/assets?system=hvac
http://127.0.0.1:5173/assets?q=centrifuge&system=lab&condition=Attention
http://127.0.0.1:5173/assets?page=2
http://127.0.0.1:5173/assets?condition=Critical&asset=MG-O2-01
http://127.0.0.1:5173/alerts?asset=FRZ-LAB-03
```

| Parameter   | Meaning                                                   |
| ----------- | --------------------------------------------------------- |
| `q`         | Asset ID or equipment-name search                         |
| `system`    | `hvac`, `gas`, `cold`, `power`, or `lab`                  |
| `condition` | `Normal`, `Attention`, `Critical`, or `Unknown`           |
| `page`      | Page number; page one is normally omitted                 |
| `asset`     | Equipment ID to display in the shared drawer, on any page |

Search typing replaces the current history entry, avoiding one Back step per keystroke. Explicit filters and page selections create history entries. Changing filters resets to page one. Invalid filters are ignored and removed; invalid/out-of-range pages are corrected safely. Unknown asset IDs show a dismissible message.

Opening a drawer adds a history entry, so Back can close it and Forward can reopen it. The Close button removes only `asset`, replacing the current entry and preserving filters and page number. A selected asset survives refresh. This is URL state, not localStorage persistence.

Suggested demonstration records:

| Asset      | What it demonstrates                                            |
| ---------- | --------------------------------------------------------------- |
| AHU-OT-01  | One physical asset, four monitoring points, Normal condition    |
| AHU-OT-02  | Running asset with a filter differential-pressure warning       |
| CHL-01     | Overdue service requirement                                     |
| CHL-02     | Normal condition while in standby                               |
| MG-O2-01   | Critical medical-gas condition from fictional pressure evidence |
| FRZ-LAB-03 | Unknown condition with unavailable monitoring data              |
| LAB-CEN-02 | Inspection-based condition, stopped operating state             |

## Where things live

| File                              | Purpose                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `src/data/demo.ts`                | The 50-asset roster, locations, readings, maintenance, documents and events   |
| `src/domain/types.ts`             | The common data structures and stable ID relationships                        |
| `src/domain/evaluateAsset.ts`     | Equipment condition evaluation and human-readable reasons                     |
| `src/data/provider.ts`            | The central mock data source; the future backend connection boundary          |
| `src/domain/selectors.ts`         | Derived totals and shared search/filter logic                                 |
| `src/App.tsx`                     | Route definitions for Dashboard, Assets, Alerts and Not Found                 |
| `src/state/DemoDataProvider.tsx`  | One shared snapshot, evaluated assets, counts, active events and asset lookup |
| `src/simulation/types.ts`         | Typed overlay, actions, scenario IDs and separate history records             |
| `src/simulation/model.ts`         | Pure reducer, effective evidence, current alarms and alert lifecycles         |
| `src/simulation/persistence.ts`   | Versioned overlay validation, save/load and scoped reset                      |
| `src/components/DemoControls.tsx` | Dashboard controls, shared equipment actions and simulation badges            |
| `src/layout/AppLayout.tsx`        | Sidebar, topbar, page outlet, shared drawer and footer                        |
| `src/pages/`                      | Dashboard, Assets, Alerts and Not Found page components                       |
| `src/lib/categories.tsx`          | Category labels, icons and URL slugs                                          |
| `src/lib/navigation.ts`           | URL parsing, safe pagination and presentation ordering                        |
| `src/state/useAssetSelection.ts`  | Shared URL-based equipment selection                                          |
| `src/components/AlertRow.tsx`     | Shared compact/full event presentation                                        |
| `src/components/AssetDrawer.tsx`  | Equipment details, readings, maintenance and documents                        |
| `src/reviews/types.ts` | Review, response, snapshot and exception structures; injectable actual UTC clock |
| `src/reviews/template.ts` | One versioned, ordered OT template and evidence selectors |
| `src/reviews/evidence.ts` | Shared-data evidence capture, scoped issues and meaningful change comparison |
| `src/reviews/model.ts` | Save/submit validation, exception reconciliation and frozen submissions |
| `src/reviews/persistence.ts` | Versioned review-storage validation and error handling |
| `src/reviews/ReviewProvider.tsx` | Review state, clock and persistence boundary |
| `src/pages/Review*.tsx` | Reviews home, start, runner, historical report and Open Issues |
| `src/reviews/reviews.css` | Review forms, responsive layouts and print rules |
| `src/styles.css`                  | Design tokens, common components and responsive layout                        |

The simulated clock is fixed at **27 October 2026, 09:30 BDT (UTC+6)**. Readings and generated transitions use this one simulation clock, never the actual date you open the app. Monotonically increasing sequence numbers distinguish events triggered at the same timestamp; Reset restarts the counter. Review creation, response saves, evidence captures and submission use the actual record clock stored as ISO UTC. Both clocks display explicitly in `Asia/Dhaka`, labeled BDT (UTC+6).

## Verify and build

```powershell
npm test
npm run typecheck
npm run build
npm run preview
```

`npm test` runs **61 lightweight Node tests**: 39 existing domain/navigation/simulation tests plus 22 review tests. `typecheck` checks TypeScript. `build` checks TypeScript again and produces a static production bundle in **`dist/`**. `preview` serves that bundle locally (normally http://127.0.0.1:4173/); use Ctrl+C to stop it.

The Vite base path remains `/`. For eventual Cloudflare Pages hosting, use build command `npm run build` and output directory `dist`. No top-level `404.html` or `_redirects` file is added, preserving [Cloudflare Pages' standard SPA fallback](https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering). Cloudflare deployment has not been performed; direct routes have been tested locally.

Routing follows [React Router's declarative BrowserRouter API](https://reactrouter.com/start/declarative/installation). React Router 8.5.0 was the current stable npm release at implementation and is compatible with the installed Node and React versions; the lockfile records exact versions. Router transitions are disabled so consecutive URL-driven form updates commit immediately.

## Scope

The v0.1A domain and data modules are unchanged. The initial 50 assets still evaluate to **43 Normal, 5 Attention, 1 Critical and 1 Unknown**, with category totals **14/10/9/9/8**. Engineering follow-up includes the Unknown asset, totaling seven, without claiming seven physical faults. Displayed timestamps use BDT (UTC+6).

Documents remain labeled placeholders with no download action. v0.2 adds exactly one evidence-assisted engineering inspection template. There is no authentication, digital signature, database, backend, real equipment connection, notification, work-order/issue closure, clinical authorization or production safety control. Nothing is published or pushed by this implementation.

See **ARCHITECTURE.md** for the data flow and the future telemetry boundary. See **VERIFICATION.md** for executed checks and browser coverage.
