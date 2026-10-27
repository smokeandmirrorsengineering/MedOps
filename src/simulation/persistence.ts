import type { Snapshot } from "../domain/types";
import { createSimulationReducer, initialOverlay } from "./model";
import {
  FAULT_ASSET_ID,
  isConnectionAsset,
  SCHEMA_VERSION,
  STORAGE_KEY,
} from "./types";
import type { SimulationAction, SimulationOverlay } from "./types";

export interface SimulationStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export type PersistenceStatus = "ready" | "recovered" | "unavailable";
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function equalJson(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (Array.isArray(left) && Array.isArray(right))
    return (
      left.length === right.length &&
      left.every((value, index) => equalJson(value, right[index]))
    );
  if (record(left) && record(right)) {
    const keys = Object.keys(left);
    return (
      keys.length === Object.keys(right).length &&
      keys.every(
        (key) => Object.hasOwn(right, key) && equalJson(left[key], right[key]),
      )
    );
  }
  return false;
}
export function serializeOverlay(overlay: SimulationOverlay) {
  return JSON.stringify(overlay);
}

// Replay validated transitions, then compare every persisted field with the canonical result.
// This validates caches, scenario flags, IDs, text, time and counters without trusting saved alarms.
export function deserializeOverlay(
  raw: string,
  seed: Snapshot,
): SimulationOverlay | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !record(parsed) ||
      parsed.schemaVersion !== SCHEMA_VERSION ||
      parsed.simNow !== seed.now ||
      !Array.isArray(parsed.history)
    )
      return null;
    const reduce = createSimulationReducer(seed);
    let state = initialOverlay(seed);
    for (const event of parsed.history) {
      if (
        !record(event) ||
        event.sequence !== state.nextSequence ||
        event.timestamp !== state.simNow
      )
        return null;
      let action: SimulationAction;
      if (
        event.transition === "fault-activated" &&
        event.assetId === FAULT_ASSET_ID
      )
        action = { type: "ACTIVATE_FAULT" };
      else if (
        event.transition === "fault-cleared" &&
        event.assetId === FAULT_ASSET_ID
      )
        action = { type: "CLEAR_FAULT" };
      else if (
        event.transition === "connection-lost" &&
        typeof event.assetId === "string" &&
        isConnectionAsset(event.assetId)
      )
        action = { type: "LOSE_CONNECTION", assetId: event.assetId };
      else if (
        event.transition === "connection-restored" &&
        typeof event.assetId === "string" &&
        isConnectionAsset(event.assetId)
      )
        action = { type: "RESTORE_CONNECTION", assetId: event.assetId };
      else return null;
      const next = reduce(state, action);
      if (next === state) return null;
      state = next;
    }
    if (!state.history.length && parsed.lastAction === "RESET")
      state = { ...state, lastAction: "RESET" };
    return equalJson(parsed, state) ? state : null;
  } catch {
    return null;
  }
}
export function browserStorage(): SimulationStorage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
export function readSimulation(
  storage: SimulationStorage | undefined,
  seed: Snapshot,
): { overlay: SimulationOverlay; status: PersistenceStatus } {
  const baseline = initialOverlay(seed);
  if (!storage) return { overlay: baseline, status: "unavailable" };
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return { overlay: baseline, status: "ready" };
    const restored = deserializeOverlay(raw, seed);
    if (restored) return { overlay: restored, status: "ready" };
    storage.removeItem(STORAGE_KEY);
    return { overlay: baseline, status: "recovered" };
  } catch {
    return { overlay: baseline, status: "unavailable" };
  }
}
export function saveSimulation(
  storage: SimulationStorage | undefined,
  overlay: SimulationOverlay,
): boolean {
  if (!storage) return false;
  try {
    if (!overlay.history.length) storage.removeItem(STORAGE_KEY);
    else storage.setItem(STORAGE_KEY, serializeOverlay(overlay));
    return true;
  } catch {
    return false;
  }
}
