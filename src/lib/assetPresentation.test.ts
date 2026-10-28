import { test } from "node:test";
import assert from "node:assert/strict";
import { demoSnapshot } from "../data/demo";
import { buildDashboard } from "../domain/selectors";
import { keyReading, inventorySort, sortInventory } from "./assetPresentation";
const assets = buildDashboard(demoSnapshot).evaluated;
test("key readings are existing asset points, preferring the evidence behind abnormal conditions", () => {
  for (const asset of assets) {
    const result = keyReading(asset, demoSnapshot)!;
    assert.ok(
      demoSnapshot.points.some(
        (point) =>
          point.assetId === asset.id &&
          point.label === result.label &&
          point.unit === result.unit,
      ),
    );
  }
  assert.equal(
    keyReading(
      assets.find((a) => a.id === "AHU-OT-02")!,
      demoSnapshot,
    )?.value,
    284,
  );
  assert.equal(
    keyReading(
      assets.find((a) => a.id === "UPS-02")!,
      demoSnapshot,
    )?.label,
    "Battery health",
  );
  assert.equal(keyReading(assets[0], { ...demoSnapshot, points: [] }), null);
});
test("inventory key reading never labels unavailable, uncertain or stale evidence current", () => {
  const asset = assets.find((a) => a.id === "AHU-OT-01")!;
  const unavailable = keyReading(
    {
      ...asset,
      monitoring: { ...asset.monitoring, connectivity: "Unavailable" },
    },
    demoSnapshot,
  )!;
  assert.equal(unavailable.current, false);
  assert.match(unavailable.validity, /Last known.*Unavailable/);
  const stale = keyReading(asset, {
    ...demoSnapshot,
    now: "2026-10-28T03:30:00.000Z",
  })!;
  assert.equal(stale.current, false);
  assert.match(stale.validity, /Stale/);
  const uncertain = keyReading(asset, {
    ...demoSnapshot,
    readings: demoSnapshot.readings.map((r) => ({
      ...r,
      quality: "Uncertain" as const,
    })),
  })!;
  assert.equal(uncertain.current, false);
  assert.match(uncertain.validity, /Uncertain/);
});
test("inventory sort is deterministic, URL-safe and does not mutate equipment", () => {
  const before = JSON.stringify(assets);
  assert.equal(inventorySort("unexpected"), "priority");
  assert.equal(sortInventory(assets, "priority")[0].id, "MG-O2-01");
  const ascending = sortInventory(assets, "id-asc").map((a) => a.id);
  assert.deepEqual(
    sortInventory(assets, "id-desc").map((a) => a.id),
    [...ascending].reverse(),
  );
  assert.equal(JSON.stringify(assets), before);
});
