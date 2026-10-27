# MedOps architecture — v0.1B

## The equipment register and its evidence

Think of an **asset** as the physical equipment entry in a SCADA equipment register. Its immutable ID, such as `AHU-OT-01`, is the anchor for everything else. A **monitoring point** is more like a tag: filter pressure, motor current, supply temperature or an inspection score. Four tags on an AHU still represent one physical asset.

`src/domain/types.ts` defines separate TypeScript structures:

| Structure         | Responsibility                                                                 | Links                |
| ----------------- | ------------------------------------------------------------------------------ | -------------------- |
| Asset             | Stable identity, category, operating state, monitoring method and connectivity | `id`, `locationId`   |
| Location          | Building, floor, department and room                                           | `id`                 |
| MonitoringPoint   | Tag identity, label, unit and fictional demo rules                             | `id`, `assetId`      |
| Reading           | Normalized value, unit, quality and timestamp                                  | `pointId`, `assetId` |
| AssetEvent        | Dated observation or active issue with severity                                | `assetId`            |
| MaintenanceRecord | Last service, next service, work summary and technician                        | `assetId`            |
| SampleDocument    | Document title, type, revision and placeholder marker                          | `assetId`            |

`src/data/demo.ts` contains an explicit roster grouped into five systems. A small deterministic factory fills out the related records. No randomness or real-time clock is involved. A `Snapshot` collects these separate arrays and one simulation timestamp.

## Condition is evaluated, not stored on the asset

`evaluateAsset(asset, evidence, now)` in `src/domain/evaluateAsset.ts` is a pure function: the same input produces the same result and does not change its inputs. This is similar to alarm logic that reads tags and equipment information, then reports an alarm state.

The function:

1. Finds the asset's monitoring points and the latest reading for each point.
2. Checks source availability, reading quality, null/non-finite values and freshness against the supplied simulation clock.
3. Compares usable values with explicitly fictional warning/critical rules.
4. Includes active Attention/Critical events and overdue maintenance.
5. Returns a condition, reasons and last-report timestamp.

Priority is **known Critical evidence → Unknown when evidence is unavailable → Attention → Normal**. If a known critical issue coexists with missing readings, the equipment remains Critical and the missing-data reason is also shown. An uncertain or stale reading cannot yield Normal. The last-report time can describe a report of unavailable quality; it does not claim that the report contained a usable measurement.

The three independent concepts are:

- **Operating state:** Running, Standby or Stopped. Stopping does not automatically imply a fault.
- **Connectivity:** Available, Unavailable or Inspection based. This describes the mock source, not equipment health.
- **Condition:** Derived from the evidence. A running asset can need attention; a standby asset can be normal.

Fictional limits are attached to monitoring points rather than written in dashboard components. Initial non-normal evidence includes a medical-gas pressure issue, AHU filter resistance, cold-storage temperature, UPS battery health, a centrifuge inspection issue, chiller service due and unavailable freezer monitoring. Evaluating that evidence yields 43/5/1/1, without a condition field on physical assets.

## How evidence reaches the screen

```text
demo.ts (deterministic records + simulation clock)
    → provider.ts (DataProvider.getSnapshot)
    → DemoDataProvider.tsx (one snapshot in React state)
        → selectors.ts (evaluate physical assets and derive counts)
        → shared context: snapshot, evaluated, counts, total, activeEvents, getAsset
            → DashboardPage / AssetsPage / AlertsPage
            → one AssetDrawer in AppLayout
```

The equipment/data/domain modules remain unchanged from v0.1A. `DemoDataProvider` initializes the existing mock provider once for the shared application state. `useMemo` derives the evaluated assets, counts, sorted active events and asset lookup from that snapshot. The context exposes read-only values through `useDemoData()`; it exposes no setter or simulation actions. Pages do not create their own snapshots. React Strict Mode may call the pure initializer twice during development checks, but all rendered pages consume the same retained state.

