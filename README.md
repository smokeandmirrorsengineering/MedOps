# MedOps v0.1B

**Prevent failures before they interrupt care.**

A local React + TypeScript application for MedOps Demo Hospital, a fictional 250-bed facility in Dhaka. Dashboard, Assets and Alerts share one read-only dataset. All equipment, readings, limits, alerts, manufacturers and service records are synthetic. They are demonstration material, not hospital operating criteria.

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
| `/alerts`        | Seven active synthetic events, sorted by severity and then timestamp                                         |
| Any unknown path | Not Found page with a return link to Dashboard                                                               |

The sidebar highlights the current page. Browser Back/Forward and direct route refreshes work. Switching primary pages scrolls to the top. Other modules remain explicitly marked **Coming soon**.

- Dashboard condition cards open Assets with the chosen condition. Total Assets opens the complete inventory. System rows open a system-filtered inventory.
- Assets orders equipment by Critical, Unknown, Attention, Normal, then asset ID. Search and filters apply before pagination.
- Filter summaries show both matching and total assets. Remove individual filter chips or use **Reset filters**.
- Alerts distinguish equipment conditions, inspections, maintenance requirements and unavailable monitoring. Everything remains read-only.
- Click equipment or an alert to open the same shared drawer. Close using Escape, the close button, or the shaded backdrop.
- On mobile, use the menu button to switch pages. The wide equipment table scrolls within its panel.

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

| File                             | Purpose                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `src/data/demo.ts`               | The 50-asset roster, locations, readings, maintenance, documents and events   |
| `src/domain/types.ts`            | The common data structures and stable ID relationships                        |
| `src/domain/evaluateAsset.ts`    | Equipment condition evaluation and human-readable reasons                     |
| `src/data/provider.ts`           | The central mock data source; the future backend connection boundary          |
| `src/domain/selectors.ts`        | Derived totals and shared search/filter logic                                 |
| `src/App.tsx`                    | Route definitions for Dashboard, Assets, Alerts and Not Found                 |
| `src/state/DemoDataProvider.tsx` | One shared snapshot, evaluated assets, counts, active events and asset lookup |
| `src/layout/AppLayout.tsx`       | Sidebar, topbar, page outlet, shared drawer and footer                        |
| `src/pages/`                     | Dashboard, Assets, Alerts and Not Found page components                       |
| `src/lib/categories.tsx`         | Category labels, icons and URL slugs                                          |
| `src/lib/navigation.ts`          | URL parsing, safe pagination and presentation ordering                        |
| `src/state/useAssetSelection.ts` | Shared URL-based equipment selection                                          |
| `src/components/AlertRow.tsx`    | Shared compact/full event presentation                                        |
| `src/components/AssetDrawer.tsx` | Equipment details, readings, maintenance and documents                        |
| `src/styles.css`                 | Design tokens, common components and responsive layout                        |

The simulated clock is fixed at **27 October 2026, 09:30 Bangladesh Standard Time (UTC+6)**. Readings are evaluated against this clock, never the actual date you open the app. Displayed times explicitly use `Asia/Dhaka` regardless of your computer's timezone.

## Verify and build

```powershell
npm test
npm run typecheck
npm run build
npm run preview
```

`npm test` runs 17 lightweight Node tests: the unchanged 10 domain tests plus seven URL/ordering tests. `typecheck` checks TypeScript. `build` checks TypeScript again and produces a static production bundle in **`dist/`**. `preview` serves that bundle locally (normally http://127.0.0.1:4173/); use Ctrl+C to stop it.

The Vite base path remains `/`. For eventual Cloudflare Pages hosting, use build command `npm run build` and output directory `dist`. No top-level `404.html` or `_redirects` file is added, preserving [Cloudflare Pages' standard SPA fallback](https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering). Cloudflare deployment has not been performed; direct routes have been tested locally.

Routing follows [React Router's declarative BrowserRouter API](https://reactrouter.com/start/declarative/installation). React Router 8.5.0 was the current stable npm release at implementation and is compatible with the installed Node and React versions; the lockfile records exact versions. Router transitions are disabled so consecutive URL-driven form updates commit immediately.

## Scope

The v0.1A domain and data modules are unchanged. The initial 50 assets still evaluate to **43 Normal, 5 Attention, 1 Critical and 1 Unknown**, with category totals **14/10/9/9/8**. Engineering follow-up includes the Unknown asset, totaling seven, without claiming seven physical faults. Displayed timestamps use BDT (UTC+6).

Documents remain labeled placeholders with no download action. There is no authentication, database, backend, real equipment connection, localStorage, data mutation, fault injection, Reset Demo or preventive-checklist workflow. v0.1C can introduce evidence changes at the shared data-provider state boundary so all pages update together.

See **ARCHITECTURE.md** for the data flow and the future telemetry boundary. See **VERIFICATION.md** for executed checks and browser coverage.
