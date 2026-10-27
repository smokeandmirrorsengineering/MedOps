# MedOps v0.1C

**Prevent failures before they interrupt care.**

A local React + TypeScript application for MedOps Demo Hospital, a fictional 250-bed facility in Dhaka. Dashboard, Assets and Alerts share one immutable seed dataset plus a small, interactive simulation overlay. All equipment, readings, limits, alerts, manufacturers and service records are synthetic. They are demonstration material, not hospital operating criteria. Simulation actions never command real equipment.

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

## Explore the three pages

| Address          | Purpose                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `/`              | Redirects to Dashboard                                                                                       |
| `/dashboard`     | KPI cards, equipment status, system health, five priority alerts and a compact engineering follow-up preview |
| `/assets`        | Full 50-asset inventory with search, filters, pagination and equipment details                               |
| `/alerts`        | Active seed/scenario alerts, resolved simulated alerts and recorded simulation history                       |
| Any unknown path | Not Found page with a return link to Dashboard                                                               |

The sidebar highlights the current page. Browser Back/Forward and direct route refreshes work. Switching primary pages scrolls to the top. Other modules remain explicitly marked **Coming soon**.

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

Only the lightweight overlay is saved in localStorage under **`medops.demo.simulation.v1`**. It contains scenario state, generated transitions, event sequence/time metadata and a few targeted last-known readings—not copies of the 50 assets or calculated KPIs.

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
| `src/styles.css`                  | Design tokens, common components and responsive layout                        |

The simulated clock is fixed at **27 October 2026, 09:30 BDT (UTC+6)**. Readings and generated transitions use this one simulation clock, never the actual date you open the app. Monotonically increasing sequence numbers distinguish events triggered at the same timestamp; Reset restarts the counter. Displayed times explicitly use `Asia/Dhaka` regardless of your computer's timezone.

## Verify and build

```powershell
npm test
npm run typecheck
npm run build
npm run preview
```

`npm test` runs **39 lightweight Node tests**: the original 17 domain/navigation tests plus 22 scenario/persistence tests. `typecheck` checks TypeScript. `build` checks TypeScript again and produces a static production bundle in **`dist/`**. `preview` serves that bundle locally (normally http://127.0.0.1:4173/); use Ctrl+C to stop it.

The Vite base path remains `/`. For eventual Cloudflare Pages hosting, use build command `npm run build` and output directory `dist`. No top-level `404.html` or `_redirects` file is added, preserving [Cloudflare Pages' standard SPA fallback](https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering). Cloudflare deployment has not been performed; direct routes have been tested locally.

Routing follows [React Router's declarative BrowserRouter API](https://reactrouter.com/start/declarative/installation). React Router 8.5.0 was the current stable npm release at implementation and is compatible with the installed Node and React versions; the lockfile records exact versions. Router transitions are disabled so consecutive URL-driven form updates commit immediately.

## Scope

The v0.1A domain and data modules are unchanged. The initial 50 assets still evaluate to **43 Normal, 5 Attention, 1 Critical and 1 Unknown**, with category totals **14/10/9/9/8**. Engineering follow-up includes the Unknown asset, totaling seven, without claiming seven physical faults. Displayed timestamps use BDT (UTC+6).

Documents remain labeled placeholders with no download action. v0.1C adds synthetic evidence overlays, fault/connection scenarios, saved history and Reset Demo. There is no authentication, database, backend, real equipment connection, external notification, production safety control or preventive-checklist workflow. Nothing is published or pushed by this implementation.

See **ARCHITECTURE.md** for the data flow and the future telemetry boundary. See **VERIFICATION.md** for executed checks and browser coverage.
