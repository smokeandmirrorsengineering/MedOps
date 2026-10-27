# MedOps v0.1A

**Prevent failures before they interrupt care.**

A local React + TypeScript dashboard for MedOps Demo Hospital, a fictional 250-bed facility in Dhaka. All equipment, readings, limits, alerts, manufacturers and service records are synthetic. They are demonstration material, not hospital operating criteria.

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

## Explore the dashboard

- Click a condition KPI or status legend to filter the inventory.
- Click a system health row to filter by system. Existing filters combine; use **Reset** to clear them.
- Search equipment names or asset IDs, including partial matches. Select a category and condition together.
- Use pagination to browse all 50 assets. The table scrolls horizontally on a phone.
- Click an equipment row, its ID, its details arrow, or an alert to open the side drawer. Close it with **Escape**, the close button, or the shaded backdrop.
- **Assets** and **Alerts** in navigation jump to integrated dashboard sections. Other modules are explicitly marked **Coming soon**.

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

| File                             | Purpose                                                                     |
| -------------------------------- | --------------------------------------------------------------------------- |
| `src/data/demo.ts`               | The 50-asset roster, locations, readings, maintenance, documents and events |
| `src/domain/types.ts`            | The common data structures and stable ID relationships                      |
| `src/domain/evaluateAsset.ts`    | Equipment condition evaluation and human-readable reasons                   |
| `src/data/provider.ts`           | The central mock data source; the future backend connection boundary        |
| `src/domain/selectors.ts`        | Derived totals and shared search/filter logic                               |
| `src/App.tsx`                    | Dashboard, navigation, overview, alerts and inventory                       |
| `src/components/AssetDrawer.tsx` | Equipment details, readings, maintenance and documents                      |
| `src/styles.css`                 | Design tokens, common components and responsive layout                      |

The simulated clock is fixed at **27 October 2026, 09:30 Bangladesh Standard Time (UTC+6)**. Readings are evaluated against this clock, never the actual date you open the app. Displayed times explicitly use `Asia/Dhaka` regardless of your computer's timezone.

## Verify and build

```powershell
npm test
npm run typecheck
npm run build
npm run preview
```

`npm test` runs lightweight Node tests for inventory integrity, evidence evaluation and filtering. `typecheck` checks TypeScript. `build` checks TypeScript again and produces a static production bundle in **`dist/`**. `preview` serves that bundle locally (normally http://127.0.0.1:4173/); use Ctrl+C to stop it.

The bundle is suitable for eventual static Cloudflare Pages hosting with build command `npm run build` and output directory `dist`. No hosting account, external service or deployment is configured.

## Scope

This milestone includes the working dashboard, search, filters, asset selection, condition evaluation and sample-document metadata. Documents are labeled placeholders with no download action. The provider runs entirely in the frontend. There is no authentication, database, backend, real equipment connection, browser persistence, fault-injection control or preventive-checklist workflow.

See **ARCHITECTURE.md** for the data flow and the future telemetry boundary. See **VERIFICATION.md** for executed checks and browser coverage.
