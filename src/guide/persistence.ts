import type { SimulationStorage } from "../simulation/persistence";
import { FAULT_ASSET_ID } from "../simulation/types";
import type { GuideSession } from "./model";
export const GUIDE_KEY = "evidanor:guide:v1";
const date = (value: unknown) =>
  typeof value === "string" &&
  /^\d{4}-\d\d-\d\dT.*Z$/.test(value) &&
  Number.isFinite(Date.parse(value));
const ids = (value: unknown) =>
  Array.isArray(value) &&
  value.every((id) => typeof id === "string" && !!id.trim()) &&
  new Set(value).size === value.length;
export function deserializeGuide(
  raw: string,
): { schemaVersion: 1; session: GuideSession | null } | null {
  try {
    const value = JSON.parse(raw);
    if (!value || value.schemaVersion !== 1) return null;
    const session = value.session;
    if (session === null) return value;
    return session &&
      typeof session.id === "string" &&
      /^GUIDE-[A-Za-z0-9-]+$/.test(session.id) &&
      date(session.startedAt) &&
      session.targetAssetId === FAULT_ASSET_ID &&
      ids(session.baselineReviewIds) &&
      ids(session.baselineFollowUpIds) &&
      ids(session.viewedReportIds) &&
      (session.detectedAt === null || date(session.detectedAt)) &&
      (session.assetViewedAt === null || date(session.assetViewedAt))
      ? value
      : null;
  } catch {
    return null;
  }
}
export function readGuide(storage: SimulationStorage | undefined): {
  session: GuideSession | null;
  status: "saved" | "recovered" | "unavailable";
} {
  try {
    if (!storage) return { session: null, status: "unavailable" };
    const raw = storage.getItem(GUIDE_KEY);
    if (raw === null) return { session: null, status: "saved" };
    const result = deserializeGuide(raw);
    return result
      ? { session: result.session, status: "saved" }
      : { session: null, status: "recovered" };
  } catch {
    return { session: null, status: "unavailable" };
  }
}
export function writeGuide(
  storage: SimulationStorage | undefined,
  session: GuideSession | null,
) {
  try {
    if (!storage) return false;
    storage.setItem(GUIDE_KEY, JSON.stringify({ schemaVersion: 1, session }));
    return true;
  } catch {
    return false;
  }
}
