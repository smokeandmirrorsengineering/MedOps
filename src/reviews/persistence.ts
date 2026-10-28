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
import { demoSnapshot } from "../data/demo";
import { focusedItems, FOCUSED_TEMPLATE_ID } from "./focused";

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
export function validEvidence(
  v: unknown,
  allowedAssetIds: readonly string[] = scopeAssetIds,
): v is EvidenceSnapshot {
  return (
    obj(v) &&
    date(v.simulatedAt) &&
    date(v.capturedAt) &&
    array(
      v.assets,
      (a) =>
        obj(a) &&
        nonempty(a.id) &&
        allowedAssetIds.includes(a.id) &&
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
          (text(i.assetId) && allowedAssetIds.includes(i.assetId))) &&
        (i.reviewId === null || text(i.reviewId)),
    )
  );
}
function template(v: unknown): v is ReviewTemplate {
  if (obj(v) && v.id === FOCUSED_TEMPLATE_ID) return focusedTemplateRecord(v);
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
function focusedTemplateRecord(
  v: Record<string, unknown>,
): v is Record<string, unknown> & ReviewTemplate {
  const ids = v.scopeAssetIds;
  if (
    !Array.isArray(ids) ||
    ids.length !== 1 ||
    !demoSnapshot.assets.some((asset) => asset.id === ids[0]) ||
    v.scopeId !== `asset:${ids[0]}` ||
    v.version !== "1.0" ||
    !fields(v, ["title", "scope", "disclaimer"]) ||
    !Array.isArray(v.items) ||
    v.items.length !== 3
  )
    return false;
  return v.items.every(
    (item, index) =>
      obj(item) &&
      item.id === focusedItems[index].id &&
      item.order === index + 1 &&
      fields(item, ["title", "section", "prompt", "limitation"]) &&
      item.kind === "equipment" &&
      item.humanOnly === false &&
      Array.isArray(item.assetIds) &&
      item.assetIds.length === 1 &&
      item.assetIds[0] === ids[0] &&
      Array.isArray(item.pointLabels) &&
      item.pointLabels.length === 0 &&
      Array.isArray(item.allowedResponses) &&
      item.allowedResponses.length === choices.length &&
      new Set(item.allowedResponses).size === choices.length &&
      item.allowedResponses.every((choice) => member(choice, choices)) &&
      Array.isArray(item.allowedMethods) &&
      item.allowedMethods.length === methods.length &&
      new Set(item.allowedMethods).size === methods.length &&
      item.allowedMethods.every((method) => member(method, methods)) &&
      obj(item.rules) &&
      item.rules.observationOnAbnormal === true &&
      item.rules.reconcilePassConflict === true &&
      obj(item.rules.tolerances) &&
      Object.values(item.rules.tolerances).every(
        (value) =>
          typeof value === "number" && Number.isFinite(value) && value >= 0,
      ),
  );
}
function response(
  v: unknown,
  allowedAssetIds: readonly string[],
): v is ItemResponse {
  return (
    obj(v) &&
    human(v) &&
    text(v.itemId) &&
    date(v.savedAt) &&
    validEvidence(v.evidence, allowedAssetIds) &&
    array(
      v.gaps,
      (g) =>
        obj(g) &&
        human(g) &&
        text(g.assetId) &&
        allowedAssetIds.includes(g.assetId),
    ) &&
    strings(v.acknowledgedIssues) &&
    (v.changeAcknowledgement === null ||
      (obj(v.changeAcknowledgement) &&
        validEvidence(v.changeAcknowledgement.evidence, allowedAssetIds) &&
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
  if (
    v.template.id === FOCUSED_TEMPLATE_ID
      ? v.subjectAssetId !== v.template.scopeAssetIds[0]
      : v.subjectAssetId !== undefined
  )
    return false;
  if (
    v.sourceFollowUpId !== undefined &&
    (!text(v.sourceFollowUpId) ||
      !/^FU-[A-Za-z0-9-]+$/.test(v.sourceFollowUpId))
  )
    return false;
  for (const [key, value] of Object.entries(v.responses)) {
    const item = v.template.items.find((item) => item.id === key);
    if (
      !item ||
      !response(value, v.template.scopeAssetIds) ||
      value.itemId !== key ||
      // Saved records may contain legacy N/A follow-up. Restore them verbatim;
      // apply the stricter rule when a draft is saved or submitted now. Rejecting
      // an old draft here would otherwise discard the whole stored collection.
      responseErrors(value, item, { historical: true }).length
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
    (!date(v.submittedAt) ||
      Object.keys(v.responses).length !== v.template.items.length)
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