This is like several SCADA display pages reading the same tag database: changing pages does not create another equipment register. KPI totals always represent the full register; the Assets summary and footer report filtered matches separately.

## Routes and the shared shell

`main.tsx` wraps the application in React Router's declarative `BrowserRouter` and `DemoDataProvider`. `App.tsx` defines routes for `/dashboard`, `/assets`, `/alerts`, a root redirect and Not Found. No route loaders, backend or framework plugin is involved. `BrowserRouter` uses browser history, enabling direct addresses and Back/Forward. Its transition option is disabled to commit URL-driven form updates synchronously.

`AppLayout` contains the retained sidebar, topbar, simulation labeling, mobile menu, footer and one drawer location. Its `<Outlet />` is the page-content slot: React Router swaps the page in that slot while preserving the shared layout and data context. Sidebar `NavLink` components determine their active state from the current route. A pathname effect updates the browser title and scrolls to the top when switching primary pages; query-only changes do not reset scrolling.

`PageHeading` reuses the existing heading and snapshot-date presentation. `AlertRow` is used by the five-event Dashboard preview and the complete Alerts page. Category labels, icons and slugs live in one typed map in `lib/categories.tsx`. This is presentation metadata and does not change domain category definitions.

## URL state

`AssetsPage` reads `q`, `system`, `condition` and `page` using `useSearchParams`. The URL is the source of truth, so refreshing or using browser history restores the view. Search typing replaces history; explicit filters and pagination push history. Filter changes remove the page parameter. The existing `filterAssets` selector runs before pagination, with presentation ordering Critical → Unknown → Attention → Normal, then stable asset ID.

`lib/navigation.ts` validates recognized values, clamps pagination to available results and normalizes invalid parameters using history replacement. It preserves other parameters, including a selected asset. System slugs (`hvac`, `gas`, `cold`, `power`, `lab`) map back to the existing domain categories. Filter chips and a matching-versus-total summary explain the current view.

`useAssetSelection` adds or removes the `asset` query parameter on the current page, preserving the other query parameters. Opening pushes history; Close/Escape/backdrop removes `asset` with replacement so it stays on the current page. Back after an in-app opening restores the preceding URL, closing the drawer; Forward can reopen it. Direct URLs and refreshes work because `AppLayout` resolves that ID through `getAsset`. Invalid IDs show a dismissible notice.

The existing `AssetDrawer` remains the only equipment-detail implementation. Its mount/unmount effect manages focus, keyboard trapping and body scrolling. A ref keeps its Escape callback current without rerunning the focus effect when URL navigation changes callback identities. On an in-app opening, closing restores the triggering control's focus. Direct loads may have no triggering control to restore.

Mobile-menu state stays local to the layout. There is no localStorage. Refreshing restores the deterministic evidence while retaining filters and drawer selection encoded in the address.

The mock provider is deliberately synchronous because the dataset is local. In v0.1C, the state initializer in `DemoDataProvider.tsx` is the intended connection point for controlled evidence updates. Add the necessary state-update actions there and recompute memoized selectors from the new snapshot, so every page and the drawer updates together. Change readings, events or source availability rather than assigning condition strings to assets. These actions are not implemented in v0.1B. Later, an asynchronous provider can retrieve approved, normalized evidence from a backend, with loading/error and refresh/subscription behavior added then.

## Future equipment connection boundary

`DataProvider` is analogous to the interface between a SCADA display and its tag server. A future backend would authenticate users, receive approved read-only BMS/PLC/SCADA evidence, normalize it, and expose snapshots to this frontend. Protocol adapters for BACnet, Modbus or OPC UA belong behind that backend boundary. The browser should not connect directly to hospital control networks.

No integration adapter, authentication service or backend is built in v0.1B. Service history and documents remain demonstration metadata. `npm run build` produces a static frontend in `dist/`. The default base `/` and absence of a top-level `404.html` preserve Cloudflare Pages' standard SPA fallback; the application renders its Not Found page after the SPA loads. Static hosting alone does not supply the future backend or security model. No deployment configuration or external connection is added.
