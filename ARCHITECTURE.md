# MedOps architecture

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
    → selectors.ts (evaluate each physical asset, count, search, filter)
    → App.tsx (overview, KPI cards, system summaries, alerts, inventory)
    → AssetDrawer.tsx (linked readings, records and explanations)
```

React manages the transient interface state: filters, pagination, selected equipment, mobile navigation and alert expansion. Nothing is saved in localStorage. Refreshing restores the deterministic initial view. Global KPI totals always represent the full register, while the inventory footer reports the filtered result count.

The mock provider is deliberately synchronous because the dataset is local. For the next milestone, introduce evidence updates and recompute the selectors from each new snapshot. Change readings, events or source availability rather than assigning condition strings to assets. Later, an asynchronous provider can retrieve approved, normalized evidence from a backend. Loading/error states and refresh/subscription behavior should be added at that point.

## Future equipment connection boundary

`DataProvider` is analogous to the interface between a SCADA display and its tag server. A future backend would authenticate users, receive approved read-only BMS/PLC/SCADA evidence, normalize it, and expose snapshots to this frontend. Protocol adapters for BACnet, Modbus or OPC UA belong behind that backend boundary. The browser should not connect directly to hospital control networks.

No integration adapter, authentication service or backend is built in v0.1A. Service history and documents remain demonstration metadata. `npm run build` produces a static frontend in `dist/`; static hosting alone does not supply the future backend or security model.
