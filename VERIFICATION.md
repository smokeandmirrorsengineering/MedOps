# Verification — v0.1A

Executed 27 October 2026. All checks below apply to the completed local implementation.

## Automated checks executed

- `npm test`: **10 tests passed, 0 failed**.
- Exactly 50 unique physical asset IDs.
- Category counts: HVAC/theatre 14, medical gas 10, cold storage 9, electrical/power 9, laboratory 8.
- Initial calculated conditions: Normal 43, Attention 5, Critical 1, Unknown 1.
- KPI counts sum to the underlying physical inventory.
- All location and asset references resolve; normalized reading units and point references match.
- One AHU has four points and remains one asset; operating state does not determine condition.
- Modified evidence produces a new condition without changing asset identity.
- Missing, uncertain, stale and disconnected evidence produces Unknown; known critical evidence takes priority.
- Maintenance dates independently produce Attention; the latest reading is selected when multiple reports exist.
- Search by ID/name and combined category/condition filtering.
- `npm run typecheck`: **passed**.
- `npm run build`: **passed**; static files emitted to `dist/`.
- Dependency installation completed with **0 reported audit vulnerabilities** at installation time.

## Interactive browser checks executed

Tests used the available Codex in-app browser. Chrome was not available to this session's browser-control tool.

- Development URL returned HTTP 200.
- Dashboard displays derived totals and category summaries.
- Name search `centrifuge` returns two records; category Laboratory + condition Attention returns LAB-CEN-02.
- ID search `ahu-ot-01` selects the correct asset and its four readings.
- Critical and Unknown KPI filters select MG-O2-01 and FRZ-LAB-03 respectively.
- Drawers show identity, structured location, operating state, condition reasons, units, quality, monitoring method, independent connectivity, report time, service dates, document placeholders and events.
- Checked Normal, Critical, Unknown and inspection-based Attention details.
- Drawer close button and Escape dismissal work.
- Last pagination page displays the final two records, LAB-WB-01 and LAB-AUT-01.
- Unmatched search displays the empty state; clearing filters restores all assets.
- Alert expansion exposes all seven synthetic events; alert selection opens equipment details.
- Dashboard navigation returns to the overview; Assets navigation targets inventory.
- Mobile navigation opens, closes via selection, and closes via Escape.
- Responsive widths checked: 390, 768, 1024 and 1280 CSS pixels; no page-level horizontal overflow. The inventory has its own horizontal scrolling region.
- The equipment drawer fits the 390-pixel mobile viewport without internal horizontal overflow.
- Desktop dashboard, mobile dashboard and mobile drawer were visually inspected. Local preview captures are in ignored `.qa/`.
- Production bundle was served with `npm run preview` on port 4173; KPI rendering, search and Critical equipment selection passed.
- Clean production and development page loads generated no new console warnings or errors. Bulk source formatting had caused transient hot-reload errors during development; those were absent on clean loads and the production bundle.

## Checks remaining for the user

- A direct Chrome check on the demonstration computer, since automated checks used the in-app browser.
- A physical phone/touch-device check if the presentation will use one; responsive testing used browser viewport sizes.
- Subject-matter review of fictional equipment labels and presentation wording before the stakeholder demonstration. No thresholds are validated for hospital use.

Development server is left running on http://127.0.0.1:5173/ for the handoff. The temporary production preview server is stopped after verification. No external deployment or remote Git push was performed.
