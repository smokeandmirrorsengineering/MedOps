import type { Asset, Evaluation, Snapshot } from "../domain/types";
import { latestReading } from "../domain/evaluateAsset";
import { orderAssets } from "./navigation";

export const inventorySorts = [
  "priority",
  "id-asc",
  "id-desc",
  "name-asc",
  "name-desc",
] as const;
export type InventorySort = (typeof inventorySorts)[number];
export const inventorySort = (value: string | null): InventorySort =>
  inventorySorts.find((sort) => sort === value) ?? "priority";
export function sortInventory<T extends Asset & Evaluation>(
  assets: readonly T[],
  sort: InventorySort,
): T[] {
  if (sort === "priority") return orderAssets(assets);
  const field = sort.startsWith("id") ? "id" : "name";
  const direction = sort.endsWith("desc") ? -1 : 1;
  return [...assets].sort(
    (a, b) =>
      direction * a[field].localeCompare(b[field], "en") ||
      a.id.localeCompare(b.id, "en"),
  );
}

/** Display an existing point. Prefer the point named in an evaluated reason;
 * do not invent a measurement, threshold or current-validity claim. */
export function keyReading(asset: Asset & Evaluation, snapshot: Snapshot) {
  const points = snapshot.points.filter((point) => point.assetId === asset.id);
  const point =
    points.find((point) =>
      asset.reasons.some((reason) => reason.startsWith(point.label + ":")),
    ) ?? points[0];
  if (!point) return null;
  const reading = latestReading(snapshot.readings, asset.id, point.id);
  const age = reading
    ? Date.parse(snapshot.now) - Date.parse(reading.timestamp)
    : NaN;
  const current =
    !!reading &&
    reading.quality === "Good" &&
    reading.value !== null &&
    Number.isFinite(reading.value) &&
    asset.monitoring.connectivity !== "Unavailable" &&
    age >= 0 &&
    age <= asset.monitoring.expectedIntervalMinutes * 60_000;
  const value =
    reading?.value !== null &&
    reading?.value !== undefined &&
    Number.isFinite(reading.value)
      ? reading.value
      : null;
  const validity = current
    ? asset.monitoring.method === "Manual inspection"
      ? "Recorded inspection"
      : "Good · simulated"
    : value !== null
      ? `Last known · ${asset.monitoring.connectivity === "Unavailable" ? "Unavailable" : reading?.quality !== "Good" ? reading?.quality : "Stale"}`
      : "No usable measurement";
  return {
    label: point.label,
    value,
    unit: point.unit,
    reportedAt: reading?.timestamp ?? null,
    current,
    validity,
  };
}
