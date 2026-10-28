import type { SimulationStorage } from "../simulation/persistence";
import { choices, methods } from "./types";
import type {
  EvidenceSnapshot,
  ReviewSession,
  ReviewStore,
  ReviewTemplate,
  ItemResponse,
} from "./types";
import { scopeAssetIds } from "./template";
import { deriveExceptions, responseErrors } from "./model";

export const REVIEW_STORAGE_KEY = "medops.engineering-reviews.v1";
export const emptyReviews = (): ReviewStore => ({
  schemaVersion: 1,
  sessions: [],
});
const obj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string";
const nonempty = (v: unknown): v is string => text(v) && !!v.trim();
const date = (v: unknown): v is string =>
  text(v) && /^\d{4}-\d\d-\d\dT.*Z$/.test(v) && Number.isFinite(Date.parse(v));
const array = (v: unknown, test: (x: unknown) => boolean): boolean =>
  Array.isArray(v) && v.every(test);
const strings = (v: unknown) => array(v, text);
const member = (v: unknown, values: readonly string[]) =>
  text(v) && values.includes(v);
const fields = (v: Record<string, unknown>, keys: string[]) =>
  keys.every((k) => text(v[k]));
function human(v: unknown): boolean {
  return (
    obj(v) &&
    member(v.choice, choices) &&
    member(v.method, ["", ...methods]) &&
    fields(v, [
      "observation",
      "notes",
      "reconciliation",
      "responsible",
      "followUp",
    ])
  );
}
export function validEvidence(v: unknown): v is EvidenceSnapshot {
  return (
    obj(v) &&
    date(v.simulatedAt) &&
    date(v.capturedAt) &&
    array(
      v.assets,
      (a) =>
        obj(a) &&
        nonempty(a.id) &&
        scopeAssetIds.includes(a.id) &&
        fields(a, ["name", "location", "method", "connectivity", "source"]) &&
        member(a.condition, ["Normal", "Attention", "Critical", "Unknown"]) &&
        member(a.operatingState, ["Running", "Standby", "Stopped"]) &&
        strings(a.reasons) &&
        array(
          a.readings,
          (r) =>
            obj(r) &&
            fields(r, ["pointId", "label", "unit"]) &&
            (r.value === null ||
              (typeof r.value === "number" && Number.isFinite(r.value))) &&
            member(r.quality, ["Good", "Uncertain", "Unavailable"]) &&
            date(r.timestamp) &&
            member(r.validity, [
              "Current simulated",
              "Recorded inspection",
              "Last known / unavailable",
              "Stale",
            ]),
        ) &&
        array(
          a.alarms,
          (e) =>
            obj(e) &&
            fields(e, ["id", "title", "severity"]) &&
            date(e.timestamp),
        ) &&
        array(
          a.maintenance,
          (m) =>
            obj(m) &&
            fields(m, ["lastServiceDate", "nextServiceDate", "summary"]),
        ),
    ) &&
    array(
      v.issues,
      (i) =>
        obj(i) &&
        fields(i, ["key", "title", "observation"]) &&
        member(i.source, ["Review exception", "Synthetic alarm"]) &&
        (i.assetId === null ||
          (text(i.assetId) && scopeAssetIds.includes(i.assetId))) &&
        (i.reviewId === null || text(i.reviewId)),
    )
  );
}
function template(v: unknown): v is ReviewTemplate {
  return (
    obj(v) &&
    v.id === "ot-engineering-review" &&
    v.scopeId === "ot-shared-services" &&
    fields(v, ["version", "title", "scope", "disclaimer"]) &&
    Array.isArray(v.scopeAssetIds) &&
    v.scopeAssetIds.length === 6 &&
    new Set(v.scopeAssetIds).size === 6 &&
    v.scopeAssetIds.every((id) => scopeAssetIds.includes(id)) &&
    Array.isArray(v.items) &&
    v.items.length === 9 &&
    new Set(v.items.map((i) => (obj(i) ? i.id : null))).size === 9 &&
    v.items.every(
      (i, index) =>
        obj(i) &&
        fields(i, ["id", "section", "title", "prompt", "limitation"]) &&
        i.order === index + 1 &&
        member(i.kind, ["equipment", "human", "gaps", "issues"]) &&
        i.humanOnly === (i.kind === "human") &&
        strings(i.assetIds) &&
        (i.assetIds as string[]).every((id) => scopeAssetIds.includes(id)) &&
        (i.kind !== "human" || (i.assetIds as string[]).length === 0) &&
        strings(i.pointLabels) &&
        array(i.allowedResponses, (c) => member(c, choices)) &&
        Array.isArray(i.allowedResponses) &&
        i.allowedResponses.length === 5 &&
        array(i.allowedMethods, (m) => member(m, methods)) &&
        Array.isArray(i.allowedMethods) &&
        i.allowedMethods.length === 6 &&
        obj(i.rules) &&
        i.rules.observationOnAbnormal === true &&
        i.rules.reconcilePassConflict === true &&
        obj(i.rules.tolerances) &&
        Object.values(i.rules.tolerances).every(
          (n) => typeof n === "number" && Number.isFinite(n) && n >= 0,
        ),
    )
  );
}
function response(v: unknown): v is ItemResponse {
  return (
    obj(v) &&
    human(v) &&
    text(v.itemId) &&
    date(v.savedAt) &&
    validEvidence(v.evidence) &&
    array(
      v.gaps,
      (g) =>
        obj(g) &&
        human(g) &&
        text(g.assetId) &&
        scopeAssetIds.includes(g.assetId),
    ) &&
    strings(v.acknowledgedIssues) &&
    (v.changeAcknowledgement === null ||
      (obj(v.changeAcknowledgement) &&
        validEvidence(v.changeAcknowledgement.evidence) &&
        nonempty(v.changeAcknowledgement.note) &&
        date(v.changeAcknowledgement.notedAt) &&
        strings(v.changeAcknowledgement.changes)))
  );
}
export function validReview(v: unknown): v is ReviewSession {
  if (
    !obj(v) ||
    !nonempty(v.id) ||
    !/^REV-[A-Za-z0-9-]+$/.test(v.id) ||
    !template(v.template) ||
    v.scopeId !== v.template.scopeId ||
    v.scope !== v.template.scope ||
    !nonempty(v.technician) ||
    !nonempty(v.role) ||
    !fields(v, ["openingNotes", "summary"]) ||
    !member(v.status, ["Draft", "Submitted"]) ||
    !date(v.createdAt) ||
    !(v.submittedAt === null || date(v.submittedAt)) ||
    !obj(v.responses) ||
    !Array.isArray(v.exceptions)
  )
    return false;
  for (const [key, value] of Object.entries(v.responses)) {
    const item = v.template.items.find((item) => item.id === key);
    if (
      !item ||
      !response(value) ||
      value.itemId !== key ||
      responseErrors(value, item).length
    )
      return false;
    if (
      value.evidence.assets.some(
        (asset) => !item.assetIds.includes(asset.id),
      ) ||
      new Set(value.evidence.assets.map((asset) => asset.id)).size !==
        value.evidence.assets.length
    )
      return false;
    if (value.evidence.assets.length !== item.assetIds.length) return false;
  }
  if (
    v.status === "Submitted" &&
    (!date(v.submittedAt) || Object.keys(v.responses).length !== 9)
  )
    return false;
  if (v.status === "Draft" && v.submittedAt !== null) return false;
  const review = v as unknown as ReviewSession;
  return (
    JSON.stringify(review.exceptions) ===
    JSON.stringify(deriveExceptions(review))
  );
}
export function deserializeReviews(raw: string): ReviewStore | null {
  try {
    const v: unknown = JSON.parse(raw);
    return obj(v) &&
      v.schemaVersion === 1 &&
      array(v.sessions, validReview) &&
      Array.isArray(v.sessions) &&
      new Set(v.sessions.map((s) => s.id)).size === v.sessions.length
      ? (v as unknown as ReviewStore)
      : null;
  } catch {
    return null;
  }
}
export function readReviews(storage: SimulationStorage | undefined): {
  store: ReviewStore;
  status: "saved" | "recovered" | "unavailable";
} {
  if (!storage) return { store: emptyReviews(), status: "unavailable" };
  try {
    const raw = storage.getItem(REVIEW_STORAGE_KEY);
    if (raw === null) return { store: emptyReviews(), status: "saved" };
    const store = deserializeReviews(raw);
    return store
      ? { store, status: "saved" }
      : { store: emptyReviews(), status: "recovered" };
  } catch {
    return { store: emptyReviews(), status: "unavailable" };
  }
}
export function writeReviews(
  storage: SimulationStorage | undefined,
  store: ReviewStore,
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}
