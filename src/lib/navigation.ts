import type { Asset, AssetEvent, Condition } from "../domain/types";
import { categoryFromSlug } from "./categories";

export const conditions: Condition[] = [
  "Normal",
  "Attention",
  "Critical",
  "Unknown",
];
const priority: Record<Condition, number> = {
  Critical: 0,
  Unknown: 1,
  Attention: 2,
  Normal: 3,
};
const severityPriority: Record<AssetEvent["severity"], number> = {
  Critical: 0,
  Attention: 1,
  Info: 2,
};

export function orderAssets<T extends Asset & { condition: Condition }>(
  assets: readonly T[],
): T[] {
  return [...assets].sort(
    (a, b) =>
      priority[a.condition] - priority[b.condition] ||
      a.id.localeCompare(b.id, "en"),
  );
}
export function orderEvents<T extends AssetEvent & { sequence?: number }>(
  events: readonly T[],
): T[] {
  return [...events].sort(
    (a, b) =>
      severityPriority[a.severity] - severityPriority[b.severity] ||
      Date.parse(b.timestamp) - Date.parse(a.timestamp) ||
      (b.sequence ?? 0) - (a.sequence ?? 0) ||
      a.id.localeCompare(b.id),
  );
}
export function parseAssetParams(params: URLSearchParams) {
  const category = categoryFromSlug(params.get("system") ?? "");
  const rawCondition = params.get("condition");
  const condition: Condition | "" =
    conditions.find((value) => value === rawCondition) ?? "";
  const rawPage = params.get("page") ?? "1";
  const requestedPage =
    /^[1-9]\d*$/.test(rawPage) && Number.isSafeInteger(Number(rawPage))
      ? Number(rawPage)
      : 1;
  return { query: params.get("q") ?? "", category, condition, requestedPage };
}
export function updateParams(
  current: URLSearchParams,
  changes: Record<string, string>,
  resetPage = false,
) {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(changes)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  if (resetPage) next.delete("page");
  return next;
}
export function clampPage(
  requested: number,
  matches: number,
  pageSize: number,
) {
  return Math.max(
    1,
    Math.min(requested, Math.max(1, Math.ceil(matches / pageSize))),
  );
}
export function normalizeAssetParams(current: URLSearchParams, page: number) {
  const { category, condition } = parseAssetParams(current);
  const next = new URLSearchParams(current);
  if (!category) next.delete("system");
  if (!condition) next.delete("condition");
  if (!next.get("q")) next.delete("q");
  if (page === 1) next.delete("page");
  else next.set("page", String(page));
  return next;
}
