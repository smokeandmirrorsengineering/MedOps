# Verification — MedOps v0.1C

Executed 27 October 2026 against the completed local implementation.

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
