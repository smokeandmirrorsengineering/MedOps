import { test } from "node:test";
import assert from "node:assert/strict";
import { demoSnapshot } from "../data/demo";
import {
  createSimulationReducer,
  effectiveSnapshot,
  initialOverlay,
} from "./model";
import {
  browserStorage,
  deserializeOverlay,
  readSimulation,
  saveSimulation,
  serializeOverlay,
} from "./persistence";
import type { SimulationStorage } from "./persistence";
import { STORAGE_KEY } from "./types";
import { buildDashboard } from "../domain/selectors";
import { orderEvents } from "../lib/navigation";
import { scenarioAlerts } from "./model";

const reduce = createSimulationReducer(demoSnapshot);
function activeState() {
  let state = reduce(initialOverlay(demoSnapshot), { type: "ACTIVATE_FAULT" });
  state = reduce(state, { type: "LOSE_CONNECTION", assetId: "FRG-BB-01" });
  return state;
}
function fakeStorage() {
  const values = new Map<string, string>();
  const storage: SimulationStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
  return { values, storage };
}
test("overlay persistence round-trip restores active scenarios and 41/5/2/2 without storing full assets", () => {
  const { storage, values } = fakeStorage();
  const state = activeState();
  assert.equal(saveSimulation(storage, state), true);
  const loaded = readSimulation(storage, demoSnapshot);
  assert.deepEqual(loaded.overlay, state);
  assert.deepEqual(
    buildDashboard(effectiveSnapshot(demoSnapshot, loaded.overlay)).counts,
    { Normal: 41, Attention: 5, Critical: 2, Unknown: 2 },
  );
  const payload = JSON.parse(values.get(STORAGE_KEY)!);
  assert.equal("assets" in payload, false);
  assert.equal("counts" in payload, false);
  assert.equal(payload.connections["FRG-BB-01"].lastKnownReadings.length, 1);
});
test("Critical, loss, clear and refresh preserve last-known values while condition is Unknown", () => {
  let state = reduce(initialOverlay(demoSnapshot), { type: "ACTIVATE_FAULT" });
  state = reduce(state, { type: "LOSE_CONNECTION", assetId: "AHU-OT-01" });
  state = reduce(state, { type: "CLEAR_FAULT" });
  const loaded = deserializeOverlay(serializeOverlay(state), demoSnapshot)!;
  assert.ok(loaded);
  const evaluated = buildDashboard(
    effectiveSnapshot(demoSnapshot, loaded),
  ).evaluated.find((asset) => asset.id === "AHU-OT-01")!;
  assert.equal(evaluated.condition, "Unknown");
  assert.equal(
    loaded.connections["AHU-OT-01"]!.lastKnownReadings.find(
      (reading) => reading.unit === "Pa",
    )!.value,
    450,
  );
});
test("malformed JSON, schema mismatch and invalid required fields recover to baseline", () => {
  for (const raw of [
    "{bad",
    "null",
    "[]",
    "42",
    "{}",
    JSON.stringify({ ...activeState(), schemaVersion: 999 }),
    JSON.stringify({ ...activeState(), simNow: "2099-01-01" }),
    JSON.stringify({ ...activeState(), nextSequence: -1 }),
    JSON.stringify({ ...activeState(), connections: null }),
    JSON.stringify({ ...activeState(), history: "wrong" }),
  ]) {
    const { storage, values } = fakeStorage();
    values.set(STORAGE_KEY, raw);
    const result = readSimulation(storage, demoSnapshot);
    assert.equal(result.status, "recovered");
    assert.deepEqual(result.overlay, initialOverlay(demoSnapshot));
    assert.equal(values.has(STORAGE_KEY), false);
  }
});
test("validation rejects inconsistent scenario flags, duplicated transitions, forged caches and counters", () => {
  const state = activeState();
  const badHistory = {
    ...state,
    history: [...state.history, state.history[0]],
  };
  const badCache = structuredClone(state);
  badCache.connections["FRG-BB-01"]!.lastKnownReadings = [
    { ...badCache.connections["FRG-BB-01"]!.lastKnownReadings[0], value: 999 },
  ];
  const badText = structuredClone(state);
  badText.history = badText.history.map((event) => ({
    ...event,
    title: "Changed",
  }));
  for (const value of [
    { ...state, fault: null },
    { ...state, nextSequence: 500 },
    badHistory,
    badCache,
    badText,
    { ...state, extra: "unexpected" },
  ])
    assert.equal(deserializeOverlay(JSON.stringify(value), demoSnapshot), null);
});
test("Reset removes only the MedOps overlay key and resets sequence after reloading", () => {
  const { storage, values } = fakeStorage();
  values.set("unrelated.app", "keep me");
  saveSimulation(storage, activeState());
  const reset = reduce(readSimulation(storage, demoSnapshot).overlay, {
    type: "RESET",
  });
  assert.equal(saveSimulation(storage, reset), true);
  assert.equal(values.has(STORAGE_KEY), false);
  assert.equal(values.get("unrelated.app"), "keep me");
  const loaded = readSimulation(storage, demoSnapshot).overlay;
  assert.equal(loaded.nextSequence, 1);
  assert.deepEqual(effectiveSnapshot(demoSnapshot, loaded), demoSnapshot);
});
test("blocked storage and quota failures cannot crash the demo", () => {
  const blocked: SimulationStorage = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("quota");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };
  assert.equal(readSimulation(blocked, demoSnapshot).status, "unavailable");
  assert.equal(saveSimulation(blocked, activeState()), false);
  assert.equal(saveSimulation(undefined, activeState()), false);
  assert.equal(browserStorage(), undefined);
});
test("reloaded cycles remain idempotent and continue the monotonic sequence", () => {
  const loaded = deserializeOverlay(
    serializeOverlay(activeState()),
    demoSnapshot,
  )!;
  assert.equal(reduce(loaded, { type: "ACTIVATE_FAULT" }), loaded);
  const cleared = reduce(loaded, { type: "CLEAR_FAULT" });
  assert.equal(cleared.history.at(-1)!.sequence, 3);
  assert.equal(cleared.nextSequence, 4);
  const alerts = orderEvents(scenarioAlerts(cleared));
  assert.equal(alerts.filter((alert) => alert.active).length, 1);
});
test("same-severity, same-timestamp alerts use descending sequence deterministically", () => {
  let state = reduce(initialOverlay(demoSnapshot), {
    type: "LOSE_CONNECTION",
    assetId: "FRG-BB-01",
  });
  state = reduce(state, { type: "LOSE_CONNECTION", assetId: "AHU-OT-01" });
  assert.deepEqual(
    orderEvents(scenarioAlerts(state)).map((alert) => alert.sequence),
    [2, 1],
  );
});
